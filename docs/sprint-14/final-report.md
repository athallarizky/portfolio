# Sprint-14 Final Report — Data Sync, Backup & Bulk Import

> Status: ✅ Delivered | 2026-07-20
> Audience: sprint-15 context + owner. Read this + [`../../AGENTS.md`](../../AGENTS.md) (esp. §5 "Back up / sync content").
> Companion: [`plan.md`](./plan.md) · [`tasks.md`](./tasks.md) · [`resources/`](./resources/) · phase reports in [`reports/`](./reports/)

---

## 1. Sprint goal & outcome

**Goal:** move content between local ↔ prod, back it up, and bulk-author projects & blogs without
per-record admin entry.

**Outcome:** ✅ Delivered and **verified by running**. A backend "Data Sync & Backup" tool with two
halves, sharing one engine:

- **Portable content export/import** — a `.zip` of JSON (relationships as natural keys) + Markdown
  rich-text bodies + media; imports upsert-merge by natural key → enables sync, backup, and bulk
  authoring. Excludes `users`, `contact-messages`, payload-internal.
- **Raw DB snapshot** — zips `payload.db` + `documents/` for a true whole-instance backup; restore is
  byte-identical.

Surface: **CLI** (`npm run export | import | snapshot | snapshot:restore`) + **admin UI**
(`/admin/data-sync`, admin-only endpoints).

## 2. Final structure

```
backend/src/data-sync/
├── types.ts            # schemas + INTERNAL/UPLOAD_AUTO field lists
├── keys.ts             # NATURAL_KEYS, RELATIONS, IMPORT_ORDER, RICH_TEXT_BODY
├── manifest.ts         # buildManifest / validateManifest (schema-version guard)
├── archive.ts          # createZip/readZip/readJson (archiver ZipArchive + adm-zip)
├── converters.ts       # Lexical↔Markdown via editorConfigFactory (cached)
├── export.ts           # exportToArchive() — relations→natural keys, bodies→MD, media bundle
├── relations.ts        # planImportOrder / makeIdResolver / resolveRef
├── import.ts           # importFromArchive() — dry-run + upsert + relation resolve + MD→Lexical + media
├── snapshot.ts         # createSnapshot() / restoreSnapshot() (DB + -wal/-shm + media)
├── version.ts          # resolvePkgVersion (exports-map-safe)
├── endpoints.ts        # admin-only /api/data-{export,import,snapshot}
├── admin/{DataSyncView,DataSyncClient,DataSyncNavLink}.tsx
├── cli/{export,import,snapshot,snapshot-restore}.ts
└── *.test.ts           # node:test units (keys/manifest/archive/relations)
```
Also modified: `backend/src/payload.config.ts` (endpoints + `admin.components.{views.dataSync, afterNav}`),
`backend/src/app/(payload)/admin/importMap.js` (regenerated), `backend/package.json`
(deps `archiver`/`adm-zip` + scripts), `.gitignore` (artifact patterns), `AGENTS.md` (§5/§6/§7).

## 3. Key deliverables

| Area | Delivered |
|------|-----------|
| Content export | `.zip` = manifest + 8 collections (JSON, relations→natural keys) + 3 globals + Markdown bodies + media |
| Content import | Upsert-merge by natural key, dependency order, 2nd-pass self-ref, MD→Lexical, media re-upload, **dry-run-by-default** + pre-import `.bak` |
| DB snapshot | `payload.db` (+WAL/SHM) + `documents/` → zip; restore byte-identical, confirm-gated |
| CLI | `npm run export \| import [-- --dry-run] \| snapshot \| snapshot:restore [-- --yes]` |
| Admin UI | Sidebar nav link + `/admin/data-sync` (section cards, `@payloadcms/ui` buttons); Upload dry-runs then one-click **Apply** when clean |
| Import robustness | Tolerates macOS/Windows re-zip folder nesting + `__MACOSX`/`.DS_Store`/`._*` junk (`detectPrefix`); graceful 400 JSON on bad input |
| Tests | `node:test` — 21/21 units (keys, manifest, archive, relations) |
| Safety | admin-only endpoints; dry-run default; pre-import + pre-restore backups; manifest version guard; unresolved required relations abort loudly |

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| `.zip` not `.rar` | Pure-JS libs, universal OS support; `.rar` needs native/licensed tooling |
| Inline Markdown bodies in JSON | One self-contained file per collection; round-trips via the lexical package's built-in converters |
| Relationships as natural keys (slug/name/title/platform) | Local & prod ids differ; natural keys port between envs |
| Upsert-merge (never replace-all) on content import | Non-destructive sync; replace-all reserved for the explicit DB-snapshot restore |
| DB restore is CLI-only (no REST endpoint) | Overwriting the SQLite file the running server holds → lock; restore is an offline op |
| Importer tolerates a top-level folder prefix + ignores OS junk | A macOS/Windows re-zip (Finder "Compress", Explorer) wraps contents in a folder (`portfolio-data/manifest.json`) and adds `__MACOSX/`, `.DS_Store`, `._*` — so unzip→edit→rezip→import just works. `detectPrefix()` resolves the root. |
| Natural key = identity | Editing a key field (slug / name / title / platform) makes a **new** record, not an update. To edit a doc in place, keep its key stable. |
| `node:test` for pure modules | Zero new deps; covers the deterministic logic; project had no test runner before |

## 5. Phase summary

| Phase | Outcome |
|-------|---------|
| 0 — Discovery | ✅ data model mapped (converter API confirmed on v3.85.2) |
| 1 — Export engine (core) | ✅ portable JSON + relations→natural keys; CLI |
| 2 — Markdown bridge | ✅ bodies → Markdown via `editorConfigFactory` |
| 3 — Media bundling | ✅ `documents/` files into `media/` |
| 4 — Import engine | ✅ upsert + relation resolve + MD→Lexical + media + dry-run |
| 5 — DB snapshot | ✅ snapshot/restore, byte-identical |
| 6 — Admin UI + endpoints | ✅ `/admin/data-sync` + admin-only endpoints (401 unauth) |
| 7 — Verify + docs | ✅ end-to-end parity; AGENTS.md + this report |
| 8 — Admin UI polish | ✅ sidebar nav link, polished section cards, one-click Apply after a clean dry-run |

> 📄 Per-phase reports: [`reports/phase-{0..6,8}-report.md`](./reports/).

## 6. Verification (all run, not asserted)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` (backend) | clean |
| `npm test` (data-sync units) | **21/21 pass** |
| `npm run build` (next build) | ✅ compiled; routes `/admin/[[...segments]]` + `/api/[...slug]` |
| Dry-run import (main DB) | `updated` counts == manifest, **0 errors** |
| Fresh-DB import | `created` == manifest (4/7/9/2/6/24/6/7), **0 errors** |
| Relation verify (depth:1) | author/tags/techTags/category all resolved; self-ref handled |
| Blog body round-trip | `root.type=root, children=8` — valid Lexical (MD→Lexical) |
| Snapshot → restore | `cmp payload.db` → **byte-identical**; 18 media restored |
| Idempotent re-import | `updated`, 0 duplicates, 0 errors |
| Endpoints (no auth) | `GET /api/data-export\|snapshot`, `POST /api/data-import` → **401** |
| Admin view | `GET /admin/data-sync` → **200** |
| macOS-rezipped import | folder-nested + junk zip (`portfolio-data (1)/…`) → prefix auto-detected, **200**, 0 errors |
| Bad input → graceful | empty/corrupt zip → **400** JSON (was unhandled 500) |
| Phase 8 build | `next build` clean; `afterNav` + `DataSyncNavLink` registered in importMap |

## 7. How to run

```bash
cd backend
npm run export                                      # → portfolio-data-<ISO>.zip (backs up payload.db)
npm run import -- portfolio-data-*.zip -- --dry-run # preview, no writes
npm run import -- portfolio-data-*.zip              # upsert-merge (backs up payload.db first)
npm run snapshot                                    # → portfolio-snapshot-<ISO>.zip
npm run snapshot:restore -- portfolio-snapshot-*.zip -- --yes   # destructive; stop backend first
npm test                                            # data-sync units
```
Admin UI at `http://localhost:3000/admin/data-sync` (log in first).

## 8. Sprint-15 handoff

- **Visual QA (owner):** after restarting `npm run dev` (config/importMap change), click through `/admin`
  → sidebar **"Data Sync & Backup"** link → `/admin/data-sync` → Download → Upload (dry-run) → **Apply**.
  The flow was verified end-to-end (curl + build); the polished UI + one-click Apply weren't browser-click-tested.
- **Deploy:** `archiver`/`adm-zip` are runtime deps → the build-on-runner deploy `npm ci`s them
  automatically (no VPS-side change, same as `@astrojs/sitemap` in sprint-13). `importMap.js` was
  regenerated — **commit it**.
- **Tech debt still open (from sprint-13):** per-page `og:image`, image optimization, Svelte 4→5 shell.
- **Possible follow-ups:** per-collection selective export/import flags; scheduled/automated sync
  (currently manual); CSV bulk-import for tabular mass-edits.
- **Identity upgrade (next sprint):** move record identity from natural-key → a stable content-level
  `uuid` so renames / moves / merges work (today, renaming a key field duplicates the record — by-design
  for portability, not a bug). Design + step-by-step plan written as context for the implementing agent:
  [`resources/identity-uuid-future.md`](./resources/identity-uuid-future.md).
