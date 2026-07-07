# Task Breakdown — Personal Portfolio (Static HTML Demo)

> Status: ✅ Delivered | Created: 2026-07-07 | Completed: 2026-07-07
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Sprint Goal

Build a static, multi-page HTML demo of a personal portfolio website whose
dashboard-like UI is cloned from `temp/blinko/` (React/Vite/Tailwind/HeroUI).

Five pages are delivered as separate static HTML files sharing one
`assets/styles.css` (Blinko-cloned CSS variable theme) and one `assets/app.js`
(theme toggle + active nav):

- **Home** (`index.html`) — About me
- **Projects** (`projects.html`) — Masonry grid of project cards
- **Blogs** (`blogs.html`) — Article list with category filter
- **Documents** (`documents.html`) — Downloadable files, grouped by category
- **Socials** (`social.html`) — Social profile links hub

No build step. No framework runtime. Content is realistic placeholder data to
be replaced with real info in a later sprint.

---

## Phase 1 — Setup & Foundation

| ID  | Task                                                                                      | Difficulty | Dependencies | Status |
|-----|-------------------------------------------------------------------------------------------|------------|--------------|--------|
| 1.1 | Create `docs/sprint-1/` + `tasks.md` + `reports/phase-0-report.md`                        | Easy       | —            | ✅     |
| 1.2 | Create `assets/styles.css` porting Blinko theme from `globals.css:163-271` (light + dark) | Easy       | 1.1          | ✅     |
| 1.3 | Create `assets/app.js` (theme toggle w/ localStorage, active nav from `location.pathname`)| Easy       | 1.1          | ✅     |

---

## Phase 2 — Layout Shell (per-page, shared via CSS)

| ID  | Task                                                                                         | Difficulty | Dependencies | Status |
|-----|----------------------------------------------------------------------------------------------|------------|--------------|--------|
| 2.1 | Sidebar: avatar, nav list (Home/Projects/Blogs), theme toggle, halation blur decoration       | Medium     | 1.2          | ✅     |
| 2.2 | Header bar: vertical accent + bold title + sync icon, search box + notification icons         | Easy       | 1.2          | ✅     |
| 2.3 | Main content shell: scroll area + blurred purple corner blob (from `Layout/index.tsx:207`)   | Easy       | 2.1, 2.2     | ✅     |

---

## Phase 3 — Pages Content

| ID  | Task                                                                  | Difficulty | Dependencies | Status |
|-----|-----------------------------------------------------------------------|------------|--------------|--------|
| 3.1 | `index.html` — Home: about-me hero card + bio/stats/skills cards      | Medium     | 2.3          | ✅     |
| 3.2 | `projects.html` — Projects: masonry grid of project cards             | Medium     | 2.3          | ✅     |
| 3.3 | `blogs.html` — Blogs: article cards (title, date, read time, excerpt) | Medium     | 2.3          | ✅     |

---

## Phase 4 — Polish & Verify

| ID  | Task                                                                            | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------|------------|--------------|--------|
| 4.1 | Responsive: sidebar collapses to hamburger drawer below 768px                   | Medium     | 3.3          | ✅     |
| 4.2 | Card hover-lift (`hover:translate-y-1`), transitions, scrollbar styling         | Easy       | 3.3          | ✅     |
| 4.3 | Test all 3 pages × both themes × mobile breakpoint, fix visual issues           | Easy       | 4.1, 4.2     | ✅     |
| 4.4 | Update `tasks.md` (mark all ✅), write `reports/phase-1-report.md`              | Easy       | 4.3          | ✅     |

---

## Phase 5 — Fixes & Detail Pages (follow-up)

| ID  | Task                                                                                  | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------|------------|--------------|--------|
| 5.1 | Sidebar: move social links into always-visible `.sidebar-section` (was hidden/scroll) | Easy       | 4.3          | ✅     |
| 5.2 | Projects: switch masonry 2-col → `.grid-3` (3-col responsive grid)                     | Easy       | 4.3          | ✅     |
| 5.3 | Blogs: switch 2-col grid → `.blog-list` (single-col full-width article previews)       | Easy       | 4.3          | ✅     |
| 5.4 | Add prose + detail-page component styles to `styles.css`                               | Easy       | 5.3          | ✅     |
| 5.5 | `article.html` — blog detail: header, banner, prose body, author card, next-article    | Medium     | 5.4          | ✅     |
| 5.6 | `project.html` — project detail: header, banner, features, tech, screenshots, stats    | Medium     | 5.4          | ✅     |
| 5.7 | Wire list → detail links (projects → `project.html`, blogs → `article.html`)           | Easy       | 5.5, 5.6     | ✅     |

---

## Phase 6 — Documents Page (downloadable files)

| ID  | Task                                                                                          | Difficulty | Dependencies | Status |
|-----|-----------------------------------------------------------------------------------------------|------------|--------------|--------|
| 6.1 | Add "Documents" nav link to sidebar on all pages (Home/Projects/Blogs/Documents)              | Easy       | 5.7          | ✅     |
| 6.2 | `documents.html` — grid of downloadable document cards (icon, type, size, download button)    | Medium     | 6.1          | ✅     |
| 6.3 | Add `.doc-card` styles to `styles.css` (file-icon tile, meta row)                             | Easy       | 6.2          | ✅     |
| 6.4 | Wire `data-page` active nav + pageTitle map in `app.js`                                       | Easy       | 6.1          | ✅     |
| 6.5 | Scaffold `assets/documents/` + README for real file drops                                     | Easy       | 6.2          | ✅     |

---

## Phase 7 — Document categories (registry-driven)

| ID  | Task                                                                                              | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 7.1 | `assets/documents.js` — `CATEGORIES` + `DOCUMENTS` registry + grouped renderer (skips empties)    | Medium     | 6.2          | ✅     |
| 7.2 | `documents.html` — replace hardcoded cards with `#documents-root` render target + script include  | Easy       | 7.1          | ✅     |
| 7.3 | `.doc-group` styles in `styles.css` (icon + title + count badge + hint)                           | Easy       | 7.1          | ✅     |
| 7.4 | Copy real `ai-workflow-template.md` into `assets/documents/` (working Research download)           | Easy       | 7.1          | ✅     |
| 7.5 | Update `assets/documents/README.md` (by-category list + source-of-truth note)                     | Easy       | 7.1          | ✅     |

---

## Phase 8 — UX refinements (compact cards, Socials, blog filter, related)

| ID  | Task                                                                                              | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 8.1 | Compact document cards: horizontal row, inline download, 1-line excerpt (`documents.js` + css)    | Easy       | 7.1          | ✅     |
| 8.2 | `social.html` — Social profile link cards (GitHub/LinkedIn/X/Threads/Instagram/Facebook/YouTube)  | Medium     | 6.1          | ✅     |
| 8.3 | "Socials" nav link on all pages + `app.js` pageTitle map + `.social-card` styles                   | Easy       | 8.2          | ✅     |
| 8.4 | Blogs: sticky category-filter sidebar — chips derived from tags, `assets/blogs.js` filters list   | Medium     | 5.3          | ✅     |
| 8.5 | Article detail: sticky related-articles sidebar (compact, non-disruptive while reading)            | Medium     | 5.5          | ✅     |

---

## Phase 9 — Home page redesign (interactive + minimalist)

| ID  | Task                                                                                              | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 9.1 | Redesign hero: pointer-follow spotlight, dot-grid texture, typing role, pulsing availability dot  | Medium     | 2.3          | ✅     |
| 9.2 | Count-up stats + live local-time clock (`assets/home.js`)                                          | Medium     | 9.1          | ✅     |
| 9.3 | Reorganize About/Currently/Skills/FindMe into 2×2 card grid + staggered reveal on load             | Easy       | 9.1          | ✅     |
| 9.4 | `prefers-reduced-motion` guard for all motion (reveal, pulse, caret, counters)                     | Easy       | 9.1          | ✅     |

---

## Dependency Graph

```
Phase 1 — Foundation
  1.1 ──► 1.2 ──┐
  1.1 ──► 1.3 ──┤
                │
Phase 2 — Shell │
  1.2 ──► 2.1 ──┤
  1.2 ──► 2.2 ──┤
  2.1 + 2.2 ──► 2.3
                │
Phase 3 — Pages │
  2.3 ──► 3.1   │
  2.3 ──► 3.2   │
  2.3 ──► 3.3 ──┤
                │
Phase 4 — Polish
  3.3 ──► 4.1 ──┐
  3.3 ──► 4.2 ──┤
  4.1 + 4.2 ──► 4.3 ──► 4.4

Phase 5 — Fixes & Detail
  4.3 ──► 5.7 ──► Phase 6

Phase 6 — Documents
  5.7 ──► 6.1 ──► 6.2 ──► 6.3
                ├─► 6.4
                └─► 6.5

Phase 7 — Doc categories
  6.2 ──► 7.1 ──► 7.2
              ├─► 7.3
              ├─► 7.4
              └─► 7.5

Phase 8 — UX refinements
  7.1 ──► 8.1
  6.1 ──► 8.2 ──► 8.3
  5.3 ──► 8.4
  5.5 ──► 8.5
```

---

## Summary

| Phase              | Tasks | Est. Time | Status |
|--------------------|-------|-----------|--------|
| 1 — Foundation     | 3     | 45m       | ✅     |
| 2 — Layout Shell   | 3     | 1h 30m    | ✅     |
| 3 — Pages          | 3     | 1h 30m    | ✅     |
| 4 — Polish & Verify| 4     | 1h        | ✅     |
| 5 — Fixes & Detail | 7     | 1h 30m    | ✅     |
| 6 — Documents      | 5     | 1h        | ✅     |
| 7 — Doc categories | 5     | 1h        | ✅     |
| 8 — UX refinements | 5     | 1h 30m    | ✅     |
| 9 — Home redesign  | 4     | 1h 15m    | ✅     |
| **Total**          | **39**| **~11h**  | ✅    |

---

## Out of Scope (Backlog → `docs/ideas/future-enhancements.md`)

- Replace placeholder content with real info (incl. real downloadable PDFs in `assets/documents/`)
- Migrate to a real framework (Next.js / Vite + React) for routing & components
- Blog MDX/markdown pipeline
- Projects fetched from a data source (GitHub API, headless CMS)
- Documents served from a CMS instead of the local JS registry (registry now lives in `assets/documents.js`)
- Live search/filter across document categories (header search box is decorative for now)
- Light/dark/system theme modes (currently manual toggle only)
- SEO, OpenGraph, sitemap
- Contact form
- Analytics
