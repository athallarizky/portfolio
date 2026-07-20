# API Contract — Content UUID Identity & Merge (sprint-15)

> Delta on [`../../sprint-14/resources/api-contract.md`](../../sprint-14/resources/api-contract.md).
> Companion: [`architecture.md`](./architecture.md) · [`data-design.md`](./data-design.md).

---

## 1. New endpoint — `POST /api/data-merge` (admin-only)

All handlers begin with `if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })`
(same gate as sprint-14 endpoints).

```http
POST /api/data-merge
Content-Type: application/json
{ "collection": "authors", "winnerUuid": "…", "loserUuid": "…", "dryRun": true }
```

Engine call: `mergeRecords(payload, collection, winnerUuid, loserUuid, { dryRun })`.

Response `200` → `MergeReport`:

```jsonc
{
  "collection": "authors",
  "winner": { "uuid": "…", "title": "Athalla Rizky" },
  "loser":  { "uuid": "…", "title": "Atha Rizky" },
  "repointed": [ { "fromCollection": "articles", "field": "author", "count": 4 } ],
  "deletedLoser": false,   // true on a real run
  "dryRun": true,
  "backupPath": "payload.db.<ts>.premerge.bak"
}
```

Bad input (unknown collection / missing uuid / `winnerUuid === loserUuid` / uuid not found) → `400` JSON,
wrapped in try/catch (same pattern as the sprint-14 import endpoint — no unhandled 500).

## 2. New CLI commands

Added to `backend/package.json` (run from `backend/`):

| Script | Command | Effect |
|---|---|---|
| `npm run backfill:uuid` | `cp payload.db payload.db.$(date).bak 2>/dev/null; tsx src/data-sync/cli/backfill-uuid.ts` | Assigns a uuid to every uuid-less content record; prints per-collection counts. Idempotent (skips records that already have one). |
| `npm run merge` | `tsx src/data-sync/cli/merge.ts <collection> <winnerUuid> <loserUuid> [-- --dry-run]` | Merges loser into winner; `--dry-run` prints `MergeReport` only. |

## 3. Admin UI

A new **Merge** card in `/admin/data-sync` (`DataSyncClient.tsx`):

```
collection select ─► winner picker (by title + uuid) ─► loser picker (by title + uuid)
   └► [Preview merge (dry-run)]  →  renders repointed[] + "loser '<title>' will be deleted"
        └► [Apply merge]  (real run; disabled until a clean dry-run exists)
```

Same dry-run-first UX as content import (sprint-14 Phase 8): Apply is only enabled after a clean preview.

## 4. Export/import wire (unchanged surface, v2 underneath)

| Endpoint | Change |
|---|---|
| `GET /api/data-export` | Now emits `schemaVersion` **2** archives (uuid + dual relations). Response shape unchanged (zip). |
| `POST /api/data-import` | Accepts v1 **and** v2. Request/return shape unchanged (`ImportReport`). |

## 5. Safety matrix (delta)

| Op | Destructive? | Guard |
|---|---|---|
| Backfill uuid | No (additive) | backs up `payload.db` first anyway; idempotent |
| Merge — dry-run | No | default; reports repoint counts + which loser will be deleted |
| Merge — real | **Yes (deletes loser)** | admin-only + explicit confirm + `payload.db.<ts>.premerge.bak` |
