# Athalla Rizky — Portfolio

> Personal portfolio website with a dashboard-like UI. Backend-driven content, AI-agent-friendly workflow.

![Stack](https://img.shields.io/badge/Stack-Astro%20%2B%20Svelte%205%20%2B%20PayloadCMS%203-8B5CF6)

A personal portfolio that doubles as a CMS playground — content lives in a headless backend, the frontend renders it as a fast SSR site, and the whole thing is built so AI agents can safely run it (sprints, RCAs, data-sync).

---

## ✨ Highlights

- **Dashboard-like aesthetic** — sidebar + header shell, Notion-inspired home page (sprint-10), purple accent throughout.
- **Headless CMS** — manage projects, blogs, documents, socials, and even your site config from Payload's admin (`/admin`).
- **Media library** — upload images once, reuse across projects, articles, and your avatar. Auto-generated thumbnails.
- **Aurora hero** — a GPU-driven WebGL aurora borealis behind the hero section. No video files, no dependencies.
- **Data sync** — move content between local ↔ production with a single zip. Merge or replace-all, snapshot for safety.
- **Agent-friendly docs** — every sprint documented: plans, tasks, phase reports, RCAs.

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | [Astro](https://astro.build) (SSR, `@astrojs/node`) + [Svelte 5](https://svelte.dev) islands |
| Styling | Plain CSS with CSS variables — one `styles.css`, two token layers (Blinko shell + Notion home) |
| Backend | [PayloadCMS 3](https://payloadcms.com) — Next.js + SQLite, Lexical rich text |
| Icons | [Iconify](https://iconify.design) — Solar for UI, simple-icons for brands |
| Font | Inter (Google Fonts) + system `ui-monospace` |
| Deploy | Tencent Lighthouse VPS, nginx + PM2, GitHub Actions (build-on-runner) |

## 🚀 Quick Start

```bash
# Backend (Payload) — http://localhost:3000 → /admin, /api
cd backend && npm install && npm run dev

# Frontend (Astro) — http://localhost:4321
cd frontend && npm install && npm run dev
```

Frontend points at the backend via `PUBLIC_API_URL` (`frontend/.env`, defaults to `http://localhost:3000/api`).

## 🗂 Project Structure

```
portfolio/
├── frontend/          # Astro 7 + Svelte 5 SSR app
│   └── src/
│       ├── pages/     # index, projects, blogs, documents, social, contact
│       ├── components/home/   # Svelte islands: Aurora, TypedRole, CountUp...
│       ├── lib/       # api.ts (safeFetch), env.ts, api-types.ts
│       └── styles/    # styles.css — the one stylesheet
├── backend/           # PayloadCMS 3
│   ├── src/collections/  # Users, Documents, Tags, Authors, Articles...
│   ├── src/globals/      # SiteConfig, Home, Nav
│   ├── src/seed.ts       # npm run seed — content seeding
│   └── src/data-sync/    # export/import/snapshot engine
├── docs/              # sprint records — symlink to the private engineering-handbook (not tracked here)
├── scripts/           # deploy + VPS setup helpers
├── tools/             # repo-to-project generator
└── temp/blinko/       # design reference only — never ship
```

## 🧠 Managing Content

### Admin UI

Everything content lives in Payload's admin at **`/admin`** — write articles, add projects, upload media, toggle what shows on the home page.

### Data Sync (local ↔ prod)

```bash
cd backend
npm run export                                      # content → zip
npm run import -- portfolio-data-*.zip -- --dry-run # preview
npm run import -- portfolio-data-*.zip              # merge-upsert (backs up first)
npm run snapshot                                    # raw DB snapshot
```

Content records have stable UUIDs, so renames update in place and merges don't duplicate.

### Repo → Project

Turn a local git repo into a portfolio project entry:

```bash
# follow tools/repo-to-project/SKILLS.md — reads README, manifests, file tree
cd backend
npm run wrap:projects -- ../tools/repo-to-project/content/<slug>/project.json -- --out ../tools/repo-to-project/collection/<date>-<slug>.zip
npm run import -- ../tools/repo-to-project/collection/<...>.zip -- --dry-run
```

### Publish to production (GitHub Actions)

Article/project content is **sourced from git** (`tools/*/content/**.json` + `tools/content/refs/`).
Actions → **Publish Article** / **Publish Project** (manual dispatch, dry-run checkbox) builds the
full-set zip on the runner and imports it over the API with **scoped replace-all** — prod converges
1:1 with git for that collection (rows absent from git are deleted; tags/technologies refs upsert
only; image/cosmetic polish done in the admin survives). Drafts that live only in the prod admin
are deleted by the next publish — author via the git pipeline.

```bash
cd backend
npm run refs:export        # refresh tools/content/refs/ after admin tag/tech changes
npm run wrap:publish -- --articles   # build the publish zip locally (same as the runner)
```

## 🛠 Verification

```bash
cd frontend && ./node_modules/.bin/tsc --noEmit && npm run build
cd backend && npm run build && npm test
```

Check both **light + dark** themes and **mobile** — the layout collapses to a drawer sidebar. Motion respects `prefers-reduced-motion`.

## 🌐 Deployment

Production runs at **https://athallarizky.com** — a Tencent Lighthouse VPS (2 GB RAM, 2 GB swap).

The GitHub Actions workflow builds both apps on the runner (7 GB RAM available), rsyncs artifacts to the VPS, and the VPS only does `npm ci --omit=dev` + `pm2 restart`. **The VPS never compiles** — that's what keeps a 2 GB box from OOMing.

Trigger it manually: GitHub → Actions → "Deploy to VPS" → Run workflow.

> ⚠️ VPS-only files (never overwritten): `backend/.env`, `backend/payload.db`, `backend/documents/` — protected by rsync `--exclude` in the workflow.

## 📚 Documentation

- [`AGENTS.md`](AGENTS.md) — the agent briefing: stack, conventions, sprint history
- [`DESIGN.md`](DESIGN.md) — Notion design spec for the home page
- `docs/` — sprint-by-sprint records (plans, tasks, phase reports, RCAs). Lives in the private
  **engineering-handbook** (`projects/portfolio/`); locally `docs/` is a symlink there and is
  gitignored here — sprint docs are committed to the handbook, never to this repo.

## 🧭 License

Private — personal portfolio. You're welcome to browse, not to clone-and-ship.
