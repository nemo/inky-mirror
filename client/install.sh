#!/bin/sh
# Install the v2 client on the Pi. Run on the Pi from ~/inky-mirror:
#   INKY_DEVICE_TOKEN=... sh client/install.sh
set -eu
CONF="$HOME/.config/inky-mirror/env"
mkdir -p "$(dirname "$CONF")"
if [ -n "${INKY_DEVICE_TOKEN:-}" ]; then
  umask 077
  printf 'INKY_DEVICE_TOKEN=%s\nINKY_API=%s\n' "$INKY_DEVICE_TOKEN" "${INKY_API:-https://api.halfmoon.ws}" > "$CONF"
fi
[ -f "$CONF" ] || { echo "missing $CONF (pass INKY_DEVICE_TOKEN=...)"; exit 1; }

# Retire the v1 screenshot cron job.
crontab -l 2>/dev/null | grep -v 'inky-mirror/run.sh' | crontab - || true

sudo cp "$HOME/inky-mirror/client/inky-mirror.service" /etc/systemd/system/inky-mirror.service
sudo systemctl daemon-reload
sudo systemctl enable --now inky-mirror.service
systemctl --no-pager status inky-mirror.service | head -5
