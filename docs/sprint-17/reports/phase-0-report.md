# Phase 0 Report — Discovery & Design Lock

> Completed: 2026-07-20

**Locked with owner:**
- Scope = backlog items **1 + 3 + 2** (skip 4/article — to come via a new authoring skill).
- Filename = `YYYY-MM-DD-HH-MM` (sortable + human-readable); `.bak` stays ISO.
- Replace-all = **full-archive only** + `referencedIds` safety guard + backup + preview + confirm.
- Insert-one surface = **component on `/admin/collections/projects`** (`admin.components.beforeList`).
- Replace-all surface = **Merge/Replace-all radio on the import card** (dry-run removed; preview always step 1).

**Reuse paths confirmed (zero engine dup):**
- Insert-one: `buildSingleCollectionArchive(collection, rows)` → in-memory zip → `importFromArchive` (inherits uuid-first upsert + priming).
- Replace-all: `importFromArchive({ replaceAll: true })` — one engine, two modes; the guard is built from `RELATIONS` (no extra DB queries).

**Filename surfaces audited (4):** `cli/export.ts`, `cli/snapshot.ts`, `cli/wrap-projects.ts` (already), `endpoints.ts` `Content-Disposition`. Verified Payload 3.85.2 collection slots (`beforeList` etc.) + that string-path components resolve via the import map (same mechanism as the existing `afterNav` / `DataSyncView`).

**Deliverable:** [`../resources/design.md`](../resources/design.md) — filename matrix, insert-one flow, replace-all semantics + guard, endpoint inventory, test plan.
