# Sprint-17 Plan — Data-sync round-trip: filenames + insert-one + replace-all

> Status: 🟡 Planning | Created: 2026-07-20
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-16/final-report.md`](../sprint-16/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)
> Decisions locked with owner: scope = items **1 + 3 + 2** (skip 4/article → comes via a new authoring skill later); filename = `YYYY-MM-DD-HH-MM`; replace-all = **full-archive only**.

---

## Context

- **Sprint-14** built data-sync (export/import/snapshot, upsert-merge by natural key).
- **Sprint-15** added content-level `uuid` identity + a merge tool (rename-safe; dual `{uuid,key}` relations).
- **Sprint-16** added the `tools/repo-to-project/` skill + `wrap:projects` + import priming (projects-only archives resolve `techTags`).
- **Three gaps remain** (from [`backlog.md`](./backlog.md), items 1/3/2 — item 4 deferred):

| # | Gap | Pain |
|---|-----|------|
| 2 | Import is **upsert-merge only — never deletes** → local & prod **drift** | "local punya lebih banyak data, prod sudah saya update" |
| 3 | sprint-16 emits a project `.json`, but adding it needs wrap→import-zip | want a one-click in-admin insert |
| 1 | export/snapshot zips use ISO (`…T01-44-07-511Z`) | hard to scan/track at a glance |

## 1. Sprint goal

Close the data-sync round-trip: **human-friendly filenames**, **one-click project insert from JSON**, and a **full-archive replace-all** that makes a target env exactly match an export (deletes drift) — safely.

## 2. Scope

**In scope:**
- **(1) Filenames** — unify user-facing zip names to `YYYY-MM-DD-HH-MM` across: `cli/export.ts`, `cli/snapshot.ts`, `cli/wrap-projects.ts` (already done), and the admin download `Content-Disposition` (`endpoints.ts`). Internal `.bak` files stay ISO (machine/sortable).
- **(3) Insert one project from JSON** — a component on `/admin/collections/projects` (via `admin.components.beforeList`) that takes a single v2 project row (paste or upload), wraps it into an in-memory archive, and imports it (idempotent upsert-by-uuid). Reuses the import engine — zero new engine logic for the upsert path.
- **(2) Replace-all mode** — a Merge / Replace-all radio on the import card (dry-run removed; preview is always step 1), backed by a `replaceAll` field on `/api/data-import` + a `replaceAll` option on `importFromArchive`: after upserting, **require a full archive** (all 8 content collections), then delete records absent from the archive; **safety guard** skips any target still referenced by a surviving record; backup + dry-run-first (preview shows deletions) + confirm step when replace-all is active. CLI `--replace` flag.

**Out of scope (→ sprint-18 backlog):**
- **(4) Insert article from JSON** — owner wants this to come via a **new article-authoring skill** (analogous to repo→project), so the admin insert path is premature for articles.
- **Media cleanup** on document replace-all delete — records are deleted; orphaned files in `documents/` are harmless (unreferenced). Documented limitation, not blocking.
- **Partial-archive / per-collection replace-all** — full-archive-only is the chosen model.

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Filename `YYYY-MM-DD-HH-MM` | Sortable in a listing **and** human-readable; already used by `wrap-projects`; unifies all 4 surfaces. (`dd-mm-yyyy` was rejected — not sortable.) |
| Replace-all = **full-archive only** | The full reference graph is present → no orphan risk by construction; matches `npm run export` (always full). |
| Safety guard: **skip deletes of still-referenced targets** | Defense-in-depth. A faithful full export can't reference an absent target, but the guard makes the dry-run report trustworthy and survives hand-edited archives. Implemented query-free via a `referencedIds` set captured during the upsert pass. |
| Replace-all reuses `importFromArchive({ replaceAll: true })` | One engine, two modes; inherits backup + dependency order + relation resolution + priming. |
| Insert-one = **wrap 1 row → in-memory archive → `importFromArchive`** | Zero new upsert code; inherits uuid-first upsert (idempotent) + priming (`techTags` resolve). |
| Insert-one surface = **component on `/admin/collections/projects`** (`admin.components.beforeList`) | Contextual — "Add from JSON" lives where projects are managed; naturally projects-only (articles skipped). Reusable component → mount on `articles` later. |
| Replace-all = **`replaceAll` field on the existing `/api/data-import`** + a Merge/Replace-all radio on the import card (dry-run removed; preview always step 1) | Owner-preferred compact UX (one upload button, mode radio). Safety comes from the **dry-run preview surfacing deletions** + a confirm step when replace-all is active — not from endpoint separation. Insert-one keeps its own `/api/data-insert-one` (different shape: JSON body, single row). |
| Internal `.bak` filenames stay ISO | Machine-generated, already sortable; only user-facing zip names change. |
| Replace-all is the **last phase** | Destructive; sequencing it last means items 1 & 3 ship even if 2 needs more iteration. |

## 4. Phasing

- **Phase 0 — Discovery & design lock:** confirm the in-memory-archive reuse path for insert-one; lock the replace-all engine contract (full-archive assert, `referencedIds` guard, report shape); write [`resources/design.md`](./resources/design.md).
- **Phase 1 — Unified human-friendly filenames (item 1):** shared `formatStamp()`, apply to export/snapshot CLIs + admin `Content-Disposition`; unit test.
- **Phase 2 — Insert one project from JSON (item 3):** `buildSingleCollectionArchive()` engine helper → `/api/data-insert-one` endpoint → component mounted on the projects collection (`beforeList`); tests (create / update-in-place / techTags resolve).
- **Phase 3 — Replace-all, full-archive only (item 2):** `replaceAll` option + `referencedIds` capture + drift-delete pass + safety guard; CLI `--replace`; `replaceAll` field on `/api/data-import`; Merge/Replace-all radio + deletion preview + confirm on the import card; tests (delete drift / refuse partial / skip referenced / idempotent).
- **Phase 4 — Verify + docs:** `tsc` + `npm test` + `build`; E2E on a `payload.db` copy (filenames, insert-one, replace-all drift scenario); update `AGENTS.md` §5/§6; final + phase reports; sprint-18 backlog (item 4 + article skill + media cleanup).

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Replace-all deletes the wrong thing | Full-archive-only assert + `referencedIds` guard + **dry-run-first** UI (Apply gated on a clean preview) + `payload.db` backup before any real run + double-confirm. |
| Hand-edited full archive references an absent target | `referencedIds` guard skips it + lists it in the report (no silent orphan). |
| Relation field added later isn't covered by the guard | `referencedIds` is built from `RELATIONS` (single source of truth) — a new relation auto-flows in (same pattern as `inverseRelations()` in merge). |
| Bundling destructive + additive work in one sprint | Replace-all is Phase 3 (last build phase); 1 & 2 (filenames, insert) are shippable independently. |
