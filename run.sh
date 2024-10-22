#!/bin/bash

firefox-esr --headless --screenshot --window-size=448,600 https://halfmoon.ws/daily-focus
/home/nima/.virtualenvs/pimoroni/bin/python image.py --file screenshot.png
