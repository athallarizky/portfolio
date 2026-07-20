# Data Design — Data Sync, Backup & Bulk Import

> The shape of the portable archive + how data flows in/out. Companion: [`architecture.md`](./architecture.md) · [`api-contract.md`](./api-contract.md) · discovery [`../reports/phase-0-report.md`](../reports/phase-0-report.md).

---

## 1. Source data (Payload collections — the export input)

| Collection | Upsert key | Stripped on export |
|---|---|---|
| `document-categories` | `slug` | `id`, `createdAt`, `updatedAt` |
| `documents` (upload) | `title` | + `url`, `thumbnailURL`, `mimeType`, `filesize`, `width`, `height`, `focalX`, `focalY` (regenerated on re-upload; `filename` kept as the media ref) |
| `tags` | `slug` | internal |
| `authors` | `name` | internal |
| `articles` | `slug` | internal; `body` → Markdown |
| `technologies` | `slug` | internal |
| `projects` | `slug` | internal; `body` → Markdown |
| `social-profiles` | `platform` | internal |
| `site-config` / `home` / `nav` (globals) | (slug) | internal (no relation fields) |

**Excluded entirely:** `users`, `contact-messages`, `payload-kv`, `payload-migrations`, `payload-locked-documents`, `payload-preferences`.

## 2. Data pipeline

```
Export:  Payload (Local API) ─► find all docs ─► strip internal fields
         ─► rewrite relationships id→natural key ─► body Lexical→Markdown
         ─► bundle media files ─► write zip (manifest + collections/ + globals/ + media/)

Import:  zip ─► validate manifest ─► [dry-run? report only]
         ─► pre-import DB backup ─► for each collection in IMPORT_ORDER:
              upsert by natural key ─► resolve relationships natural-key→id
              (2nd pass for self-ref) ─► body Markdown→Lexical ─► re-upload media
         ─► ImportReport
```

## 3. Archive format (`.zip`)

```
portfolio-data-<ISO>.zip
├── manifest.json              # see §4
├── collections/
│   ├── document-categories.json
│   ├── tags.json
│   ├── authors.json
│   ├── articles.json          # body = inline Markdown; tags/author/relatedArticles = natural keys
│   ├── technologies.json
│   ├── projects.json          # body = inline Markdown; techTags = slugs
│   ├── social-profiles.json
│   └── documents.json         # rows ref media/<filename>
├── globals/
│   ├── site-config.json
│   ├── home.json
│   └── nav.json
└── media/                     # binaries from backend/documents/
    └── atha-tharizky-resume.pdf
```

### Per-row shape (example — `articles.json` row)

```json
{
  "slug": "ai-workflow-template",
  "title": "The AI Workflow Template",
  "excerpt": "...",
  "tags": ["ai", "workflow"],
  "author": "Atha Thizky",
  "relatedArticles": ["another-slug"],
  "publishedAt": "2026-07-07T00:00:00.000Z",
  "readMinutes": 8,
  "bannerColor": "...",
  "bannerIcon": "solar:...",
  "status": "published",
  "seo": { "metaTitle": "", "metaDescription": "", "ogImage": "" },
  "body": "## Heading\n\nParagraph with `code`.\n\n```ts\nconst x = 1\n```"
}
```

## 4. Storage schema — `manifest.json`

```json
{
  "schemaVersion": 1,
  "tool": "portfolio-data-sync",
  "exportedAt": "2026-07-20T12:00:00.000Z",
  "sourceEnv": "local",
  "payloadVersion": "3.x.y",
  "counts": {
    "articles": 4, "projects": 3, "technologies": 12, "tags": 6,
    "authors": 1, "document-categories": 2, "documents": 7, "social-profiles": 5
  }
}
```

`validateManifest(m)` rejects: missing `schemaVersion`, `schemaVersion !== SCHEMA_VERSION`, `counts` keys mismatched vs `NATURAL_KEYS`. `exportedAt`/`sourceEnv` are **passed in by the caller** (CLI/endpoint stamp the real value) — never `Date.now()` inside the engine (keeps it deterministic/testable).

## 5. Relationship rewrite rules + import order

| From.field | Serialized as | Resolved on import via | Required |
|---|---|---|---|
| `articles.tags` | `[slug, …]` | tag slug→id | no |
| `articles.author` | `name` | author name→id | **yes** |
| `articles.relatedArticles` | `[slug, …]` | article slug→id (**2nd pass**) | no |
| `documents.category` | `slug` | category slug→id | **yes** |
| `projects.techTags` | `[slug, …]` | tech slug→id | no |

**Import order (topological):** `document-categories → documents` · `tags → authors → articles` · `technologies → projects` · `social-profiles` · then globals. (Mirrors the existing seed phase order — Phase 0 §3.)

Unresolved **required** relations throw `UnresolvedRelationError` (with the key + collection) and abort — never silently drop.

## 6. Known limitation → next sprint

**Renaming a record (changing its key) creates a duplicate** — identity is the natural key today (for
portability across local/prod). The planned fix is a content-level `uuid` per record so identity stays
stable across renames/moves/merges. Full design + implementation plan for the next sprint's agent:
[`identity-uuid-future.md`](./identity-uuid-future.md).
