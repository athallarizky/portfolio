# Sprint 11 — Final Report

> Status: ✅ Delivered | 2026-07-18
> Audience: sprint-12 context.

---

## 1. Sprint goal & outcome

Switch GitHub Action deploy from auto-trigger on push to `main` to manual trigger (`workflow_dispatch`). User controls when deploys happen via the Actions tab.

## 2. Final changes

| File | Change |
|------|--------|
| `.github/workflows/deploy.yml` | Changed `on: push: [main]` → `on: workflow_dispatch` |
| `docs/sprint-11/plan.md` | Sprint plan |
| `docs/sprint-11/tasks.md` | Task breakdown |
| `docs/sprint-11/reports/phase-1-report.md` | Workflow fix |
| `docs/sprint-11/reports/phase-2-report.md` | Documentation |

## 3. How to deploy (manual)

1. GitHub repo → **Actions** tab → **"Deploy to VPS"**
2. Click **"Run workflow"** → branch `main` → **"Run workflow"**

## 4. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 — Fix workflow | 2 | ✅ |
| 2 — Documentation | 2 | ✅ |
| **Total** | **4** | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

## 5. Verification

- YAML syntax valid
- Push to main does NOT auto-deploy
- `deploy.sh` unchanged
