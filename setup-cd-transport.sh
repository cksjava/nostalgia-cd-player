#!/usr/bin/env bash
set -euo pipefail

echo "=== System update ==="
sudo apt update
sudo apt upgrade -y

echo "=== Base utilities ==="
sudo apt install -y \
  ca-certificates \
  curl \
  gnupg \
  build-essential \
  udev \
  alsa-utils

echo "=== Installing mpv ==="
sudo apt install -y mpv

echo "=== Installing Node.js LTS (system-wide, systemd-safe) ==="
# NodeSource LTS (20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify paths
NODE_BIN="$(command -v node)"
MPV_BIN="$(command -v mpv)"

echo "Node: $NODE_BIN"
echo "mpv : $MPV_BIN"

if [[ ! -x "$NODE_BIN" ]]; then
  echo "ERROR: node not found"
  exit 1
fi

if [[ ! -x "$MPV_BIN" ]]; then
  echo "ERROR: mpv not found"
  exit 1
fi

echo "=== Installing nginx ==="
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "=== App directories ==="
sudo mkdir -p /opt/cd-transport/{backend,frontend}
sudo chown -R "$USER:$USER" /opt/cd-transport

echo "=== CD drive permissions ==="
# Allow current user to access /dev/sr0
sudo usermod -aG cdrom "$USER"

echo "=== Done ==="
echo "IMPORTANT: reboot once so group changes take effect"
