# Design — Data-sync round-trip (filenames + insert-one + replace-all)

> Sprint-17 design lock. Read with [`../plan.md`](../plan.md). Grounds the implementation; the phase reports capture deviations.

---

## 1. Filename matrix (item 1)

Target format: **`YYYY-MM-DD-HH-MM`** (local time for CLIs; server-local for admin downloads).

| Surface | File | Now | After |
|---|---|---|---|
| Export CLI | `cli/export.ts` | `portfolio-data-2026-07-20T01-44-07-511Z.zip` (ISO) | `portfolio-data-2026-07-20-01-44.zip` |
| Snapshot CLI | `cli/snapshot.ts` | `portfolio-snapshot-…T….zip` (ISO) | `portfolio-snapshot-2026-07-20-01-44.zip` |
| Wrap-projects CLI | `cli/wrap-projects.ts` | `portfolio-projects-YYYY-MM-DD-HH-MM-<slug>.zip` | unchanged (already new format) |
| Admin download | `endpoints.ts` (`Content-Disposition`) | fixed `portfolio-data.zip` / `portfolio-snapshot.zip` | `portfolio-data-YYYY-MM-DD-HH-MM.zip` / `portfolio-snapshot-…zip` |
| Internal `.bak` | `backupDb()`, `restoreSnapshot()` | ISO (`payload.db.2026-07-20T…-preimport.bak`) | **unchanged** (machine, sortable) |

**Shared helper** (`cli/filenames.ts`):
```ts
// Local-time YYYY-MM-DD-HH-MM stamp for user-facing zip names.
export function formatStamp(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}-${p(d.getMinutes())}`
}
```
`wrap-projects.ts` already inlines this exact logic — refactor it to call `formatStamp` (DRY).

**Timezone note:** CLIs run on the developer's machine (local time). Admin downloads run server-side — on the VPS that is UTC, so an admin-downloaded stamp may differ from a CLI one by the tz offset. Accepted (the stamp is for human scan-ordering, not cross-env comparison); documented in AGENTS.

---

## 2. Insert one record from JSON (item 3)

### Reuse path — zero new upsert code

A single v2 row is just a 1-element `collections/<c>.json`. So insert-one wraps the row into an **in-memory archive** and runs the existing import engine:

```
row(s) ──► buildSingleCollectionArchive(collection, rows) ──► Buffer
                                                              │
           importFromArchive(payload, buf, { dryRun }) ◄──────┘
                 │
                 ├─ uuid-first upsert (idempotent: create-or-update)
                 ├─ primeResolver() → techTags resolve against existing technologies
                 └─ returns ImportReport
```

### `buildSingleCollectionArchive(collection, rows): Promise<Buffer>` (new `single.ts`)

Factors the logic already in `cli/wrap-projects.ts`:
- assigns `randomUUID()` to any row missing `uuid`;
- validates each row has its natural key (`NATURAL_KEYS[collection]`);
- builds manifest v2 (`buildManifest({ sourceEnv:'generated', … counts:{[c]:rows.length} })`) + `collections/<c>.json`;
- returns `await createZip(entries)`.

`wrap-projects.ts` becomes a thin CLI over this (`npm run wrap:projects` unchanged behavior, now DRY).

### Endpoint — `POST /api/data-insert-one` (admin-only, JSON body)

```
Request:  { collection: 'projects', row: { …v2 row… }, dryRun?: boolean }
Response: ImportReport  (created/updated/errors/dryRun)
Errors:   400 if collection ∉ CONTENT_COLLECTIONS; row missing natural key; import error.
```
Mirrors the `data-merge` endpoint shape (json body, admin guard, badRequest on user error).

### Admin component — on `/admin/collections/projects`

Mounted via the Projects collection's `admin.components.afterListTable` slot (renders **inside the table container**, left-aligned with the table cells, just below the table):

```ts
// Projects.ts
admin: {
  useAsTitle: 'title', group: 'Projects', defaultColumns: ['title', 'year', 'status'],
  components: { afterListTable: ['/data-sync/admin/InsertProjectFromJson#InsertProjectFromJson'] },
}
```

`afterListTable` was chosen after iterating on placement: it's the only slot that **guarantees alignment with the table content** (it inherits the table card's padding). `afterList` (below pagination) renders outside the card and can't be aligned without fragile pixel-guessing; `beforeList` puts a heavy element above the list. (Payload's list slots are `beforeList` / `beforeListTable` / `afterListTable` / `afterList` — there is **no** slot beside the "Create new" button; it's hard-coded in the built-in `ListHeader`.) Run `npm run generate:importmap` after wiring the path. The component renders just a native Payload **"＋ Create new from JSON"** `Button` (secondary) — the heavy form lives in a **modal** it opens. The modal:

- JSON textarea **or** `.json` file upload + "paste sample"/"clear";
- **Preview** (dry-run) → if clean + has a change → **Apply** (calls `/api/data-insert-one` with `collection:'projects'`); loading + success states inline.

**Reuse:** to support articles later, mount the same component (parameterized by collection slug) on the `articles` collection.

---

## 3. Replace-all, full-archive only (item 2)

### Semantics

> After upserting, **make the DB exactly match the archive** for the content collections: delete records absent from the archive. Restricted to a **full archive** so the full reference graph is present.

### Engine contract

`ImportOptions` gains `replaceAll?: boolean`. In `importFromArchive`, **after** the globals pass (and only when `replaceAll`):

1. **Full-archive assert** — `const missing = CONTENT_COLLECTIONS.filter(c => !present.has(c))`. If `missing.length`, throw `ReplaceAllError('replace-all requires a full archive; missing: …')`. (Caught → 400 in the endpoint.)
2. **Build archive identities** — for each present collection, a `Set` of identities (`uuid` if present, else natural-key) from the archive rows.
3. **`referencedIds` guard set** — `Map<ContentCollection, Set<id>>` captured **during the upsert pass**: for every row, for each relation field (`RELATIONS[collection]`), record the resolved target ids (already computed by `rewriteRelationsToIds`) under `rel.to`. A target referenced by any surviving (archive) row → must not be deleted.
4. **Drift-delete pass** — per content collection:
   - list DB records (`payload.find`, depth 0, pagination off);
   - compute each record's identity (uuid else natural-key);
   - **delete candidate** = identity ∉ archive identities;
   - **skip** (record in `skippedReferenced`) if `record.id ∈ referencedIds[collection]`;
   - else: real run → `payload.delete({ collection, id })`; dry-run → count only.
   - accumulate `report.deleted[collection]` + `skippedReferenced[]`.

   **Deletion order = REVERSE dependency (children before parents).** Collections are deleted in the
   reverse of `IMPORT_ORDER` (social-profiles → projects → technologies → articles → authors → tags →
   documents → document-categories) so a drift parent isn't deleted while a drift child still references
   it — otherwise SQLite's FK constraint aborts the whole pass (found in prod testing: deleting a drift
   `document-categories` row while a drift `documents` row still pointed at it threw `Failed query:
   delete from "document_categories" …`, which — before the fix — aborted the pass and left
   social-profiles un-deleted). Each `payload.delete` is also wrapped in its own try/catch: a failure
   (FK / hand-edited-archive conflict) is reported as an error and the pass continues, so one bad delete
   can't prevent unrelated collections from converging.

### Why the guard is correct + cheap

A faithful full export can't reference an absent target (if row X refs T, T was exported → T is present). So in the common case `skippedReferenced` is empty. The guard exists for **hand-edited / partial archives that slip through** (defense-in-depth) and to make the dry-run report trustworthy. It's **query-free** — built from ids already resolved during upsert, so it costs no extra DB round-trips.

### Report shape

`ImportReport` gains:
```ts
deleted: Record<string, number>                       // e.g. { authors: 1 }
skippedReferenced: { collection: string; key: string; reason: string }[]
```
`unchanged`/`deleted` are separate buckets. Merge-mode imports leave `deleted` empty (`{}`).

### Endpoint — `replaceAll` field on `POST /api/data-import` (admin-only, multipart)

One upload endpoint, two modes (merge vs replace). The import card flow is **Upload content (.zip) → modal "Step 1 of 2" with two choice buttons [Merge] / [⚠ Replace all] → preview (Step 2 of 2) → Apply**. Preview is always step 1 (the old dry-run checkbox is removed):

```
Request:  multipart { file, dryRun, replaceAll }   // dryRun=true on preview; replaceAll set by which modal button was picked
Response: ImportReport (+ deleted + skippedReferenced when replaceAll)
Errors:   400 ReplaceAllError (partial archive) / bad zip; 500 otherwise.
```

The modal choice sets the `replaceAll` field and starts the dry-run preview. Apply (the second click) writes; Replace-all additionally requires an explicit confirm checkbox. Loading + success states render inline in the content section.

### Safety

- **Backup**: `importFromArchive` already calls `backupDb()` for real runs — replace-all inherits it.
- **Always preview first**: Upload opens a mode modal; picking Merge/Replace-all runs a dry-run preview. Apply is a deliberate second click (the old "dry-run checkbox = skip preview" is removed — unsafe alongside replace-all). Apply is gated on a clean preview (0 errors).
- **Explicit mode modal**: a "Step 1 of 2" modal with two choice buttons — Merge (safe) / Replace all (warning, destructive). The choice sets the mode (and the `replaceAll` field).
- **Contextual confirm**: an explicit checkbox ("I understand N record(s) not in the archive will be deleted") renders only in Replace-all mode once the preview is clean, directly above Apply.
- **CLI**: `npm run import -- <zip> -- --replace` (+ `--dry-run` for preview).

### Out of scope (documented limitations)

- **Documents media**: deleting a `documents` record removes the DB row; the file in `documents/` may linger (unreferenced, harmless). Future: media cleanup pass.
- **Globals**: singletons — always upserted, no delete concept (unchanged).
- **Partial-archive / per-collection replace-all**: not built (full-archive-only by decision).

---

## 4. Endpoint inventory (after sprint-17)

| Method | Path | Purpose | Sprint |
|---|---|---|---|
| GET | `/api/data-export` | content zip (timestamped filename now) | 14 |
| POST | `/api/data-import` | upsert-merge import (+ **replace-all** mode via `replaceAll` field) | 14, **17** |
| GET | `/api/data-snapshot` | whole-DB zip (timestamped filename now) | 14 |
| POST | `/api/data-merge` | merge two records | 15 |
| POST | `/api/data-insert-one` | insert/update one record from JSON | **17** |

All admin-only. Registered via `dataSyncEndpoints` in `payload.config.ts`.

---

## 5. Test plan (additions)

| Area | Tests |
|---|---|
| Filenames | `formatStamp` deterministic for a fixed date |
| Insert-one | create (no uuid); update-in-place (existing uuid); `techTags` resolve via priming |
| Replace-all | deletes drift (absent author); refuses partial archive (`ReplaceAllError`); skips referenced target; idempotent (2nd run `deleted:{}`); dry-run reports `would-delete`, no writes |

All hermetic (in-memory fake payload or a `payload.test.db` copy; `backup: () => undefined` injection where needed, per the sprint-15 merge-test pattern).
