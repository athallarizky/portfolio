# Phase 6 Report — Merge CLI + endpoint + admin UI

> Completed: 2026-07-20

## 1. What was built

- **`cli/merge.ts`** + **`npm run merge -- <collection> <winnerUuid> <loserUuid> [-- --dry-run]`** — prints
  the MergeReport (repointed counts, loser-outgoing awareness, deletion status).
- **`POST /api/data-merge`** (admin-only) — JSON body `{ collection, winnerUuid, loserUuid, dryRun? }` →
  `MergeReport`. `MergeError` → 400, other errors → 500.
- **`admin/MergePanel.tsx`** — a new card in `/admin/data-sync`: collection select → winner/loser pickers
  (by uuid, fetched from `/api/<collection>?depth=0`) → Preview (dry-run) → Apply (enabled only after a
  clean preview on the same selection). Shows repointed relations + which loser is deleted.
- **`endpoints.ts`** — `dataMergeEndpoint` added to `dataSyncEndpoints`.

## 2. No importMap change

`MergePanel` is a normal ES import inside `DataSyncClient.tsx` (like `@payloadcms/ui`'s `Button`), not a
config-declared path-string component → resolved by the admin bundler, **not** importMap. `next build`
confirms it compiles into the admin bundle.

## 3. How to run

```bash
cd backend
npm run merge -- authors <winnerUuid> <loserUuid> -- --dry-run   # preview
npm run merge -- authors <winnerUuid> <loserUuid>                # apply (backs up payload.db first)
# or via the UI: /admin/data-sync → "Merge duplicates"
```

## 4. Test results

| Check | Result |
|---|---|
| `npm test` | **53/53** |
| `npx tsc --noEmit` | clean |
| `npm run build` | ✅ compiled; routes `/admin/[[...segments]]` + `/api/[...slug]` |

## 5. Decisions

| Decision | Reason |
|----------|--------|
| Merge endpoint is JSON (not multipart) | no file upload; simpler request shape |
| `MergeError` → 400, other → 500 | distinguish user error (bad uuid/collection) from server fault |
| Embed MergePanel via normal import | avoids importMap churn; build verifies the bundle |
| UI fetches records from the public REST API | `read: () => true`; uuid is returned despite `admin.disabled` (that hides from admin panel only) |
