# Phase 3 Report — Pages Content

> Completed: 2026-07-07
> Reconstructed retrospectively (2026-07-07) from `tasks.md` + the codebase — not written contemporaneously.
> Note: these pages were later revised — Home in phase 9, Projects grid in
> phase 5.2, Blogs layout in phase 5.3. This report describes them as initially built.

---

## 1. What was built

The first three content pages, dropped into the phase-2 shell, all using
realistic placeholder data (flagged for replacement in a later sprint).

- **Home** (`index.html`) — about-me hero card (avatar, "Hello I'm", name,
  role, two CTAs) + a 2-column masonry of cards: About Me, Quick Stats,
  Skills, Currently, Find Me
- **Projects** (`projects.html`) — masonry grid of project cards, each with a
  gradient banner, title, year, excerpt, tech tags, and footer links
- **Blogs** (`blogs.html`) — article cards with meta (tags, date, read time),
  title, excerpt, and a "Read article" footer

---

## 2. How to run

```bash
open index.html   # or projects.html / blogs.html
```

---

## 3. Files

| File             | Purpose                                                       |
|------------------|---------------------------------------------------------------|
| `index.html`     | Home: hero + masonry of bio/stats/skills/currently/find-me   |
| `projects.html`  | Projects: masonry (`column-count`) of project cards           |
| `blogs.html`     | Blogs: article cards (meta, title, excerpt, footer)          |
| `assets/styles.css` | `.card`, `.card-header`, `.card-title`, `.card-excerpt`, `.card-footer`, `.tag`, `.btn`, `.masonry` |

---

## 4. Key decisions

| Decision | Reason |
|----------|--------|
| Realistic placeholder content | Site should look complete on first view; real content is a later sprint |
| Reusable card/tag/button tokens | One component vocabulary across all pages = visual consistency + less CSS |
| Masonry via CSS `column-count` (projects, home) | No JS needed for a varied card wall |

---

## 5. What changed later

- Projects: masonry → responsive `.grid-3` (phase 5.2)
- Blogs: grid → single-column `.blog-list` (phase 5.3), then category filter (phase 8.4)
- Home: full redesign — interactive hero, count-up stats, 2×2 grid (phase 9)
