# Sprint 10 — Final Report

> Status: ✅ Delivered (code) | 2026-07-19
> Audience: sprint-11 context. Read this + root [`AGENTS.md`](../../AGENTS.md) before continuing.

---

## 1. Sprint goal & outcome

**Goal:** redesign the Home page per the Notion [`DESIGN.md`](../../DESIGN.md) spec —
minimalist, professional, more interactive — adding two API-driven sections
(Selected work, Latest writing) and four interaction upgrades, plus small
backend/schema fixes.

**Outcome:** all 34 tasks across 5 phases delivered and **build-verified**. The
home page now runs on a Notion `--n-*` token layer (light + dark, scoped to
`.home`), with two new SSR sections and cursor-glow / magnetic / scroll-reveal /
skill-stagger interactions. Other pages are untouched.

**Caveat (data, not code):** the two new sections are gated off in the live dev DB
because the owner's `home.showItems` predates the new options and no projects carry
`showOnHome`. See §8 — two admin toggles bring them live.

## 2. Final structure (what changed)

```
DESIGN.md                                  ← (Phase 0) Notion spec, home source of truth
backend/src/
  collections/Projects.ts                  ← + showOnHome checkbox (sidebar)
  globals/Home.ts                          ← showItems += featuredProjects, latestWriting (+ default)
  seed/data/globals.ts                     ← − 'Local time {time}' currently-item
  seed/data/projects.ts                    ← + showOnHome on orders 1–3 (interface + flags)
  seed/phases/projects.ts                  ← + writer mapping
  payload-types.ts                         ← regenerated
frontend/src/
  lib/api-types.ts                         ← Project.showOnHome?, Home.showItems union, SiteConfig sync
  lib/actions/glow.ts                      ← NEW: cursor-glow Svelte action
  components/home/{GlowGrid,MagneticButton,Reveal}.svelte  ← NEW interaction islands
  pages/index.astro                        ← 2 fetches, 2 sections, rewired interactions
  styles/styles.css                        ← --n-* token layer + home re-skin + interactions; dead CSS removed
  data/home.ts                             ← DELETED (dead since sprint-4)
docs/sprint-10/                            ← plan, tasks, AGENTS, resources/, reports/phase-{0..4}, this report
AGENTS.md (root)                           ← refreshed: Astro+Svelte reality + DESIGN.md pointer
```

## 3. Key deliverables

| Item | Count | Notes |
|------|-------|-------|
| New CSS token layer | 1 | `--n-*` (light + dark), scoped under `.home` |
| New sections | 2 | Selected work (3 project cards), Latest writing (3 article rows) |
| New interactions | 4 | glow, magnetic buttons, scroll reveal, skill stagger |
| New Svelte islands | 3 | GlowGrid, MagneticButton, Reveal (+ glow action) |
| Backend fields | 1 | `Projects.showOnHome`; `Home.showItems` += 2 options |
| Dead code removed | 1 file + 7 selectors | `data/home.ts`, `.now-live`/`.pulse`/`.skill-tag`/`#local-time`/`.findme-link .ext` |

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| Purple `--n-primary #5645d4` for CTAs (not Notion blue) | Visual continuity with the existing purple shell; blue `--n-link` kept for inline links |
| Tokens scoped under `.home`, prefix `--n-*` | Zero regression on other pages; easy site-wide rollout later |
| New sections as plain Astro (SSR), glow via a slot-wrapper island | Zero per-card hydration; one tiny island per grid for cursor-tracking |
| `Reveal` IO rooted at `.content-scroll` | Body doesn't scroll; the content container does |
| `select` uses **bracket** syntax (`select[title]=true`) | Payload comma-syntax returns only `id` (AGENTS §4.2 was wrong) |
| Not re-seeding the dev DB | Owner's `home.showItems` is custom-ordered; re-seed would clobber it |

## 5. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery & setup | 5 | ✅ |
| 1 — Backend & types | 6 | ✅ |
| 2 — Token layer & re-skin | 8 | ✅ |
| 3 — New sections | 5 | ✅ |
| 4 — Interactions & cleanup | 7 | ✅ |
| 5 — QA & docs | 3 | ✅ |
| **Total** | **34** | ✅ |

> 📄 Per-phase: [`reports/phase-{0..4}-report.md`](./reports/)

## 6. Verification matrix

| Check | Method | Result |
|-------|--------|--------|
| Backend build | `npm run build` | ✅ Next 16, TS check passed |
| Backend queries (Q4/Q5) | `curl -sg …` | ✅ `where[showOnHome]` valid; articles query returns 6; bracket `select` returns fields |
| Frontend types | `tsc --noEmit` | ✅ exit 0 |
| Frontend build | `npm run build` | ✅ Complete! (~720–850 ms) |
| SSR runtime | `curl :4321/` | ✅ HTTP 200, no `TypeError`/`ReferenceError`/500 |
| Rendered sections (existing) | parse body | ✅ hero/stats/about/currently/skills(12)/findme(2)/CTA in DOM |
| Dead-CSS removal | grep markup | ✅ all 7 selectors have zero usages |
| **New sections live render** | — | ⏳ gated off in dev DB (see §8) — code verified via identical gating path |
| **Light/dark/mobile visual** | browser | ⏳ manual — owner to eyeball in dev |
| **Interactions (glow/magnetic/reveal)** | browser | ⏳ manual — client-side, fire on pointer/scroll |
| **prefers-reduced-motion / no-hover** | browser | ⏳ manual — guards coded (matchMedia + `@media`) |

Items marked ⏳ need a browser; the code/build side is fully green.

## 7. How to run

```bash
cd backend  && npm run dev          # :3000 → /admin, /api
cd frontend && npm run dev          # :4321
cd frontend && ./node_modules/.bin/tsc --noEmit && npm run build   # verify
```

## 8. Sprint-11 handoff

### Owner actions to surface the new sections (dev + prod DBs)
1. **`/admin` → Home global → `showItems`:** add *Featured projects* + *Latest writing*.
   (Latest writing then renders immediately — **6 articles are already published**.)
2. **`/admin` → Projects:** tick `showOnHome` on the 3 to feature (or
   `cd backend && npm run seed:projects` — that script touches only projects,
   **not** the Home global, so it won't disturb the custom `showItems` ordering).
3. **Optional content tweak:** Home `hero.eyebrow` is `// hello, I'm`; the new
   micro-uppercase style suits a role label (e.g. `FULL-STACK ENGINEER`).

### Known gaps / follow-ups
- **Latest-writing `select` cost:** already minimal (bracket select). No action.
- **Reveal on existing sections** (about/skills/CTA) migrated from load-time to scroll
  reveal — confirm the scroll cadence feels right in browser.
- **Interaction QA** (glow tracks cursor, magnetic pull, reveal-on-scroll, skill stagger)
  is coded and self-guards motion/touch, but needs a manual browser pass.
- **Site-wide Notion rollout** is explicitly out of scope (home only) — a future sprint
  can widen the `--n-*` selector scope to other pages.

### Integration points for sprint-11
- The `--n-*` tokens are global (`:root`/`.dark`) but applied under `.home`; reusing them
  elsewhere is just a selector change.
- New interaction primitives (`glow` action, `Reveal`, `MagneticButton`, `GlowGrid`,
  `.glowable`) are reusable on any page.
- Root `AGENTS.md` is now accurate (Astro + Svelte, DESIGN.md pointer) — use it as the
  entry point.
