# Phase 3 Report — Import: uuid-first upsert + dual resolve + v1/v2 compat

> Completed: 2026-07-20

## 1. What changed

### `backend/src/data-sync/relations.ts`
- `IdResolver` now tracks **two** indexes: `byKey` (natural-key→id) **and** `byUuid` (uuid→id).
- New `resolve(collection, { uuid, key })` → **uuid first** (rename-safe), **falls back to key**.
- `set(collection, key, id, uuid?)` populates both. `get`/`getByUuid` kept for direct lookups.

### `backend/src/data-sync/import.ts`
- **`toRef(val)`** — normalizes a serialized ref: v1 plain string → `{ key }`; v2 object → `{ uuid?, key }`;
  null/invalid → `null`. The importer is **version-agnostic** — it doesn't branch on `schemaVersion`,
  it just reads whatever shape each ref is. (validateManifest already accepts both v1 and v2.)
- **`upsertDoc`** — finds existing **by uuid first** → else by natural key. So a renamed record (same
  uuid, new slug) **updates in place** instead of duplicating. The imported `uuid` passes through to
  create/update (the `ensureUuid` hook is a no-op when uuid is present).
- **`rewriteRelationsToIds`** — parses each ref via `toRef`, resolves via `resolver.resolve` (uuid→key).
- **`resolveSelfRefs`** (2nd pass) — same dual parse; finds the target article by uuid → slug fallback.
- **Main loop** — `resolver.set(collection, key, id, rowUuid)` so downstream relations resolve by uuid.

## 2. v1 / v2 compatibility

A v1 archive (plain-string refs, no row uuids) imports unchanged: `toRef('ai')` → `{ key:'ai' }`,
resolved by key; upsert finds existing by natural key only (no row uuid). A v2 archive resolves by
uuid first. **No big-bang** — the owner's existing Downloads archives keep working.

## 3. How to run / verify

```bash
cd backend && npm test   # 10 new import tests (toRef + resolver.resolve + rewriteRelationsToIds)
```

## 4. Test results

| Check | Result |
|---|---|
| `npm test` | **41/41** (10 new import + 31 prior) |
| `npx tsc --noEmit` | clean |

New tests cover: toRef v1/v2/null parsing; resolver uuid-wins-over-stale-key + key-fallback;
rewriteRelationsToIds dual resolution, v1 backwards-compat, rename (stale key + correct uuid), and
required-relation-throws.

## 5. Decisions

| Decision | Reason |
|----------|--------|
| Version-agnostic ref parsing (`toRef`) over a `schemaVersion` branch | one code path handles both; can't drift between v1/v2 handling |
| Cross-env alignment via update-overwrite | importing a record found by natural key overwrites its uuid with the archive's → uuids converge after one sync round |
| Full e2e (rename round-trip, fresh-DB import) deferred to Phase 7 | needs a running Payload; unit tests cover the pure logic here |
