# Phase 0 Report — Discovery (backend data model)

> Completed: 2026-07-20
> Companion: [`../plan.md`](../plan.md) · [`../resources/data-design.md`](../resources/data-design.md) · [`../resources/architecture.md`](../resources/architecture.md)

---

## 1. How to run (reproduce this discovery)

```bash
# Registered collections/globals + DB adapter + upload cap + CORS
sed -n '1,80p' backend/src/payload.config.ts

# Collection + global definitions
ls backend/src/collections backend/src/globals

# Confirm the lexical converter exports (task 0.1 locks the exact import for the installed version)
node -e "console.log(Object.keys(require('@payloadcms/richtext-lexical')).filter(k => /markdown|editorConfig/i.test(k)))"

# Confirm the DB + media on disk
ls -la backend/payload.db backend/documents
```

## 2. Data structure analysis

**Registered (`backend/src/payload.config.ts:36-37`):**
```
collections: [Users, DocumentCategories, Documents, Tags, Authors, Articles,
              Technologies, Projects, SocialProfiles, ContactMessages]
globals:     [SiteConfig, Home, Nav]
```

**Collections (field-level detail → [`../resources/data-design.md`](../resources/data-design.md)):**

| Collection | Upload? | Upsert key | Notable fields |
|---|---|---|---|
| `users` | — | email | **auth** — EXCLUDE from sync |
| `document-categories` | no | `slug` | label, icon, hint, order |
| `documents` | **yes** (`upload: true`) | `title` | category→doc-categories, excerpt, updated; files in `backend/documents/` |
| `tags` | no | `slug` | name |
| `authors` | no | `name` | initials, role, bio |
| `articles` | no | `slug` | body (Lexical), tags↔hasMany, author (req), relatedArticles (self hasMany), seo group |
| `technologies` | no | `slug` | name, icon |
| `projects` | no | `slug` | body (Lexical), techTags↔hasMany, links/features/screenshots arrays, architecture code |
| `social-profiles` | no | `platform` | icon, handle, url, showOnHome |
| `contact-messages` | no | none | **transient** — EXCLUDE from sync |

**Globals:** `site-config`, `home`, `nav` — no relationship fields (trivial dump / `updateGlobal`).

**DB / storage:** SQLite, `backend/payload.db` (`DATABASE_URL || 'file:./payload.db'`, ~626 KB). Top-level upload cap 10 MB (`payload.config.ts:51-53`). CORS = `PAYLOAD_PUBLIC_CORS`; **CSRF not configured**.

## 3. Relationship graph (drives import ordering)

| From.field | → Collection | Cardinality | Required |
|---|---|---|---|
| `articles.tags` | tags | hasMany | no |
| `articles.author` | authors | single | **yes** |
| `articles.relatedArticles` | articles (self) | hasMany | no — **resolve in 2nd pass** |
| `documents.category` | document-categories | single | **yes** |
| `projects.techTags` | technologies | hasMany | no |

→ Import order: `document-categories → documents` · `tags → authors → articles` · `technologies → projects` · `social-profiles` · globals (matches the existing seed phase order).

## 4. Key findings (surprises / limitations)

- **MD↔Lexical is built in** — `@payloadcms/richtext-lexical` exports `convertLexicalToMarkdown` / `convertMarkdownToLexical` (+ `editorConfigFactory`). No custom converter to write. **Confirmed in task 0.1 on v3.85.2**: all three modern symbols are present in `dist` (legacy `$convertFromMarkdownString` / `TRANSFORMERS` also available as fallback). Exact `editorConfigFactory.default({config})` usage verified when `converters.ts` is written (Phase 2.1).
- **Two proven primitives already in-repo:** `cp payload.db …bak` (the seed npm scripts) and `payload.create({ data, file })` (`backend/src/seed/phases/documents.ts`) — both are reused by this feature.
- **No archive deps** — need to add `archiver` + `adm-zip`.
- **No custom admin views / endpoints** exist today — the data-sync tab is greenfield.
- **Exclude** `users` (auth/security), `contact-messages` (transient, no key), `payload-*` internal tables.
- **CSRF not configured** — the custom import endpoint must be admin-only (`req.user` check) regardless.

## 5. Key decisions (from discovery)

| Decision | Reason |
|---|---|
| Exclude `users` + `contact-messages` + `payload-*` | Security, no natural key, framework bookkeeping |
| Natural-key portability (not DB ids) | Local and prod ids differ |
| Reuse the seed's dependency order for import | Already proven correct |
| Reuse `payload.create({ data, file })` for media re-upload | Already proven in the documents seed |

## 6. Reference files

| File | Purpose |
|---|---|
| `backend/src/payload.config.ts:36-53` | registered collections/globals, DB adapter, upload cap, CORS |
| `backend/src/collections/*.ts` | per-collection field defs (slugs, relations, upload) |
| `backend/src/seed/phases/*.ts` | proven upsert + upload patterns to copy |
| `backend/src/seed/lib/lexical.ts` | existing Lexical node builders (body shape reference) |
| `backend/package.json` (`seed` scripts) | `cp payload.db …bak` backup pattern |
