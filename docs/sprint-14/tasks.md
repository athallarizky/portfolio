# Task Breakdown — Data Sync, Backup & Bulk Import

> Status: 🟡 Planning | Created: 2026-07-20
> Companion: [`plan.md`](./plan.md) · [`resources/architecture.md`](./resources/architecture.md) · [`resources/data-design.md`](./resources/data-design.md) · [`resources/api-contract.md`](./resources/api-contract.md)
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked
> Difficulty: Easy ≤30m · Medium 1–2h · Hard 3h+

---

## Phase 0 — Discovery

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 0.1 | Confirm installed lexical MD-converter API + Payload 3 endpoint multipart (`req.file`) shape; lock deps | Easy | — | ✅ |

> 📄 Discovery report: [`reports/phase-0-report.md`](./reports/phase-0-report.md) (data model already mapped). Task 0.1 is the only remaining pre-code check: read `backend/node_modules/@payloadcms/richtext-lexical/package.json`, confirm `convertMarkdownToLexical`/`convertLexicalToMarkdown`/`editorConfigFactory` exports (else the older `$convertFromMarkdownString` from `…/lexical/markdown`), and confirm `req.file` = `{ data, mimetype, name, size }`. Record the chosen API in [`resources/api-contract.md`](./resources/api-contract.md) §4.

---

## Phase 1 — Export engine (core: JSON collections + globals, relations → natural keys; no MD/media yet)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 1.1 | Add deps (`archiver`, `adm-zip`, `@types/adm-zip`); establish working `node:test` + `tsx` invocation | Easy | — | ✅ |
| 1.2 | `data-sync/types.ts` + `keys.ts` (`NATURAL_KEYS`, `RELATIONS`, `IMPORT_ORDER`, `EXCLUDED`) + tests | Medium | 1.1 | ✅ |
| 1.3 | `data-sync/manifest.ts` (`SCHEMA_VERSION`, `buildManifest`, `validateManifest`) + tests | Easy | 1.1 | ✅ |
| 1.4 | `data-sync/archive.ts` (`createZip`/`readZip`/`readJson`) + tests | Medium | 1.1, 1.3 | ✅ |
| 1.5 | `data-sync/export.ts` — `exportToArchive(payload)`; collections + globals → JSON, relationships rewritten to natural keys | Hard | 1.2, 1.3, 1.4 | ✅ |
| 1.6 | CLI `data-sync/cli/export.ts` + `npm run export`; verify on local DB | Medium | 1.5 | ✅ |

### Service Summary

- **Runtime:** Node + `tsx` (matches seed scripts)
- **Files:** `backend/src/data-sync/{types,keys,manifest,archive,export}.ts`, `backend/src/data-sync/cli/export.ts`, `backend/package.json`
- **Key output:** a `portfolio-data-<ts>.zip` with `manifest.json` + `collections/*.json` + `globals/*.json` (no MD/media yet)

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Markdown bridge

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 2.1 | `data-sync/converters.ts` — `lexicalToMd`/`mdToLexical` via `editorConfigFactory` + round-trip test | Medium | 0.1, 1.1 | ✅ |
| 2.2 | Wire MD into export: Article/Project `body` → inline markdown string | Easy | 2.1, 1.5 | ✅ |

### Service Summary

- **Runtime:** Node + `tsx`
- **Files:** `backend/src/data-sync/converters.ts`, modifies `export.ts`
- **Key output:** Article/Project bodies emitted as Markdown strings inside their collection JSON

> 📄 Full report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Media bundling

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 3.1 | Export: copy each Document's file from `backend/documents/` into `media/` in the zip; strip upload auto-fields | Medium | 1.5 | ✅ |

### Service Summary

- **Runtime:** Node + `tsx`
- **Files:** modifies `backend/src/data-sync/export.ts`
- **Key output:** `media/<filename>` entries in the zip; `documents.json` rows carry `filename` + declared fields only

> 📄 Full report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Import engine (sync + bulk-update)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 4.1 | `data-sync/relations.ts` — `planImportOrder` + `makeIdResolver` + `resolveRef` + tests | Hard | 1.2 | ✅ |
| 4.2 | `data-sync/import.ts` — `importFromArchive(payload, zip, { dryRun })`: pre-backup → upsert in dep order → resolve relations (2nd pass for self-ref) → MD→Lexical → media re-upload → report | Hard | 4.1, 2.1, 3.1, 1.4 | ✅ |
| 4.3 | CLI `data-sync/cli/import.ts` + `npm run import [-- --dry-run]`; round-trip parity vs a throwaway DB | Hard | 4.2 | ✅ |

### Service Summary

- **Runtime:** Node + `tsx`
- **Files:** `backend/src/data-sync/{relations,import}.ts`, `backend/src/data-sync/cli/import.ts`, `backend/package.json`
- **Key output:** `ImportReport { created, updated, unchanged, errors }`; idempotent upsert-merge import

> 📄 Full report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)

---

## Phase 5 — DB snapshot (whole-instance backup/restore)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 5.1 | `data-sync/snapshot.ts` — `snapshot()` (zip `payload.db` + `documents/`) + `restoreSnapshot()` (extract + replace, requires confirm) | Medium | 1.4 | ✅ |
| 5.2 | CLI `snapshot` + `snapshot:restore`; verify round-trip (byte-identical DB + media) | Easy | 5.1 | ✅ |

### Service Summary

- **Runtime:** Node + `tsx`
- **Files:** `backend/src/data-sync/snapshot.ts`, `backend/src/data-sync/cli/{snapshot,snapshot-restore}.ts`, `backend/package.json`
- **Key output:** `portfolio-snapshot-<ts>.zip`; a confirmed restore reproduces the instance exactly

> 📄 Full report: [`reports/phase-5-report.md`](./reports/phase-5-report.md)

---

## Phase 6 — Admin UI + endpoints (the buttons)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 6.1 | Admin-only REST endpoints in `payload.config.ts` (`/api/data-export`, `/api/data-import`, `/api/data-snapshot`) wiring to the engine | Medium | 1.5, 4.2, 5.1 | ✅ |
| 6.2 | Custom admin view `/admin/data-sync` (Download/Upload/Snapshot + dry-run preview), registered via `admin.components.views.dataSync` | Medium | 6.1 | ✅ |

### Service Summary

- **Runtime:** Payload 3 + Next.js (admin) + React (`@payloadcms/ui`)
- **Files:** `backend/src/data-sync/endpoints.ts`, `backend/src/data-sync/admin/DataSyncView.tsx`, modifies `backend/src/payload.config.ts`
- **Key output:** a `/admin/data-sync` page with working buttons over admin-only endpoints

> 📄 Full report: [`reports/phase-6-report.md`](./reports/phase-6-report.md)

---

## Phase 7 — Verify + docs

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 7.1 | End-to-end local↔fresh-DB sync parity check (content export/import + snapshot restore) | Medium | 4.3, 5.2 | ✅ |
| 7.2 | Update `AGENTS.md` (§5/§6/§7) + write sprint-14 final report | Easy | 7.1 | ✅ |

### Service Summary

- **Runtime:** n/a (verification + docs)
- **Files:** modifies `../../AGENTS.md`; creates `final-report.md`
- **Key output:** parity evidence in the final report; AGENTS.md updated with export/import/snapshot commands

> 📄 Full report: [`final-report.md`](./final-report.md)

---

## Phase 8 — Admin UI polish (post-delivery)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 8.1 | Sidebar nav link to `/admin/data-sync` via `admin.components.afterNav` | Easy | 6.2 | ✅ |
| 8.2 | Improve `/data-sync` UI (`@payloadcms/ui` Button, section cards, result badges) | Medium | 6.2 | ✅ |
| 8.3 | Smart "Apply changes" button after a clean dry-run (re-send same file, dryRun=false) | Medium | 8.2 | ✅ |

### Service Summary

- **Runtime:** Payload 3 + Next.js (admin) + React (`@payloadcms/ui`)
- **Files:** `backend/src/data-sync/admin/{DataSyncNavLink,DataSyncClient}.tsx`, modifies `backend/src/payload.config.ts` (`afterNav`), regenerates `importMap.js`
- **Key output:** a sidebar link to `/admin/data-sync`; polished section-card UI; one-click Apply after a clean dry-run

> 📄 Full report: [`reports/phase-8-report.md`](./reports/phase-8-report.md)

---

## Dependency Graph

```
Phase 0   0.1 ─────────────────────────────────────────┐
                                                     │
Phase 1   1.1 ─► 1.2 ─► 1.5 ─► 1.6                   │
           │     1.3 ─► 1.4 ─► 1.5                    │
           │        (1.2,1.3)                         │
                                                     │
Phase 2   0.1,1.1 ─► 2.1 ─► 2.2 ──(modifies 1.5)     │
                                                     │
Phase 3   1.5 ─► 3.1 ──(modifies 1.5)                │
                                                     │
Phase 4   1.2 ─► 4.1 ─► 4.2 ─► 4.3                   │
                2.1,3.1,1.4 ─► 4.2                    │
                                                     │
Phase 5   1.4 ─► 5.1 ─► 5.2                          │
                                                     │
Phase 6   1.5,4.2,5.1 ─► 6.1 ─► 6.2                  │
                                                     │
Phase 7   4.3,5.2 ─► 7.1 ─► 7.2                      │
```

## Summary

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 0 — Discovery | 1 | 0.5h | ✅ |
| 1 — Export engine (core) | 6 | 7h | ✅ |
| 2 — Markdown bridge | 2 | 2.5h | ✅ |
| 3 — Media bundling | 1 | 1.5h | ✅ |
| 4 — Import engine | 3 | 9h | ✅ |
| 5 — DB snapshot | 2 | 2.5h | ✅ |
| 6 — Admin UI + endpoints | 2 | 3h | ✅ |
| 7 — Verify + docs | 2 | 2h | ✅ |
| 8 — Admin UI polish | 3 | 2h | ✅ |
| **Total** | **22** | **~30h** | ✅ Delivered |
