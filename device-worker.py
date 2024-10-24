#!/usr/bin/env python3

import gpiod
import gpiodevice
from gpiod.line import Bias, Direction, Edge
import subprocess  # Add this import at the top of the file

print("""buttons.py - Detect which button has been pressed

This example should demonstrate how to:
 1. set up gpiod to read buttons,
 2. determine which button has been pressed

Press Ctrl+C to exit!

""")

# GPIO pins for each button (from top to bottom)
# These will vary depending on platform and the ones
# below should be correct for Raspberry Pi 5.
# Run "gpioinfo" to find out what yours might be
BUTTONS = ["PIN29", "PIN31", "PIN36", "PIN18"]

# These correspond to buttons A, B, C and D respectively
LABELS = ["A", "B", "C", "D"]

# Create settings for all the input pins, we want them to be inputs
# with a pull-up and a falling edge detection.
INPUT = gpiod.LineSettings(direction=Direction.INPUT, bias=Bias.PULL_UP, edge_detection=Edge.FALLING)

# Find the gpiochip device we need, we'll use
# gpiodevice for this, since it knows the right device
# for its supported platforms.
chip = gpiodevice.find_chip_by_platform()

# Build our config for each pin/line we want to use
OFFSETS = [chip.line_offset_from_id(id) for id in BUTTONS]
line_config = dict.fromkeys(OFFSETS, INPUT)

# Request the lines, *whew*
request = chip.request_lines(consumer="inky7-buttons", config=line_config)

def run_bash_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"Command output: {result.stdout}")
    except subprocess.CalledProcessError as e:
        print(f"Command failed with error: {e.stderr}")

# "handle_button" will be called every time a button is pressed
# It receives one argument: the associated gpiod event object.
def handle_button(event):
    index = OFFSETS.index(event.line_offset)
    pin = BUTTONS[index]
    label = LABELS[index]
    print(f"Button press detected on pin: {pin} label: {label}")

    if label == "A":
        print(f"Button A pressed. Running 'ls' command.")
        run_bash_command("./run.sh https://api.halfmoon.ws/users/self/art")
        
    elif label == "B":
        print(f"Button B pressed. Running 'pwd' command.")
        run_bash_command("pwd")

while True:
    for event in request.read_edge_events():
        handle_button(event)