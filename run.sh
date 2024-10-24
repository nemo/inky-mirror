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
firefox-esr --headless --wait-for-load --screenshot --window-size=448,600 "$URL"
/home/nima/.virtualenvs/pimoroni/bin/python /home/nima/inky-mirror/image.py --file screenshot.png
