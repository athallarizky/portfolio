# Phase 3 Report — Combined import, renderer fix, local verification

> Completed: 2026-08-19 · prod apply pending owner (see final-report)

## 1. The combined zip

`tools/article-polish/collection/portfolio-content-2026-08-19-sprint-22.zip` (4.6 KB) — manifest v2 + 4 collections:

| Collection | Rows |
|---|---|
| tags | 3 (AI, Learning, Workflow — all new) |
| technologies | 2 (AI Agents — new; Productivity — existing, carried verbatim) |
| articles | 1 (how-to-learn-new-things-in-ai-era) |
| projects | 1 (ai-guided-learning) |

Built with the engine itself (`buildManifest` + `createZip`) so the manifest matches a real export.

## 2. Import results (local)

| Run | Result |
|---|---|
| dry-run | `created: {tags:3, articles:1, technologies:1, projects:1}` · 0 errors |
| real | same, + auto-backup `payload.db.…preimport.bak` |
| re-import | `updated: {tags:3, articles:1, technologies:2, projects:1}` · 0 errors — **idempotent, no dupes** |

## 3. Bug found & fixed during verification

**Silent techTags drop (data path):** first zip omitted the `Productivity` row → `primeResolver` skipped
technologies (collection present in archive) → `productivity` ref unresolved → **dropped silently**.
Fix: carry existing referenced rows verbatim in the zip. Verified: `techTags: ['AI Agents', 'Productivity']`.

**Link-node 500 (frontend):** both detail pages crashed on the article's Markdown link.
Root cause + fix in [`../rca/2026-08-19-lexical-link-node-500.md`](../rca/2026-08-19-lexical-link-node-500.md).
Changed: `frontend/src/lib/render-lexical.ts` (recurse via `renderNode`, add `link` + `text` cases),
`frontend/src/lib/api-types.ts` (widen children types, add link node).

## 4. Verification matrix (local, backend :3000 + frontend :4321)

| Check | Result |
|---|---|
| `/api/articles?slug=…` | title/tags/author resolve, body = Lexical (23 nodes incl. quote + link), link URL present |
| `/api/projects?slug=ai-guided-learning` | techTags 2/2, links, architecture, article back-link |
| `/blogs` list | 200, article card renders |
| `/blogs/[slug]` | 200 — headings, blockquote, lists, `<a href="/projects/ai-guided-learning">` |
| `/projects` + `/projects/[slug]` | 200 — tech chips, GitHub link, `<a href="/blogs/…">` |
| `tsc --noEmit` (frontend) | clean |
| `npm run build` (frontend) | clean |
| `npm test` (backend) | 68 pass, 0 fail |

Not checked by agent (owner): light/dark/mobile visual pass, `prefers-reduced-motion` — dev servers left running for review.

## 5. Prod handoff (owner actions)

⚠️ **Order matters — deploy before import** (the renderer fix must be live or the article's detail page will 500 in prod):

1. Commit + push + dispatch "Deploy to VPS".
2. Prod `/admin/data-sync` → Import (**Merge**) → upload `portfolio-content-2026-08-19-sprint-22.zip` → dry-run → apply.
3. Media polish in admin: article featured image, project banner/screenshots.
4. Spot-check `/blogs` + both detail pages on prod.
