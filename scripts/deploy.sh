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

echo "=== nginx: allow content-zip uploads (idempotent, best-effort) ==="
# Sprint-27: publish zips now carry git-tracked project screenshots (multi-MB PNGs),
# POSTed to /api/data-import by the Publish workflows. nginx's default 1 MB
# client_max_body_size rejects them with 413. Raise the limit once, verify with
# nginx -t, reload; NEVER let this block the rest of the deploy.
NGX_CONF='/etc/nginx/sites-available/portfolio'
if [ ! -f "$NGX_CONF" ]; then
  NGX_CONF=$(grep -rls 'server_name[^;]*athallarizky\.com' /etc/nginx/sites-available/ /etc/nginx/conf.d/ 2>/dev/null | head -1 || true)
fi
if [ -n "${NGX_CONF:-}" ] && [ -f "$NGX_CONF" ] && grep -q 'listen 443 ssl' "$NGX_CONF" && ! grep -q 'client_max_body_size' "$NGX_CONF"; then
  cp "$NGX_CONF" "$NGX_CONF.pre-413fix"
  sed -i '/listen 443 ssl/a\    client_max_body_size 100m;' "$NGX_CONF"
  if nginx -t 2>/dev/null; then
    if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
      echo "nginx: client_max_body_size 100m added to $NGX_CONF + reloaded"
    else
      echo "⚠️  nginx config updated but reload failed — will apply on next reload (deploy continues)"
    fi
  else
    cp "$NGX_CONF.pre-413fix" "$NGX_CONF"
    echo "⚠️  nginx -t failed after edit — reverted, reload skipped (deploy continues)"
  fi
else
  echo "nginx: limit already set or config not found — skipping (deploy continues)"
fi

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
