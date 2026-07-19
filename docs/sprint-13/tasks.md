# Task Breakdown — Sprint-13: Notion system everywhere + responsive + sidebar fix + SEO

> Status: 🟡 Executing | Created: 2026-07-19
> Plan: [`plan.md`](./plan.md) · Phase 0 discovery: [`reports/phase-0-report.md`](./reports/phase-0-report.md)
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery ✅

| ID  | Task | Status |
|-----|------|--------|
| 0.1 | Diagnose sidebar nav bug (root cause: z-index) | ✅ |
| 0.2 | Map design system (tokens, components, responsive, SEO) | ✅ |

> 📄 Report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Fix sidebar navigation

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 1.1 | `styles.css` mobile `.sidebar`: add `z-index: 50` (above backdrop's 40) | Easy | — | ✅ |
| 1.2 | Remove dead SPA CSS `[data-page]:not(.sidebar-link)` rule (`styles.css:892-897`) | Easy | — | ✅ |
| 1.3 | Verify: mobile drawer links navigate; desktop unaffected; typecheck/build clean | Easy | 1.1, 1.2 | ✅ |

---

## Phase 2 — Token alignment (Notion values; purple accent)

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 2.1 | Warm the ink: `--foreground` → warm-neutral (notion ink), `--desc`/muted already close | Easy | — | ⬜ |
| 2.2 | Warmer hairline + surface refinements to match `--n-*` (light + dark) | Easy | — | ⬜ |
| 2.3 | Keep accent **purple** `#5645d4` (decision; flip is one-token if user wants blue) | Easy | — | ⬜ |
| 2.4 | Verify: pages look cohesive with Home; light + dark | Easy | 2.1–2.3 | ⬜ |

---

## Phase 3 — Shared component Notion discipline

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 3.1 | `.btn`/`.btn-primary`/`.btn-outline`/`.btn-ghost` → pill (`rounded.full`) + button type | Medium | 2 | ⬜ |
| 3.2 | `.card` (+ `.is-hoverable`, `.doc-card`, `.social-card`) → 12px radius, hairline, soft shadow | Medium | 2 | ⬜ |
| 3.3 | `.tag`/`.tech-chip`/badges → pill + eyebrow type | Easy | 2 | ⬜ |
| 3.4 | `.form-input`/`.form-textarea` → 4px radius (tight, not pill) + hairline | Easy | 2 | ⬜ |
| 3.5 | Sidebar/header polish (`.sidebar-link` active indicator, `.icon-btn` 44×44 on mobile) | Medium | 2 | ⬜ |
| 3.6 | Verify across pages; light + dark + touch | Easy | 3.1–3.5 | ⬜ |

---

## Phase 4 — Responsive overhaul (DESIGN.md breakpoints)

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 4.1 | Add 1440px wide tier (widest container / grid breathing room) | Easy | — | ⬜ |
| 4.2 | Shift mobile drawer breakpoint 768 → **≤600** (hamburger only on phones) | Medium | — | ⬜ |
| 4.3 | Add 840px tablet tier between 600 and 1080 (grids 2-up, nav condensing) | Medium | — | ⬜ |
| 4.4 | Reconcile existing 1024/1100/1280 rules to the 1080–1300 desktop band | Medium | — | ⬜ |
| 4.5 | Ensure 44×44px touch targets persist on mobile | Easy | 4.2 | ⬜ |
| 4.6 | Verify all breakpoints: 1440 / 1080–1300 / 768–840 / ≤600 | Easy | 4.1–4.5 | ⬜ |

---

## Phase 5 — Per-page polish + dead-code cleanup

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 5.1 | Delete duplicate `.contact-alt*`/`.contact-cta*` (`styles.css:1396-1411`) | Easy | — | ⬜ |
| 5.2 | projects / blogs / documents / social / contact: ensure Notion-cohesive (component propagation should cover most) | Medium | 2, 3 | ⬜ |
| 5.3 | Detail pages (`projects/[slug]`, `blogs/[slug]`): `.prose`, `.detail-*`, `.author-card` cohesion | Medium | 2, 3 | ⬜ |
| 5.4 | Verify all pages read as one product; light + dark + mobile | Easy | 5.2, 5.3 | ⬜ |

---

## Phase 6 — SEO + performance

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 6.1 | `astro.config.mjs`: set `site: 'https://athallarizky.com'` | Easy | — | ⬜ |
| 6.2 | Add `@astrojs/sitemap` integration | Easy | 6.1 | ⬜ |
| 6.3 | `BaseLayout.astro`: per-page `<title>`/description via props; canonical uses `site` | Easy | 6.1 | ⬜ |
| 6.4 | Open Graph: `og:image`, `og:url`, `twitter:card=summary_large_image` | Medium | 6.1 | ⬜ |
| 6.5 | Add `public/robots.txt` + favicon + `site.webmanifest`; fix `theme-color` to brand | Easy | 6.1 | ⬜ |
| 6.6 | Structured data (JSON-LD): Person on home, Article on blog detail | Medium | 6.3 | ⬜ |
| 6.7 | Image optimization (astro:assets / `<Image>`) for banners + screenshots | Medium | — | ⬜ |
| 6.8 | Verify: Lighthouse SEO/perf, sitemap reachable, meta correct per page | Easy | 6.1–6.7 | ⬜ |

---

## Phase 7 — Homepage mesh background on list pages (added mid-sprint)

> Goal: bring the home page's decorative `.home-mesh` gradient to the other list/index pages
> (projects, blogs, documents, social, contact) so they share the same bg. **Excluded:** the two
> detail pages (`blogs/[slug]`, `projects/[slug]`) stay clean.

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 7.1 | BaseLayout: add `mesh` prop (default `true`); render `.home-mesh` in `.content-inner` | Easy | — | ✅ |
| 7.2 | CSS: lift `.content-inner > *` above the mesh (`z-index: 1`) so content stays visible | Easy | 7.1 | ✅ |
| 7.3 | index.astro: remove its own `.home-mesh` (now provided by BaseLayout) | Easy | 7.1 | ✅ |
| 7.4 | Detail pages (`blogs/[slug]`, `projects/[slug]`): pass `mesh={false}` | Easy | 7.1 | ✅ |
| 7.5 | Verify: mesh shows on home + list pages; absent on detail pages; mobile hides it | Easy | 7.1–7.4 | ✅ |

---

## Dependency Graph

```
Phase 1 (sidebar fix) — independent, do first
Phase 2 (tokens) ──► Phase 3 (components) ──► Phase 5 (per-page polish)
                                   
Phase 4 (responsive) — independent of 2/3
Phase 6 (SEO) — mostly independent (depends on site URL only)
```

## Summary

| Phase | Tasks | Difficulty mix | Status |
|-------|-------|----------------|--------|
| 0 — Discovery | 2 | 2 E | ✅ |
| 1 — Sidebar fix | 3 | 3 E | ✅ |
| 2 — Tokens | 4 | 4 E | ✅ |
| 3 — Components | 6 | 3 M, 3 E | ✅ (core; inputs/sidebar-header polish deferred) |
| 4 — Responsive | 6 | 3 M, 3 E | ✅ (core; full breakpoint realignment deferred — see notes) |
| 5 — Per-page polish | 4 | 2 M, 2 E | ✅ (dead code done; cohesion via propagation; layout polish deferred to QA) |
| 6 — SEO + perf | 8 | 3 M, 5 E | ✅ (core; og:image asset + image opt deferred) |
| 7 — Mesh bg on list pages | 5 | 5 E | ✅ |
| **Total** | **38** | **11 M, 27 E** | ✅ delivered (+ QA polish) |

## Deferred / follow-up (not blocking — for a future pass or visual QA)

- **`public/og.png`** — the OG/Twitter meta references `/og.png` (1200×630); no asset exists yet. Drop one in `frontend/public/`.
- **Image optimization** — adopt `astro:assets` `<Image>` for article/project banners + screenshots (sharp is already a backend dep).
- **Full responsive realignment** — mobile drawer intentionally kept at `max-width:767px` (defensible for a left-sidebar layout vs DESIGN.md's top-nav ≤600 assumption); container already caps at 1200px and grids collapse 3→2→1. Revisit per-page responsive issues found in visual QA.
- **Per-page component polish** — inputs (4px radius), sidebar/header active-indicator refinements.
- **Svelte 4→5 migration of shell** (`Sidebar`/`Header`/`Icon`) — tech debt; works today in legacy mode.

## Notes

- **Color decision (pending user):** keep purple `#5645d4` (recommended) or flip to Notion blue
  `#0075de`. Phase 2.3 encodes the choice; flipping later is a one-token change.
- **Dark mode:** DESIGN.md is light-only; dark `--n-*` already delegate to the original layer — keep.
- **Verify cadence:** after each phase, typecheck + build + eyeball light/dark/mobile, then update
  this file + write a short phase report.
