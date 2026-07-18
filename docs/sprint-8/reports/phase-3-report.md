# Phase 3 Report — Deploy cleanup & documentation

> Completed: 2026-07-14

---

## 1. What was done

- Removed `npm run seed` from `scripts/deploy.sh` — seeding is now manual
- Added first-deploy instructions to `backend/.env.example`
- Added note in deploy.sh: "On first deploy, run `cd backend && npm run seed`"
- Created `docs/sprint-8/AGENTS.md` — deploy + seed guide for LLM agents
- GitHub Action excludes `/docs` from VPS deployment

## 2. deploy.sh now does

```
1. Validates backend/.env exists and PAYLOAD_SECRET is not default
2. npm install + npm run build in backend
3. npm install + npx astro build in frontend
4. Prints PM2 start commands + first-deploy seed note
```

## 3. First deploy checklist

1. Copy `backend/.env.example` → `backend/.env`
2. Set real `PAYLOAD_SECRET`
3. Run `./scripts/deploy.sh`
4. Run `cd backend && npm run seed` (only on first deploy)
5. Start with PM2

## 4. Verification

- `deploy.sh` runs successfully without attempting to seed
- `.env.example` documents first-deploy steps
- AGENTS.md covers all deploy + seed workflows for LLM handoff
