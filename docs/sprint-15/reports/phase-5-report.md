# Phase 5 Report — Merge engine

> Completed: 2026-07-20

## 1. What was built

- **`keys.ts` — `inverseRelations()`**: derives `target → [{ fromCollection, field, hasMany, selfRef }]`
  from `RELATIONS`. Single source of truth — a new relationship auto-flows into merge.
- **`import.ts` — `backupDb(dir?, label='preimport')`**: generalized; merge passes `'premerge'`.
- **`merge.ts` (NEW)** — `mergeRecords(payload, collection, winnerUuid, loserUuid, {dryRun})`:
  1. find winner + loser by uuid (rejects unknown collection / winner==loser / not-found);
  2. for every incoming relationship (`inverseRelations`), fetch-all + filter for refs to `loser.id`,
     repoint → `winner.id` (hasMany dedups + drops loser, preserves id value type);
  3. delete the loser; dry-run reports counts only (0 writes).
  - `loserOutgoing` in the report lists the loser's own relations (discarded with it) for awareness.
  - Helpers exported for testing: `fieldReferencesId`, `repointHasMany` (internal), `MergeError`.

## 2. How to run / verify

```bash
cd backend && npm test   # 8 new merge tests
```

## 3. Test results

| Check | Result |
|---|---|
| `npm test` | **53/53** (8 new merge + 45 prior) |
| `npx tsc --noEmit` | clean |

New tests: inverseRelations (self + hasOne); fieldReferencesId (hasOne/hasMany/null); merge hasOne
repoint + delete; merge hasMany repoint + dedup; self-ref repoint; dry-run (0 writes); error cases
(winner==loser / unknown collection / missing uuid).

## 4. Decisions

| Decision | Reason |
|----------|--------|
| Fetch-all + filter (not a `where` query) for incoming refs | robust across adapters (relationship query semantics differ); portfolio data is small |
| Preserve original id value type in hasMany repoint | SQLite ids are numeric; avoid stringifying stored relationship arrays |
| Self-ref merge leaves a self-loop (winner→winner) | rare edge case (merging A into B where A referenced B); surfaced in the dry-run report, editable after |
| Loser's outgoing relations discarded, not migrated | winner-takes-all semantics; reported so the owner can re-key first if they matter |
