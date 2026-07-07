# Sprint 3 — Final Report

> Status: ✅ Delivered | 2026-07-07
> Audience: sprint-4 context. Read this + [`AGENTS.md`](../../AGENTS.md) before starting sprint-4.

---

## 1. Sprint goal & outcome

Rebuild the portfolio frontend using **Astro + Svelte**, replicating the sprint-1 static HTML UI exactly. **UI only** — no backend API integration. Component props mirror the sprint-2 REST API response shapes so sprint-4 integration is a data-source swap.

**Outcome:** 17 static pages across 7 routes, all data-driven from mock TypeScript files, with 10 Svelte components for interactivity.

---

## 2. Final frontend structure

```
frontend/
├── astro.config.mjs
├── tsconfig.json
├── package.json               ← astro 5, svelte 5, @iconify/svelte 5
├── public/
│   └── documents/             ← 6 downloadable files from sprint-1
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro   ← <html> shell: inline FOUC script, sidebar, header, content-wrapper
│   ├── components/
│   │   ├── shell/
│   │   │   ├── Sidebar.svelte       ← nav links, connect links, halation, theme toggle, collapse
│   │   │   ├── Header.svelte        ← hamburger, page title, header-right slot
│   │   │   └── ThemeToggle.svelte   ← icon swap, store bind
│   │   ├── home/
│   │   │   ├── TypedRole.svelte       ← role cycling (type→pause→delete→next)
│   │   │   ├── CountUpStats.svelte    ← cubic ease-out count-up, reduced-motion gate
│   │   │   ├── SpotlightEffect.svelte ← pointer radial glow via CSS vars
│   │   │   └── LiveClock.svelte       ← 15s interval, Asia/Jakarta timezone
│   │   ├── blog/
│   │   │   └── BlogFilter.svelte      ← article list + category chips + text search
│   │   └── ui/
│   │       ├── Icon.svelte            ← @iconify/svelte wrapper
│   │       └── SearchFilter.svelte    ← DOM-based card filtering
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── theme.ts         ← writable store + FOUC toggle helper
│   │   │   └── shell.ts         ← mobileDrawerOpen, sidebarCollapsed
│   │   ├── api-types.ts         ← TS interfaces from sprint-2 API contract
│   │   └── render-lexical.ts    ← Lexical JSON tree → HTML (7 node types, 5 format bits)
│   ├── data/                    ← static mock data (shaped like API responses)
│   │   ├── site-config.ts       ← name, initials, role, status, timezone, location
│   │   ├── home.ts              ← hero, stats[], about[], currently[], skills[]
│   │   ├── nav.ts               ← menuItems[], connectLinks[]
│   │   ├── projects.ts          ← 6 projects (PaginatedResponse<Project>)
│   │   ├── articles.ts          ← 6 articles (PaginatedResponse<Article>)
│   │   ├── document-categories.ts  ← 3 categories
│   │   ├── documents.ts         ← 6 documents
│   │   ├── social-profiles.ts   ← 7 profiles
│   │   ├── technologies.ts      ← 24 technologies
│   │   ├── tags.ts              ← 9 tags
│   │   └── authors.ts           ← 1 author
│   ├── styles/
│   │   ├── styles.css           ← copied verbatim from sprint-1 (974 lines)
│   │   └── iconify-bridge.css   ← 3-rule bridge for @iconify/svelte's SVG output
│   └── pages/
│       ├── index.astro          ← Home: hero + 4 Svelte islands
│       ├── projects.astro       ← .grid-3 of 6 project cards + SearchFilter
│       ├── projects/[slug].astro  ← 6 detail pages (static paths)
│       ├── blogs.astro          ← BlogFilter island
│       ├── blogs/[slug].astro   ← 6 article detail pages (Lexical prose)
│       ├── documents.astro      ← Grouped .doc-group sections
│       └── social.astro         ← .grid-3 of profile cards + SearchFilter
└── dist/                        ← 40 files, 17 pages, clean static output
```

---

## 3. Routes built

| Route | Pages | Type |
|-------|-------|------|
| `/` | 1 | Svelte islands for animations |
| `/projects` | 1 | Astro SSG + SearchFilter island |
| `/projects/[slug]` | 6 | Astro SSG via `getStaticPaths()` |
| `/blogs` | 1 | BlogFilter island (combined list + filter + search) |
| `/blogs/[slug]` | 6 | Astro SSG via `getStaticPaths()` |
| `/documents` | 1 | Astro SSG (pure static, no JS) |
| `/social` | 1 | Astro SSG + SearchFilter island |
| **Total** | **17** | |

---

## 4. Component inventory

| Component | Directive | Purpose |
|-----------|-----------|---------|
| `BaseLayout.astro` | — | Full `<html>` shell (theme FOUC, sidebar, header, content-wrapper) |
| `Sidebar.svelte` | `client:load` | Nav, connect links, halation, theme toggle, collapse toggle, mobile drawer |
| `Header.svelte` | `client:load` | Hamburger, page title, header-right slot |
| `ThemeToggle.svelte` | in Sidebar | Light/dark icon swap, store bind |
| `Icon.svelte` | — | `@iconify/svelte` wrapper |
| `TypedRole.svelte` | `client:visible` | Role cycling (type→pause→delete→next), reduced-motion gate |
| `CountUpStats.svelte` | `client:visible` | Cubic ease-out count-up, reduced-motion gate |
| `SpotlightEffect.svelte` | `client:visible` | Pointer radial glow on hero |
| `LiveClock.svelte` | `client:visible` | 15s interval, Asia/Jakarta timezone |
| `BlogFilter.svelte` | `client:load` | Article list + category chips (derived from tags) + text search + empty state |
| `SearchFilter.svelte` | `client:load` | DOM-based card text filter (projects + social) |

---

## 5. Key decisions

| Decision | Rationale |
|----------|-----------|
| Clean URLs (`/projects`, `/blogs/noteflow`) | Standard Astro routing, simpler API integration |
| Single `styles.css` import verbatim | Guarantees visual parity with sprint-1, no CSS migration |
| Mock data shaped as API paginated envelopes | Sprint-4 swap: `import` → `fetch()`, zero prop changes |
| Svelte stores for theme + shell state | Cross-component reactivity (Sidebar ↔ Header) without prop drilling |
| `client:visible` for home animations | Defers JS until scrolled into view |
| Iconify CDN + `@iconify/svelte` coexistence | CDN for static Astro `<iconify-icon>`, npm for Svelte components |
| BlogFilter as single component | Combined state (category + search) in one island |
| Lexical renderer as pure function | Called at build time, outputs HTML string, no client JS |
| `is:inline` theme script in `<head>` | Zero FOUC — sets `.dark` class before first paint |

---

## 6. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery & Exploration | Frontend + backend analysis | ✅ |
| 1 — Scaffold & Shell | Astro init, deps, CSS copy, documents move | ✅ |
| 2 — Data Layer | 11 mock data files, api-types.ts, render-lexical.ts | ✅ |
| 3 — Shell Components | 2 stores, Icon, ThemeToggle, Sidebar, Header, BaseLayout | ✅ |
| 4 — Static Pages | Social, documents, projects list + 6 detail pages | ✅ |
| 5 — Blog Pages + Filter | BlogFilter, blogs list + 6 article detail pages | ✅ |
| 6 — Home Page | 4 animation components, index.astro | ✅ |
| 7 — Search Filters | Projects search, blogs search, social search | ✅ |
| 8 — Verify & Polish | Build verification, all pages return 200 | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

---

## 7. Verification (done)

- `npx tsc --noEmit` — zero errors
- `npx astro build` — 17 pages, 40 output files, ~380ms build time
- All 7 routes return HTTP 200 in dev server
- Theme toggle works, no FOUC, persists across navigation
- Mobile drawer opens/closes, backdrop works
- Blog filter derives chips from tags, filters correctly, "All" resets
- Document categories render in order, empty categories hidden
- Home animations respect `prefers-reduced-motion`
- Search filters work on projects, blogs, socials

---

## 8. How to run

```bash
cd frontend && npm install && npm run dev    # http://localhost:4321
cd frontend && npm run build                 # static output in dist/
```

---

## 9. Sprint-4 handoff (API integration)

1. Replace mock data imports with `fetch()` calls to `http://localhost:3000/api/`
2. Component props already match API response interfaces — no prop changes needed
3. Pass fetched data through the same `.docs` access pattern
4. Configure CORS in backend `.env` for the Astro dev server origin
5. Lexical renderer works with real API bodies directly — no changes needed
6. Real file PDFs need to be uploaded to Payload and URLs updated

---

## 10. Documentation produced

| Document | Purpose |
|----------|---------|
| `tasks.md` | 56 tasks across 8 phases with dependencies |
| `AGENTS.md` | Self-contained delegation guide with code snippets |
| `final-report.md` | This file |
| `resources/architecture.md` | Tech stack decisions, component boundaries, architectural decisions |
| `resources/data-design.md` | API response shapes, Lexical format, mock data values |
| `resources/ux-flow.md` | Navigation, 7 screen wireframes, interaction flows |
| `reports/phase-0-report.md` through `reports/phase-7-report.md` | Per-phase reports |
