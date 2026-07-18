#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Portfolio VPS Provisioning Script
# For: Ubuntu 22.04/24.04 — fresh VPS → production
# Run as: bash scripts/setup-vps.sh
# ──────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="athallarizky.com"
REPO_DIR="$HOME/portfolio"
REPO_URL="git@github.com:athallarizky/portfolio.git"  # change if using HTTPS

echo -e "${GREEN}=== Portfolio VPS Setup ===${NC}"
echo "Domain: $DOMAIN"
echo "Repo:   $REPO_DIR"
echo ""

# ── 1. System update ──────────────────────────
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
sudo apt update -qq && sudo apt upgrade -y -qq

# ── 2. Install Node.js 22.x ───────────────────
echo -e "${YELLOW}[2/10] Installing Node.js 22.x...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
  echo -e "${GREEN}Node.js $(node -v) installed${NC}"
else
  echo "Node.js $(node -v) already installed"
fi

# ── 3. Install system packages ────────────────
echo -e "${YELLOW}[3/10] Installing git, nginx, certbot, ufw...${NC}"
sudo apt install -y git nginx certbot python3-certbot-nginx ufw

# ── 4. Clone repo ─────────────────────────────
echo -e "${YELLOW}[4/10] Setting up repository...${NC}"
if [ -d "$REPO_DIR" ]; then
  echo "Repo already exists at $REPO_DIR, pulling latest..."
  cd "$REPO_DIR"
  git fetch origin main
  git reset --hard origin/main
else
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

# ── 5. Configure backend .env ─────────────────
echo -e "${YELLOW}[5/10] Configuring backend .env...${NC}"
cd "$REPO_DIR/backend"
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate random PAYLOAD_SECRET
  SECRET=$(openssl rand -base64 32)
  # Use # delimiter to avoid base64 chars clashing with sed
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s#PAYLOAD_SECRET=.*#PAYLOAD_SECRET=$SECRET#" .env
  else
    sed -i "s#PAYLOAD_SECRET=.*#PAYLOAD_SECRET=$SECRET#" .env
  fi
  # Update CORS for production
  echo "PAYLOAD_PUBLIC_CORS=https://$DOMAIN" >> .env
  echo -e "${GREEN}backend/.env created with generated PAYLOAD_SECRET${NC}"
else
  echo "backend/.env already exists, skipping"
fi

# ── 6. Build backend ──────────────────────────
echo -e "${YELLOW}[6/10] Building backend...${NC}"
npm install
npm run build

# ── 7. Build frontend ─────────────────────────
echo -e "${YELLOW}[7/10] Building frontend...${NC}"
cd "$REPO_DIR/frontend"
npm install
PUBLIC_API_URL="http://localhost:3000/api" npx astro build

# ── 8. Configure firewall ─────────────────────
echo -e "${YELLOW}[8/10] Configuring firewall (ufw)...${NC}"
sudo ufw --force reset
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo -e "${GREEN}UFW enabled: SSH (22), HTTP (80), HTTPS (443)${NC}"

# ── 9. Configure nginx ────────────────────────
echo -e "${YELLOW}[9/10] Configuring nginx...${NC}"
sudo cp "$REPO_DIR/scripts/nginx/portfolio.conf" "/etc/nginx/sites-available/portfolio"
sudo ln -sf "/etc/nginx/sites-available/portfolio" "/etc/nginx/sites-enabled/portfolio"

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

if sudo nginx -t; then
  sudo systemctl reload nginx
  echo -e "${GREEN}Nginx configured and reloaded${NC}"
else
  echo -e "${RED}Nginx config test failed. Check /etc/nginx/sites-available/portfolio${NC}"
  exit 1
fi

# ── 10. Install PM2 & start services ──────────
echo -e "${YELLOW}[10/10] Installing PM2 and starting services...${NC}"
cd "$REPO_DIR"

if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" || true

echo ""
echo -e "${GREEN}=== Services started ===${NC}"
pm2 status

# ── 11. Request SSL certificate ───────────────
echo ""
echo -e "${YELLOW}[11] Requesting SSL certificate via certbot...${NC}"
if sudo certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  echo "SSL certificate already exists for $DOMAIN, skipping"
else
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" || {
    echo -e "${RED}Certbot failed. Run manually: sudo certbot --nginx -d $DOMAIN${NC}"
  }
fi

# ── Verify certbot auto-renewal ───────────────
echo ""
echo -e "${YELLOW}Verifying certbot renewal timer...${NC}"
sudo systemctl is-active certbot.timer 2>/dev/null && echo -e "${GREEN}certbot.timer is active${NC}" || echo -e "${YELLOW}certbot.timer not found — renewal may need manual check${NC}"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  VPS setup complete!${NC}"
echo -e "${GREEN}  Visit: https://$DOMAIN${NC}"
echo -e "${GREEN}  Admin: https://$DOMAIN/admin${NC}"
echo ""
echo -e "${YELLOW}  Next step (first deploy only):${NC}"
echo -e "  cd $REPO_DIR/backend && npm run seed"
echo -e "${GREEN}============================================${NC}"
