#!/bin/bash

# Default URL
DEFAULT_URL="https://halfmoon.ws/daily-focus"

# Check if a URL is provided as an argument
if [ $# -eq 1 ]; then
    URL="$1"
else
    URL="$DEFAULT_URL"
    echo "No URL provided. Using default: $URL"
fi

echo "Running at $(date +"%Y-%m-%d %T")"
pkill -f firefox-esr
firefox-esr --headless --wait-for-load --screenshot --window-size=600,448 "$URL"

# Check if screenshot.png has changed
if [ ! -f screenshot.png.md5 ] || ! md5sum -c screenshot.png.md5 &>/dev/null; then
    md5sum screenshot.png > screenshot.png.md5
    /home/nima/.virtualenvs/pimoroni/bin/python /home/nima/inky-mirror/image.py --file screenshot.png
else
    echo "screenshot.png hasn't changed. Skipping image.py execution."
fi
