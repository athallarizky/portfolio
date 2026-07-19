#!/usr/bin/env bash
# VPS-side deploy helper.
#
# Since sprint-12, the build happens on the GitHub Actions runner, NOT here.
# The runner builds backend (.next/) + frontend (dist/) and rsyncs them to this
# box (see .github/workflows/deploy.yml). This script only:
#   1. Installs production runtime deps (npm ci --omit=dev) — fast, no compile.
#   2. Restarts PM2 so the new build is served.
#
# IMPORTANT: this script assumes the artifacts + package*.json were already
# rsynced to /root/portfolio by the workflow. It must NOT overwrite backend/.env
# or backend/payload.db (rsync excludes them — see architecture.md §7.5).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Install backend runtime deps (no compile) ==="
cd backend
if [ ! -f .env ]; then
  echo "❌ backend/.env not found. Copy backend/.env.example and fill in PAYLOAD_SECRET."
  exit 1
fi
if grep -q 'your-secret-here' .env 2>/dev/null; then
  echo "❌ PAYLOAD_SECRET in backend/.env is still the default. Generate one with: openssl rand -base64 32"
  exit 1
fi
npm ci --omit=dev
cd ..

echo "=== Install frontend runtime deps (no compile) ==="
cd frontend
npm ci --omit=dev
cd ..

echo ""

# Restart PM2 services
if command -v pm2 &> /dev/null; then
  echo "=== Restarting PM2 services ==="
  pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
fi

echo ""
echo "=== Deploy complete ==="
echo "Artifacts (.next/, dist/) were built on the GitHub runner and rsynced here."
echo "This script only installed runtime deps and restarted PM2 — no compile on the VPS."
