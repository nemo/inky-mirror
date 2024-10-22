#!/bin/bash

CWD=`pwd`

firefox --headless --screenshot --window-size=600,448 https://halfmoon.ws/daily-focus
../image.py screenshot.png
