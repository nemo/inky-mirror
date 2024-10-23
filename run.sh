#!/bin/bash

echo "Running at $(date +"%Y-%m-%d %T")"
firefox-esr --headless --screenshot --window-size=448,600 https://halfmoon.ws/daily-focus
/home/nima/.virtualenvs/pimoroni/bin/python /home/nima/inky-mirror/image.py --file screenshot.png
