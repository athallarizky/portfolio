# Sprint-17 Final Report — Data-sync round-trip: filenames + insert-one + replace-all

> Status: ✅ Delivered | 2026-07-20
> Audience: sprint-18 context + owner. Read this + [`../../AGENTS.md`](../../AGENTS.md) (§5).
> Companion: [`plan.md`](./plan.md) · [`tasks.md`](./tasks.md) · [`resources/design.md`](./resources/design.md) · phase reports in [`reports/`](./reports/)

---

## 1. Sprint goal & outcome

**Goal:** close the data-sync round-trip — human-friendly filenames, one-click project insert from JSON, and a full-archive **replace-all** that makes a target env exactly match an export (deletes drift).

**Outcome:** ✅ Delivered and **verified by running** — 68 unit tests + a 10-step e2e on a `payload.db` copy (production untouched).

Three features (scope locked with owner = backlog items **1 + 3 + 2**; item 4/article deferred to a future authoring skill):

- **(1) Filenames** — unified user-facing zip names to `YYYY-MM-DD-HH-MM` (sortable + human-readable) across export CLI, snapshot CLI, wrap-projects CLI, and admin download `Content-Disposition`.
- **(3) Insert one project from JSON** — a **"Create new from JSON" button** on `/admin/collections/projects` (`admin.components.afterListTable`, inside the table container) that opens a **modal**; the modal wraps a single v2 row into an in-memory archive and imports it (idempotent upsert-by-uuid; `techTags` resolve via priming). Reuses the import engine — zero new upsert code.
- **(2) Replace-all** — an upload → **mode modal** ([Merge] / [⚠ Replace all]) on the import card + a `replaceAll` option on `importFromArchive`: after upserting, **require a full archive** (all 8 content collections), then delete records absent from the archive; a `referencedIds` safety guard skips targets still referenced by a surviving row; **reverse-order FK-safe deletion** + backup + preview-first + contextual confirm + loading/success states.

## 2. Final structure

```
backend/src/data-sync/
├── filenames.ts                 # NEW — formatStamp() (YYYY-MM-DD-HH-MM, local)
├── filenames.test.ts            # NEW — 2 tests
├── single.ts                    # NEW — buildSingleCollectionArchive() + fillUuids + validateRows
├── single.test.ts               # NEW — 4 tests
├── types.ts                     # MOD — ImportOptions.replaceAll; ImportReport.deleted + skippedReferenced
├── import.ts                    # MOD — ReplaceAllError, assertFullArchive, archiveIdentitySet,
│                                  #       collectReferenced, replaceDrift; replaceAll wired in
├── import.test.ts               # MOD — +6 replace-all tests
├── endpoints.ts                 # MOD — /api/data-insert-one; replaceAll field on /api/data-import;
│                                  #       timestamped Content-Disposition
├── cli/export.ts                # MOD — formatStamp
├── cli/snapshot.ts              # MOD — formatStamp
├── cli/wrap-projects.ts         # MOD — refactored over single.ts (DRY) + formatStamp
├── cli/import.ts                # MOD — --replace + deleted/skipped printing
├── cli/insert-one.ts            # NEW — npm run insert-one
└── admin/
    ├── InsertProjectFromJson.tsx # NEW — "Create new from JSON" button (afterListTable) + modal
    └── DataSyncClient.tsx        # MOD — upload→mode modal, Step-2 preview/Apply, loading/success
backend/src/collections/Projects.ts  # MOD — admin.components.afterListTable
backend/package.json                 # MOD — insert-one script; (importmap regenerated)
```

## 3. Key deliverables

| Area | Delivered |
|------|-----------|
| Filenames | `formatStamp()` shared; export/snapshot CLIs + admin `Content-Disposition` → `YYYY-MM-DD-HH-MM`; `.bak` stays ISO |
| Insert-one engine | `buildSingleCollectionArchive()` (uuid-fill + validate + manifest v2 + `collections/<c>.json`); `wrap-projects` refactored over it |
| Insert-one surface | "Create new from JSON" button (`afterListTable`, inside table container) → modal + `/api/data-insert-one` + `npm run insert-one` CLI |
| Replace-all engine | `replaceAll` opt + `assertFullArchive` + `archiveIdentitySet` + `collectReferenced` (query-free guard) + `replaceDrift` (reverse-order, per-delete isolated) |
| Replace-all surface | Upload → mode modal ([Merge]/[Replace all]) + Step-2 preview/Apply + `replaceAll` field on `/api/data-import` + `--replace` CLI |
| Safety | full-archive-only assert; `referencedIds` guard (built from `RELATIONS` — new relations auto-flow); backup inherited; preview-first; contextual confirm |
| Tests | `node:test` **68/68** (was 61: +2 filenames, +4 single, +7 replace-all) |

## 4. How it's used

```bash
cd backend
# Filenames (auto): portfolio-data-YYYY-MM-DD-HH-MM.zip  /  portfolio-snapshot-…-HH-MM.zip

# Insert one project (admin: /admin/collections/projects → "Create new from JSON" button → modal)
npm run insert-one -- projects ../tools/repo-to-project/content/<slug>/project.json -- --dry-run
npm run insert-one -- projects ../tools/repo-to-project/content/<slug>/project.json   # apply

# Replace-all (admin: /admin/data-sync → Upload → modal → Replace all; or CLI)
npm run import -- portfolio-data-*.zip -- --replace -- --dry-run   # preview (shows would-delete)
npm run import -- portfolio-data-*.zip -- --replace                # apply (backs up payload.db first)
```

## 5. Key decisions

| Decision | Rationale |
|----------|-----------|
| Filename `YYYY-MM-DD-HH-MM` | Sortable in a listing AND human-readable; unifies all 4 surfaces |
| Insert-one reuses `importFromArchive` via an in-memory archive | Zero new upsert code; inherits uuid-first upsert (idempotent) + priming |
| Insert-one on `/admin/collections/projects` (`afterListTable`, button+modal) | Contextual + aligned with table (inside container); naturally projects-only (articles deferred) |
| Replace-all = full-archive only | Full reference graph present → no orphan risk by construction |
| `referencedIds` safety guard (query-free, from `RELATIONS`) | Defense-in-depth for hand-edited archives; makes the dry-run report trustworthy |
| Replace-all = upload→mode modal on the import card (not a separate endpoint/card) | Owner-preferred UX; safety via Step-2 preview + confirm, not endpoint separation |
| Drift deletes in **reverse dependency order** + per-delete try/catch | FK-safe: a drift parent isn't deleted while a drift child still references it; one failure can't abort the pass (hotfix after first prod test hit an FK on `document_categories`) |
| Dry-run removed from the import card | Preview is always step 1 (Upload → preview → Apply) — safer alongside replace-all |

## 6. Verification (all run)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm test` | **68/68** |
| `npm run build` | ✓ routes `/admin/[[...segments]]` + `/api/[...slug]` |
| `generate:importmap` | ✓ `InsertProjectFromJson` registered |
| E2e (10 steps, `payload.test.db` copy) | all pass — see [`reports/phase-4-report.md`](./reports/phase-4-report.md) |

E2e highlights: filename `portfolio-data-2026-07-20-13-38.zip` ✓; insert-one update-in-place (slack-rag pre-existed → `updated`, re-run no dup) + create (temp-drift) ✓; replace-all `deleted: {projects:1}` (drift), idempotent re-run (no deletes), and **`ReplaceAllError` on a partial archive** (lists the 7 missing collections). `payload.db` untouched.

## 7. How to run

```bash
cd backend
npm run dev                                  # /admin → data-sync (upload→mode modal) + collections/projects (Create from JSON button)
npm test                                     # 68 unit tests
npx tsc --noEmit && npm run build            # typecheck + build
```

## 8. Sprint-18 handoff

[`../sprint-18/backlog.md`](../sprint-18/backlog.md): (1) **Article authoring skill** — a `tools/repo-to-project`-style skill that emits an article v2 row, so the admin insert path can extend to articles (item 4, deferred here); (2) **media cleanup** on document replace-all delete (records are deleted; orphaned files in `documents/` currently linger — harmless, unreferenced); (3) revisit anything surfaced during prod use of replace-all.
