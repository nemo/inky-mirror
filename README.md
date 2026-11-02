# inky-mirror

A Braun-inspired e-ink display in the bathroom. From 4 to 11am it shows the
day: weather, the shape of the calendar, the next meeting, a note to self, and
the weekly plant-watering reminder. The rest of the day it shows a calm,
data-free ambient piece. Every morning Sonnet composes the layout from a fixed
component library, so the screen is a little different each day.

- **Spec:** [SPEC.md](SPEC.md) · **Design system and JSON contract:** [DESIGN.md](DESIGN.md)
- **Server:** [nemo/api.halfmoon.ws](https://github.com/nemo/api.halfmoon.ws), `inky/` (Vercel). It fetches data, calls Sonnet, renders and quantises the 600×448 PNG.
- **This repo:** the design source (`design/`), previews (`previews/`) and the Pi client (`client/`).

## How it works

```
Pi (client/inky_client.py) --GET /inky/frame.png (ETag)--> api.halfmoon.ws (Vercel)
                           --POST /inky/button/:id------>   ├─ iCal (work + personal), OpenWeatherMap
                                                            ├─ Sonnet composes the morning layout (JSON)
                                                            └─ Chromium renders → 7-colour PNG
```

The client polls every 5 minutes and only refreshes the panel (~40 s) when the
frame hash changes.

## Buttons

| Button | Action |
|---|---|
| A | Plants watered (next reminder in 7 days) |
| B | 👍 today's design |
| C | 👎 today's design |
| D | Refresh now |

## Notes to self

You or any agent can leave a note for the next morning:

```bash
curl -X POST https://api.halfmoon.ws/inky/notes \
  -H "Authorization: Bearer $INKY_NOTES_TOKEN" -H "Content-Type: application/json" \
  -d '{"text": "Call the super about the radiator.", "from": "Nima"}'
```

## Design work

```bash
cd design && npm install && node render.mjs   # renders previews/ + previews/index.html
```

After changing `design/src`, run `node inky/sync-design.mjs` in api.halfmoon.ws
and redeploy. UI work uses Impeccable (`.claude/skills/impeccable`).

## Hardware

[Pimoroni Inky Impression 5.7"](https://pimoroni.com/impression) (600×448,
7 inks, 4 buttons) on a Raspberry Pi Zero W, in a
[3D-printed case](https://www.printables.com/model/51765-pimoroni-inky-impression-case).
Panel calibration notes are in DESIGN.md. Colour only reads at 8px or larger.

## Pi set-up

1. Flash Raspberry Pi OS with hostname `inky`, user `nima`, SSH and Wi-Fi enabled.
2. `sudo raspi-config` → Interface Options → enable I2C and SPI.
3. Install the Inky library (into `~/.virtualenvs/pimoroni`): `curl https://get.pimoroni.com/inky | bash`
4. Clone and install the client:
   ```bash
   git clone https://github.com/nemo/inky-mirror.git ~/inky-mirror
   cd ~/inky-mirror && INKY_DEVICE_TOKEN=... sh client/install.sh
   ```
   The token lives in `~/.config/inky-mirror/env` (mode 600). Logs: `journalctl -u inky-mirror -f`.
