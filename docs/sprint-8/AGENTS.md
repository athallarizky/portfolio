# AGENTS.md — Sprint-8: Deploy & Seed Guide

> **For:** Any LLM agent working on deploy/seed tasks in this repo.
> **Context:** Sprint-8 added CI/CD, backup hooks, and dry-run seeding.

---

## 0. Quick reference

| Task | Command | What it does |
|------|---------|-------------|
| Deploy | `./scripts/deploy.sh` | Builds backend + frontend, prints PM2 commands. Does NOT seed |
| Seed all | `npm run seed` | Backs up DB, seeds everything |
| Seed preview | `npm run seed:dry` | Prints what would be seeded. No writes |
| Seed articles only | `npm run seed:articles` | Seeds tags + authors + articles |
| Seed projects only | `npm run seed:projects` | Seeds technologies + projects |
| Restore backup | `cp payload.db.20260714-120000.bak payload.db` | Rollback to pre-seed state |

## 1. Deploy flow

```
git push origin main
  → GitHub Action triggers
  → SSH into VPS
  → git reset --hard origin/main
  → rm -rf docs/   (exclude planning artifacts)
  → ./scripts/deploy.sh
  → PM2 restarts both services
```

## 2. GitHub Action secrets (set in repo Settings → Secrets)

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Your Tencent VPS IP |
| `VPS_USER` | SSH username (likely `root`) |
| `VPS_SSH_KEY` | Private SSH key for deploy access |

## 3. Adding content

```bash
# 1. Edit the right data file:
#    seed/data/articles.ts   — new blog post
#    seed/data/projects.ts   — new project

# 2. Dry-run to preview
cd backend && npm run seed:dry

# 3. Seed to database (creates backup automatically)
npm run seed:articles   # or seed:projects

# 4. Deploy
git add -A && git commit -m "content: add new article" && git push
```

## 4. Backup strategy

- Every `npm run seed*` command creates a timestamped `.bak` before writing
- Backups are gitignored (match `payload.db-*` pattern)
- Rollback: `cp payload.db.20260714-120000.bak payload.db && pm2 restart portfolio-backend`
- PM2 management: `pm2 restart ecosystem.config.cjs` / `pm2 status` / `pm2 logs`

## 5. First VPS setup

```bash
# On VPS, after cloning repo:
cp backend/.env.example backend/.env
# → edit PAYLOAD_SECRET with a real value
cd backend && npm install && npm run seed && npm run build
cd ../frontend && npm install && npx astro build
pm2 start backend/.next/standalone/server.js --name portfolio-backend
pm2 start frontend/dist/server/entry.mjs --name portfolio-frontend
pm2 save
```
