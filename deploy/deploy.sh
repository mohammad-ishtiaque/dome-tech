#!/usr/bin/env bash
# Build and (re)start Digital Dome from the current main branch.
#   bash deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f apps/api/.env ] || { echo "apps/api/.env is missing. Copy deploy/env.example and fill it in."; exit 1; }

echo "== latest code"
git pull --ff-only

echo "== dependencies"
# mongodb-memory-server is only for local development; skip its ~780 MB MongoDB download.
MONGOMS_DISABLE_POSTINSTALL=1 pnpm install --frozen-lockfile

echo "== build website and dashboard"
pnpm --filter @dome/web build
VITE_SITE_URL=https://somdigitaldome.com pnpm --filter @dome/admin build

echo "== publish dashboard files for nginx"
sudo rsync -a --delete apps/admin/dist/ /var/www/dome-admin/

echo "== start or reload"
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save

echo "== health check"
sleep 3
curl -fsS http://127.0.0.1:4100/api/health && echo "  API ok"
curl -fsS -o /dev/null http://127.0.0.1:3100/ && echo "  website ok"
