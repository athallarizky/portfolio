# Phase 3 Report — Projects

> Completed: 2026-07-07
> Part of: Sprint-2 (Headless CMS Backend)

---

## 1. What was built

Created the Technologies taxonomy and Projects collection — the richest content model. Projects have card-level metadata (banner, tech tags, links) and detail-page content (overview body, features list, screenshots, stats footer, architecture diagram). All seeded from the legacy `projects.html` and `project.html`.

- `Technologies` collection — 24 technologies (normalized taxonomy)
- `Projects` collection — 6 projects with full detail fields
- Rich Lexical bodies with 3–6 blocks each (headings, paragraphs, code blocks)

---

## 2. Files

| File | Purpose |
|---|---|
| `backend/src/collections/Technologies.ts` | name, slug, icon — public read |
| `backend/src/collections/Projects.ts` | title, slug, year, excerpt, descriptor, bannerColor, bannerIcon, techTags[], links[], Lexical body, status, order, features[], screenshots[], statsFooter[], architecture (code), seo{} |

---

## 3. Seeded content

**Technologies (24):** Next.js, tRPC, Prisma, Go, FastAPI, RAG, Docker, Cobra, Node.js, SSE, Redis, React, S3, Postgres, WASM, Edge, TypeScript, Vite, TailwindCSS, Express, Tauri, OpenAI, MobX, HNSW

**Projects (6):**

| Title | Year | Tech | Body Blocks |
|---|---|---|---|
| NoteFlow | 2025 | Next.js, tRPC, Prisma, TypeScript, React, Vite, TailwindCSS, Express, Tauri, Postgres, OpenAI, MobX, HNSW | 6 |
| Rent-House-AI | 2025 | Go, FastAPI, RAG, Node.js, Redis | 5 |
| DevPlatform CLI | 2024 | Go, Docker, Cobra | 3 |
| Realtime Polls | 2024 | Node.js, SSE, Redis | 3 |
| Wallpaper Hub | 2023 | React, S3, Postgres | 3 |
| Edge Tiny-Go Worker | 2023 | Go, WASM, Edge | 3 |

---

## 4. Project detail fields

Each project includes:

- **features[]** — icon + heading + description (e.g., "Instant capture", "Semantic search")
- **screenshots[]** — bannerColor + icon placeholders (4 for NoteFlow)
- **statsFooter[]** — value + label key-value pairs (e.g., "480 stars", "15MB binary")
- **links[]** — label + url + icon (Source/GitHub, Live Demo)
- **architecture** — code block with ASCII directory tree
- **body** — Lexical rich text with Overview (H2 + paragraphs) and Architecture sections

---

## 5. Key decisions

| Decision | Why |
|---|---|
| `technologies` as separate taxonomy | Fixes "React" / "React 18" drift; reusable across projects |
| `body` with Lexical, not just excerpt | Enables multi-block overview + architecture sections |
| `code` type for architecture | Syntax-highlighted in admin; renders as `<pre><code>` in API JSON |
| `order` field for display control | Matches legacy manual ordering; sortable via `?sort=order` |

---

## 6. Verification

- `GET /api/technologies` → 24 technologies
- `GET /api/projects?sort=order` → 6 projects, ordered 1–6
- `GET /api/projects/1?depth=0` → body has 6 Lexical blocks (heading + paragraph + code)
- `GET /api/projects/1?depth=1` → techTags populated with full technology objects
- `npm run seed` → idempotent
