#!/usr/bin/env python3
"""inky-mirror v2 device client.

One process owns the display and the four buttons:
  * polls GET {INKY_API}/inky/frame.png every POLL_SECONDS with If-None-Match,
    and refreshes the panel only when the frame hash changes;
  * on a button press, POSTs /inky/button/{A-D} and fetches a fresh frame
    right away (A = watered, B = thumbs up, C = thumbs down, D = refresh).

Config comes from the environment (see inky-mirror.service):
  INKY_API           base URL, default https://api.halfmoon.ws
  INKY_DEVICE_TOKEN  bearer token for the device endpoints (required)
  POLL_SECONDS       default 300
"""
import io
import os
import sys
import time
import logging
from datetime import timedelta

import requests
from PIL import Image
from inky.auto import auto

import gpiod
import gpiodevice
from gpiod.line import Bias, Direction, Edge

API = os.environ.get("INKY_API", "https://api.halfmoon.ws").rstrip("/")
TOKEN = os.environ.get("INKY_DEVICE_TOKEN", "")
POLL = int(os.environ.get("POLL_SECONDS", "300"))
STATE_DIR = os.path.expanduser(os.environ.get("INKY_STATE_DIR", "~/.local/state/inky-mirror"))
ETAG_FILE = os.path.join(STATE_DIR, "etag")

BUTTONS = {"GPIO5": "A", "GPIO6": "B", "GPIO16": "C", "GPIO24": "D"}

log = logging.getLogger("inky")
session = requests.Session()
session.headers["Authorization"] = f"Bearer {TOKEN}"
display = auto()


def read_etag():
    try:
        with open(ETAG_FILE) as f:
            return f.read().strip() or None
    except OSError:
        return None


def write_etag(etag):
    os.makedirs(STATE_DIR, exist_ok=True)
    with open(ETAG_FILE, "w") as f:
        f.write(etag or "")


def show(png_bytes):
    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    if im.size != display.resolution:
        im = im.resize(display.resolution)
    # Frames are already quantised to the saturated palette server-side,
    # so saturation=1.0 maps them 1:1 onto the panel's inks.
    display.set_image(im, saturation=1.0)
    display.show()


def update(force=False):
    """Fetch the current frame; refresh the panel if it changed."""
    headers = {} if force else ({"If-None-Match": read_etag()} if read_etag() else {})
    try:
        r = session.get(f"{API}/inky/frame.png", headers=headers, timeout=90)
    except requests.RequestException as e:
        log.warning("frame fetch failed: %s", e)
        return
    if r.status_code == 304:
        log.info("frame unchanged")
        return
    if r.status_code != 200 or not r.headers.get("content-type", "").startswith("image/png"):
        log.warning("frame fetch: HTTP %s %s", r.status_code, r.text[:200])
        return
    log.info("new frame mode=%s direction=%s", r.headers.get("X-Inky-Mode"), r.headers.get("X-Inky-Direction"))
    t = time.time()
    show(r.content)
    write_etag(r.headers.get("ETag"))
    log.info("panel refreshed in %.0fs", time.time() - t)


def press(label):
    log.info("button %s", label)
    if label != "D":
        try:
            r = session.post(f"{API}/inky/button/{label}", timeout=30)
            log.info("button %s -> HTTP %s", label, r.status_code)
        except requests.RequestException as e:
            log.warning("button post failed: %s", e)
    update(force=(label == "D"))


def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", stream=sys.stdout)
    if not TOKEN:
        log.error("INKY_DEVICE_TOKEN is not set")
        sys.exit(1)

    chip = gpiodevice.find_chip_by_platform()
    offsets = [chip.line_offset_from_id(name) for name in BUTTONS]
    labels = dict(zip(offsets, BUTTONS.values()))
    settings = gpiod.LineSettings(direction=Direction.INPUT, bias=Bias.PULL_UP,
                                  edge_detection=Edge.FALLING, debounce_period=timedelta(milliseconds=40))
    request = chip.request_lines(consumer="inky-mirror", config={o: settings for o in offsets})

    update()
    next_poll = time.monotonic() + POLL
    last_press = {}
    while True:
        timeout = max(0.0, next_poll - time.monotonic())
        if request.wait_edge_events(timedelta(seconds=timeout)):
            for ev in request.read_edge_events():
                label = labels[ev.line_offset]
                now = time.monotonic()
                if now - last_press.get(label, 0) < 2:  # ignore bounces / double taps
                    continue
                last_press[label] = now
                press(label)
            # Presses that arrived during a 40s refresh are stale; drop them.
            while request.wait_edge_events(timedelta(0)):
                request.read_edge_events()
        if time.monotonic() >= next_poll:
            update()
            next_poll = time.monotonic() + POLL


if __name__ == "__main__":
    main()
