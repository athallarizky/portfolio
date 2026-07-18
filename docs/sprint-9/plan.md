# Sprint-9 Plan — VPS Provisioning, Nginx & SSL

> Status: ✅ Complete | Created: 2026-07-18
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-8/final-report.md`](../sprint-8/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-8 delivered CI/CD (GitHub Action → VPS deploy on push to main), backup hooks, and seed:dry. What's missing: the VPS itself isn't provisioned. There's no nginx reverse proxy, no SSL, and no PM2 config file — the deploy script just prints PM2 commands as suggestions.

## 1. Sprint goal

Provision the VPS from scratch with a single script: firewall (ufw), Node.js 22, nginx reverse proxy, Let's Encrypt SSL for `athallarizky.com`, and PM2.

## 2. Scope

**In scope:**
- VPS provisioning script (`scripts/setup-vps.sh`) — installs deps, firewall, clones repo, builds, configures nginx + SSL
- Nginx config template (`scripts/nginx/portfolio.conf`) — reverse proxy `/api` + `/admin` → backend (3000), rest → frontend (4321)
- PM2 ecosystem config (`ecosystem.config.cjs`) — manages backend + frontend with autorestart
- Update `scripts/deploy.sh` and `.github/workflows/deploy.yml` to use PM2 ecosystem restart
- Update sprint-8 AGENTS.md PM2 commands

**Out of scope:**
- Docker, staging, monitoring, Postgres migration, DNS setup (assumes domain points to VPS)

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| nginx config in repo (`scripts/nginx/`) | Version-controlled, reusable |
| Single nginx server block | Simple routing: `/api`, `/admin` → backend, rest → frontend |
| PM2 ecosystem at repo root | Standard location |
| certbot --nginx | Auto SSL + renewal |
| ufw: 22, 80, 443 only | Minimal attack surface |

## 4. Phasing

- **Phase 0 — Discovery:** ✅
- **Phase 1 — VPS provisioning + nginx:** `setup-vps.sh`, `portfolio.conf`
- **Phase 2 — PM2 + CI/CD:** `ecosystem.config.cjs`, update deploy.sh & deploy.yml
- **Phase 3 — Docs & verification:** Sprint docs, build verification

## 5. Verification

1. `bash scripts/setup-vps.sh` provisions fresh Ubuntu VPS
2. `nginx -t` validates config
3. `https://athallarizky.com` serves portfolio with SSL
4. `https://athallarizky.com/api/projects` returns JSON
5. `pm2 status` shows both online
6. Push to main → deploy → PM2 restarts
7. certbot renew timer active
