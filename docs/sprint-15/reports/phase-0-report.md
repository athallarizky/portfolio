# Phase 0 Report — Discovery & Design Lock

> Completed: 2026-07-20
> Companion: [`../plan.md`](../plan.md) · [`../resources/`](../resources/)

---

## 1. Goal

Lock every technical unknown before code, so Phases 1–7 are mechanical.

## 2. Findings

### 2.1 `ensureUuid` hook approach — confirmed
Payload 3.85.2 collection `beforeChange` hooks receive `{ data, req, operation, originalDoc, context }`
with `operation: 'create' | 'update'` (verified against the bundled type declarations:
`node_modules/payload/dist/index.bundled.d.ts` exposes `operation: 'create'` in hook args; the
`HookOperationType` + `CollectionBeforeChangeHook` types are exported from `payload`).

Decision: **beforeChange hook**, not `defaultValue`. The hook is a no-op on update (so uuid is immutable
once set) and only fills on create-when-missing (so import pass-through is automatic — the importer
provides `data.uuid`, the hook sees it present and does nothing).

### 2.2 Dual-relation wire format — locked
v2 serializes each relationship ref as `{ uuid, key }`:
- hasOne → `{ uuid, key } | null`
- hasMany → `Array<{ uuid, key }>`

v1 detection: `manifest.schemaVersion === 1` → refs are plain strings → resolve by key only.
v2: `schemaVersion === 2` → resolve by uuid, fall back to key.

### 2.3 Merge algorithm — locked
`inverseRelations()` derives the inverse of `RELATIONS` (single source of truth). `mergeRecords()`:
find winner + loser by uuid → for every `(fromCollection, field)` pointing at this collection, repoint
loser→winner (hasMany dedups; hasOne replaces) → handle self-ref → delete loser. Dry-run + pre-merge
backup, mirroring the import safety model.

### 2.4 Field placement — locked
Shared `uuidField` + `ensureUuid` live in `backend/src/data-sync/identity.ts` (DRY — one definition
imported by all 8 collections). `admin.disabled: true` hides it from the admin UI; Local API (hook,
import, backfill, merge) is unaffected.

### 2.5 Schema migration — safe
Adding `uuid` (nullable text) to SQLite via Payload's auto-schema-push adds the column; existing rows
get `NULL`. SQL `UNIQUE` allows multiple NULLs, so there is **no uniqueness violation** during the
pre-backfill window. The `backfill:uuid` CLI then populates every row.

## 3. Decisions

| Decision | Reason |
|----------|--------|
| `beforeChange` hook (not `defaultValue`) | Version-proof, explicit, uniform across create paths, pass-through safe |
| `identity.ts` shared module | One definition of `uuidField` + `ensureUuid` for all 8 collections |
| `admin.disabled: true` | Hidden from editors; still settable via Local API; readable via REST |
| Derive merge inverse-map from `RELATIONS` | Single source of truth; a new relationship auto-flows into merge |

## 4. Reference files (to create / modify)

| File | Role |
|------|------|
| `backend/src/data-sync/identity.ts` (NEW) | `uuidField` + `ensureUuid` |
| `backend/src/data-sync/keys.ts` (MOD) | + `inverseRelations()` |
| `backend/src/collections/*.ts` (MOD, ×8) | + `uuidField` + `hooks.beforeChange` |
| `backend/src/data-sync/{types,manifest,export,import,relations}.ts` (MOD) | uuid identity + v1/v2 |
| `backend/src/data-sync/{merge,backfill}.ts` (NEW) | engines |
| `backend/src/data-sync/cli/{merge,backfill-uuid}.ts` (NEW) | CLIs |
| `backend/src/data-sync/admin/MergePanel.tsx` (NEW) + `endpoints.ts` (MOD) | UI + endpoint |
