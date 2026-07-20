# Phase 1 Report — Schema: uuid + ensureUuid hook + types bump

> Completed: 2026-07-20

---

## 1. What was built

- **`backend/src/data-sync/identity.ts` (NEW)** — shared `uuidField` (`TextField`: `text`, `unique`,
  `index`, `admin.disabled`) + `ensureUuid` `beforeChange` hook (fills `randomUUID()` on create-when-missing,
  no-op on update). Single source for all 8 collections.
- **8 collections** — each gained `import { uuidField, ensureUuid } from '../data-sync/identity'`,
  `hooks: { beforeChange: [ensureUuid] }`, and `uuidField` as the first field:
  `Articles, Authors, Documents, Tags, Technologies, Projects, DocumentCategories, SocialProfiles`.
- **`types.ts`** — `SCHEMA_VERSION` 1→**2**; added `SUPPORTED_SCHEMA_VERSIONS = [1,2]`; widened
  `ArchiveManifest.schemaVersion` to `1 | 2`; added `RelationRef` (`{ uuid?, key }`) for the dual wire format.
- **`manifest.ts`** — `validateManifest` now accepts schemaVersion ∈ {1, 2} (was `=== SCHEMA_VERSION`);
  rejects anything else with a clear "supported: 1, 2" message.
- **`payload-types.ts`** — regenerated; `uuid?: string | null` now on all 8 content-collection interfaces.

## 2. How to run

```bash
cd backend
npm test                                  # 26/26 (5 new identity tests + 21 existing)
npx tsc --noEmit                          # clean
npm run generate:types                    # emits uuid into payload-types.ts
```

## 3. Test results

| Check | Result |
|---|---|
| `npm test` | **26/26 pass** (5 new: assigns-on-create, preserves-provided, no-op-on-update, empty-as-missing, field-config) |
| `npx tsc --noEmit` | clean |
| `payload-types.ts` | 8× `uuid?: string \| null` (one per content collection) |

## 4. Key decisions

| Decision | Reason |
|----------|--------|
| `uuidField` typed as `TextField` (not `Field`) | The `Field` union doesn't expose `.name`/`.unique`/`.index` uniformly; `TextField` is still assignable to `Field[]` and is directly testable |
| `admin.disabled: true` | Fully hides uuid from the admin UI while keeping it settable via the Local API (hook/import/backfill) and readable via REST |
| Hook is a no-op on update | uuid is immutable once set; import pass-through is automatic |

## 5. Reference files

| File | Role |
|------|------|
| `src/data-sync/identity.ts` | `uuidField` + `ensureUuid` |
| `src/data-sync/identity.test.ts` | hook + field unit tests |
| `src/collections/*.ts` (×8) | wired to the shared hook/field |
| `src/data-sync/{types,manifest}.ts` | SCHEMA_VERSION 2 + dual-version validation |
