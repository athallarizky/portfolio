# Sprint-3 Plan — Astro + Svelte Frontend Rebuild — **UI only**

> Status: ✅ Complete | Created: 2026-07-07
> Companion: [`tasks.md`](./tasks.md) · sprint-2: [`../sprint-2/final-report.md`](../sprint-2/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-1 delivered a static HTML/CSS/JS frontend with content hardcoded in markup and JS registries. Sprint-2 built a PayloadCMS 3 headless CMS backend exposing a public REST API. Sprint-3 rebuilds the frontend using **Astro + Svelte**, replicating sprint-1's exact UI. **No API integration** — that's sprint-4.

**Scope decision:** UI-first. Build all pages with mock data shaped like API responses. Component props mirror the API contract so sprint-4 is a data-source swap (`import` → `fetch()`).

The sprint-1 static `frontend/` is now deleted — the Astro project lives at `frontend/`.

---

## 1. Sprint goal

Rebuild the portfolio frontend with Astro + Svelte, replicating sprint-1's UI from mock data. 7 routes, 17 pages, zero API calls.

## 2. Scope

**In scope:**
- Astro + Svelte project scaffold in `frontend/`
- All 7 routes: Home, Projects (list + detail), Blogs (list + detail), Documents, Socials
- 10 Svelte components for interactivity (theme, sidebar, animations, filters, search)
- Mock data files shaped like sprint-2 REST API responses
- Lexical rich text renderer for article/project bodies
- Client-side search on projects, blogs, socials
- Theme toggle with FOUC prevention
- Mobile drawer + desktop sidebar collapse

**Out of scope:**
- Backend API calls (sprint-4)
- Real file uploads (PDFs are served from `public/documents/`)
- SEO / OpenGraph / sitemap
- Contact form
- Admin content editing

---

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Clean URLs (`/projects`, `/blogs/noteflow`) | Standard Astro routing; sidebar links use path-prefix matching |
| Single `styles.css` import verbatim | Guarantees visual parity with sprint-1 |
| Mock data as `PaginatedResponse<T>` | Sprint-4 swap: `import` → `fetch()`, zero prop changes |
| Svelte stores for theme + shell state | Cross-component reactivity (Sidebar ↔ Header) without prop drilling |
| `client:visible` for home animations | Defers JS until scrolled into view |
| Iconify CDN + `@iconify/svelte` coexistence | CDN for static Astro `<iconify-icon>`, npm for Svelte components |
| Lexical renderer as pure function | Called at build time — outputs HTML string |

---

## 4. Phasing

- **Phase 0 — Discovery ✅** — Explored sprint-1 HTML/CSS/JS, sprint-2 API contract, CMS schemas. Documented component boundaries, data flows, interactive surface.
- **Phase 1 — Scaffold & Shell ✅** — Deleted old `frontend/`, scaffolded Astro 5 + Svelte 5, added `@iconify/svelte`, copied CSS, moved documents.
- **Phase 2 — Data Layer ✅** — TS interfaces from API contract, 11 mock data files, Lexical renderer.
- **Phase 3 — Shell Components ✅** — Svelte stores, Icon wrapper, ThemeToggle, Sidebar, Header, BaseLayout.
- **Phase 4 — Static Pages ✅** — Social, documents, projects list + 6 detail pages.
- **Phase 5 — Blog Pages ✅** — BlogFilter island, blogs list + 6 article detail pages.
- **Phase 6 — Home Page ✅** — 4 animation components (TypedRole, CountUpStats, SpotlightEffect, LiveClock).
- **Phase 7 — Search ✅** — Client-side text filter on projects, blogs, socials.
- **Phase 8 — Verify ✅** — Build passes (17 pages, 40 output files), all routes return 200.

---

## 5. Verification

1. `cd frontend && npm run dev` → all 7 routes return 200
2. `npx tsc --noEmit` → zero errors
3. `npx astro build` → 17 static pages in `dist/`
4. Theme toggle works, no FOUC, persists
5. Blog filter chips derive from tags, filter correctly
6. Home animations respect `prefers-reduced-motion`
7. Search filters work on all listing pages

---

## 6. Current status

All 8 phases complete and verified (2026-07-07). Sprint-4 will integrate the REST API by swapping mock data imports for `fetch()` calls.
