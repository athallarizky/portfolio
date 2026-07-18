# Task Breakdown — Sprint-8: CI/CD, Seeder Control & Backup

> Status: 🟡 Planning | Created: 2026-07-14
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 1 — Backup hooks

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 1.1  | Add pre-seed backup to npm scripts | Easy | — | ✅ |
| 1.2  | Add seed:dry script | Medium | — | ✅ |
| 1.3  | payload.db-* already gitignored | Easy | — | ✅ |
| 1.4  | Verify seed:dry output | Easy | 1.2 | ✅ |

### Service Summary
- **Runtime:** Node.js
- **Files:** `backend/package.json`, `backend/src/seed/dry.ts` (new), `.gitignore`
- **Key output:** every seed run leaves a rollback; dry-run shows before/after without writing

> 📄 Report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — CI/CD (GitHub Actions)

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 2.1  | Create .github/workflows/deploy.yml | Medium | — | ✅ |
| 2.2  | Add deploy key setup docs to AGENTS.md | Easy | 2.1 | ✅ |
| 2.3  | Verify workflow syntax | Medium | 2.1 | ✅ |

### Service Summary
- **Runtime:** GitHub Actions
- **Files:** `.github/workflows/deploy.yml` (new), `docs/sprint-8/AGENTS.md`
- **Key output:** push to main → VPS updates automatically

> 📄 Report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Deploy script cleanup

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 3.1  | Remove seed from deploy.sh | Easy | 1.1 | ✅ |
| 3.2  | Add first-deploy instructions to .env.example | Easy | 3.1 | ✅ |
| 3.3  | Write AGENTS.md for LLM handoff | Easy | 3.1, 3.2 | ✅ |

### Service Summary
- **Files:** `scripts/deploy.sh`, `backend/.env.example`, `docs/sprint-8/AGENTS.md`
- **Key output:** deploy never auto-seeds; clear docs for first-deploy and ongoing updates

> 📄 Report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Dependency Graph

```
Phase 1 ──► Phase 3 (deploy script depends on backup hooks)
Phase 2 ──► independent (CI/CD touches different files)
```

## Summary

| Phase                        | Tasks | Difficulty Mix | Status |
|------------------------------|-------|----------------|--------|
| 1 — Backup hooks             | 4     | 3 E, 1 M       | ✅     |
| 2 — CI/CD                    | 3     | 1 E, 2 M       | ✅     |
| 3 — Deploy cleanup           | 3     | 3 E            | ✅     |
| **Total**                    | **10**| **7 E, 3 M**   | ✅     |
