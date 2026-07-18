# Sprint-6 Plan — UI Polish & Bugfixes

> Status: 🟡 Planning | Created: 2026-07-10
> Companion: [`tasks.md`](./tasks.md) · sprint-5: [`../sprint-5/final-report.md`](../sprint-5/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprints 1-5 built and wired the portfolio end-to-end: PayloadCMS backend, Astro+Svelte frontend consuming its REST API, and a working contact form. The product is feature-complete but accumulated UI debt: functional bugs (broken article tags, a dead spotlight effect), fragile data fetching (every page 500s if the backend hiccups), accessibility gaps (invisible focus, failing contrast, unlabeled controls), and dead/mis-styled CSS.

Sprint-6 is a polish sprint — no new features. It cleans up ~28 issues found by a three-pass frontend audit (functional, CSS/layout, a11y/mobile), each verified against the actual source. Work proceeds one task at a time so each fix is reviewable in isolation.

---

## 1. Sprint goal

Fix all functional UI bugs, harden data fetching against backend failures, bring accessibility to WCAG-AA, fix mobile layout gaps, and remove dead CSS — leaving the frontend polished and production-ready. No new features.

---

## 2. Scope

**In scope:**
- Functional bugs: article `depth`, dead SpotlightEffect, nextProject logic, LiveClock timezone, dead var
- Fetch resilience: shared `src/lib/api.ts` helper (`PUBLIC_API_URL` + `safeFetch`), refactor 9 pages, defensive defaults
- CSS fixes: iconify→svg selectors, reduced-motion gating, mobile header padding, `.halation` overflow, focus-visible, `--desc` contrast
- Nav/detail: segment-based `isActive`, real 404s + `404.astro`
- Accessibility: skip link, aria-labels, accessible search input, live regions, aria-hidden decorative icons, mobile drawer a11y
- Mobile/empty states: touch targets, `.chip-count`, empty-state fallbacks, detail-page breakpoints
- Cleanup + SEO: dead-CSS removal, meta/OpenGraph/Twitter/theme-color/canonical

**Out of scope:**
- New pages or features (except data-model changes that unblock UI fixes)
- Performance work beyond hydration note (self-host iconify, `client:idle`) — candidate for sprint-7
- `render-lexical` new node types (links/images) — candidate for sprint-7
- Real file uploads / deployment / DB migration

---

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| One shared `src/lib/api.ts` with `safeFetch` | Resolves 4 findings at once (hardcoded localhost ×9, missing res.ok checks, no error states, unguarded home-shape access). Single source of truth for the API base |
| `PUBLIC_API_URL` env var (default localhost) | Unblocks production deployment; `.env` already gitignored |
| Migrate iconify CSS selectors `iconify-icon` → `svg` (not the other way) | `Icon.svelte` uses `@iconify/svelte` which emits `<svg>`. Changing CSS is lower-risk than swapping the component across all call sites. Lets us delete `iconify-bridge.css` |
| Global `:focus-visible` ring via `--secondary` | One rule fixes keyboard visibility everywhere; purple accent matches the design system |
| `--desc` light: `#808080` → `#6b6b6b` (4.95:1) | Smallest change that passes WCAG AA; keeps the muted aesthetic. Dark token already passes (6.9:1) |
| Real 404 (`Astro.response.status(404)`) + `404.astro` | Current silent redirect hides broken links and confuses crawlers; a 404 page is correct UX + SEO |
| Segment-based `isActive` (`href` or `href + '/'`) | Fixes the latent prefix-collision bug (e.g. `/projects` matching `/projects-archive`) with minimal logic |
| Dead CSS removed, not "fixed" | `.masonry`, `.sidebar-resizer`, `.is-hidden-desktop` have zero usages — removing is safer than maintaining unused rules |

---

## 4. Phasing

- **Phase 0 — Discovery:** audit complete (3 passes + spot-checks); findings in phase-0 report
- **Phase 1 — Functional bugs:** surgical fixes (depth, SpotlightEffect, nextProject, LiveClock, dead var)
- **Phase 2 — Fetch resilience:** `src/lib/api.ts` helper + refactor all pages
- **Phase 3 — CSS bugfixes:** iconify selectors, reduced-motion, mobile padding, halation, focus-visible, contrast
- **Phase 4 — Navigation & detail pages:** isActive segments, 404 handling
- **Phase 5 — Accessibility:** skip link, aria-labels, live regions, drawer a11y
- **Phase 6 — Mobile & empty states:** touch targets, chip-count, fallbacks, breakpoints
- **Phase 7 — Cleanup & SEO:** dead-CSS removal, meta/OG/Twitter
- **Phase 8 — Verify & finalize:** build, route sweep, re-audit, final report
- **Phase 9 — UI tweaks:** CMS-driven TypedRole roles (backend field + frontend wiring), card-header `space-between` removal, remove dead sync icon from header
- **Phase 10 — Feature flags:** Home section visibility (`showItems` select on Home global), contact form toggle (`contactFormEnabled` on SiteConfig), documents toggle (`documentsEnabled` on SiteConfig)

---

## 5. Verification

1. `blogs/<any-slug>` shows tags + author initials/name (was blank)
2. Home hero spotlight follows pointer (was dead)
3. Stop the backend → pages show a graceful error card (not 500)
4. `grep -rn "localhost:3000" frontend/src/pages` returns 0 (all via helper)
5. Tab through a page → focus ring visible on every interactive element
6. Lighthouse a11y score ≥ 95 on `/` and `/contact`
7. Mobile (375px): no content under header, touch targets ≥ 44px, grids collapse
8. `/projects/nonexistent-slug` returns 404 with the 404 page
9. `prefers-reduced-motion: reduce` → no hover transforms animate
10. `npx astro build` succeeds; all routes 200 (except intentional 404)
11. Home page sections toggle via `showItems` in Payload admin; unchecking a section hides it
12. Uncheck `contactFormEnabled` → form replaced by message; POST `/api/contact` returns 503
13. Uncheck `documentsEnabled` → downloads replaced by message
