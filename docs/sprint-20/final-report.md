# Sprint-20 Final Report — Bug Fixes: Logic & UI

> Status: ✅ Delivered | 2026-08-10
> Audience: sprint-21 context. Read this + [`../../AGENTS.md`](../../AGENTS.md) before starting next sprint.

---

## 1. Sprint goal & outcome

**Goal:** Audit and fix logic + UI bugs across the portfolio frontend, leave the site consistent in light/dark/mobile with production-safe media URLs.

**Outcome:** ✅ delivered. 2 logic bugs identified and fixed (safeFetch bracket encoding, showItems incomplete). Homepage hero restructured: avatar fixed, location chip added, aurora WebGL shader background, clock icon theme-consistent. Sidebar layout improved (Currently → Skills → Find me).

## 2. What changed

### Frontend — New files

| File | Purpose |
|------|---------|
| `frontend/src/lib/env.ts` | Single source of truth: `isDev` + `API_ORIGIN` (uses `MODE`, not `DEV`) |
| `frontend/src/components/home/AuroraEffect.svelte` | WebGL2 fragment shader: nimitz aurora borealis behind hero, no dependencies |

### Frontend — Modified files

| File | Change |
|------|--------|
| `frontend/src/lib/api.ts` | Re-export `API_ORIGIN` + `isDev` from `env.ts`; **safeFetch bracket encode fix** (`[]` → `%5B`/`%5D`) |
| `frontend/src/pages/index.astro` | Avatar: aspect-ratio + object-fit + soft rounded; Location chip from `siteConfig.location`; Layout restructure (About left, Currently→Skills→FindMe right column); Remove SpotlightEffect, add AuroraEffect + hero-overlay |
| `frontend/src/styles/styles.css` | `.hero-avatar-img`: 1:1 + cover + `var(--radius)`; `.home-side-col`: flex column with gap; `.is-currently`: `align-self: start`; `.hero-overlay`: 15%/28% black; Dark hero gradient |
| `frontend/src/components/home/LiveClock.svelte` | Switch from `Icon.svelte` to `<iconify-icon>` for theme-consistent color |
| `frontend/src/components/project/Screenshots.svelte` | Remove inline `API_ORIGIN` duplication, import from `api.ts` |

### Database

| Change | Detail |
|--------|--------|
| `site_config.location` | "Remote · UTC+7" → "Jakarta, Indonesia" |
| `site_config.avatar_id` | Set to media id=3 (user photo) |
| `home.showItems` | +`featuredProjects` +`latestWriting` (was missing from production export) |
| `home.currently` | Removed "Local time {time}" placeholder |

### Docs

| File | Purpose |
|------|---------|
| `docs/sprint-20/plan.md` | Sprint plan: goal, scope, decisions, phasing |
| `docs/sprint-20/tasks.md` | 24 tasks across 4 phases, all completed |
| `docs/sprint-20/rca/2026-08-10-safefetch-bracket-encode.md` | RCA: bracket `[]` not URL-encoded in SSR `fetch()` |
| `docs/sprint-20/rca/2026-08-10-showitems-incomplete-export.md` | RCA: showItems missing from production zip |
| `docs/sprint-20/final-report.md` | This file |

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| `lib/env.ts` as single source of truth | Avoids duplicated `import.meta.env` checks; taste: centralize env logic |
| `MODE` not `DEV` for dev/prod detection | Global `NODE_ENV=production` flips `DEV` to false even in `astro dev` |
| WebGL aurora: raw canvas, no Three.js | No extra dependencies; reduced-motion path auto-disables |
| `mix-blend-mode: screen` + black overlay | Aurora effect visible but text remains readable; taste: 10-30% overlay |
| Soft rounded avatar (`var(--radius)`) | Consistent with design system cards, not full circle |

## 4. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery | 5 | ✅ |
| 1 — Homepage Hero | 5 | ✅ |
| 2 — Logic Hardening | 3 | ✅ |
| 3 — UI Audit | 6 | ✅ |
| 4 — Verify & Docs | 5 | ✅ |
| **Total** | **24** | ✅ |

## 5. Verification

- [x] `tsc --noEmit` (frontend) clean
- [x] All sections render: hero, stats, about/currently/skills/findme, selected work, latest writing, contact CTA
- [x] Avatar loads with correct URL (dev: absolute `localhost:3000`, prod: relative)
- [x] Aurora canvas renders, reduced-motion skips
- [x] Light + dark theme visually consistent
- [x] Mobile layout: sidebar drawer, grids collapse to 1 column

## 6. Sprint-21 handoff

### What the next sprint needs to know

- **Uncommitted work** (see `git status`): `index.astro`, `styles.css`, `api.ts`, `LiveClock.svelte`, `AuroraEffect.svelte`, `Screenshots.svelte`, `env.ts`, all sprint-20 docs — need commit + push
- **Production sync**: `showItems` needs update in production Payload admin (checkbox `featuredProjects` + `latestWriting`). Then re-export new zip for 1:1 backup.
- **DB changes in local only**: `location`, avatar_id, showItems, currently — will be overwritten on next import. Consider exporting from local to push to production.

### Cleanup / backlog

- [ ] Commit + push all sprint-20 changes
- [ ] Update production `showItems` and `location` via admin or data-sync
- [ ] Re-export zip from production for fresh 1:1 backup
