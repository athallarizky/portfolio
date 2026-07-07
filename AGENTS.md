# AGENTS.md — Portfolio Implementation Guide

> **For:** any LLM agent working on this repo in a fresh session.
> **Read this first**, then [`docs/sprint-1/final-report.md`](docs/sprint-1/final-report.md)
> for what sprint-1 delivered.
> **Owner:** Atha Tharizky — Full-Stack Engineer (backend-leaning · TS/Go/Python · AI tooling).

---

## 0. TL;DR — what this is

A personal portfolio website with a **dashboard-like UI cloned from Blinko**
(`temp/blinko/`). Two halves:

- **`backend/`** — a **PayloadCMS 3** headless CMS (sprint-2, ✅ complete) that
  models all content and serves a public REST API.
- **`frontend/`** — the sprint-1 **static HTML/CSS/JS** demo (no build step).
  Now **legacy / reference only**; it will be **rebuilt in Astro + Svelte** in a
  later sprint against the backend's REST API.

See [`docs/sprint-2/plan.md`](docs/sprint-2/plan.md) for the backend work.

**The one rule that overrides everything:** match the existing aesthetic.
Every page must look like it belongs to the same product (same sidebar, header,
cards, purple accent, spacing, motion). Do not introduce a new visual language.

---

## 1. Tech stack (EXACT — do not change without asking)

| Layer      | Technology |
|------------|------------|
| Markup     | Hand-written static HTML files (one per page) |
| Styling    | One shared `frontend/assets/styles.css` — plain CSS, CSS variables for theming |
| Behavior   | Vanilla JS, small per-feature IIFEs (`app.js`, `home.js`, `blogs.js`, `documents.js`) |
| Icons      | [Iconify](https://iconify.design) `iconify-icon` web component (CDN), **Solar** set for UI, **simple-icons** for brand logos |
| Font       | **Inter** (Google Fonts) + `ui-monospace` (system) for code/label accents |
| Build      | **None.** No npm, no bundler, no transpile. Files served as-is. |

Do NOT add: a CSS framework, a JS framework/runtime, a build step, or a new
web font — unless the user explicitly approves it (it changes the whole project).

> **Backend (separate stack):** `backend/` is a **PayloadCMS 3** app — Next.js +
> SQLite (dev) + Lexical rich text, configured in vanilla TS. The future
> frontend will be **Astro + Svelte**, consuming the backend's REST API.

---

## 2. Repo structure (monorepo)

```
portofolio/
├── AGENTS.md                 ← you are here
├── docs/
│   ├── ai-workflow-template.md   # the phased workflow to follow
│   └── sprint-1/                 # sprint record (tasks, reports, final-report)
├── frontend/                ← LEGACY static demo (sprint-1) — reference only,
│   ├── *.html               #   will be rebuilt in Astro + Svelte later
│   └── assets/              #   styles.css, app.js, home/blogs/documents.js, documents/
├── backend/                 ← PayloadCMS 3 app (sprint-2): REST API + admin
│   ├── payload.config.ts    #   collections, globals, cors, sqlite adapter
│   ├── src/collections/     #   Users, DocumentCategories, Documents, Tags, Authors, Articles, Technologies, Projects, SocialProfiles
│   ├── src/globals/         #   SiteConfig, Home, Nav
│   ├── src/seed.ts          #   npm run seed — idempotent, seeds all content
│   └── src/app/(payload)/   #   admin + REST route group (generated boilerplate)
├── docs/sprint-2/           # backend plan + tasks + reports
└── temp/blinko/             # reference clone — DESIGN SOURCE ONLY, do not ship
```

All asset/page references are **relative** (`assets/styles.css`, `projects.html`),
so the `frontend/` folder is self-contained and works served from any root.

---

## 3. The design system — "maintain the style" (read carefully)

This is a **Blinko clone**. The look is: calm, dense, app-like dashboard;
soft ambient depth; purple accent on neutral surfaces; restrained motion.

### 3.1 Theme tokens (`frontend/assets/styles.css`, `:root` + `.dark`)
Reuse these — never hardcode colors:
`--background --foreground --secondbackground --card --border --radius --shadow
--hover --muted --desc --ignore --primary --primary-foreground --secondary
--secondary-foreground --accent --popover --input --ring --header`.

- **Accent / brand color = purple:** `--secondary` = `hsl(253,53%,59%)` ≈ `#c35af7`.
  Tags, links, active highlights, icons, glows all lean on it.
- **Surfaces are neutral** (white/near-black). Don't paint big brand-colored
  blocks; use purple as a sharp accent.
- **Ambient depth** (already global): `.corner-blob` (blurred purple, top-right)
  and sidebar `.halation` (blurred yellow, bottom). Keep them; don't add more
  heavy effects.

### 3.2 Component vocabulary — reuse, don't reinvent
| Class | Use |
|-------|-----|
| `.card`, `.card.is-hoverable` | Any boxed content; `is-hoverable` adds the lift |
| `.card-header`, `.card-title`, `.card-excerpt`, `.card-footer`, `.card-date` | Card internals |
| `.tag`, `.tag.is-secondary` | Pills (tech, categories, file types) |
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost` | Buttons |
| `.chip` | Round filter chip (blogs) |
| `.icon-btn` | Square icon-only button |
| `.grid-2`, `.grid-3`, `.masonry`, `.blog-list` | Layouts (responsive built-in) |
| `.sidebar-link`, `.sidebar-section`, `.sidebar-section-title` | Sidebar nav |
| `.prose` | Article body typography (auto-styled h2/h3/p/code/pre/blockquote) |
| `.back-link`, `.detail-*`, `.author-card`, `.feature-list` | Detail-page parts |
| Utilities: `.flex .flex-col .flex-wrap .items-center .justify-between .gap-1..4 .mt-2/.mt-4 .mb-2/.mb-4 .text-desc .text-xs/.text-sm .w-full` | Spacing/layout helpers |

### 3.3 Motion rules
- **CSS-first.** Use transitions/keyframes; reach for JS only to feed data
  (counters, clocks, pointer coords, filtering).
- One orchestrated moment beats scattered micro-interactions.
- **Always** gate motion behind `@media (prefers-reduced-motion: reduce)`.
- Hover = subtle (`translateY(-2..4px)`, background shift), never flashy.

### 3.4 Icons
`<iconify-icon icon="solar:..." width="20" height="20"></iconify-icon>`.
- Solar for UI (`solar:user-id-outline`, `solar:folder-bold-duotone`, …).
- `simple-icons:*` for brand logos (`simple-icons:github`, `simple-icons:x`, …).
- Color an icon via a class/`color:` — iconify uses `currentColor`.

---

## 4. Pages that exist (do NOT rebuild)

| File | Page |
|------|------|
| `index.html` | Home — interactive hero, count-up stats, 2×2 grid |
| `projects.html` | Projects — `.grid-3` of cards |
| `blogs.html` | Blogs — `.blog-list` + category filter sidebar |
| `documents.html` | Documents — registry-driven, grouped by category |
| `social.html` | Socials — `.grid-3` of profile cards |
| `article.html` | Blog detail + related-articles sidebar |
| `project.html` | Project detail |

---

## 5. Conventions — how to do common tasks

### Add a new page
1. Copy `projects.html` (cleanest template) → `frontend/<name>.html`.
2. In the sidebar `<nav class="sidebar-nav">`, the new page's link needs
   `class="sidebar-link" data-page="<name>.html"`. Mark it `is-active` on its
   own page only.
3. **Add the same nav link to every other page's sidebar** (the shell is
   duplicated per page — keep them in sync).
4. Register the title in `frontend/assets/app.js` → `initPageTitle()` map:
   `'<name>.html': 'Title'`. (Active-nav highlight is automatic via `data-page`.)
5. Add any page-specific CSS to `frontend/assets/styles.css` (one file).
6. Page-specific JS → a new `frontend/assets/<name>.js`, included after `app.js`.

### Add a downloadable document
Edit `frontend/assets/documents.js` → push one object to `DOCUMENTS`
(`title, category, file, size, updated, excerpt`), drop the file in
`frontend/assets/documents/`. Categories live in `CATEGORIES` in the same file.
Empty categories auto-hide.

### Add a blog article
Add an `<article>` to `blogs.html`'s `.blog-list` (copy an existing one). Its
`.tag` chips auto-become filter categories via `blogs.js` — no JS edit needed.
Add the full article as `article.html`-style detail if needed.

### Theme
Toggle via the sidebar button (handled by `app.js`). Persisted in
`localStorage['portfolio-theme']`; first visit respects
`prefers-color-scheme`. `.dark` class on `<html>` switches all tokens.

---

## 6. What to build (backlog / vision)

Ordered priority (confirm with the user before starting):

1. ~~**Backend (sprint-2)**~~ — ✅ Complete. PayloadCMS 3 modeling all content +
   public REST API. See [`docs/sprint-2/final-report.md`](docs/sprint-2/final-report.md).
2. **Frontend rebuild (sprint-3, UPCOMING)** — replace the legacy static `frontend/`
   with **Astro + Svelte** consuming the backend REST API. Reuse sprint-1's
   design system (§3) so it still looks like the Blinko clone.
3. **Blog pipeline** — articles authored as Lexical rich text in Payload;
   rendered by the future Astro/Svelte FE.
4. **Polish** — SEO/OpenGraph/sitemap, contact form, analytics, system-theme mode.

---

## 7. How to run

**Backend (PayloadCMS):**
```bash
cd backend && npm install && npm run dev      # http://localhost:3000  →  /admin, /api
```

**Frontend (legacy static, reference only):**
```bash
cd frontend && python3 -m http.server 8080    # http://localhost:8080
```

Verify JS with `node --check frontend/assets/<file>.js`. There are **no
automated tests** — verify the backend via `curl http://localhost:3000/api/<col>`
and the frontend visually across light/dark + mobile.

---

## 8. Working style (from `docs/ai-workflow-template.md`)

- Follow the phased workflow: plan → build → **verify by running it** → write a
  phase report → update `tasks.md` → ask before committing.
- **Ask before design decisions**; recommend an option rather than surveying.
- Keep new code consistent with surrounding style (naming, density, idiom).
- `docs/` = sprint planning markdown; `frontend/assets/documents/` =
  downloadable files — never confuse the two.
- `temp/blinko/` is reference only — copy patterns, don't ship its files.
- **Git:** the owner handles all commits. Do not commit unless asked.

## 9. Done criteria (self-check before claiming done)

- [ ] New page/feature matches the dashboard aesthetic (sidebar, header, cards, accent)
- [ ] Works in **light + dark** and on **mobile** (sidebar drawer, grids collapse)
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Sidebar nav stays in sync across **all** pages
- [ ] JS passes `node --check`; no broken relative refs
- [ ] `tasks.md` updated + a phase report written
