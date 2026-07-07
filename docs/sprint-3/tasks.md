# Task Breakdown — Sprint 3: Astro + Svelte Frontend Rebuild

> Status: 🟡 Planning | Created: 2026-07-07
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 1 — Scaffold & Shell

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 1.1 | Delete existing `frontend/` directory | Easy | — | ⬜ |
| 1.2 | Scaffold Astro project in `frontend/` with TypeScript | Easy | 1.1 | ⬜ |
| 1.3 | Add `@astrojs/svelte`, `@iconify/svelte`, `svelte` deps | Easy | 1.2 | ⬜ |
| 1.4 | Configure `astro.config.mjs` with Svelte integration | Easy | 1.3 | ⬜ |
| 1.5 | Copy `styles.css` verbatim into `src/styles/styles.css` | Easy | 1.1 | ⬜ |
| 1.6 | Create `src/styles/iconify-bridge.css` (3 rules for SVG selectors) | Easy | — | ⬜ |
| 1.7 | Move document files to `public/documents/` | Easy | 1.1 | ⬜ |

### Service Summary

- **Runtime:** Node.js (Astro dev server)
- **Files:** `astro.config.mjs`, `package.json`, `tsconfig.json`, `src/styles/styles.css`, `src/styles/iconify-bridge.css`
- **Key output:** Bootable `astro dev` with empty pages

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Data Layer

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 2.1 | Create `src/lib/api-types.ts` — all TS interfaces from API contract | Medium | — | ⬜ |
| 2.2 | Create `src/data/nav.ts` — nav menu items + connect links (shaped like `Nav` global) | Easy | 2.1 | ⬜ |
| 2.3 | Create `src/data/site-config.ts` — name, role, bio, status, timezone, location | Easy | 2.1 | ⬜ |
| 2.4 | Create `src/data/home.ts` — hero, stats, about, currently, skills (shaped like `Home` global) | Easy | 2.1 | ⬜ |
| 2.5 | Create `src/data/projects.ts` — 6 projects (shaped like `PaginatedResponse<Project>`) | Medium | 2.1 | ⬜ |
| 2.6 | Create `src/data/articles.ts` — 6 articles (shaped like `PaginatedResponse<Article>`) | Medium | 2.1 | ⬜ |
| 2.7 | Create `src/data/document-categories.ts` — 3 categories | Easy | 2.1 | ⬜ |
| 2.8 | Create `src/data/documents.ts` — 6 documents with file URLs | Easy | 2.1, 2.7 | ⬜ |
| 2.9 | Create `src/data/social-profiles.ts` — 7 profiles | Easy | 2.1 | ⬜ |
| 2.10 | Create `src/data/technologies.ts` — 24 technologies | Easy | 2.1 | ⬜ |
| 2.11 | Create `src/data/tags.ts` — 9 tags | Easy | 2.1 | ⬜ |
| 2.12 | Create `src/data/authors.ts` — 1 author | Easy | 2.1 | ⬜ |
| 2.13 | Create Lexical rich text mock data for article bodies | Hard | 2.6 | ⬜ |
| 2.14 | Create Lexical rich text mock data for project bodies | Hard | 2.5 | ⬜ |

### Service Summary

- **Runtime:** TypeScript (no runtime, data files only)
- **Files:** `src/lib/api-types.ts`, `src/data/*.ts` (11 files)
- **Key output:** All mock data available for import by pages + components

> 📄 Full report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Shell Components

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 3.1 | Create `src/lib/stores/theme.ts` — theme store + FOUC prevention helper | Medium | 1.4 | ⬜ |
| 3.2 | Create `src/lib/stores/shell.ts` — mobileDrawer + sidebarCollapsed stores | Easy | 1.4 | ⬜ |
| 3.3 | Create `src/components/ui/Icon.svelte` — `@iconify/svelte` wrapper | Easy | 1.3 | ⬜ |
| 3.4 | Create `src/components/shell/ThemeToggle.svelte` — icon swap, store bind | Easy | 3.1, 3.3 | ⬜ |
| 3.5 | Create `src/components/shell/Sidebar.svelte` — full sidebar (avatar, nav, connect, halation, theme toggle, collapse) | Hard | 2.2, 2.3, 3.2, 3.3, 3.4 | ⬜ |
| 3.6 | Create `src/components/shell/Header.svelte` — hamburger, page title, search slot, header-right slot | Medium | 3.2, 3.3 | ⬜ |
| 3.7 | Create `src/layouts/BaseLayout.astro` — `<html>` shell, inline FOUC script, sidebar island, header island, content wrapper, corner-blob | Hard | 1.5, 1.6, 3.5, 3.6 | ⬜ |

### Service Summary

- **Runtime:** Astro + Svelte (client:load islands)
- **Files:** `src/lib/stores/{theme,shell}.ts`, `src/components/ui/Icon.svelte`, `src/components/shell/{ThemeToggle,Sidebar,Header}.svelte`, `src/layouts/BaseLayout.astro`
- **Key output:** Shared layout shell with theme, mobile drawer, sidebar collapse, active nav

> 📄 Full report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Static Pages (Data-Driven, No Islands)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 4.1 | Create `src/pages/social.astro` — `.grid-3` of profile cards from mock data | Easy | 2.9, 3.7 | ⬜ |
| 4.2 | Create `src/pages/documents.astro` — grouped `.doc-group` sections from mock data | Medium | 2.7, 2.8, 3.7 | ⬜ |
| 4.3 | Create `src/pages/projects.astro` — `.grid-3` of project cards with gradient banners | Medium | 2.5, 3.7 | ⬜ |
| 4.4 | Create `src/pages/projects/[slug].astro` — `getStaticPaths()`, full project detail (features, screenshots, stats, architecture) | Hard | 2.5, 3.7 | ⬜ |

### Service Summary

- **Runtime:** Astro (SSG — no client JS needed for these pages)
- **Files:** `src/pages/social.astro`, `documents.astro`, `projects.astro`, `projects/[slug].astro`
- **Key output:** 4 pages rendered statically from mock data

> 📄 Full report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)

---

## Phase 5 — Blog Pages + Filter

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 5.1 | Create Lexical renderer utility (`src/lib/render-lexical.ts`) — walks JSON tree → HTML | Hard | 2.1, 2.13 | ⬜ |
| 5.2 | Create `src/components/blog/BlogFilter.svelte` — category chips from article tags, filter logic | Medium | 2.6, 3.3 | ⬜ |
| 5.3 | Create `src/pages/blogs.astro` — blog list + `BlogFilter` island in right sidebar | Medium | 2.6, 3.7, 5.2 | ⬜ |
| 5.4 | Create `src/pages/blogs/[slug].astro` — `getStaticPaths()`, article detail with prose body, author card, related articles sidebar | Hard | 2.6, 2.12, 3.7, 5.1 | ⬜ |

### Service Summary

- **Runtime:** Astro SSG + Svelte island for filter
- **Files:** `src/lib/render-lexical.ts`, `src/components/blog/BlogFilter.svelte`, `blogs.astro`, `blogs/[slug].astro`
- **Key output:** Blog listing with filter + 6 article detail pages

> 📄 Full report: [`reports/phase-5-report.md`](./reports/phase-5-report.md)

---

## Phase 6 — Home Page (Svelte Islands)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 6.1 | Create `src/components/home/TypedRole.svelte` — role cycling animation with `prefers-reduced-motion` gate | Medium | 2.4, 3.3 | ⬜ |
| 6.2 | Create `src/components/home/CountUpStats.svelte` — cubic ease-out count-up with `prefers-reduced-motion` gate | Medium | 2.4 | ⬜ |
| 6.3 | Create `src/components/home/SpotlightEffect.svelte` — pointer radial glow on hero | Easy | — | ⬜ |
| 6.4 | Create `src/components/home/LiveClock.svelte` — ticking local time (15s interval) | Easy | 2.3 | ⬜ |
| 6.5 | Create `src/pages/index.astro` — assemble hero, stats, about, currently, skills, find-me with Svelte islands | Hard | 2.3, 2.4, 2.9, 3.7, 6.1, 6.2, 6.3, 6.4 | ⬜ |

### Service Summary

- **Runtime:** Astro SSG + Svelte islands (client:visible)
- **Files:** `src/components/home/{TypedRole,CountUpStats,SpotlightEffect,LiveClock}.svelte`, `src/pages/index.astro`
- **Key output:** Home page with all animations

> 📄 Full report: [`reports/phase-6-report.md`](./reports/phase-6-report.md)

---

## Phase 7 — Search Filters

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 7.1 | Add client-side text filter to `projects.astro` — filter by title/excerpt/techTags | Medium | 4.3 | ⬜ |
| 7.2 | Add client-side text filter to `blogs.astro` — filter by title/excerpt/tags | Medium | 5.3 | ⬜ |
| 7.3 | Add client-side text filter to `social.astro` — filter by platform/handle | Easy | 4.1 | ⬜ |

### Service Summary

- **Runtime:** Svelte (inline in each page)
- **Files:** Modified `projects.astro`, `blogs.astro`, `social.astro`
- **Key output:** Functional search on 3 listing pages

> 📄 Full report: [`reports/phase-7-report.md`](./reports/phase-7-report.md)

---

## Phase 8 — Verify & Polish

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|-------------|--------|
| 8.1 | Verify visual match against sprint-1 (light + dark + mobile) | Hard | All phases | ⬜ |
| 8.2 | Verify theme toggle works, no FOUC, persists across navigation | Medium | 3.1, 3.4 | ⬜ |
| 8.3 | Verify mobile drawer (open/close/backdrop/link-close) | Medium | 3.2, 3.5, 3.6 | ⬜ |
| 8.4 | Verify sidebar collapse on desktop, persists | Easy | 3.2, 3.5 | ⬜ |
| 8.5 | Verify active nav on all 7 pages including detail pages | Easy | 3.5 | ⬜ |
| 8.6 | Verify blog filter chips + filtering + "All" reset | Medium | 5.2 | ⬜ |
| 8.7 | Verify document grouping + empty category hiding | Easy | 4.2 | ⬜ |
| 8.8 | Verify home animations (typed role, count-up, spotlight, clock) | Medium | 6.1-6.4 | ⬜ |
| 8.9 | Verify search filters on projects, blogs, socials | Easy | 7.1-7.3 | ⬜ |
| 8.10 | Verify all internal links + external links + document downloads | Easy | All | ⬜ |
| 8.11 | Run `astro build` — verify static output in `dist/` | Easy | All | ⬜ |
| 8.12 | Write `docs/sprint-3/final-report.md` | Medium | 8.1-8.11 | ⬜ |

### Service Summary

- **Runtime:** Manual browser testing + `astro build`
- **Files:** All — final verification pass
- **Key output:** Verified build, final report

> 📄 Full report: [`reports/phase-8-report.md`](./reports/phase-8-report.md)

---

## Dependency Graph

```
Phase 1 ─────────────────────────────────────────────┐
  1.1 ──► 1.2 ──► 1.3 ──► 1.4                       │
  1.1 ──► 1.5                                        │
  1.6 (independent)                                   │
  1.1 ──► 1.7                                        │
                                                     │
Phase 2 ─────────────────────────────────────────────┤
  2.1 ──► 2.2─2.12                                   │
  2.5 ──► 2.14  2.6 ──► 2.13                         │
                                                     │
Phase 3 ─────────────────────────────────────────────┤
  1.4 ──► 3.1, 3.2                                   │
  1.3 ──► 3.3                                        │
  3.1, 3.3 ──► 3.4                                   │
  2.2, 2.3, 3.2, 3.3, 3.4 ──► 3.5                   │
  3.2, 3.3 ──► 3.6                                   │
  1.5, 1.6, 3.5, 3.6 ──► 3.7                         │
                                                     │
Phase 4 ─────────────────────────────────────────────┤
  2.9, 3.7 ──► 4.1                                   │
  2.7, 2.8, 3.7 ──► 4.2                              │
  2.5, 3.7 ──► 4.3                                   │
  2.5, 3.7 ──► 4.4                                   │
                                                     │
Phase 5 ─────────────────────────────────────────────┤
  2.1, 2.13 ──► 5.1                                  │
  2.6, 3.3 ──► 5.2                                   │
  2.6, 3.7, 5.2 ──► 5.3                              │
  2.6, 2.12, 3.7, 5.1 ──► 5.4                        │
                                                     │
Phase 6 ─────────────────────────────────────────────┤
  2.4, 3.3 ──► 6.1                                   │
  2.4 ──► 6.2                                        │
  6.3, 6.4, 2.3                                      │
  2.3, 2.4, 2.9, 3.7, 6.1─6.4 ──► 6.5               │
                                                     │
Phase 7 ─────────────────────────────────────────────┤
  4.3 ──► 7.1   5.3 ──► 7.2   4.1 ──► 7.3            │
                                                     │
Phase 8 ─────────────────────────────────────────────┤
  All phases ──► 8.1─8.12                            │
```

## Summary

| Phase | Tasks | Difficulty Mix | Status |
|-------|-------|---------------|--------|
| 1 — Scaffold & Shell | 7 | 7 Easy | ⬜ |
| 2 — Data Layer | 14 | 9 Easy, 3 Medium, 2 Hard | ⬜ |
| 3 — Shell Components | 7 | 4 Easy, 1 Medium, 2 Hard | ⬜ |
| 4 — Static Pages | 4 | 1 Easy, 2 Medium, 1 Hard | ⬜ |
| 5 — Blog Pages + Filter | 4 | 0 Easy, 2 Medium, 2 Hard | ⬜ |
| 6 — Home Page | 5 | 2 Easy, 2 Medium, 1 Hard | ⬜ |
| 7 — Search Filters | 3 | 1 Easy, 2 Medium | ⬜ |
| 8 — Verify & Polish | 12 | 5 Easy, 5 Medium, 2 Hard | ⬜ |
| **Total** | **56** | **29 E, 17 M, 10 H** | |
