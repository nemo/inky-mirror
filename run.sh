#!/bin/bash

# Get the current hour (in 24-hour format)
current_hour=$(date +"%H")

# Check if the current hour is between 4am and 9am
if [ $current_hour -ge 4 ] && [ $current_hour -lt 9 ]; then
    echo "Current time is between 4am and 9am. Running draw.sh"
    ./draw.sh
else
    echo "Current time is outside 4am-9am range. Running art.sh"
    ./draw.sh https://api.halfmoon.ws/users/self/art
fi

echo "Script completed at $(date +"%Y-%m-%d %T")"
