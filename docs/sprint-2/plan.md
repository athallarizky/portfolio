# Sprint-2 Plan — Headless CMS Backend (PayloadCMS) — **BE-only**

> Status: ✅ Complete | Created: 2026-07-07
> Companion: [`tasks.md`](./tasks.md) · sprint-1: [`../sprint-1/final-report.md`](../sprint-1/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-1 delivered a static HTML/CSS/JS frontend with content hardcoded in
markup or in tiny JS registries. Sprint-2 adds a **headless CMS backend**
(`backend/`) so content is managed in an admin panel and served over **REST**.

**Scope decision (updated mid-sprint):** this sprint is **BACKEND ONLY**. We do
**not** wire the existing static frontend to the API. The frontend integration
will happen in a **separate, later sprint that rebuilds the frontend in
Astro + Svelte** against this REST API. The sprint-1 static `frontend/` is now
**legacy** (kept for reference) and will be superseded — do not invest in it.

Two CMS options were researched via **context7** (July 2026): PayloadCMS and
SonicJS. **Decision: PayloadCMS 3** (stable, self-hostable, exact fit for the
content model; SonicJS rejected — pre-stable + Cloudflare-locked).

---

## 1. CMS decision — PayloadCMS

| | PayloadCMS 3.x | SonicJS |
|---|---|---|
| Stability | ✅ stable GA (running: Next 16.2.10) | ⚠️ alpha/beta |
| Runtime | Next.js + Node — self-host anywhere | Cloudflare-only (D1/R2/KV) |
| Content model | collections + **Globals** | `defineCollection` |
| Relationships / order / taxonomy | first-class | present, less mature |
| Uploads (downloadable docs) | `upload: true` → auto `filesize`/`mimeType` | `media` → R2 |
| Rich text | Lexical (default) | `richtext` |
| Public REST | `access:{ read:()=>true }` + `cors:[]` | `optionalAuth()` |

**Payload** chosen: mature, models the schema exactly, self-hostable, public
REST in one line. **SonicJS rejected**: current line is pre-stable and the CMS
runtime is locked to Cloudflare.

---

## 2. Content spec → Payload collections (1:1 from the sprint-1 frontend)

### Collections
| Collection | Key fields | Public read |
|---|---|---|
| `users` | `name`, auth (email/password) — admin login | no |
| `document-categories` | `label`, `slug`, `icon`, `hint`, `order` (**ordered**) | yes ✅ built |
| `documents` | `title`, `category`→`document-categories`, `file`(**upload**), `excerpt`, `updated` | yes ✅ built |
| `articles` (blog) | `title`, `slug`, `excerpt`, `tags`→`tags`, `publishedAt`, `readMinutes`, `body`(richText), `author`→`authors`, `banner{}`, `related`→`articles`, `status` | yes |
| `tags` | `name`, `slug` — doubles as blog filter categories | yes |
| `authors` | `name`, `initials`, `role`, `bio`, `avatar`(upload) | yes |
| `projects` | `title`, `slug`, `year`, `excerpt`, `banner{}`, `techTags`→`technologies`, `descriptor`, `links[]`, `body`(richText), `features[]`, `screenshots[]`, `statsFooter[]`, `status`, `order` | yes |
| `technologies` | `name`, `slug`, `icon?` — shared tech taxonomy | yes |
| `social-profiles` | `platform`, `icon`, `handle`, `url`, `showOnHome`, `order` | yes |

### Globals (singletons)
| Global | Fields |
|---|---|
| `site-config` | `name`, `initials`, `role`, `bioShort`, `status`, `timezone` |
| `home` | `hero{}`, `stats[]`, `currently[]`, `skills[]` |
| `nav` | `menuItems[]`, `connectLinks[]` |

### Categories grouping (explicit design)
- **Documents → explicit `document-categories` collection**, related via
  `documents.category`, ordered by `order` (Pinned→Research→Other). Empty
  categories can be hidden by the future FE.
- **Blog "categories" stay tag-derived** (today's UX) — tags are a managed
  `tags` taxonomy; adding a tag makes it available as a filter.
- All collection/list modeling is backend work and stays valid regardless of FE.

---

## 3. API design (REST, public read)

```
GET /api/document-categories?sort=order&depth=1   ✅ live
GET /api/documents?depth=1                         ✅ live (category populated)
GET /api/articles?sort=-publishedAt&depth=1
GET /api/articles/{slug}
GET /api/projects?sort=order
GET /api/social-profiles?sort=order
GET /api/globals/{site-config|home|nav}
```
`access: { read: () => true }` on content collections; CORS allowlist in
`payload.config.ts` (currently `localhost:8080` — the future FE origin will be
added then). Uploads return a `url` the FE links to.

---

## 4. Frontend — OUT OF SCOPE this sprint

The frontend will be rebuilt in **Astro + Svelte** in a later sprint against the
REST API above. The sprint-1 static `frontend/` is kept only as the source of
**content + design reference** (real copy, palette, layout intent) for that
future rebuild — it is not connected to the API and is not maintained.

---

## 5. Repo structure (monorepo)

```
portofolio/
├── AGENTS.md
├── docs/sprint-2/{plan.md, tasks.md, reports/}
├── frontend/          # legacy static (sprint-1) — reference only, not wired
└── backend/           # Payload 3 app (THIS sprint)
    ├── package.json   # payload, @payloadcms/db-sqlite, richtext-lexical, next…
    ├── payload.config.ts
    ├── src/collections/   # Users, DocumentCategories, Documents (+ more per phase)
    ├── src/globals/        # (+ Phase 4)
    ├── src/seed.ts         # seeds content from the legacy frontend data
    └── src/app/(payload)/  # admin + REST route group
```

---

## 6. Phasing (BE-only)

- **Phase 0 — Bootstrap ✅** — `backend/` Payload app boots; admin + REST live;
  SQLite; `document-categories` + `documents` collections exist and respond.
- **Phase 1 — Documents & categories:** finalize fields, **seed** from legacy
  `frontend/assets/documents.js` (incl. uploading the real
  `ai-workflow-template.md`), verify `GET /api/documents` returns grouped data.
- **Phase 2 — Blog:** `tags` + `authors` + `articles` (richText, slug, related),
  seed from legacy `blogs.html`/`article.html`.
- **Phase 3 — Projects:** `technologies` + `projects`, seed from legacy
  `projects.html`/`project.html`.
- **Phase 4 — Globals & social:** `site-config`, `home`, `nav` globals +
  `social-profiles` collection, seed from legacy `index.html`/`social.html`.
- **Phase 5 — Polish:** `status` (draft/published) + SEO fields, prod DB
  (Postgres/Turso), media storage (S3/R2 plugin), seed script (`npm run seed`),
  API niceties (depth defaults, sorting). **No FE fallback** (no FE this sprint).

Each phase: add collection → boot recompiles → create/seed records →
`curl /api/<collection>` → confirm JSON → `npm run generate:types` → update
`tasks.md` → phase report.

---

## 7. Open decisions (BE-relevant only)

| Decision | Recommendation | Why |
|---|---|---|
| Blog richText format | **Lexical** (Payload default) | Rendering is the future Astro+Svelte FE's job; store structured |
| Prod DB | **Postgres** (Docker/VPS) or **Turso** (edge) | SQLite is dev-only |
| Media storage | local disk dev → **S3/R2 plugin** prod | Payload `upload` supports both |
| Tech-tag normalization | `technologies` taxonomy (Phase 3) | Fixes "React"/"React 18" drift |
| Seed approach | `src/seed.ts` using Local API + `npm run seed` | Reproducible content from legacy frontend data |

---

## 8. Verification (per phase, backend only)

1. `cd backend && npm run dev` → http://localhost:3000 (admin `/admin`, API `/api`).
2. Add/seed records in admin (or `npm run seed`).
3. `curl http://localhost:3000/api/<collection>?depth=1` → returns seeded JSON;
   relationships populated (e.g., a document returns its category object).
4. `npm run generate:types` → `payload-types.ts` reflects the new collections.
5. Categories grouping: `GET /api/documents` groups correctly when filtered/sorted
   by category `order`.

## 9. Current status

Phase 0 complete and verified (2026-07-07): app boots (Next 16.2.10), admin
`/admin` returns 200, `/api/document-categories` and `/api/documents` return
Payload JSON, types auto-generated. Next up: **Phase 1** (finalize + seed the
documents/categories content).
