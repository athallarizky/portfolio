# Sprint 8 — Final Report

> Status: ✅ Delivered | 2026-07-14
> Audience: sprint-9 context. Read this + [`../../AGENTS.md`](../../AGENTS.md) before starting sprint-9.

---

## 1. Sprint goal & outcome

Automate VPS deployment on push to main, remove auto-seeding from the deploy script, and add backup hooks so no seed operation can destroy production data without a rollback.

## 2. Final changes

| File | Change |
|------|--------|
| `backend/package.json` | All seed scripts now include `cp payload.db → .bak` before running. Added `seed:dry` |
| `backend/src/seed/dry.ts` | **New** — dry-run seed previewer |
| `.github/workflows/deploy.yml` | **New** — SSH deploy on push to main, excludes `/docs` |
| `scripts/deploy.sh` | Removed `npm run seed`; added first-deploy note |
| `backend/.env.example` | Added first-deploy instructions |
| `docs/sprint-8/AGENTS.md` | **New** — deploy + seed guide for LLM agents |
| `docs/sprint-8/reports/` | Phase 1-3 reports |

## 3. Deploy flow

```
git push origin main
  → GitHub Action: SSH into VPS
  → git reset --hard origin/main
  → rm -rf docs/
  → ./scripts/deploy.sh (build backend + frontend)
  → PM2 restarts both services
```

Seed is **manual** — run `npm run seed:articles` (or `seed:projects`, etc.) when adding content. Every seed command creates a backup.

## 4. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 — Backup hooks | 4 | ✅ |
| 2 — CI/CD | 3 | ✅ |
| 3 — Deploy cleanup | 3 | ✅ |
| **Total** | **10** | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

## 5. Verification

- `npm run seed:dry` prints all data without writing
- `npm run seed` creates `.bak` before touching DB
- `scripts/deploy.sh` builds both services without seeding
- GitHub Action workflow excludes `/docs` from VPS
- Build passes

## 6. Sprint-9 handoff

- Set up VPS GitHub Action secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)
- Configure actual VPS (nginx, SSL, PM2)
- First deploy: seed DB, verify all routes
- Monitor for seed backup growth — add cleanup cron if needed
