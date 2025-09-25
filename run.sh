#!/bin/bash

# Empty mozilla cache
rm -rf /home/nima/.moizlla

# Get the current hour (in 24-hour format)
current_hour=$(date +"%H")

# Check if the current hour is between 4am and 10am
if [ $current_hour -ge 4 ] && [ $current_hour -lt 10 ]; then
    echo "Current time is between 4am and 10am. Showing default URL."
    /home/nima/inky-mirror/draw.sh
else
    echo "Current time is outside 4am-10am range. Showing art."
    /home/nima/inky-mirror/draw.sh https://api.halfmoon.ws/users/self/art
fi

echo "Script completed at $(date +"%Y-%m-%d %T")"
