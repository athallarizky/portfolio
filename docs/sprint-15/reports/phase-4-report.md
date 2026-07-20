# Phase 4 Report — Backfill CLI

> Completed: 2026-07-20

## 1. What was built

- **`backend/src/data-sync/backfill.ts`** — `backfillUuids(payload, {dryRun})` walks all 8 content
  collections, finds records with no `uuid`, and `payload.update`s one onto each (update, not create →
  the `ensureUuid` hook is a no-op → the explicit uuid is preserved). Idempotent: records that already
  have a uuid are skipped. Returns `{ scanned, backfilled, dryRun }`.
- **`backend/src/data-sync/cli/backfill-uuid.ts`** — `npm run backfill:uuid [-- --dry-run]`. Prints
  per-collection scanned/filled counts.
- **`package.json`** — `"backfill:uuid"` script (backs up `payload.db` first, same as seed/export).
  Run independently per env.

## 2. How to run

```bash
cd backend
npm run backfill:uuid -- --dry-run   # preview
npm run backfill:uuid                # assign (backs up payload.db first)
```

## 3. Test results

| Check | Result |
|---|---|
| `npm test` | **45/45** (4 new backfill tests + 41 prior) |
| `npx tsc --noEmit` | clean |

New tests (fake Payload): assigns to uuid-less + leaves existing; idempotent second run; dry-run
counts but writes nothing; reports scanned when nothing needs filling.

## 4. Decisions

| Decision | Reason |
|----------|--------|
| Backfill = `payload.update` (not re-create) | preserves the existing DB id + all fields; only adds uuid; hook no-op keeps it |
| Engine takes a `Payload` (no backup inside) | testable with a fake payload; the npm script backs up the DB (matches export/seed pattern) |
| Cross-env: run per env, not coordinated | uuids differ at first but self-align on the next content sync |

> Real run against `payload.db` (schema-push + populate) happens in Phase 7 e2e.
