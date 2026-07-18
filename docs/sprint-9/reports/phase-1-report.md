# Phase 1 Report — VPS Provisioning + Nginx

> Completed: 2026-07-18

---

## 1. How to Run

```bash
# On a fresh Ubuntu 22.04/24.04 VPS:
bash scripts/setup-vps.sh
```

## 2. Files created

| File | Purpose |
|------|---------|
| `scripts/setup-vps.sh` | One-shot provisioning: Node.js 22, git, nginx, certbot, PM2, ufw, clone repo, .env, build, SSL |
| `scripts/nginx/portfolio.conf` | Nginx reverse proxy: `/api`, `/admin` → localhost:3000, rest → localhost:4321 |

## 3. Architecture

```
Internet
  │
  ▼
nginx (:80/:443) ──► certbot (Let's Encrypt)
  │
  ├── /api, /admin ──► backend (Next.js :3000)
  │
  └── / ──► frontend (Astro SSR :4321)
```

## 4. nginx config details

- Single server block for `athallarizky.com` + `www.athallarizky.com`
- Proxy headers: `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`
- WebSocket upgrade headers included (`Upgrade`, `Connection`)
- certbot --nginx auto-modifies for SSL (adds listen 443 + ssl_certificate)

## 5. Firewall (ufw)

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH     |
| 80   | TCP      | HTTP    |
| 443  | TCP      | HTTPS   |

## 6. Key decisions

| Decision | Rationale |
|----------|-----------|
| Node.js 22.x from NodeSource | Matches project `>=22.12.0` requirement |
| certbot --nginx (not standalone) | Auto-modifies nginx config, simplest path |
| Provisioning script idempotent | Checks if steps already done before repeating |
| `PUBLIC_API_URL=http://localhost:3000/api` in frontend build | Since nginx proxies, frontend connects to local backend — no external URL needed |

## 7. Reference files

| File | Purpose |
|------|---------|
| `scripts/setup-vps.sh` | Main provisioning script |
| `scripts/nginx/portfolio.conf` | Nginx config template |
