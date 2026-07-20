# Phase 2 Report — Insert one project from JSON

> Completed: 2026-07-20

**Engine** — `src/data-sync/single.ts`:
- `buildSingleCollectionArchive(collection, rows)` — uuid-fill, validate natural key, manifest v2 + `collections/<c>.json` via `createZip`. Returns `{ buffer, filledUuids }`.
- `fillUuids`, `validateRows`, `SingleArchiveError`.
- `cli/wrap-projects.ts` refactored over it (DRY — one archive builder for the wrap CLI, the insert CLI, and the admin path).

**Endpoint** — `POST /api/data-insert-one` (admin-only, JSON `{ collection, row, dryRun }`): validates `collection ∈ CONTENT_COLLECTIONS` + `row` is a single object → wraps → `importFromArchive` → `ImportReport`. `SingleArchiveError` → 400.

**UI** — `src/data-sync/admin/InsertProjectFromJson.tsx`, mounted via `Projects.admin.components.afterListTable` (string path `/data-sync/admin/InsertProjectFromJson#InsertProjectFromJson`); renders a native Payload **"＋ Create new from JSON"** `Button` inside the table container (left-aligned with the cells). Click opens a **modal**: paste or upload `.json` → Preview (dry-run) → Apply, with loading + success states inline. (`afterListTable` chosen over `beforeList`/`afterList` for guaranteed alignment with the table content — see `design.md` §2.) `generate:importmap` confirmed the mapping.

**CLI parity** — `npm run insert-one -- <collection> <file.json> [-- --dry-run]`.

**Tests** — `single.test.ts` (4): `fillUuids` (assign + leave-existing), `validateRows` (missing key throws), `buildSingleCollectionArchive` (v2 manifest + row shape + uuid filled), empty-rows reject. The create/update/`techTags`-resolve path flows through `importFromArchive` (unchanged engine) → covered by the Phase-4 e2e, not duplicated.
