#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Build backend ==="
cd backend
if [ ! -f .env ]; then
  echo "❌ backend/.env not found. Copy backend/.env.example and fill in PAYLOAD_SECRET."
  exit 1
fi
if grep -q 'your-secret-here' .env 2>/dev/null; then
  echo "❌ PAYLOAD_SECRET in backend/.env is still the default. Generate one with: openssl rand -base64 32"
  exit 1
fi
npm install
npm run build
cd ..

echo "=== Build frontend ==="
cd frontend
npm install
PUBLIC_API_URL="${PUBLIC_API_URL:-http://localhost:3000/api}" npx astro build
cd ..

echo ""

# Restart PM2 services
if command -v pm2 &> /dev/null; then
  echo "=== Restarting PM2 services ==="
  pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
fi

echo ""
echo "=== Deploy complete ==="
echo "NOTE: On first deploy, run 'cd backend && npm run seed' to populate the database."
