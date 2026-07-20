# Phase 1 Report — Export engine (core)

> Completed: 2026-07-20
> Companion: [`../plan.md`](../plan.md) · [`../resources/data-design.md`](../resources/data-design.md) · [`../resources/architecture.md`](../resources/architecture.md)

---

## 1. How to run

```bash
cd backend
npm run export        # writes portfolio-data-<ISO>.zip (auto-backs-up payload.db first)
npm test              # data-sync node:test units
npx tsc --noEmit      # typecheck
```

Inspect an archive:
```bash
unzip -l portfolio-data-*.zip          # entries
unzip -p portfolio-data-*.zip manifest.json
```

## 2. Service architecture

```
cli/export.ts ─► exportToArchive(payload)
                   │
                   ├─ buildIdKeyMaps()   pre-fetch relation targets (id→natural key)
                   ├─ per collection: payload.find({depth:0, limit:0, pagination:false})
                   │     → stripInternal() → rewriteRelations(id→key)
                   ├─ per global: payload.findGlobal()
                   └─ createZip(manifest + collections/*.json + globals/*.json)
```

Modules: `types.ts` (schemas), `keys.ts` (natural-key + relations + import order), `manifest.ts`, `archive.ts` (archiver/adm-zip), `export.ts`. All engine-only (no HTTP/React).

## 3. Test results

| Check | Result |
|---|---|
| `node:test` units (keys / manifest / archive) | **16/16 pass** |
| `npx tsc --noEmit` | clean |
| Real export on `payload.db` | **✅ 12-entry zip, 13,662 bytes** |

Exported counts (manifest):
`document-categories: 4 · documents: 7 · tags: 9 · authors: 2 · articles: 6 · technologies: 24 · projects: 6 · social-profiles: 7` (+ 3 globals).

Spot-check (`articles.json`): `tags: ["testing","dx"]`, `author: "Athalla Rizky"` — **natural keys, not ids**; no `id`/`createdAt` (stripped); `body` still raw Lexical JSON (→ Phase 2 converts to Markdown).

## 4. Key decisions

| Decision | Reason |
|---|---|
| `new ZipArchive(opts)` (not `archiver('zip',…)`) | archiver **v8** dropped the callable default export; named `ZipArchive` class is the v8 API. |
| Resolve Payload version by walking up from `require.resolve('payload')` | Payload v3's `exports` map doesn't expose `./package.json` → `require('payload/package.json')` throws `ERR_PACKAGE_PATH_NOT_EXPORTED`. |
| `depth: 0` + `pagination: false` on every `find` | depth:0 returns relationship **ids** (not populated) so we can rewrite them; pagination:false returns all docs in one call. |
| `filename` kept on `documents` rows | the media ref for Phase 3 bundling (upload auto-fields stripped — regenerated on re-import). |

## 5. Reference files

| File | Purpose |
|---|---|
| `backend/src/data-sync/{types,keys,manifest,archive,export}.ts` | engine modules |
| `backend/src/data-sync/cli/export.ts` | `npm run export` entrypoint |
| `backend/src/data-sync/*.test.ts` | node:test units |
| `backend/package.json` | `export` + `test` scripts; `archiver`/`adm-zip` deps |

## 6. Notes for Phase 2

- Bodies (`articles.body`, `projects.body`) are currently exported as raw Lexical JSON. Phase 2 swaps them for inline Markdown via `convertLexicalToMarkdown` + `editorConfigFactory` (confirmed present in v3.85.2, Phase 0.1).
