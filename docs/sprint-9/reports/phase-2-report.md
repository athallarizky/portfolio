# Phase 2 Report — PM2 Ecosystem + CI/CD

> Completed: 2026-07-18

---

## 1. Files created/modified

| File | Action | Purpose |
|------|--------|---------|
| `ecosystem.config.cjs` | Create | PM2 config for backend + frontend with autorestart |
| `scripts/deploy.sh` | Modify | Replace manual PM2 printout with `pm2 restart ecosystem.config.cjs` |
| `.github/workflows/deploy.yml` | Modify | PM2 restart integrated into SSH script |
| `docs/sprint-8/AGENTS.md` | Modify | Update PM2 commands, add provisioning script reference |

## 2. PM2 ecosystem config

```js
// ecosystem.config.cjs
module.exports = {
  apps: [
    { name: 'portfolio-backend', cwd: './backend', script: 'node_modules/.bin/next', args: 'start', env: { NODE_ENV: 'production', PORT: '3000' }, autorestart: true, max_restarts: 10, min_uptime: '10s' },
    { name: 'portfolio-frontend', cwd: './frontend', script: 'dist/server/entry.mjs', env: { NODE_ENV: 'production', PORT: '4321' }, autorestart: true, max_restarts: 10, min_uptime: '10s' },
  ],
};
```

**Why `next start` instead of `node server.js`:**
Backend doesn't have `output: 'standalone'` in next.config.mjs, so `next start` is the correct production command.

## 3. Deploy flow (updated)

```
git push origin main
  → GitHub Action: SSH into VPS
  → git reset --hard origin/main
  → rm -rf docs/
  → bash scripts/deploy.sh
       → npm install + build (backend)
       → npm install + astro build (frontend)
       → pm2 restart ecosystem.config.cjs (or start if not running)
```

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| `min_uptime: 10s` + `max_restarts: 10` | Prevents infinite restart loops on crash |
| PM2 restart in deploy.sh, not deploy.yml | deploy.sh is the single build+deploy entry point |
| deploy.yml SSH script runs `pm2 start` as fallback | If PM2 isn't running yet, `start` bootstraps it |
