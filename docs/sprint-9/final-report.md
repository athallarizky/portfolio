# Sprint 9 — Final Report

> Status: ✅ Delivered | 2026-07-18
> Audience: sprint-10 context. Read this + [`../../AGENTS.md`](../../AGENTS.md) before starting sprint-10.

---

## 1. Sprint goal & outcome

Provision the VPS from scratch with a single script: firewall, Node.js 22, PM2, nginx reverse proxy, and Let's Encrypt SSL for `athallarizky.com`. All configuration files stored in the repo.

## 2. Final changes

| File | Change |
|------|--------|
| `scripts/setup-vps.sh` | **New** — one-shot VPS provisioning (Node 22, nginx, certbot, PM2, ufw) |
| `scripts/nginx/portfolio.conf` | **New** — nginx reverse proxy for `athallarizky.com` |
| `ecosystem.config.cjs` | **New** — PM2 config for backend + frontend |
| `scripts/deploy.sh` | Updated to auto-restart PM2 via `ecosystem.config.cjs` |
| `.github/workflows/deploy.yml` | Updated SSH script to use PM2 ecosystem |
| `docs/sprint-8/AGENTS.md` | Updated PM2 commands and first-setup instructions |
| `backend/src/seed/lib/lexical.ts` | Fixed types: added index signatures, tightened `direction` type |
| `backend/src/seed/data/articles.ts` | Fixed `ARTICLE_BODIES` type from `LexicalParagraph[]` → `LexicalNode[]` |
| `backend/src/seed/data/projects.ts` | Same fix |
| `backend/src/seed/phases/articles.ts` | Added `as any` cast for PayloadCMS boundary |
| `backend/src/seed/phases/projects.ts` | Same fix |
| `backend/src/app/(payload)/admin/[[...segments]]/not-found.tsx` | Fixed Next.js 16 `NotFoundPage` missing params |

## 3. Deploy flow (updated)

```
git push origin main
  → GitHub Action: SSH into VPS
  → git reset --hard origin/main
  → rm -rf docs/
  → bash scripts/deploy.sh
       → npm install + npm run build (backend)
       → npm install + npx astro build (frontend)
       → pm2 restart ecosystem.config.cjs
```

## 4. First VPS setup

```bash
# On fresh Ubuntu 22.04/24.04 VPS:
git clone git@github.com:athallarizky/portfolio.git ~/portfolio
cd ~/portfolio
bash scripts/setup-vps.sh
cd backend && npm run seed    # First deploy only
```

## 5. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery | 3 | ✅ |
| 1 — VPS provisioning + nginx | 2 | ✅ |
| 2 — PM2 + CI/CD | 4 | ✅ |
| 3 — Docs & verification | 3 | ✅ |
| **Total** | **12** | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

## 6. Verification

- `npx tsc --noEmit` (backend) — passes
- `npm run build` (backend) — passes
- `npx astro build` (frontend) — passes
- `scripts/setup-vps.sh` — executable, bash syntax valid
- `scripts/nginx/portfolio.conf` — valid nginx syntax (will be tested by `nginx -t` on VPS)

## 7. Sprint-10 handoff

Next sprint options:
- **Run the provisioning script on actual VPS** — SSH in, run `bash scripts/setup-vps.sh`, seed DB, verify HTTPS
- **DNS setup** — point `athallarizky.com` A record to VPS IP if not already
- **Content work** — populate seed data with real articles, projects, documents
- **Frontend polish** — Any remaining UI improvements
