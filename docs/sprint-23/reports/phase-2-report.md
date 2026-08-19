# Phase 2 Report — Scoped replace engine + wrap:publish CLI

> Completed: 2026-08-19

## 1. How to run

```bash
# build a publish zip from git sources (ALL rows + refs manifest)
cd backend && npm run wrap:publish -- --articles   # or --projects
# apply with scoped replace (drift in the target collection is deleted)
npm run import -- ../tools/collection/portfolio-publish-articles-<stamp>.zip -- --replace-only articles
```

## 2. Engine changes (`backend/src/data-sync/import.ts`)

| Change | What |
|---|---|
| `ImportOptions.replaceCollections` | new option — scoped replace-all; ignored when `replaceAll` is set |
| `assertReplaceCollectionsPresent()` | every named collection must be IN the archive (drift semantics assume the archive carries that collection's full row set); unknown names rejected |
| drift scoping | `archiveIdentities` populated only for replaceAll or the requested collections → `replaceDrift` touches nothing else |
| refs safety | refs collections (tags/technologies) are never in `archiveIdentities` under scoped mode → never deleted; `collectReferenced` guard unchanged |

## 3. Wiring

- CLI: `--replace-only articles,projects` (csv)
- REST: `POST /api/data-import` form field `replaceOnly` (csv) — validated by the same `assertReplaceCollectionsPresent` (bad input → 400 with the message)

## 4. wrap:publish (`backend/src/data-sync/cli/wrap-publish.ts`)

- `--articles` reads `tools/article-polish/content/*/article.json`; `--projects` reads `tools/repo-to-project/content/*/project.json`
- Always bundles `tools/content/refs/{tags,technologies}.json` (missing → error with the `npm run refs:export` hint)
- Validates: every row has uuid + natural key; no duplicate uuid/slug in the set (catches copy-paste collisions like a duplicated entry folder)
- Output: `tools/collection/portfolio-publish-<collection>-<stamp>.zip` (collision-safe) — gitignored

## 5. Tests + verification

- 8 new tests (`assertReplaceCollectionsPresent` ×3, `validatePublishRows` ×5) — **76/76 pass**
- Live proof on the local DB:
  - `--replace-only articles` → `deleted: {articles: 1}` (the junk `test123` drift) + tags untouched → **local articles now 1:1 with git**
  - `--replace-only projects` → `created: {projects: 1}` (slack-rag from git) → **local projects 1:1 with git (5)**
  - `npm run build` clean (one TS cast fix in refs-export)
