#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/kiosk-app"
DIST_DIR="$FRONTEND_DIR/dist"
TARGET_DIR="$ROOT_DIR/cd-transport/frontend"

echo "==> Building frontend in: $FRONTEND_DIR"
echo "==> Target hosting dir:  $TARGET_DIR"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "ERROR: kiosk-app directory not found at $FRONTEND_DIR"
  exit 1
fi

# Install deps (prefer npm ci if lockfile exists)
cd "$FRONTEND_DIR"
if [[ -f package-lock.json ]]; then
  echo "==> Installing dependencies (npm ci)"
  npm ci
else
  echo "==> Installing dependencies (npm install)"
  npm install
fi

echo "==> Running build"
npm run build

if [[ ! -d "$DIST_DIR" ]]; then
  echo "ERROR: dist directory not found after build: $DIST_DIR"
  exit 1
fi

echo "==> Syncing build output to $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Clean target dir first to avoid stale hashed assets
rm -rf "$TARGET_DIR"/*
# Copy dist -> target (preserve structure)
cp -a "$DIST_DIR"/. "$TARGET_DIR"/

echo "==> Done."
echo "   Hosted files are now in: cd-transport/frontend"
