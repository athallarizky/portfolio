# Phase 2 Report — Export: emit uuid + dual relations

> Completed: 2026-07-20

## 1. What changed (`backend/src/data-sync/export.ts`)

- `buildIdKeyMaps` → **`buildIdRefMaps`**: each target id now maps to `{ uuid, key }` (v2 dual ref)
  instead of a plain natural-key string. The target's `uuid` is read from the DB row (null for
  un-backfilled records → key-only ref, which the importer resolves by key).
- `rewriteRelations` now emits each relation ref as `{ uuid, key }`:
  - hasMany → `Array<{ uuid, key }>`
  - hasOne → `{ uuid, key } | null` (an unresolved id becomes `null`, never leaks an orphan id)
- `uuid` is **not** in `INTERNAL_FIELDS`, so each row's own `uuid` survives `stripInternal` → it ships
  in the archive as the record's identity.

## 2. How to run / verify

```bash
cd backend && npm test   # 5 new export tests (rewriteRelations dual format)
```

## 3. Test results

| Check | Result |
|---|---|
| `npm test` | **31/31** (5 new export + 26 prior) |
| `npx tsc --noEmit` | clean |

New tests cover: hasMany dual, hasOne dual, own-uuid preserved, key-only fallback (no target uuid),
unresolved hasOne → null.

## 4. Decisions

| Decision | Reason |
|----------|--------|
| Exported `rewriteRelations` + `IdRefMaps` type | unit-testable as a pure function without booting Payload |
| Unresolved hasOne → `null` | cleaner than `undefined` (which JSON omits); import treats null as "clear/skip" |
