# Phase 1 Report — Import partial-archive priming

> Completed: 2026-07-20

## 1. What changed (`backend/src/data-sync/import.ts`)

- **`primeResolver(payload, resolver, present)`** (exported) — for each `RELATION_TARGETS` collection
  **not in `present`**, fetch its existing DB records and populate the resolver (`set(slug, id, uuid)`).
  Lets a partial archive (e.g. projects-only) resolve relations against records that aren't being imported
  this run (e.g. `techTags` → existing `technologies`).
- **Called in `importFromArchive`** right after `present` is computed (before the upsert loop), for both
  dry-run and real runs.
- **Full archives: no-op** — every relation target is in `present` → `continue` → zero DB fetches, zero
  behavior change for sprint-14/15 full exports.

## 2. How to run / verify

```bash
cd backend && npm test   # 2 new primeResolver tests
```

## 3. Test results

| Check | Result |
|---|---|
| `npm test` | **55/55** (2 new + 53 prior) |
| `npx tsc --noEmit` | clean |

New tests: priming populates resolver from DB for absent targets (technologies by slug + uuid); priming
fetches nothing when all targets are already in the archive.

## 4. Decision

| Decision | Reason |
|----------|--------|
| Prime from DB (not re-include target collections in the archive) | keeps generated archives small + scoped; reusing existing records is correct since the owner maps to known tech slugs |
| Run for dry-run too | dry-run must report accurate relation resolution, same as a real run |
