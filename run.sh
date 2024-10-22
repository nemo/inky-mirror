#!/bin/bash

firefox-esr --headless --screenshot --window-size=600,448 https://halfmoon.ws/daily-focus
/home/nima/.virtualenvs/pimoroni/bin/python ./image.py screenshot.png
