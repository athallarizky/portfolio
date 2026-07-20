# AGENTS.md — Portfolio Implementation Guide

> **For:** any LLM agent working on this repo in a fresh session.
> **Read this first**, then the latest sprint record in [`docs/sprint-N/`](docs/)
> (currently sprint-17 → [`docs/sprint-17/final-report.md`](docs/sprint-17/final-report.md)).
> **Owner:** Atha Thizky — Full-Stack Engineer (backend-leaning · TS/Go/Python · AI tooling).

---

## 0. TL;DR — what this is

A personal portfolio website with a **dashboard-like UI** (original aesthetic cloned
from Blinko in sprint-1). Two halves, both built:

- **`backend/`** — a **PayloadCMS 3** headless CMS (Next.js + SQLite): models all
  content, serves a public REST API at `/api`, admin at `/admin`.
- **`frontend/`** — an **Astro 7 (SSR) + Svelte 5** app consuming the backend REST
  API via `safeFetch()` (silent-empty on failure). Deployed via `@astrojs/node`.

The **Home page** (`/`) was redesigned in **sprint-10** against the Notion
[`DESIGN.md`](DESIGN.md) spec — minimalist, Notion token layer scoped under `.home`.
All other pages keep the original Blinko-style look.

**The one rule that overrides everything:** match the existing aesthetic. Every
page must look like one product (same sidebar, header, cards, accent, spacing,
motion). Do not introduce a new visual language.

---

## 1. Tech stack (EXACT — do not change without asking)

| Layer | Technology |
|-------|------------|
| Frontend | **Astro 7** (SSR, `@astrojs/node` adapter) + **Svelte 5** islands (`client:visible`) |
| Styling | One shared `frontend/src/styles/styles.css` — plain CSS, CSS variables for theming |
| Data | Backend REST via `safeFetch` (`frontend/src/lib/api.ts`); types in `frontend/src/lib/api-types.ts` |
| Backend | **PayloadCMS 3** — Next.js + SQLite (dev) + Lexical rich text, vanilla TS config |
| Icons | `iconify-icon` web component — **Solar** for UI, **simple-icons** for brand logos |
| Font | **Inter** (Google Fonts) + `ui-monospace` (system) for code/label accents |
| Design spec | [`DESIGN.md`](DESIGN.md) (notion) — source of truth for the **Home** page only |

Do NOT add: a CSS framework, a second JS runtime, or a new web font (Inter stays).
Home-page styling lives under the `--n-*` token layer scoped to `.home`; other
pages use the original `--*` tokens.

---

## 2. Repo structure

```
portfolio/
├── AGENTS.md                      ← you are here
├── DESIGN.md                      ← Notion design spec — Home page source of truth (sprint-10)
├── docs/
│   ├── GUIDE.md                   ← the phased AI workflow (plan → build → verify → report)
│   └── sprint-1..11/              ← sprint records (plan, tasks, reports, final-report)
├── frontend/                      ← Astro 7 + Svelte 5 SSR app
│   ├── astro.config.mjs           ← node adapter, SSR
│   ├── src/
│   │   ├── pages/                 ← routes: index, projects(+/[slug]), blogs(+/[slug]),
│   │   │                            documents, social, contact, 404, api/contact.ts
│   │   ├── layouts/BaseLayout.astro   ← app shell (sidebar + header + .content-scroll)
│   │   ├── components/home/       ← Svelte islands: TypedRole, CountUpStats, SpotlightEffect,
│   │   │                            LiveClock, MagneticButton, Reveal, GlowGrid
│   │   ├── lib/                   ← api.ts (safeFetch), api-types.ts, render-lexical.ts, actions/glow.ts
│   │   ├── styles/styles.css      ← single stylesheet (theme tokens + components + home `--n-*` layer)
│   │   └── data/                  ← legacy per-collection TS (home.ts removed sprint-10)
│   └── package.json               ← dev/build/preview (astro)
├── backend/                       ← PayloadCMS 3
│   ├── src/payload.config.ts      ← collections, globals, cors, sqlite adapter
│   ├── src/collections/           ← Users, DocumentCategories, Documents, Tags, Authors,
│   │                                Articles, Technologies, Projects, SocialProfiles
│   ├── src/globals/               ← SiteConfig, Home, Nav
│   ├── src/seed.ts                ← npm run seed — seeds all (per-phase scripts: seed:projects, …)
│   └── payload.db                 ← SQLite (gitignored)
└── temp/blinko/                   ← reference clone — DESIGN SOURCE ONLY, do not ship
```

---

## 3. The design system — "maintain the style"

Two token layers in `frontend/src/styles/styles.css`:

- **Original (`--*`)** — the Blinko-clone shell + all non-home pages. Reuse never hardcode:
  `--background --foreground --secondbackground --card --border --radius --shadow --hover
  --muted --desc --primary --secondary --accent`. Accent = purple `--secondary`.
- **Notion home layer (`--n-*`)** — sprint-10, scoped under `.home` (`:root` + `.dark`).
  See [`DESIGN.md`](DESIGN.md) and [`docs/sprint-10/resources/architecture.md`](docs/sprint-10/resources/architecture.md) §5.

### Component vocabulary — reuse, don't reinvent
| Class | Use |
|-------|-----|
| `.card`, `.card.is-hoverable` | Boxed content; `is-hoverable` adds the lift |
| `.card-header`, `.card-title`, `.card-excerpt` | Card internals |
| `.tag`, `.tag.is-secondary`, `.tag-badge .tint-0..3` | Pills / pastel chips |
| `.btn`, `.btn-primary` (purple, 8px on home), `.btn-outline`, `.btn-ghost` | Buttons |
| `.grid-2`, `.grid-3`, `.blog-list` | Layouts (responsive built-in) |
| `.sidebar-link`, `.sidebar-section` | Sidebar nav |
| `.prose` | Article body (auto-styled h2/h3/p/code/pre/blockquote) |
| Home interactions: `.glowable` (`use:glow`), `.magnetic`, `.reveal-io` (`Reveal`), `.skills-chips` | sprint-10 |
| Utilities: `.flex .flex-wrap .items-center .gap-1..4 .mt-2/.mt-4 .text-desc .text-sm .w-full` | helpers |

### Motion rules
- **CSS-first.** Use transitions/keyframes; reach for JS only to feed data
  (counters, clocks, pointer coords, scroll-reveal IO, magnetic/glow).
- **Always** gate motion behind `@media (prefers-reduced-motion: reduce)` and
  `@media (hover: hover)` (see the home interaction components — all self-guard).

### Icons
`<iconify-icon icon="solar:..." width="20" height="20"></iconify-icon>` (uses `currentColor`).

---

## 4. Pages that exist

| Route | Page |
|-------|------|
| `/` (`index.astro`) | Home — Notion-redesigned (sprint-10): hero, stats band, Selected work, Latest writing, About/Currently, Skills/Find-me, CTA |
| `/projects`, `/projects/[slug]` | Projects list + detail |
| `/blogs`, `/blogs/[slug]` | Blogs list (+ category filter) + article detail |
| `/documents` | Documents, grouped by category |
| `/social` | Social profile cards |
| `/contact` | Contact form (`api/contact.ts`) |
| `/404` | Not found |

---

## 5. Conventions

### Add a page
1. Create `frontend/src/pages/<name>.astro` (copy `projects.astro` as a template).
2. Wrap in `BaseLayout` (gives the sidebar/header shell); set `activeNav`.
3. Fetch data with `safeFetch<PaginatedResponse<T>>(...)` (silent-empty on failure).
4. Add page-specific CSS to `frontend/src/styles/styles.css`.
5. Add the nav link in the `Nav` global (backend) so the sidebar renders it.

### Add content (article / project / document / social)
Author it in the Payload admin (`/admin`) or extend the seed in
`backend/src/seed/data/*.ts` then `npm run seed:<phase>`. The frontend reads it via REST.

### Back up / sync content (sprint-14)
Content can be moved between local ↔ prod (and bulk-edited) via the data-sync tool —
see [`docs/sprint-14/`](docs/sprint-14/). Export → a portable `.zip` (JSON + Markdown
bodies + media); import upserts by natural key (merge, never replace-all). A raw-DB
snapshot backs up the whole instance.

```bash
cd backend
npm run export                                      # content zip (sync / bulk-edit)
npm run import -- portfolio-data-*.zip -- --dry-run # preview (no writes)
npm run import -- portfolio-data-*.zip              # upsert-merge (backs up payload.db first)
npm run import -- portfolio-data-*.zip -- --replace # FULL archive only → also delete drift (backs up first)
npm run insert-one -- projects ../path/project.json # add/update ONE project from a v2 JSON row
npm run snapshot                                    # whole-DB zip
npm run snapshot:restore -- portfolio-snapshot-*.zip -- --yes   # destructive; stop backend
```

Admin UI: **`/admin/data-sync`** — the import card has a **Merge / Replace-all radio** (replace-all =
full archive only, deletes records not in the archive; preview-first + confirm) + Download / Snapshot.
**`/admin/collections/projects`** has an "Add one project from JSON" panel (`/api/data-insert-one`).
Engine: `backend/src/data-sync/` — exclude `users`, `contact-messages`, payload-internal from sync.

### Record identity & merge (sprint-15)
Each content record now has a stable content-level **`uuid`** (auto-assigned on create by a
`beforeChange` hook). Identity = `uuid`, so **renaming a record updates it in place** instead of
duplicating it; relationships serialize as dual `{ uuid, key }` refs. v1 archives (sprint-14) still
import unchanged.

```bash
cd backend
npm run backfill:uuid                                          # one-time per env (assigns uuid to existing records)
npm run merge -- authors <winnerUuid> <loserUuid> -- --dry-run # preview merging two records
npm run merge -- authors <winnerUuid> <loserUuid>             # repoint relations + delete loser
```
Admin UI: **`/admin/data-sync`** → "Merge duplicates" card. Detail:
[`docs/sprint-15/final-report.md`](docs/sprint-15/final-report.md).

### Generate a project from a local repo (sprint-16)
A manually-invoked tool at [`tools/repo-to-project/`](tools/repo-to-project/) turns a local git repo into a
portfolio `projects` entry. In Claude Code: *"follow `tools/repo-to-project/SKILLS.md`, repo: <path>"* → it
reads the repo (README, manifests, git, file tree), writes a v2 `.json` + a human `.md`, wraps an importable
zip, and dry-run imports. Re-running **updates in place** (reuses uuid) and **preserves manual polish**.

```bash
cd backend
npm run wrap:projects -- ../tools/repo-to-project/content/<slug>/project.json -- --out ../tools/repo-to-project/collection/<date>-<slug>.zip
npm run import -- ../tools/repo-to-project/collection/<...>.zip -- --dry-run   # preview
```
Detail: [`docs/sprint-16/final-report.md`](docs/sprint-16/final-report.md).

### Theme
Toggle via the sidebar button; persisted in `localStorage['portfolio-theme']`;
`.dark` on `<html>` switches all tokens (both `--*` and `--n-*`).

---

## 6. Sprint history (what's done)

| Sprint | Delivered |
|--------|-----------|
| 1 | Static HTML/CSS/JS Blinko-clone demo (**legacy reference** — do not revive) |
| 2 | PayloadCMS 3 backend: all collections/globals + REST API + seed |
| 3–6 | Astro + Svelte SSR frontend consuming the REST API; all pages |
| 7–8 | Polish (SEO, contact form, documents, etc.) |
| 9 | VPS provisioning: nginx + SSL + deploy pipeline |
| 10 | **Home page redesign** per Notion `DESIGN.md`: `--n-*` tokens, Selected work + Latest writing sections, glow/magnetic/reveal/stagger interactions |
| 11 | Deploy workflow (manual trigger) — fixed SSH auth, repo path (`/root/portfolio`), `PAYLOAD_SECRET` ([RCAs](docs/sprint-11/rca/)) |
| 12 | **Deploy OOM-proofing** — build moved to the GitHub runner + rsync; VPS only restarts. 2 GB swap added. ([final-report](docs/sprint-12/final-report.md), [architecture](docs/sprint-12/resources/architecture.md)) |
| 13 | **Notion system across all pages + sidebar fix + SEO** — fixed mobile sidebar nav (z-index), warmed tokens + Notion component discipline (pill CTAs, 12px cards), SEO tier-up (`site` config, `@astrojs/sitemap`, per-page meta/OG/JSON-LD, `robots.txt`). Purple accent kept. ([final-report](docs/sprint-13/final-report.md)) |
| 14 | **Data Sync, Backup & Bulk Import** — backend tool to export/import content as a portable `.zip` (JSON + Markdown bodies + media; upsert-merge by natural key) for local↔prod sync + bulk authoring, plus a raw-DB snapshot. Admin UI (`/admin/data-sync`) + CLI (`npm run export \| import \| snapshot`). ([final-report](docs/sprint-14/final-report.md)) |
| 15 | **Content UUID identity & merge** — stable content-level `uuid` per record (rename-safe; replaces natural-key identity; `beforeChange` hook) + a merge tool (CLI + admin UI + `/api/data-merge`) that repoints all incoming relations and deletes the loser. `npm run backfill:uuid` + `npm run merge`. v1 archives still import. ([final-report](docs/sprint-15/final-report.md)) |
| 16 | **Repo → Portfolio Project tool** — `tools/repo-to-project/` (manually-invoked skill) reads a local git repo and emits an importable `projects` entry (`.json` + `.md`); `npm run wrap:projects` zips it; import priming lets a projects-only archive resolve `techTags`. Idempotent re-gen (update in place, preserves manual polish). ([final-report](docs/sprint-16/final-report.md)) |
| 17 | **Data-sync round-trip: filenames + insert-one + replace-all** — human-friendly `YYYY-MM-DD-HH-MM` zip names; insert one project from JSON on `/admin/collections/projects` (`/api/data-insert-one`, idempotent upsert-by-uuid); full-archive **replace-all** (Merge/Replace-all radio on the import card; `--replace`; deletes drift absent from the archive; `referencedIds` safety guard + backup + preview-first + confirm). ([final-report](docs/sprint-17/final-report.md)) |

Latest detail: [`docs/sprint-17/final-report.md`](docs/sprint-17/final-report.md).

---

## 7. How to run

```bash
# Backend (PayloadCMS) — http://localhost:3000 → /admin, /api
cd backend && npm install && npm run dev

# Frontend (Astro) — http://localhost:4321
cd frontend && npm install && npm run dev

# Verify: typecheck + build (backend also has `npm test` for the data-sync units)
cd frontend && ./node_modules/.bin/tsc --noEmit && npm run build
cd backend && npm run build && npm test
# Sanity-check the API:  curl -sg 'http://localhost:3000/api/projects?limit=3'
```

`PUBLIC_API_URL` (frontend) points the frontend at the backend (default
`http://localhost:3000/api`). Verify visually across **light + dark + mobile**;
check `prefers-reduced-motion` and touch/no-hover behavior.

---

## 8. Deploy (production)

> Live at **https://athallarizky.com** (Tencent Lighthouse VPS, ~2 GB RAM).
> Full design + concepts: [`docs/sprint-12/resources/architecture.md`](docs/sprint-12/resources/architecture.md).

**Flow (build-on-runner, sprint-12):** the GitHub Actions runner compiles
backend + frontend with ~7 GB RAM, **rsyncs** artifacts to the VPS, and the VPS
only runs `npm ci --omit=dev` + `pm2 restart`. **The VPS never compiles** (a 2 GB
box OOM'd and locked us out before — see the [sprint-11 RCA](docs/sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md)).

- **Deploy user:** `root`. Repo at **`/root/portfolio`**. PM2 + nginx run as root.
  → GitHub secret `VPS_USER` **must be `root`** (it owns the repo + PM2).
- **Secrets:** `VPS_HOST` (IP), `VPS_USER` (`root`), `VPS_SSH_KEY` (private key;
  its public half is in `/root/.ssh/authorized_keys`).
- **Dispatch:** GitHub → Actions → "Deploy to VPS" → Run workflow (branch `main`).
  **You must push workflow edits before dispatching** (GitHub runs the remote copy).
- **VPS-only files — NEVER overwrite:** `backend/.env` (holds `PAYLOAD_SECRET`),
  `backend/payload.db` (SQLite DB), and `backend/documents/` (Payload uploads).
  These are protected by rsync `--exclude` in the workflow — **do not remove those
  excludes** (a stray `--delete-excluded` would wipe the DB or uploads).
- **Swap:** 2 GB swap is active on the VPS (4 GB effective). Baked into
  [`scripts/setup-vps.sh`](scripts/setup-vps.sh) step 2.
- **Files:** `.github/workflows/deploy.yml` (the 8-step build-on-runner workflow),
  [`scripts/deploy.sh`](scripts/deploy.sh) (VPS-side restart helper — no compile),
  `ecosystem.config.cjs` (PM2 entries — `next start` + `dist/server/entry.mjs`, unchanged).
- **Out-of-band recovery** (if SSH is unreachable — OOM/hang): Tencent Lighthouse
  console → **Reboot** (or VNC), *not* the "one-click login" (needs the OrcaTerm
  agent, which isn't installed). PM2 auto-resurrects via `pm2 startup`. See RCA §4.

---

## 9. Working style (from [`docs/GUIDE.md`](docs/GUIDE.md))

- Follow the phased workflow: plan → build → **verify by running it** → write a
  phase report → update `tasks.md` → ask before committing.
- **Ask before design decisions**; recommend an option rather than surveying.
- Keep new code consistent with surrounding style (naming, density, idiom).
- `docs/` = sprint planning markdown; backend documents live in Payload.
- `temp/blinko/` is reference only — copy patterns, don't ship its files.
- **Git:** the owner handles all commits. Do not commit unless asked.

## 10. Done criteria (self-check before claiming done)

- [ ] Matches the dashboard aesthetic (sidebar, header, cards, accent)
- [ ] Works in **light + dark** and on **mobile** (drawer, grids collapse)
- [ ] Motion respects `prefers-reduced-motion`; touch disables hover/glow/magnetic
- [ ] `tsc --noEmit` + `npm run build` (frontend) and `npm run build` (backend) clean
- [ ] Other pages visually unchanged (home-only changes stay scoped to `.home`)
- [ ] `tasks.md` updated + a phase report written
