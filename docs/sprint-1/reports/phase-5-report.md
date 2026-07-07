# Phase 5 Report — Fixes & Detail Pages

> Completed: 2026-07-07
> Reconstructed retrospectively (2026-07-07) from `tasks.md` + the codebase — not written contemporaneously.

---

## 1. What was built

A follow-up pass: layout fixes from real use of the phase-3 pages, plus the
two detail pages and the prose styling they need.

- **Sidebar Connect group** — social links moved into an always-visible
  `.sidebar-section` (previously hidden/scroll-gated)
- **Projects: masonry → `.grid-3`** — 3-column responsive grid (2-col ≤1280,
  1-col ≤768) instead of the `column-count` masonry
- **Blogs: grid → `.blog-list`** — single-column, full-width article previews
- **Prose + detail-page styles** — `.prose` typography, `.detail-*` header/
  banner/meta, `.author-card`, `.back-link`, `.feature-list`, `.screenshot-row`
- **`article.html`** — blog detail: header, banner, prose body, author card,
  next-article
- **`project.html`** — project detail: header, banner, features, tech, screenshots
- **List → detail wiring** — project cards → `project.html`, blog cards →
  `article.html`

---

## 2. How to run

```bash
open projects.html   # click a card → project.html
open blogs.html      # click an article → article.html
```

---

## 3. Files

| File               | Purpose                                                                                  |
|--------------------|------------------------------------------------------------------------------------------|
| `article.html`     | NEW — blog detail page                                                                   |
| `project.html`     | NEW — project detail page                                                                |
| per-page `*.html`  | `.sidebar-section` (Connect group) added to sidebars                                      |
| `assets/styles.css`| `.sidebar-section` / `-title`, `.blog-list` / `.blog-card-*`, `.prose`, `.detail-*`, `.author-card`, `.back-link`, `.feature-list`, `.screenshot-row`, `.grid-3` |

---

## 4. Key decisions

| Decision | Reason |
|----------|--------|
| Detail pages reuse the phase-2 shell | Consistent nav/chrome; only the content area differs |
| Prose capped at ~760px max-width | Optimal reading measure; leaves intentional whitespace (later filled by the related-articles sidebar in phase 8.5) |
| `back-link` to return to the list | Standard list↔detail navigation |
| Masonry → `.grid-3` / `.blog-list` | Predictable, responsive, easier to scan than the varied masonry |

---

## 5. What changed later

- Sidebar got "Documents" (phase 6.1) and "Socials" (phase 8.3) nav items
- `article.html` gained a sticky related-articles sidebar (phase 8.5)
- `blogs.html` gained a category filter (phase 8.4)
