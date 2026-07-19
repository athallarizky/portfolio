# Task Breakdown — Sprint-11: Manual Deploy Workflow

> Status: ✅ Delivered | Created: 2026-07-18 · Phase 3 added 2026-07-19
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 1 — Fix workflow

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 1.1  | Change deploy trigger to workflow_dispatch | Easy    | —            | ✅     |
| 1.2  | Verify workflow YAML syntax             | Easy       | 1.1          | ✅     |

### Service Summary
- **Runtime:** GitHub Actions
- **Files:** `.github/workflows/deploy.yml`
- **Key output:** Deploy only runs on manual trigger

> 📄 Report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Documentation

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 2.1  | Write sprint docs (plan, tasks, reports) | Medium    | 1.2          | ✅     |
| 2.2  | Write final-report.md                   | Easy       | 2.1          | ✅     |

> 📄 Report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Deploy "repo not found" diagnostics

> Trigger (2026-07-19): manual dispatch failed with `❌ Repo not found at ~/portfolio`. Run history showed the workflow had *never* succeeded (the VPS was provisioned manually via `setup-vps.sh`), pointing at a `VPS_USER` / path mismatch or a reset VPS. The old message gave no clues.

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 3.1  | Rewrite deploy SSH script to fail-fast with diagnostics (whoami, `$HOME`, `ls ~`, probe `/root` + `/home/*`, node/pm2/nginx check) + a 2-cause fix matrix | Medium | — | ✅ |
| 3.2  | Validate (YAML parse + `bash -n` on inline script) | Easy   | 3.1          | ✅     |
| 3.3  | Phase 3 report + update task tracker    | Easy       | 3.2          | ✅     |

### Service Summary
- **Runtime:** GitHub Actions (`appleboy/ssh-action@v1`)
- **Files:** `.github/workflows/deploy.yml`
- **Decision:** deliberately do **not** auto-clone on missing repo — `backend/.env` (with `PAYLOAD_SECRET`) is gitignored, so a fresh clone would fail later at `deploy.sh`'s `.env` check. Real recovery is re-provisioning via `setup-vps.sh`. The workflow now tells you exactly which cause it is.
- **Verification:** YAML + `bash -n` clean. End-to-end run requires a live dispatch against the VPS (owner action).

> 📄 Report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Dependency Graph

```
1.1 ──► 1.2 ──► 2.1 ──► 2.2
                       (Phase 3 independent)
3.1 ──► 3.2 ──► 3.3
```

## Summary

| Phase               | Tasks | Difficulty Mix | Status |
|---------------------|-------|----------------|--------|
| 1 — Fix workflow    | 2     | 2 E            | ✅     |
| 2 — Documentation   | 2     | 1 M, 1 E       | ✅     |
| 3 — Deploy diagnostics | 3  | 1 M, 2 E       | ✅     |
| **Total**           | **7** | **2 M, 5 E**   | ✅     |
