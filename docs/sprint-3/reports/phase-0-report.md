# Phase 0 Report — Discovery & Exploration

> Completed: 2026-07-07

---

## 1. How to Run

No runnable output in this phase. Exploration was read-only against existing code and docs.

```bash
# To view sprint-1 (reference):
cd frontend && python3 -m http.server 8080

# To view sprint-2 backend (optional, not needed for sprint-3):
cd backend && npm run dev
```

---

## 2. Exploration Scope

Three parallel investigations:

### Frontend Architecture (sprint-1)
- All 7 HTML pages analyzed — purpose, structure, data dependencies
- CSS system reverse-engineered: theme tokens, component classes, grid systems, utilities (974 lines)
- JS files analyzed: `app.js` (shell behaviors), `home.js` (animations), `blogs.js` (filter), `documents.js` (data + DOM rendering)
- Sidebar navigation pattern: duplicated across all pages, `data-page` attributes for active state
- Theme toggle: localStorage + `prefers-color-scheme` + `.dark` class on `<html>`
- Iconify CDN usage: all `<iconify-icon>` web components with `solar:*` and `simple-icons:*` prefixes

### Backend API Contract (sprint-2)
- 8 collections: Articles, Projects, Documents, DocumentCategories, Tags, Technologies, Authors, SocialProfiles
- 3 globals: SiteConfig, Home, Nav
- Response shape rules: collections return `PaginatedResponse<T>` envelope, globals return singletons
- Lexical rich text format documented: node types, text format bitmask
- Full TypeScript interfaces extracted from `docs/sprint-2/resources/api-contract.md`

### PayloadCMS Schemas (sprint-2)
- All collection schemas examined: field types, relationships, upload config
- Global schemas: Home (hero, stats, about, currently, skills), Nav (menuItems, connectLinks), SiteConfig
- Seed data reviewed (`backend/src/seed.ts`): exact values for all 6 articles, 6 projects, 6 documents, 24 technologies, 9 tags, 7 social profiles
- Lexical body structures understood (used for mock data in sprint-3)

---

## 3. Key Findings

### 3.1 The sidebar is the biggest duplication problem
All 7 HTML files contain identical sidebar/header markup (~80 lines each, ~560 lines total duplication). This is the single largest win from moving to a component-based architecture — one `BaseLayout.astro` replaces all of it.

### 3.2 The CSS is self-contained and well-organized
`styles.css` (974 lines) uses CSS custom properties for theming, consistent class naming, and responsive grid systems. It can be imported verbatim into Astro with only one change: 3 CSS selectors target `<iconify-icon>` as an element tag, which breaks when `@iconify/svelte` renders `<svg>` instead. Solution: a 3-rule `iconify-bridge.css` file.

### 3.3 Data-driven pages are easy wins
Documents, projects, and socials pages are pure data → HTML rendering. They require zero Svelte islands. Astro's template syntax can render the exact same HTML from mock data arrays.

### 3.4 Interactive components are scoped and small
The interactive surface is limited to: theme toggle (1 button), mobile drawer (hamburger + backdrop), sidebar collapse (1 button), blog filter (chips), and 4 home animations (typed role, count-up, spotlight, clock). Each is a well-scoped Svelte component.

### 3.5 Mock data shapes must match API response envelopes
Collections return `{ docs: T[], totalDocs, limit, ... }`, not bare arrays. Globals return singletons. Component props that expect `Article[]` won't match `{ docs: Article[] }` — the `.docs` access is essential. If mock data uses bare arrays, the sprint-4 swap will break silently.

### 3.6 Lexical rich text is the trickiest part
Articles and projects have `body` fields in Lexical JSON format. The renderer must handle 7 node types (paragraph, heading, code, quote, list, listitem, upload) and 5 text format bits (bold, italic, underline, strikethrough, code). The renderer is a pure function — called at build time, outputs HTML.

---

## 4. Decisions Made

| Decision | Rationale |
|----------|-----------|
| Clean URLs (`/projects`, `/blogs/noteflow`) | Standard for Astro; sidebar links change from `data-page="projects.html"` to `href="/projects"`; active nav uses path-prefix matching |
| Delete old `frontend/`, scaffold fresh | Clean break; sprint-1 is committed in git history for reference |
| Client-side text filters on listing pages | Adds value at near-zero cost; Svelte filter against mock data arrays |
| `@iconify/svelte` npm package | No CDN dep; tree-shakeable; requires `iconify-bridge.css` for 3 rules |
| Single `styles.css` import | Guarantees visual parity; no CSS migration or refactoring |
| Svelte stores for theme + shell state | Replaces vanilla JS IIFE globals with reactive stores; shared between Sidebar + Header |
| `client:visible` for home animations | Defers work below fold; reduces initial JS execution |
| Mock data as `.ts` files (not JSON) | TypeScript enforces API contract shapes at compile time; autocomplete in editor |
| No backend calls in sprint-3 | Isolates UI work from API integration risk; data swap in sprint-4 is a one-line diff |

---

## 5. Reference Files

| File | What it informed |
|------|-----------------|
| `frontend/assets/styles.css` (974 lines) | CSS import strategy, iconify-bridge.css requirements |
| `frontend/assets/app.js` (131 lines) | Shell store design (theme, mobileDrawer, sidebarCollapsed) |
| `frontend/assets/home.js` (93 lines) | 4 Svelte component interfaces (TypedRole, CountUpStats, Spotlight, LiveClock) |
| `frontend/assets/blogs.js` (63 lines) | BlogFilter.svelte logic (category derivation + filtering) |
| `frontend/assets/documents.js` (117 lines) | Mock data shapes for documents + categories |
| `frontend/*.html` (7 pages) | Page templates for all 7 Astro routes |
| `docs/sprint-2/resources/api-contract.md` (466 lines) | All TypeScript interfaces for `api-types.ts` |
| `backend/src/seed.ts` (36.5 KB) | Exact string values for all mock data |
| `backend/src/collections/*.ts` | Schema validation rules (required fields, types) |
| `AGENTS.md` | Design system rules, component vocabulary, don't-break-the-aesthetic constraint |
| `docs/ai-workflow-template.md` | Sprint planning structure (this report format) |
