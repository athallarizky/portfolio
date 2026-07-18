# Phase 2 Report — Documentation

> Completed: 2026-07-18

---

## 1. Documents created

| File | Purpose |
|------|---------|
| `docs/sprint-11/plan.md` | Sprint plan |
| `docs/sprint-11/tasks.md` | Task breakdown |
| `docs/sprint-11/reports/phase-1-report.md` | Workflow fix |
| `docs/sprint-11/reports/phase-2-report.md` | Documentation |
| `docs/sprint-11/final-report.md` | Sprint summary |

## 2. Manual deploy instructions (for future reference)

### Trigger deploy via GitHub

1. GitHub repo → **Actions** tab
2. Pilih **"Deploy to VPS"**
3. Klik **"Run workflow"** → branch `main` → **"Run workflow"**

### Deploy manually via SSH

```bash
ssh root@<VPS_IP>
cd ~/portfolio
git fetch origin main
git reset --hard origin/main
rm -rf docs/
bash scripts/deploy.sh
```

### What deploy.sh does

1. `cd backend` → `npm install` → `npm run build`
2. `cd frontend` → `npm install` → `npx astro build`
3. `pm2 restart ecosystem.config.cjs`
