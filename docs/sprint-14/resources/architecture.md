# Architecture — Data Sync, Backup & Bulk Import

> Companion: [`../plan.md`](../plan.md) · [`data-design.md`](./data-design.md) · [`api-contract.md`](./api-contract.md) · discovery [`../reports/phase-0-report.md`](../reports/phase-0-report.md)

---

## 1. Project Structure

```
backend/
├── src/
│   ├── data-sync/                       # NEW — the engine (UI-agnostic)
│   │   ├── types.ts                     # ArchiveManifest, ExportedDoc, ImportReport, RelationDef
│   │   ├── keys.ts                      # NATURAL_KEYS, RELATIONS, IMPORT_ORDER, EXCLUDED
│   │   ├── manifest.ts                  # SCHEMA_VERSION, buildManifest(), validateManifest()
│   │   ├── archive.ts                   # createZip/readZip/readJson (archiver + adm-zip)
│   │   ├── converters.ts                # lexicalToMd()/mdToLexical() via editorConfigFactory
│   │   ├── export.ts                    # exportToArchive(payload)
│   │   ├── relations.ts                 # planImportOrder(), makeIdResolver(), resolveRef()
│   │   ├── import.ts                    # importFromArchive(payload, zip, { dryRun })
│   │   ├── snapshot.ts                  # snapshot()/restoreSnapshot()
│   │   ├── endpoints.ts                 # admin-only REST handlers
│   │   ├── admin/DataSyncView.tsx       # custom admin view
│   │   ├── cli/{export,import,snapshot,snapshot-restore}.ts
│   │   └── *.test.ts                    # node:test units beside each module
│   └── payload.config.ts                # MODIFY: + endpoints[], + admin.components.views.dataSync
└── package.json                         # MODIFY: + deps, + scripts (export/import/snapshot)
```

## 2. Tech Stack Decisions

### Decision Matrix

| Concern | Technology | Why |
|---|---|---|
| Zip create | `archiver` | Streaming, mature, pure JS |
| Zip read | `adm-zip` | Synchronous API, simple for import | 
| Zip types | `@types/adm-zip` (dev) | Type safety |
| Rich-text bridge | `@payloadcms/richtext-lexical` (already a dep) | Ships MD↔Lexical converters — no custom code |
| Unit tests | `node:test` (built into Node) | Zero new deps; covers the deterministic pure modules |
| Engine runtime | `tsx` (already used by seed) | Runs `.ts` directly; matches existing seed scripts |
| Admin UI | `@payloadcms/ui` `DefaultTemplate` + React | Stays inside Payload's admin shell, consistent styling |

### Why NOT alternatives

| Rejected | Reason |
|---|---|
| `.rar` archive | Needs native/licensed `unrar`; no pure-JS lib; every OS handles `.zip`. |
| Raw DB file as the *only* backup | Can't be hand-edited → fails the bulk-authoring goal; schema-version-coupled; replace-only. Kept as the *separate* snapshot tool. |
| CSV bulk-import | Nested arrays (`links`, `features`, `screenshots`, `seo`) map poorly to flat rows. JSON + MD is richer and already needed for export. |
| A Payload backup plugin | Opaque dependency for logic we own in ~200 lines tuned to *these* collections; the engine doubles as the bulk-import path. |
| GraphQL for export | REST + Local API already used everywhere (AGENTS.md §1); no second query surface needed. |
| Jest/Vitest for tests | Adds a dep + config; `node:test` is built-in and sufficient for the pure modules. |

## 3. Module Boundaries

**Engine modules** take a `Payload` instance (Local API) + pure inputs — no HTTP, no React. Adapters (endpoints / admin / cli) are thin layers over the engine.

| Module | Input | Output | Does NOT |
|---|---|---|---|
| `export.ts` | `payload`, `{ sourceEnv }` | zip `Buffer` | touch the DB on disk, render UI |
| `import.ts` | `payload`, zip `Buffer`, `{ dryRun }` | `ImportReport` | bypass dry-run, skip the pre-backup |
| `snapshot.ts` | `{ dbPath, mediaDir }` / `(zip, { confirm })` | zip `Buffer` / restore | run without explicit confirm |
| `converters.ts` | Lexical state / Markdown string + `editorConfig` | Markdown / Lexical state | know about collections |
| `relations.ts` | collection slug, rows | import order + id resolver | write to the DB |
| `endpoints.ts` | `req` (Payload request) | `Response` | contain business logic (delegates to engine) |
| `admin/DataSyncView.tsx` | — | React UI | call the DB directly (uses endpoints) |
| `cli/*.ts` | argv | stdout + file writes | contain engine logic (delegates) |

## 4. Key Architectural Decisions

### Decision 1 — Two tools, one engine
**Decision:** Portable content export/import (sync + bulk authoring) **and** a raw DB snapshot (panic backup/migrate), sharing one `data-sync/` engine.
**Reasoning:** The owner's three goals split across both — sync/bulk-authoring need editable portable JSON; whole-instance backup/migrate is most reliable as a raw file copy. One engine keeps them consistent and avoids duplicating the media/zip/manifest plumbing.

### Decision 2 — Natural-key portability, not DB ids
**Decision:** Relationships are serialized as natural keys (slug/name/title/platform) and resolved back to ids on import.
**Reasoning:** Local and prod assign different ids; an archive must port between them. Each content collection has a unique natural key (Phase 0 confirmed).

### Decision 3 — Upsert-merge import (never replace-all)
**Decision:** Import creates-new / updates-existing by natural key; idempotent re-runs.
**Reasoning:** Non-destructive sync semantics. The only replace-all path is the explicit, double-confirmed DB-snapshot **restore**.

### Decision 4 — Safety by default
**Decision:** Admin-only endpoints (`req.user`); dry-run-by-default import; pre-import `payload.db.<ts>.preimport.bak`; manifest `schemaVersion` guard; unresolved required relations abort loudly.
**Reasoning:** Import touches prod content. Every destructive path requires an explicit opt-in and leaves a recovery trail. Full safety matrix in [`api-contract.md`](./api-contract.md) §4.
