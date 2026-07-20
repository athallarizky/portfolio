# API Contract — Data Sync, Backup & Bulk Import

> REST endpoints, CLI commands, and the admin view. Companion: [`architecture.md`](./architecture.md) · [`data-design.md`](./data-design.md).

---

## 1. REST endpoints (admin-only)

All handlers begin with `if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })`.
Registered as root-level `endpoints:` in `backend/src/payload.config.ts` (served under `/api/<path>`).

| Method | Path | Request | Response | Engine call |
|---|---|---|---|---|
| `GET` | `/api/data-export` | — (admin cookie) | `application/zip` (`Content-Disposition: attachment`) | `exportToArchive(payload, { sourceEnv })` |
| `POST` | `/api/data-import` | multipart `req.file` (zip) + body `{ dryRun?: boolean }` | `application/json` → `ImportReport` | `importFromArchive(payload, buf, { dryRun })` |
| `GET` | `/api/data-snapshot` | — | `application/zip` (snapshot) | `snapshot({ dbPath, mediaDir })` |
| `POST` | `/api/db-restore` | multipart `req.file` (snapshot zip) + body `{ confirm: true }` | `application/json` → `{ ok, backup }` | `restoreSnapshot(buf, { confirm })` |

> `req.file` shape (confirm in task 0.1, expected `{ data: Buffer, mimetype, name, size }` — the same object the seed passes to `payload.create({ file })`).

## 2. CLI commands

Added to `backend/package.json` (run from `backend/`):

| Script | Command | Effect |
|---|---|---|
| `npm run export` | `cp payload.db payload.db.$(date).bak && tsx src/data-sync/cli/export.ts` | Writes `portfolio-data-<ts>.zip` |
| `npm run import` | `tsx src/data-sync/cli/import.ts <zip> [-- --dry-run]` | Upsert-merge; dry-run prints `ImportReport` only |
| `npm run snapshot` | `tsx src/data-sync/cli/snapshot.ts` | Writes `portfolio-snapshot-<ts>.zip` |
| `npm run snapshot:restore` | `tsx src/data-sync/cli/snapshot-restore.ts <zip> [-- --yes]` | Restores DB + media (destructive) |

## 3. Admin view

Registered in `payload.config.ts`:
```ts
admin: {
  components: {
    views: {
      dataSync: { Component: '/data-sync/admin/DataSyncView#DataSyncView', path: '/data-sync' },
    },
  },
},
```
Component (`backend/src/data-sync/admin/DataSyncView.tsx`):
```tsx
'use client'
import { DefaultTemplate } from '@payloadcms/ui/rsc'

export const DataSyncView = () => (
  <DefaultTemplate>
    <h1>Data Sync &amp; Backup</h1>
    {/* Download content zip · Download DB snapshot · Upload zip (dry-run toggle) */}
  </DefaultTemplate>
)
```
> The `Component` path-string is resolved by Payload 3's admin bundler; task 6.2 confirms exact placement/resolution against the installed version.

## 4. Code patterns

### 4.1 Admin-only endpoint (download)
```ts
import type { Endpoint } from 'payload'
import { exportToArchive } from '../export'

export const exportEndpoint: Endpoint = {
  path: '/data-export',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const buf = await exportToArchive(req.payload, { sourceEnv: process.env.NODE_ENV ?? 'local' })
    return new Response(buf, {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': 'attachment; filename="portfolio-data.zip"',
      },
    })
  },
}
```

### 4.2 Lexical ↔ Markdown (confirm exact import in task 0.1)
```ts
import { convertLexicalToMarkdown, convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export const makeEditorConfig = (config: Config) => editorConfigFactory.default({ config })
export const lexicalToMd = (data: SerializedEditorState, editorConfig) =>
  convertLexicalToMarkdown({ data, editorConfig })
export const mdToLexical = (md: string, editorConfig): SerializedEditorState =>
  convertMarkdownToLexical({ markdown: md, editorConfig })
```
Fallback (older 3.x — if `convertMarkdownToLexical` isn't exported): `$convertFromMarkdownString(md, TRANSFORMERS)` from `@payloadcms/richtext-lexical/lexical/markdown`.

### 4.3 Import upsert + resolver (shape)
```ts
const resolver = makeIdResolver()
for (const slug of IMPORT_ORDER) {
  for (const row of readJson(zip, `collections/${slug}.json`)) {
    const existing = await payload.find({ collection: slug, where: { [NATURAL_KEYS[slug]]: { equals: row[NATURAL_KEYS[slug]] } }, limit: 1 })
    const data = await rewriteRelationsToIds(row, slug, resolver)
    if (slug === 'articles' || slug === 'projects') data.body = mdToLexical(row.body, editorConfig)
    const doc = existing.docs[0]
      ? await payload.update({ collection: slug, id: existing.docs[0].id, data })
      : slug === 'documents'
        ? await payload.create({ collection: slug, data, file: mediaFile(zip, row) })
        : await payload.create({ collection: slug, data })
    resolver.set(slug, row[NATURAL_KEYS[slug]], doc.id)
  }
}
// 2nd pass: articles.relatedArticles now resolvable
```

## 5. Safety matrix

| Op | Destructive? | Guard |
|---|---|---|
| Content export (download) | No | admin-only |
| Content import — dry-run | No | default; reports counts only |
| Content import — real | Partial (upsert-merge) | admin-only + explicit confirm + `payload.db.<ts>.preimport.bak` |
| DB snapshot (download) | No | admin-only |
| DB snapshot restore | **Yes (replace-all)** | double-confirm (UI) / `--yes` (CLI); recommends backend stopped |

Unresolved **required** relations (`articles.author`, `documents.category`) throw `UnresolvedRelationError` and abort — never silently drop.
