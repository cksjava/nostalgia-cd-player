#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="cd-transport"
APP_DIR="/opt/cd-transport/backend"
ENTRY="server.js"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

RUN_USER="${SUDO_USER:-$USER}"

NODE_BIN="/usr/bin/node"
MPV_SOCKET="/tmp/mpv-cd.sock"

echo "==> Creating systemd service: $SERVICE_NAME"
echo "    User: $RUN_USER"
echo "    App : $APP_DIR"

if [[ ! -x "$NODE_BIN" ]]; then
  echo "ERROR: node not found at $NODE_BIN"
  exit 1
fi

sudo tee "$SERVICE_FILE" >/dev/null <<EOF
[Unit]
Description=CD Transport Backend (Express + mpv)
After=sound.target
Wants=sound.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Clean up stale mpv socket on boot/restart
ExecStartPre=/bin/rm -f ${MPV_SOCKET}

ExecStart=${NODE_BIN} ${APP_DIR}/${ENTRY}

Restart=always
RestartSec=2

StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF

echo "==> Reloading systemd"
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}.service"
sudo systemctl restart "${SERVICE_NAME}.service"

echo "==> Service status"
sudo systemctl --no-pager status "${SERVICE_NAME}.service" || true

echo
echo "Useful:"
echo "  sudo systemctl status ${SERVICE_NAME}"
echo "  journalctl -u ${SERVICE_NAME} -f"
