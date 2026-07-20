# Architecture — Content UUID Identity & Merge (sprint-15)

> Delta on [`../../sprint-14/resources/architecture.md`](../../sprint-14/resources/architecture.md).
> Companion: [`data-design.md`](./data-design.md) · [`api-contract.md`](./api-contract.md).

---

## 1. What changes in `backend/src/`

```
data-sync/
├── types.ts          # MODIFY: SCHEMA_VERSION 1→2; schemaVersion: 1 | 2
├── keys.ts           # MODIFY: + inverseRelations() helper (single source: RELATIONS)
├── manifest.ts       # MODIFY: validateManifest accepts v1 + v2
├── export.ts         # MODIFY: emit uuid + dual {uuid,key} relations
├── import.ts         # MODIFY: uuid-first upsert + dual resolve + v1 fallback
├── relations.ts      # MODIFY: resolver keyed by uuid, key as fallback
├── merge.ts          # NEW: mergeRecords() engine
├── backfill.ts       # NEW: backfillUuids() engine (used by CLI)
├── hooks.ts          # NEW: ensureUuid beforeChange hook (shared by 8 collections)
├── endpoints.ts      # MODIFY: + POST /api/data-merge
├── cli/
│   ├── merge.ts          # NEW
│   └── backfill-uuid.ts  # NEW
└── admin/
    └── MergePanel.tsx    # NEW (added as a card in DataSyncClient.tsx)
collections/*.ts      # MODIFY: + uuid field + ensureUuid hook (8 collections)
```

## 2. Tech decisions (delta)

| Concern | Choice | Why |
|---|---|---|
| uuid source | `randomUUID()` from `node:crypto` (Node 24) | Zero deps; v4; cryptographically random |
| uuid assignment | `beforeChange` hook (`ensureUuid`), immutable-on-create | Version-proof vs `defaultValue`; uniform across admin/seed/import; pass-through safe |
| Relation wire format (v2) | `{ uuid, key }` per ref | Renamed targets still resolve by uuid; `key` stays human-readable + v1-compatible |
| v1 archive support | detect by `manifest.schemaVersion === 1` → plain-string relations | No big-bang; existing archives (incl. the owner's Downloads) keep importing |
| Merge field policy | winner-takes-all (loser's non-relation data discarded; only relations repointed) | Simple, predictable; any field conflict surfaced in the dry-run report |
| Merge safety | dry-run default + pre-merge `payload.db` backup | Mirrors the import safety model (sprint-14 §4) |

## 3. Module boundaries (new / changed)

| Module | Input | Output | Does NOT |
|---|---|---|---|
| `hooks.ts` (`ensureUuid`) | `{ data, operation }` (beforeChange) | mutates `data.uuid` on create-when-missing | run on update; overwrite an existing uuid |
| `backfill.ts` | `payload` | `BackfillReport` | assign a uuid to a record that already has one (skip) |
| `merge.ts` (`mergeRecords`) | `payload`, collection, winner/loser uuid, `{dryRun}` | `MergeReport` | merge across collections; delete the winner |
| `keys.ts` (`inverseRelations`) | — (reads `RELATIONS`) | `target → [{fromCollection, field, hasMany, selfRef}]` | duplicate the relation definitions |
| `cli/merge.ts` | argv | stdout + writes | contain merge logic (delegates to `merge.ts`) |
| `admin/MergePanel.tsx` | — | React UI | call the DB directly (uses `/api/data-merge`) |

## 4. Key architectural decisions

### A. Identity = uuid; natural key = handle + fallback
**Decision:** upsert / merge / relate by `uuid`; the natural key is kept as the display handle + v1 fallback.
**Reasoning:** uuid is both portable (content-level, not DB `id`) and rename-stable (unlike the natural key). The natural key stays so archives remain human-readable and v1 archives keep working — no forced re-export.

### B. `beforeChange` hook over `defaultValue`
**Decision:** a shared `ensureUuid` hook fills `randomUUID()` on create when `uuid` is absent; it is a no-op on update.
**Reasoning:** `defaultValue` semantics are version-dependent and only fire on create; a hook is explicit, testable, fires on every create path (admin UI / seed / import), and is a no-op on update — so the uuid is immutable and import pass-through is automatic (the provided `uuid` is simply written). The hook is the safety-net; the backfill CLI is the one-time populator for pre-existing records.

### C. Merge = repoint + delete, never across collections
**Decision:** `mergeRecords` operates within one collection. It repoints every incoming relation (computed by inverting `RELATIONS`) from loser→winner, handles self-refs, then deletes the loser. Winner's fields are unchanged (winner-takes-all).
**Reasoning:** cross-collection merge is meaningless (different record types). Within-collection merge with relation repointing is the only semantically sound "combine two records." Loser deletion keeps the DB clean; relations never orphan because every incoming ref is repointed first.

### D. Single source of truth for relations
**Decision:** both the export/import rewrite AND the merge inverse-map read `RELATIONS` (sprint-14 `keys.ts`). The merge inverse map is **derived**, not hand-maintained.
**Reasoning:** if a new relationship is added later, merge picks it up automatically — no second place to update and forget.
