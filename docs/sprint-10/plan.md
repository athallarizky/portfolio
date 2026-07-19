# Sprint-10 Plan — Home Page Redesign (Notion DESIGN.md)

> Status: ✅ Complete | Created: 2026-07-18
> Companion: [`tasks.md`](./tasks.md) · sprint-9: [`../sprint-9/final-report.md`](../sprint-9/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprints 3–6 delivered an Astro + Svelte SSR frontend consuming the PayloadCMS REST API; sprint-9 provisioned VPS/nginx/SSL. The Home page (`frontend/src/pages/index.astro`) still uses the sprint-1 Blinko-derived styling: typed-role hero, count-up stats, card grids — content from the API except hardcoded CTA/button copy.

Sprint-10 redesigns the **Home page only**, adopting the **Notion `DESIGN.md`** spec (installed at repo root via `npx getdesign@latest add notion`, from VoltAgent/awesome-design-md) for a simpler, more minimalist, more professional look with richer interaction — while the dashboard shell (sidebar/header) and all other pages keep the existing style.

**Scope decision:** Home-scoped re-skin, not a site-wide redesign. Notion tokens apply under `.home` only; other pages are untouched (site-wide rollout is a future sprint).

## 1. Sprint goal

Redesign the Home page per the Notion DESIGN.md spec — minimalist, professional, more interactive — adding two API-driven sections (Selected work, Latest writing) and four interaction upgrades, plus small backend/schema fixes.

## 2. Scope

**In scope:**
- `./DESIGN.md` (notion) at repo root — design source of truth for the Home page ✅ (installed in Phase 0)
- Home-scoped Notion token layer (`--n-*` CSS vars, light + dark) in `frontend/src/styles/styles.css`
- Re-skin of all existing home sections: hero, stats band, About/Currently, Skills/Find me, CTA banner
- New **Selected work** section — 3 featured projects from the API
- New **Latest writing** section — 3 latest articles from the API
- Interactions: card cursor glow (`use:glow` action), magnetic hero/CTA buttons, scroll-aware reveals (IntersectionObserver), interactive skill tags
- Backend: `Projects.showOnHome` checkbox, `Home.showItems` options += `featuredProjects`/`latestWriting`, seed fix for the literal `{time}` item
- Cleanup: delete dead `frontend/src/data/home.ts`, remove unused CSS, align page default `visible` set with the backend default
- Docs refresh: root `AGENTS.md` still describes `frontend/` as the legacy static demo

**Out of scope:**
- Restyling other pages (projects/blogs/documents/social/detail) — future sprint
- Moving hardcoded CTA/button copy into the CMS (handoff note)
- New web fonts (Inter stays — root AGENTS.md rule; Notion Sans is not shipped)
- New API endpoints (existing collections/globals only)
- Deploy/VPS changes

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Notion tokens scoped under `.home`, prefixed `--n-*` | Other pages keep current style; zero regression risk; easy site-wide rollout later |
| Inter kept, Notion Sans rejected | Root AGENTS.md forbids new web fonts; Notion Sans is Inter-based so the visual delta is negligible |
| New sections as plain Astro (no Svelte) | SSR-rendered, zero JS cost; interactivity comes from CSS + small actions |
| Glow as a Svelte action (`use:glow`), not a wrapper component | No extra DOM nodes; attaches to any card; reuses SpotlightEffect's CSS-var pattern |
| IntersectionObserver root = `.content-scroll` | The body doesn't scroll in the app shell — the content container does; wrong root = reveals never fire |
| `showOnHome` flag on Projects | Consistent with the existing `SocialProfile.showOnHome` pattern; CMS-controlled, deterministic |
| Latest writing = `sort=-publishedAt&limit=3` | No new flag needed; `publishedAt` is required on Articles |
| Stats → single `stat-row` surface band | Notion `stat-row` pattern; visually distinct from cards; more minimal than 4 separate cards |
| Remove seeded `'Local time {time}'` currently-item | Renders a literal `{time}` (sprint-1 placeholder, never substituted); the clock already lives in the hero chip |
| Purple CTA `#5645d4` and link-blue `#0075de` kept in separate roles | Notion spec: never mix primary purple with link blue |

## 4. Phasing

- **Phase 0 — Discovery & setup ✅** — Explored the current home page, design system, and backend schema; researched + installed the Notion DESIGN.md; wrote sprint docs.
- **Phase 1 — Backend & types** — `showOnHome` on Projects, `showItems` options, seed fixes, `api-types.ts`; verify with curl + backend build.
- **Phase 2 — Notion token layer & re-skin** — `--n-*` tokens (light/dark), home-scoped re-skin of hero/stats/cards/tags/CTA; remove dead CSS.
- **Phase 3 — New sections** — Selected work + Latest writing (fetch + SSR markup + gating + empty states).
- **Phase 4 — Interactions & cleanup** — glow action, MagneticButton, Reveal, skill-tag stagger; delete dead mock; reduced-motion/touch guards.
- **Phase 5 — QA & docs** — Full verification matrix, `final-report.md`, root `AGENTS.md` refresh.

## 5. Verification

1. `cd backend && npm run build`; `curl 'http://localhost:3000/api/projects?where[showOnHome][equals]=true&limit=3'` → flagged projects
2. `cd frontend && npx tsc --noEmit && npx astro build` clean after each phase
3. Home page: light + dark, mobile (1-col grids, 2-col stats, drawer), `prefers-reduced-motion` (all static), no-hover (glow/magnetic off)
4. `showItems` + `showOnHome` toggles in Payload admin → sections appear/hide; empty → hidden gracefully
5. No literal `{time}` on the page; no console errors; other pages visually unchanged

---

## 6. Current status

**Sprint 10 COMPLETE (2026-07-19)** — all 5 phases delivered and build-verified.
Home page runs on the Notion `--n-*` token layer (light + dark) with two new
SSR sections (Selected work, Latest writing) and four interactions (glow,
magnetic, scroll reveal, skill stagger); backend `showOnHome` + `showItems`
options added; dead code removed; root `AGENTS.md` refreshed. See
[`final-report.md`](./final-report.md) (incl. verification matrix + sprint-11
handoff). **Owner action:** 2 admin toggles to surface the new sections on the
existing DB.
