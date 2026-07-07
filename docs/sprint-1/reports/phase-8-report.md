# Phase 8 Report — UX Refinements

> Completed: 2026-07-07

Four small refinements requested in quick succession: denser document cards,
a Socials page, a blog category filter, and a related-articles sidebar.

---

## 1. What was built

1. **Compact document cards** — restructured the `.doc-card` from a stacked
   (body + footer) card to a single horizontal row: icon · info · inline
   download button. Smaller 40px icon tile, tighter padding, 1-line truncated
   excerpt. Less vertical space per card.
2. **Socials page** (`social.html`) — new top-level page: a 3-column grid of
   social profile cards (GitHub, LinkedIn, X, Threads, Instagram, Facebook,
   YouTube) using `simple-icons` brand glyphs on uniform `--secondary` tiles.
   Whole card is an external link. "Socials" added to the sidebar on all pages.
3. **Blog category filter** (`blogs.html`) — two-column layout: article list +
   sticky "Categories" sidebar. Chips are **derived dynamically from each
   article's tags** by `assets/blogs.js` (no hardcoded list); clicking filters
   the list; "All" resets.
4. **Related-articles sidebar** (`article.html`) — two-column layout: reading
   column + sticky related-articles list. Compact items, non-disruptive
   (sticky, collapses below the prose on narrow screens).

---

## 2. Files touched

| File               | Change                                                                  |
|--------------------|-------------------------------------------------------------------------|
| `assets/documents.js` | `card()` rebuilt as a compact horizontal row (no `.doc-card-body`/footer) |
| `assets/styles.css`   | `.doc-card` compact styles; `.social-card*`; `.blog-layout`/`.blog-filter`/`.chip`; `.article-layout`/`.related-*` |
| `social.html`         | NEW — social profile grid + Socials-active sidebar                       |
| `blogs.html`          | `.blog-layout` wrapper + `.blog-filter` aside + `blogs.js` include       |
| `article.html`        | `.article-layout` + `.article-main` wrapper + `.related-articles` aside  |
| `assets/blogs.js`     | NEW — derives category chips from tags, filters on click                 |
| `*.html` (6 others)   | + "Socials" nav link in sidebar                                          |
| `assets/app.js`       | + `'social.html': 'Socials'` in pageTitle map                            |
| `docs/sprint-1/tasks.md` | + Phase 8; summary → 35 / ~9h 45m; "Five pages"                       |

---

## 3. Key decisions

| Decision | Reason |
|----------|--------|
| Derive blog filter chips from existing tags | No data-model change; categories stay in sync with articles automatically |
| Uniform `--secondary` tiles for socials (not brand colors) | Brand colors for black brands (X/Threads/GitHub) break contrast in dark mode; uniform tiles are cohesive and theme-safe |
| Related sidebar is `position: sticky`, not fixed/floating | Stays in view while reading without following the cursor or overlapping content — the requested "non-disruptive" UX |
| Both sidebars collapse to single column on narrow screens | Mobile-friendly; blog filter reorders above the list (`order:-1`) |

---

## 4. Verification

- `node --check assets/blogs.js` → valid.
- `blogs.html` / `article.html` `<div>` balance = 36/36 each (wrapper edits didn't break nesting).
- "Socials" nav present on all 7 pages (1 each); `app.js` map entry present.
- Both two-column layouts use responsive breakpoints (1024px blogs, 1100px article) to stack on narrow screens.

## 5. Done criteria

- [x] Document cards compacted (horizontal row, inline download)
- [x] Socials page built + nav on all pages
- [x] Blog category filter works (chips derived, click filters, All resets)
- [x] Related-articles sidebar sticky + non-disruptive + responsive
- [x] Both themes + mobile considered
- [x] `tasks.md` Phase 8 + this report written
