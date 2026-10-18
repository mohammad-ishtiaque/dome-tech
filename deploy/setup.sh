#!/usr/bin/env bash
# One-time server setup for Digital Dome on an Ubuntu 24.04 VPS, run as the normal (sudo) user.
# Safe to run more than once. It does not touch other apps or nginx sites on the server.
#   bash deploy/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1 GB swap (insurance against running out of memory)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 1G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "== pnpm"
# An existing global pnpm is left alone: other apps on the server may rely on it, and pnpm itself
# switches to the version pinned in package.json when it runs inside this repo.
PNPM_VERSION=$(node -p "require('./package.json').packageManager.split('@')[1]")
if ! command -v pnpm >/dev/null; then
  # Node installed under the home folder (nvm) needs no sudo; a system-wide Node does.
  case "$(command -v node)" in
    "$HOME"/*) npm install -g "pnpm@$PNPM_VERSION" ;;
    *) sudo npm install -g "pnpm@$PNPM_VERSION" ;;
  esac
fi

echo "== certbot for HTTPS"
command -v certbot >/dev/null || sudo apt-get install -y certbot python3-certbot-nginx

echo "== folders"
mkdir -p "$HOME/dome-data/uploads"
sudo mkdir -p /var/www/dome-admin

echo "== PM2 starts again after a reboot (skipped if this is already set up)"
if ! systemctl list-unit-files | grep -q "^pm2-$USER"; then
  pm2 startup systemd -u "$USER" --hp "$HOME" | grep '^sudo' | bash
fi

echo
echo "Done. Next: create apps/api/.env (see deploy/env.example), then run: bash deploy/deploy.sh"
