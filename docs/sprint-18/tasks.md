# Task Breakdown — Portfolio Sprint-18

> Status: 🟢 Active | Created: 2026-07-23 · Updated: 2026-07-23
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery: Payload delete file behavior

| ID   | Task                           | Difficulty | Dependencies | Status |
|------|--------------------------------|------------|-------------|--------|
| 0.1  | Verify whether `payload.delete` on upload collection removes the file from disk | Easy | — | ✅ |

**Finding:** Payload 3 `deleteAssociatedFiles()` is called with `overrideDelete: true` on every delete path → files are cleaned up natively. Item #2 (media cleanup) is **invalidated — no code needed.**

## Phase 1 — Deploy

| ID   | Task                           | Difficulty | Dependencies | Status |
|------|--------------------------------|------------|-------------|--------|
| 1.1  | Push to main (sprint-17 code + sprint-18 docs) | Easy | — | ⬜ |
| 1.2  | Deploy to production via GitHub Actions | Easy | 1.1 | ⬜ |

## Phase 2 — Prod Observation

| ID   | Task                           | Difficulty | Dependencies | Status |
|------|--------------------------------|------------|-------------|--------|
| 2.1  | Export data from production | Easy | 1.2 | ⬜ |
| 2.2  | Run replace-all dry-run against production export | Easy | 2.1 | ⬜ |
| 2.3  | Run replace-all (apply) in production | Medium | 2.2 | ⬜ |
| 2.4  | Document findings + fix bugs if any | Medium | 2.3 | ⬜ |

## Phase 3 — Verify & Docs

| ID   | Task                           | Difficulty | Dependencies | Status |
|------|--------------------------------|------------|-------------|--------|
| 3.1  | Write final report | Medium | 2.4 | ⬜ |
| 3.2  | Create `docs/sprint-19/resources/backlog.md` | Easy | 3.1 | ⬜ |

---

## Dependency Graph

```
Phase 0 ✅
   0.1 ✅

Phase 1
   1.1 ──► 1.2

Phase 2
   1.2 ──► 2.1 ──► 2.2 ──► 2.3 ──► 2.4

Phase 3
   2.4 ──► 3.1 ──► 3.2
```

## Summary

| Phase        | Tasks | Status |
|-------------|-------|--------|
| 0 — Discovery | 1   | ✅     |
| 1 — Deploy    | 2   | ⬜     |
| 2 — Prod      | 4   | ⬜     |
| 3 — Docs      | 2   | ⬜     |
| **Total**     | **9** |      |
