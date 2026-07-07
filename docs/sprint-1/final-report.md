# Sprint 1 — Final Report

> Status: ✅ Delivered | 2026-07-07
> Audience: sprint-2 context. Read this + [`AGENTS.md`](../../AGENTS.md) before
> starting sprint-2.

---

## 1. Sprint goal & outcome

Build a static, multi-page personal-portfolio **demo** whose dashboard-like UI
is cloned from `temp/blinko/` (React/Vite/Tailwind/HeroUI), delivered as plain
HTML/CSS/JS — **no build step, no framework runtime**.

**Outcome:** 5 top-level pages + 2 detail pages, a shared Blinko-cloned theme,
light/dark mode, responsive (sidebar → mobile drawer), and a handful of
data-driven + interactive features — all in vanilla JS.

---

## 2. Final structure (monorepo)

End of sprint-1 reorganized the repo into a monorepo: **`frontend/`** holds all
fe code; **`backend/`** is reserved for sprint-2+.

```
portofolio/
├── AGENTS.md                 # delegation guide for other LLMs (read first)
├── docs/
│   ├── ai-workflow-template.md   # the workflow this sprint followed
│   └── sprint-1/
│       ├── tasks.md              # 39 tasks, 9 phases, all ✅
│       ├── final-report.md       # ← this file
│       └── reports/
│           ├── phase-0 … phase-9 report.md   # complete set
├── frontend/                 # ← fe (this sprint)
│   ├── index.html            # Home (interactive: spotlight, count-up, typing)
│   ├── projects.html         # Projects grid
│   ├── blogs.html            # Blog list + category filter
│   ├── documents.html        # Downloadable docs, grouped by category
│   ├── social.html           # Social links hub
│   ├── article.html          # Blog detail + related-articles sidebar
│   ├── project.html          # Project detail
│   └── assets/
│       ├── styles.css        # Blinko-cloned theme + all component CSS
│       ├── app.js            # theme toggle, active nav, drawer, pageTitle
│       ├── home.js           # home interactions (typer, count-up, spotlight, clock)
│       ├── blogs.js          # blog category filter (derives chips from tags)
│       ├── documents.js      # documents registry + grouped renderer
│       └── documents/        # downloadable files (+ ai-workflow-template.md real)
├── backend/                  # ← reserved for sprint-2 (not created yet)
└── temp/blinko/              # reference clone (do NOT ship; design source only)
```

---

## 3. Pages delivered

| Page | What it has |
|------|-------------|
| **Home** (`index.html`) | Interactive hero (pointer spotlight, typing role, availability pulse, dot-grid), count-up stats, live local-time clock, 2×2 card grid (About/Currently/Skills/Find me). Staggered reveal; `prefers-reduced-motion` safe. |
| **Projects** (`projects.html`) | `.grid-3` of project cards (gradient banner, title, year, excerpt, tech tags, footer links). |
| **Blogs** (`blogs.html`) | Single-column `.blog-list` + sticky **category filter** sidebar (chips derived from article tags). |
| **Documents** (`documents.html`) | Compact downloadable-file rows **grouped by category** (Pinned/Research/Other), rendered from a registry. |
| **Socials** (`social.html`) | `.grid-3` of social profile cards (brand glyphs, external links). |
| **article.html** | Blog detail: header, banner, prose, author card, next-article, sticky **related-articles** sidebar. |
| **project.html** | Project detail: header, banner, features, tech, screenshots. |

All 7 pages share one sidebar (Home/Projects/Blogs/Documents/Socials + Connect
group) and one header. Active nav + page title auto-resolve from
`location.pathname`.

---

## 4. Architecture & key decisions

| Decision | Why |
|----------|-----|
| Static HTML, vanilla JS, no build step | Fastest path to a visible demo; deployable as static files |
| Blinko CSS-variable theme ported verbatim | Pixel-level fidelity to the reference; trivial light/dark |
| Per-page shared layout via CSS classes (not components) | No framework → no partials; classes keep it DRY |
| `data-page` attribute drives active-nav + pageTitle | Each static page self-highlights from its URL |
| Data-driven registries (`documents.js`, `blogs.js`) | Adding content = one array entry, not copy-pasted markup |
| Interactions are CSS-first (reveal, pulse, caret); JS only for data | No motion library, low runtime cost |
| `prefers-reduced-motion` gates all motion | Accessibility |
| Monorepo (`frontend/` + future `backend/`) | Sets up fe/be split before sprint-2 adds a backend |

---

## 5. The design system to preserve (read AGENTS.md for full rules)

- **Theme tokens** in `assets/styles.css`: `--background --foreground --primary
  --secondary --card --border --radius --shadow --hover --muted --desc` (+ `.dark`)
- **Accent:** purple `--secondary` `hsl(253,53%,59%)` / `#c35af7`. Yellow
  halation + purple corner-blob for ambient depth.
- **Component vocabulary:** `.card`, `.card-header/-title/-excerpt/-footer`,
  `.tag` / `.tag.is-secondary`, `.btn` (`-primary/-outline/-ghost`), `.chip`,
  `.sidebar-link`, `.icon-btn`, `.grid-2/-3`, `.masonry`, `.prose`.
- **Icons:** Iconify `iconify-icon` web component (Solar set for UI,
  `simple-icons` for brands).
- **Font:** Inter (constraint — whole site uses it); `ui-monospace` for
  code/label accents.

---

## 6. Placeholder vs real

| Real | Placeholder (replace in sprint-2) |
|------|-----------------------------------|
| `frontend/assets/documents/ai-workflow-template.md` (working download) | All other downloads (resume/CV/… — links wired, files absent → 404 until dropped in) |
| The 5 category ids + document registry | Persona text, stats numbers, project/blog content, social handles/URLs (all `example`/placeholder) |

The site is visually complete with **realistic placeholder content** — content
swap is a sprint-2 concern, not structural.

---

## 7. How to run

No build step. Serve the `frontend/` folder (or open files directly):

```bash
cd frontend
python3 -m http.server 8080     # then http://localhost:8080
# or just open frontend/index.html
```

---

## 8. Carry-over to sprint-2 (backlog)

Prioritized from `tasks.md` "Out of scope" + session findings:

1. **Real content** — replace placeholder persona, stats, projects, blogs,
   social URLs; drop real PDFs into `frontend/assets/documents/`.
2. **Backend (`backend/`)** — the monorepo slot is reserved. Likely: a small
   API + data store so projects/blogs/documents come from a source instead of
   hardcoded HTML / JS registries.
3. **Framework migration (optional)** — Next.js / Vite+React for routing &
   components (the repeated-per-page shell is the main pain today).
4. **Blog pipeline** — MDX/markdown → rendered articles (today: hand-written HTML).
5. **Wire the decorative controls** — header search + filter icons are
   non-functional across pages.
6. **Polish** — SEO/OG/sitemap, contact form, analytics, system-theme mode.

---

## 9. Sprint stats

- **39 tasks** across **9 phases**, all ✅ (`docs/sprint-1/tasks.md`)
- **10 phase reports** (`phase-0` → `phase-9`)
- **~11h** estimated
- No automated tests (static demo); verification was visual + `node --check` on JS.
