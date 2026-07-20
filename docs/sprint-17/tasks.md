# Task Breakdown — Data-sync round-trip: filenames + insert-one + replace-all

> Status: ✅ Delivered | Created: 2026-07-20
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked
> Scope (owner-locked): items 1 + 3 + 2. Item 4 (article insert) → sprint-18 (new authoring skill).

---

## Phase 0 — Discovery & Design Lock

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 0.1 | Confirm insert-one reuse path: `buildSingleCollectionArchive(collection, rows)` → in-memory zip (manifest v2 + `collections/<c>.json`) → `importFromArchive` | Easy | — | ✅ |
| 0.2 | Lock replace-all engine contract: `ImportOptions.replaceAll`; full-archive assert; `referencedIds: Map<collection, Set<id>>` captured during upsert; drift-delete pass; report gains `deleted` + `skippedReferenced` | Medium | — | ✅ |
| 0.3 | Audit the 4 filename surfaces (export CLI, snapshot CLI, wrap-projects, admin `Content-Disposition`) + decide `.bak` stays ISO | Easy | — | ✅ |
| 0.4 | Write [`resources/design.md`](./resources/design.md) (filename matrix, insert-one flow, replace-all semantics + guard, report shapes, endpoint contracts) | Medium | 0.1, 0.2, 0.3 | ✅ |

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Unified human-friendly filenames (item 1)

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 1.1 | Add shared `formatStamp(date?): string` → `YYYY-MM-DD-HH-MM` (local time) in a small util (e.g. `cli/filenames.ts`); default `new Date()` | Easy | 0.3 | ✅ |
| 1.2 | `cli/export.ts`: replace its local `timestamp()` with `formatStamp()` → `portfolio-data-YYYY-MM-DD-HH-MM.zip` | Easy | 1.1 | ✅ |
| 1.3 | `cli/snapshot.ts`: use `formatStamp()` → `portfolio-snapshot-YYYY-MM-DD-HH-MM.zip` | Easy | 1.1 | ✅ |
| 1.4 | `endpoints.ts`: timestamp the admin download `Content-Disposition` for both `/data-export` and `/data-snapshot` (server-local `new Date()`) | Easy | 1.1 | ✅ |
| 1.5 | Unit test: `formatStamp` produces `YYYY-MM-DD-HH-MM` for a fixed date (deterministic) | Easy | 1.1 | ✅ |

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Insert one project from JSON (item 3)

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 2.1 | Engine: `buildSingleCollectionArchive(collection: ContentCollection, rows: Row[]): Promise<Buffer>` — assigns uuid to rows missing one; builds manifest v2 + `collections/<c>.json` via `createZip` (mirrors `wrap-projects.ts` logic, factored into `single.ts`) | Medium | 0.1 | ✅ |
| 2.2 | Endpoint `POST /api/data-insert-one` (admin-only, json): `{ collection, row }` → validate `collection ∈ CONTENT_COLLECTIONS` + row has its natural key → `buildSingleCollectionArchive` → `importFromArchive({ dryRun })` → return `ImportReport` | Medium | 2.1 | ✅ |
| 2.3 | Client component `data-sync/admin/InsertProjectFromJson.tsx`: JSON textarea + `.json` file upload, **dry-run → Apply** (calls `/api/data-insert-one` with `collection:'projects'`; mirror `MergePanel` gating) | Medium | 2.2 | ✅ |
| 2.4 | Wire it into `Projects.admin.components.beforeList` (`'/data-sync/admin/InsertProjectFromJson#InsertProjectFromJson'`); run `npm run generate:importmap` to register | Easy | 2.3 | ✅ |
| 2.5 | (Parity) CLI `npm run insert-one -- <collection> <file.json> [-- --dry-run]` + `package.json` script | Easy | 2.1 | ✅ |
| 2.6 | Tests: row sans uuid → `created`; row with existing uuid → `updated` (idempotent); project row with `techTags` → resolves via priming | Medium | 2.1 | ✅ |

> 📄 Full report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Replace-all, full-archive only (item 2)

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 3.1 | `types.ts`: add `replaceAll?: boolean` to `ImportOptions`; add `deleted: Record<string, number>` + `skippedReferenced: { collection, key, reason }[]` to `ImportReport` | Easy | 0.2 | ✅ |
| 3.2 | Engine: capture `referencedIds: Map<ContentCollection, Set<id>>` during the upsert pass — for each row's relation fields (from `RELATIONS`), record resolved target ids keyed by `rel.to` | Medium | 3.1 | ✅ |
| 3.3 | Engine: `replaceAllDrift()` pass — if `replaceAll`: assert all 8 content collections present (else `ReplaceAllError`); per collection, list DB records (depth 0), compute identity (uuid else natural-key); a record is a delete candidate if its identity ∉ archive identities; **skip** if its id ∈ `referencedIds[collection]`; else delete (real) / count (dry-run); populate `report.deleted` + `skippedReferenced` | Hard | 3.2 | ✅ |
| 3.4 | Wire `replaceAllDrift` into `importFromArchive` after the globals pass (gated on `opts.replaceAll`; backup already taken for real runs) | Easy | 3.3 | ✅ |
| 3.5 | CLI `import.ts`: parse `--replace` → `{ replaceAll: true }`; usage line + `--dry-run` still works for preview | Easy | 3.4 | ✅ |
| 3.6 | Extend `POST /api/data-import` to read a `replaceAll` form field → `importFromArchive(buf, { replaceAll, dryRun })`; `ReplaceAllError` → 400 | Easy | 3.4 | ✅ |
| 3.7 | Redesign import card: drop the dry-run checkbox (preview is always step 1: Upload → preview → Apply); add a **Merge / Replace-all radio** (Merge = safe default, Replace all = warning) beside one upload button + one file picker; render `deleted`/`skippedReferenced` in the preview ("Would delete …"); contextual confirm checkbox shown only in Replace-all mode + clean preview, gating Apply | Medium | 3.6 | ✅ |
| 3.8 | Tests: full archive deletes drift record (author absent in archive → deleted); partial archive → `ReplaceAllError`; referenced target → skipped (not deleted); idempotent (run twice → 2nd run `deleted: {}`); dry-run reports `would-delete` without writing | Hard | 3.4 | ✅ |

> 📄 Full report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Verify + Docs

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 4.1 | `npx tsc --noEmit` clean; `npm test` green; `npm run build` | Easy | 1–3 | ✅ |
| 4.2 | E2E on a `payload.db` copy: (a) export → filename format; (b) insert-one a project row → created, re-run → updated; (c) drift scenario — add an extra author locally, export, replace-all on a prod-copy → extra deleted, referenced authors preserved | Medium | 3 | ✅ |
| 4.3 | Update `AGENTS.md` (§5 insert-one + replace-all commands; §6 sprint-17 row); write `final-report.md` + phase reports; refresh sprint-18 backlog (item 4 + article skill + media cleanup) | Medium | 4.1, 4.2 | ✅ |

---

## Dependency Graph

```
Phase 0 ──────────────────────────────────────────────┐
  0.1 ─► 2.1 ─► 2.2 ─► 2.3                            │
              └► 2.4                                  │
              └► 2.5                                  │
  0.2 ─► 3.1 ─► 3.2 ─► 3.3 ─► 3.4 ─► 3.5             │
                                  └► 3.6 ─► 3.7       │
                                  └► 3.8              │
  0.3 ─► 1.1 ─► 1.2                                  │
            └► 1.3                                   │
            └► 1.4                                   │
            └► 1.5                                   │
  0.1,0.2,0.3 ─► 0.4                                 │
Phase 4 (verify + docs) ──────────────────────────────┘
  4.1 ─► 4.2 ─► 4.3
```

## Summary

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 0 — Discovery & design | 4 | 2h | ✅ |
| 1 — Filenames (item 1) | 5 | 1.5h | ✅ |
| 2 — Insert-one project (item 3) | 6 | 3h | ✅ |
| 3 — Replace-all (item 2) | 8 | 6h | ✅ |
| 4 — Verify + docs | 3 | 2.5h | ✅ |
| **Total** | **26** | **~15h** | ✅ |
