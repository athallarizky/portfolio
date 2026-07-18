# Task Breakdown — Sprint-11: Manual Deploy Workflow

> Status: 🔵 In Progress | Created: 2026-07-18
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 1 — Fix workflow

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 1.1  | Change deploy trigger to workflow_dispatch | Easy    | —            | ⬜     |
| 1.2  | Verify workflow YAML syntax             | Easy       | 1.1          | ⬜     |

### Service Summary
- **Runtime:** GitHub Actions
- **Files:** `.github/workflows/deploy.yml`
- **Key output:** Deploy only runs on manual trigger

> 📄 Report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Documentation

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 2.1  | Write sprint docs (plan, tasks, reports) | Medium    | 1.2          | ⬜     |
| 2.2  | Write final-report.md                   | Easy       | 2.1          | ⬜     |

---

## Dependency Graph

```
1.1 ──► 1.2 ──► 2.1 ──► 2.2
```

## Summary

| Phase               | Tasks | Difficulty Mix | Status |
|---------------------|-------|----------------|--------|
| 1 — Fix workflow    | 2     | 2 E            | ⬜     |
| 2 — Documentation   | 2     | 1 M, 1 E       | ⬜     |
| **Total**           | **4** | **3 E, 1 M**   |        |
