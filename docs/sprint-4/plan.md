# Sprint-4 Plan — API Integration

> Status: 🟡 Planning | Created: 2026-07-07
> Companion: [`tasks.md`](./tasks.md) · sprint-3: [`../sprint-3/final-report.md`](../sprint-3/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-3 rebuilt the frontend in Astro + Svelte with mock data files shaped like
the sprint-2 REST API responses. Sprint-4 swaps those mock imports for live
`fetch()` calls to the PayloadCMS backend at `http://localhost:3000/api/`.
Component props, types, and templates stay unchanged — only the data source moves.

---

## 1. Sprint goal

Replace all mock data imports with fetches to the PayloadCMS REST API, switch
to hybrid SSR mode for dynamic `[slug]` routes, and verify zero visual regressions.

## 2. Scope

**In scope:**
- Replace `import { ... } from '../data/*'` with `fetch()` in **8 files** (7 pages + `BaseLayout.astro`)
- Install `@astrojs/node` SSR adapter, switch to `output: 'hybrid'`
- Add `localhost:4321` to backend CORS
- Fix `LiveClock.svelte` to accept timezone as a prop instead of importing data
- Handle document file URLs (API returns `/api/documents/file/...` — prefix with backend base)
- Remove unused `ROLES` array in `index.astro` (TypedRole is self-contained)
- Convert `projects/[slug]` and `blogs/[slug]` from `getStaticPaths()` to on-demand SSR

**Out of scope:**
- Backend changes (collections, seed data, config)
- CSS or component changes beyond data props
- SEO / OpenGraph / sitemap
- Error handling beyond `Astro.redirect` for missing records
- Loading states (data is fetched at build/request time, not client-side)

---

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| `output: 'hybrid'` + `prerender = false` on `[slug]` pages | List pages stay static (fast); only detail pages SSR |
| `@astrojs/node` adapter | Simplest adapter, no Vercel/Netlify lock-in |
| BaseLayout fetches nav + siteConfig from API | Shared shell must not import mock data; every page depends on it |
| Document URLs prefixed with `http://localhost:3000` | API returns `/api/documents/file/...` — needs base URL |
| Fetch articles at `depth=0` for relatedArticles lookup | At depth=1, Payload populates relatedArticles as objects, not IDs |

---

## 4. Phase 0 findings (discovery — completed)

Read the AGENTS.md against the actual codebase. **4 gaps found:**

1. **BaseLayout imports mock data** — `nav` + `siteConfig` from `../data/`, used by every page
2. **No SSR adapter installed** — `@astrojs/node` required for hybrid/server mode
3. **relatedArticles depth conflict** — AGENTS.md fetches at `depth=1` then treats `relatedArticles` as IDs (it'll be populated objects at depth=1)
4. **TypedRole is self-contained** — hardcodes roles internally, never imported data. No changes needed beyond removing the unused `ROLES` array in `index.astro`.

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## 5. Phasing

- **Phase 1 — Infrastructure:** Install `@astrojs/node`, switch to `output: 'hybrid'`, update CORS
- **Phase 2 — Layout & static pages:** Replace data imports in BaseLayout, index, projects list, blogs list, documents, socials
- **Phase 3 — Dynamic routes:** Convert `projects/[slug]` and `blogs/[slug]` to on-demand SSR
- **Phase 4 — Component cleanup:** Fix LiveClock prop, remove unused imports
- **Phase 5 — Verify:** Build both modes, test all 7 routes, zero regressions

---

## 6. Verification

1. `cd backend && npm run dev` — all `/api/` endpoints return 200
2. `cd frontend && npm run dev` — all 7 routes return 200 with API data
3. `npm run build` — hybrid build succeeds (static pages + SSR endpoints)
4. Theme toggle, mobile drawer, sidebar collapse still work
5. Blog filter chips derive from API tags
6. Home animations work (typed role, count-up, spotlight, clock)
7. Zero mock data imports remain: `grep -r "from '\.\.\/data" frontend/src/` returns nothing
8. Zero visual regressions from sprint-3
