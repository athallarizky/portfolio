# Sprint 11 — Final Report

> Status: ✅ Delivered | 2026-07-18 · Phase 3 added 2026-07-19
> Audience: sprint-12 context.

---

## 1. Sprint goal & outcome

Switch GitHub Action deploy from auto-trigger on push to `main` to manual trigger (`workflow_dispatch`). User controls when deploys happen via the Actions tab.

## 2. Final changes

| File | Change |
|------|--------|
| `.github/workflows/deploy.yml` | Phase 1: `on: push: [main]` → `on: workflow_dispatch`. Phase 3: missing-repo now fails fast with diagnostics + a 2-cause fix matrix |
| `docs/sprint-11/plan.md` | Sprint plan |
| `docs/sprint-11/tasks.md` | Task breakdown |
| `docs/sprint-11/reports/phase-1-report.md` | Workflow fix |
| `docs/sprint-11/reports/phase-2-report.md` | Documentation |
| `docs/sprint-11/reports/phase-3-report.md` | Repo-not-found diagnostics |

## 3. How to deploy (manual)

1. GitHub repo → **Actions** tab → **"Deploy to VPS"**
2. Click **"Run workflow"** → branch `main` → **"Run workflow"**

## 4. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 — Fix workflow | 2 | ✅ |
| 2 — Documentation | 2 | ✅ |
| 3 — Deploy diagnostics | 3 | ✅ |
| **Total** | **7** | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

## 5. Verification

- YAML syntax valid
- Push to main does NOT auto-deploy
- `deploy.sh` unchanged
