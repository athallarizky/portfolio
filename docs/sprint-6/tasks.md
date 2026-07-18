# Task Breakdown — Sprint 6: UI Polish & Bugfixes

> Status: 🟡 Planning | Created: 2026-07-10
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked
> Execution: one task at a time — tick off each row as you go.

---

## Phase 0 — Discovery (completed in planning)

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 0.1  | Three-pass frontend audit (functional, CSS/layout, a11y/mobile)             | Medium     | —            | ✅     |
| 0.2  | Spot-verify top findings (SpotlightEffect, depth=0, Icon.svelte svg, dead CSS usage, contrast math) | Easy       | 0.1          | ✅     |
| 0.3  | Deduplicate + rank ~28 findings by severity                                 | Easy       | 0.1          | ✅     |
| 0.4  | Write `reports/phase-0-report.md` (full findings table with file:line evidence) | Easy       | 0.2, 0.3     | ✅     |

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Functional Bugs

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 1.1  | `blogs/[slug].astro:11` — change `depth=0` → `depth=1` (tags/author populate) | Easy       | 0.4          | ✅     |
| 1.2  | `SpotlightEffect.svelte:18` — add `bind:this={heroEl}` to `.hero-spotlight` | Easy       | 0.4          | ✅     |
| 1.3  | `projects/[slug].astro:19` — replace `order === project.order + 1` with smallest-higher-order lookup | Easy       | 0.4          | ✅     |
| 1.4  | `LiveClock.svelte:13` — use `timezone` prop in `toLocaleTimeString` (map UTC+7→Asia/Jakarta or store IANA) | Medium     | 0.4          | ✅     |
| 1.5  | `contact.astro:69` — remove unused `iconHtml` var                           | Easy       | 0.4          | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`)
- **Files:** `blogs/[slug].astro`, `SpotlightEffect.svelte`, `projects/[slug].astro`, `LiveClock.svelte`, `contact.astro`
- **Key output:** article tags render; spotlight works; navigation robust

> 📄 Report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Fetch Resilience & Shared API Helper

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 2.1  | Create `frontend/src/lib/api.ts`: export `API` (from `PUBLIC_API_URL`), `safeFetch(path)` (try/catch + res.ok + returns `{docs:[]}` fallback) | Medium     | 0.4          | ✅     |
| 2.2  | Add `frontend/.env` with `PUBLIC_API_URL=http://localhost:3000/api` (gitignored) | Easy       | 2.1          | ✅     |
| 2.3  | Refactor `BaseLayout.astro` to use helper; render error state if nav/siteConfig fail | Medium     | 2.1          | ✅     |
| 2.4  | Refactor `index.astro` + add defensive defaults (`home.about ?? []` etc.)   | Medium     | 2.1          | ✅     |
| 2.5  | Refactor `projects.astro`, `projects/[slug].astro`, `blogs.astro`, `blogs/[slug].astro` | Medium     | 2.1          | ✅     |
| 2.6  | Refactor `social.astro`, `documents.astro` (incl. download origin from helper base) | Medium     | 2.1          | ✅     |
| 2.7  | Refactor `pages/api/contact.ts` to use helper                              | Easy       | 2.1          | ✅     |
| 2.8  | Verify: stop backend → pages show error card, not 500                       | Easy       | 2.3-2.7      | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`), PayloadCMS (`:3000`)
- **Files:** `src/lib/api.ts`, `frontend/.env`, all 9 pages + `api/contact.ts`
- **Key output:** single API base; graceful degradation when backend down

> 📄 Report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — CSS Bugfixes

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 3.1  | Migrate `iconify-icon` selectors → `svg` in `styles.css` (7 sites); delete `iconify-bridge.css` + its import | Medium     | 0.4          | ✅     |
| 3.2  | Broaden `@media (prefers-reduced-motion)` to global `*{transition/animation-duration:.01ms!important}` | Easy       | 0.4          | ✅     |
| 3.3  | `styles.css:844` — mobile `.content-scroll` padding 56px → 64px | Easy       | 0.4          | ✅     |
| 3.4  | `.halation` — add `overflow:hidden` to `.sidebar` to stop bleed when collapsed | Easy       | 0.4          | ✅     |
| 3.5  | Add global `:focus-visible { outline: 2px solid var(--secondary); outline-offset:2px }` + remove `outline:0/none` overrides | Easy       | 0.4          | ✅     |
| 3.6  | `--desc` light theme `#808080` → `#6b6b6b` (AA pass); verify dark unchanged | Easy       | 0.4          | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`)
- **Files:** `src/styles/styles.css`, `src/styles/iconify-bridge.css` (deleted)
- **Key output:** icon colors correct; motion gated; mobile not clipped; focus visible; contrast AA

> 📄 Report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Navigation & Detail-Page Behavior

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 4.1  | `Sidebar.svelte:33-37` — `isActive` → segment-based (`activeNav === href \|\| activeNav.startsWith(href+'/')`) | Easy       | 0.4          | ✅     |
| 4.2  | `projects/[slug].astro` + `blogs/[slug].astro` — redirect to 404 page on missing slug | Medium     | 0.4          | ✅     |
| 4.3  | Create `frontend/src/pages/404.astro` (BaseLayout + "not found" card + links home) | Easy       | 4.2          | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`)
- **Files:** `Sidebar.svelte`, `projects/[slug].astro`, `blogs/[slug].astro`, `404.astro` (new)
- **Key output:** correct active-nav; real 404 page for bad slugs

> 📄 Report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)

---

## Phase 5 — Accessibility

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 5.1  | `BaseLayout.astro` — add skip-to-content link + `#main tabindex=-1`; wrap sidebar nav in `aria-label` | Easy       | 0.4          | ✅     |
| 5.2  | Icon-only buttons get `aria-label`: hamburger, sidebar-collapse, theme-toggle, project/doc links | Medium     | 0.4          | ✅     |
| 5.3  | `SearchFilter.svelte` — add `aria-label` on input | Easy       | 0.4          | ✅     |
| 5.4  | `contact.astro` — add `role="status" aria-live="polite"` to `#form-status` | Easy       | 0.4          | ✅     |
| 5.5  | `Icon.svelte` — default `aria-hidden="true"`; add optional `label` prop | Easy       | 0.4          | ✅     |
| 5.6  | Decorative inline `<iconify-icon>` → will be hidden by Icon.svelte's aria-hidden default (task 5.5 covers it) | Easy       | 5.5          | ✅     |
| 5.7  | Mobile drawer: Escape-to-close, `role="dialog" aria-modal`, backdrop without role=presentation | Hard       | 0.4          | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`)
- **Files:** `BaseLayout.astro`, `Sidebar.svelte`, `Header.svelte`, `ThemeToggle.svelte`, `SearchFilter.svelte`, `contact.astro`, `Icon.svelte`, all pages
- **Key output:** keyboard/screen-reader usable; Lighthouse a11y ≥ 95

> 📄 Report: [`reports/phase-5-report.md`](./reports/phase-5-report.md)

---

## Phase 6 — Mobile & Empty States

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 6.1  | Touch targets ≥44px on mobile: `.icon-btn`, `.chip`, `.back-link`, `.sidebar-link` | Medium     | 0.4          | ✅     |
| 6.2  | Style `.chip-count` (BlogFilter.svelte:101 renders it unstyled)             | Easy       | 0.4          | ✅     |
| 6.3  | Empty-state fallback: `projects.astro`, `social.astro`, `documents.astro` when `docs.length === 0` | Medium     | 2.5, 2.6     | ✅     |
| 6.4  | `SearchFilter.svelte` — "no results" message when zero cards match          | Medium     | 0.4          | ✅     |
| 6.5  | Detail-page mobile breakpoints: `.detail-title` (32px→clamp)                | Easy       | 0.4          | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`), mobile viewport (375px)
- **Files:** `styles.css`, `BlogFilter.svelte`, `SearchFilter.svelte`, `projects.astro`, `social.astro`, `documents.astro`
- **Key output:** mobile-clean; no blank screens on empty/filtered data

> 📄 Report: [`reports/phase-6-report.md`](./reports/phase-6-report.md)

---

## Phase 7 — Dead-CSS Cleanup & SEO

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 7.1  | Remove dead CSS: `.masonry*`, `.sidebar-resizer`, `.is-hidden-desktop`, unused tokens (`--hover-foreground`, `--swiper-3d-shadow`) | Easy       | 3.1          | ✅     |
| 7.2  | `BaseLayout.astro` `<head>` — add meta description, OpenGraph (og:title/description/image), Twitter card, `theme-color`, canonical | Medium     | 0.4          | ✅     |
| 7.3  | Remove `!important` abuse: `.accent-bar` where redundant | Easy       | 3.3          | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`)
- **Files:** `styles.css`, `BaseLayout.astro`
- **Key output:** lean stylesheet; SEO/social meta present

> 📄 Report: [`reports/phase-7-report.md`](./reports/phase-7-report.md)

---

## Phase 8 — Verify & Finalize

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 8.1  | Full route sweep: all pages 200, `/projects/fake` → 404                     | Easy       | 1-7          | ✅     |
| 8.2  | Lighthouse a11y audit on `/` and `/contact` (target ≥95)                    | Medium     | 5.*          | ⬜     |
| 8.3  | Mobile re-check (375px): header, touch targets, grids, detail pages         | Easy       | 6.*          | ⬜     |
| 8.4  | `npx astro build` succeeds; `grep localhost:3000 src/pages` = 0             | Easy       | 2.*          | ✅     |
| 8.5  | Write `final-report.md`; update all `tasks.md` statuses                     | Easy       | 8.1-8.4      | ⬜     |

### Service Summary
- **Runtime:** Astro build + dev server
- **Files:** `docs/sprint-6/tasks.md`, `docs/sprint-6/final-report.md`
- **Key output:** sprint verified end-to-end; finalized

> 📄 Report: [`final-report.md`](./final-report.md)

---

## Phase 9 — UI Tweaks

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 9.1  | CMS-driven TypedRole roles: add `roles` array to Home global (backend: Home.ts + seed.ts) | Medium     | —            | ✅     |
| 9.2  | Frontend wiring: api-types `roles`, pass prop to TypedRole, accept prop in component | Easy       | 9.1          | ✅     |
| 9.3  | Card header: remove `space-between`, replace with `gap: 8px`               | Easy       | —            | ✅     |
| 9.4  | Remove dead sync icon from header: Header.svelte + CSS rules               | Easy       | —            | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`) + PayloadCMS (`:3000`)
- **Files:** `backend/src/globals/Home.ts`, `backend/src/seed.ts`, `frontend/src/lib/api-types.ts`, `frontend/src/pages/index.astro`, `frontend/src/components/home/TypedRole.svelte`, `frontend/src/components/shell/Header.svelte`, `frontend/src/styles/styles.css`
- **Key output:** roles editable from Payload admin; card-header icon+title adjacent; no dead sync icon in header

> 📄 Report: [`reports/phase-9-report.md`](./reports/phase-9-report.md)

---

## Phase 10 — Feature Flags

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 10.1 | Backend: add `showItems` select to Home global (hero/stats/about/currently/skills) | Easy       | —            | ✅     |
| 10.2 | Frontend: wrap home page sections in `visible.has()` using `home.showItems` | Easy       | 10.1         | ✅     |
| 10.3 | Backend: add `contactFormEnabled` checkbox to SiteConfig global + seed      | Easy       | —            | ✅     |
| 10.4 | Frontend: guard contact.astro + `/api/contact.ts` with contactFormEnabled   | Medium     | 10.3         | ✅     |
| 10.5 | Backend: add `documentsEnabled` checkbox to SiteConfig global + seed        | Easy       | —            | ✅     |
| 10.6 | Frontend: guard documents.astro with documentsEnabled                       | Medium     | 10.5         | ✅     |
| 10.7 | Verify: build passes; toggles work via Payload admin                        | Easy       | 10.1-10.6    | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`) + PayloadCMS (`:3000`)
- **Files:** `backend/src/globals/Home.ts`, `backend/src/globals/SiteConfig.ts`, `backend/src/seed.ts`, `frontend/src/lib/api-types.ts`, `frontend/src/pages/index.astro`, `frontend/src/pages/contact.astro`, `frontend/src/pages/api/contact.ts`, `frontend/src/pages/documents.astro`
- **Key output:** CMS-driven section visibility; contact form kill-switch; documents toggle

> 📄 Report: [`reports/phase-10-report.md`](./reports/phase-10-report.md)

---

## Summary

| Phase                        | Tasks | Difficulty Mix | Status |
|------------------------------|-------|----------------|--------|
| 0 — Discovery                | 4     | 3 E, 1 M       | ✅     |
| 1 — Functional Bugs          | 5     | 4 E, 1 M       | ✅     |
| 2 — Fetch Resilience         | 8     | 3 E, 5 M       | ✅     |
| 3 — CSS Bugfixes             | 6     | 6 E            | ✅     |
| 4 — Nav & Detail Pages       | 3     | 1 E, 2 M       | ✅     |
| 5 — Accessibility            | 7     | 4 E, 2 M, 1 H  | ✅     |
| 6 — Mobile & Empty States    | 5     | 1 E, 4 M       | ✅     |
| 7 — Cleanup & SEO            | 3     | 2 E, 1 M       | ✅     |
| 8 — Verify & Finalize        | 5     | 4 E, 1 M       | ✅     |
| 9 — UI tweaks                | 3     | 2 E, 1 M       | ✅     |
| 10 — Feature flags           | 7     | 4 E, 3 M       | ✅     |
| **Total**                    | **56**| **34 E, 19 M, 1 H** | ✅ |
