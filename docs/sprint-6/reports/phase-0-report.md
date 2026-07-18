# Phase 0 Report — Discovery (Sprint-6 Audit)

> Completed: 2026-07-10

---

## 1. Method

Three parallel read-only QA audits of `frontend/src/`: (1) CSS/layout, (2) page-level/interaction, (3) mobile/a11y/polish. Top findings were then **spot-verified directly against source** before being accepted. Findings that didn't hold up under verification were corrected or dropped (e.g. `.masonry` was initially flagged "High — broken layout" but grep showed zero usages, so it was downgraded to "Low — dead CSS removal").

---

## 2. Verified findings (ranked)

### High severity

| ID | Finding | Where | Verified |
|----|---------|-------|----------|
| H1 | `blogs/[slug].astro` fetches `depth=0` → tags & author come back as raw IDs, render as `undefined` | `blogs/[slug].astro:11` | ✅ read line 11 — `&depth=0` |
| H2 | SpotlightEffect `heroEl` declared + guarded but `bind:this` missing on the div → `onMount` always bails; the spotlight is dead code | `SpotlightEffect.svelte:4,7,18` | ✅ read full file — no `bind:this` |
| H3 | No `res.ok` check / try-catch on ANY fetch → pages throw 500 when backend down or returns error envelope | all pages + `BaseLayout.astro:9-14` | ✅ pattern confirmed across files |
| H4 | Hardcoded `const API='http://localhost:3000/api'` in 9 files → breaks in any non-local environment | 9 files | ✅ |
| H5 | `iconify-icon` CSS selectors never match — `Icon.svelte` uses `@iconify/svelte` which emits `<svg>`, so icon color rules (`.contact-alt-item > iconify-icon` etc.) silently fail in 4+ components | `styles.css` (7 sites), `Icon.svelte:8` | ✅ read Icon.svelte — `<IconifyIcon>` |
| H6 | `prefers-reduced-motion` block only covers 3 decorative animations; all hover transforms (`translateY` on cards/stats/skills/buttons, `scale` on sidebar-link:active) remain ungated — violates AGENTS.md:113 | `styles.css:969-973` vs ~17 transition sites | ✅ read block |
| H7 | Mobile header is `height:64px` but `.content-scroll` has `padding-top:56px` → 8px of content clipped under fixed header on every phone | `styles.css:324,844` | ✅ read both lines |
| H8 | `--desc: #808080` on white = 3.95:1 → fails WCAG AA (needs 4.5:1). Affects all secondary text (intros, dates, meta, placeholders) | `styles.css:18` | ✅ contrast computed: 3.95:1 |
| H9 | No `:focus-visible` anywhere; inputs actively set `outline:0` → keyboard focus invisible on links, buttons, inputs | `styles.css` (no rule; `:372,996` remove outline) | ✅ |
| H10 | Mobile drawer: no Escape-to-close, no focus trap, no `role=dialog`/`aria-modal`, backdrop mislabeled `role="presentation"` | `Sidebar.svelte:40-46` | ✅ |

### Medium severity

| ID | Finding | Where |
|----|---------|-------|
| M1 | `nextProject` uses `p.order === project.order + 1` — breaks if orders non-contiguous | `projects/[slug].astro:19` |
| M2 | LiveClock accepts `timezone` prop but hardcodes `timeZone:'Asia/Jakarta'` — label and clock disagree | `LiveClock.svelte:5,13` |
| M3 | `isActive` uses `startsWith` → `/projects` would wrongly highlight on `/projects-archive` | `Sidebar.svelte:35` |
| M4 | `[slug]` pages `Astro.redirect` instead of returning 404 — hides broken links, bad for SEO | `projects/[slug].astro:15`, `blogs/[slug].astro:15` |
| M5 | No empty states on projects/social/documents; SearchFilter hides cards with no "no results" message | `projects.astro`, `social.astro`, `documents.astro`, `SearchFilter.svelte` |
| M6 | Icon-only buttons lack `aria-label` (title only, which AT ignores) | `Header.svelte:10`, `Sidebar.svelte:99`, `ThemeToggle.svelte:8` |
| M7 | SearchFilter input has no accessible name (icon + placeholder only) | `SearchFilter.svelte:20-23` |
| M8 | Contact form status div has no `role`/`aria-live` — success/error not announced | `contact.astro:34` |
| M9 | `.halation` is fixed 250×250px; when sidebar collapses to 72px the glow bleeds into main (no `overflow` containment) | `styles.css:275-291` |
| M10 | No skip-to-content link; `<main>` has no `id`; sidebar not in `<nav aria-label>` | `BaseLayout.astro:61` |
| M11 | Decorative icons not `aria-hidden`; `Icon.svelte` has no aria handling at all | `Icon.svelte:8` + all inline icons |
| M12 | Touch targets <44px: `.icon-btn` 32×32, `.chip` ~28px tall, `.back-link` ~28px | `styles.css:228,599` |
| M13 | `.chip-count` rendered by BlogFilter but has no CSS rule → unstyled | `BlogFilter.svelte:101` |
| M14 | Missing SEO: no meta description, no OpenGraph, no Twitter card, no `theme-color`, no canonical | `BaseLayout.astro:27-48` |
| M15 | `documents.astro:61` re-hardcodes `http://localhost:3000` for download origin (separate from the API const) | `documents.astro:61` |

### Low severity / cleanup

| ID | Finding | Where | Verified |
|----|---------|-------|----------|
| L1 | `.masonry*` CSS — **ZERO usages** in pages/components (dead) | `styles.css:455-479` | ✅ grep: none |
| L2 | `.sidebar-resizer` — **ZERO usages** (dead) | `styles.css:182-190` | ✅ grep: none |
| L3 | `.is-hidden-desktop` — **ZERO usages** (dead) | `styles.css:237` | ✅ grep: none |
| L4 | Unused tokens `--hover-foreground`, `--swiper-3d-shadow` (Blinko leftovers) | `styles.css:16,68,9,62` | |
| L5 | Unused `iconHtml` var in contact form script | `contact.astro:69` | |
| L6 | `!important` abuse (5 redundant sites) | `styles.css:122,134,829,833,845` | |
| L7 | Empty/no-op media queries (masonry `/* keep 2 col */`) | `styles.css:463-467` | |

---

## 3. Key decisions

| Decision | Reason |
|----------|--------|
| Shared `src/lib/api.ts` (`safeFetch` + `PUBLIC_API_URL`) | Fixes H3 + H4 + M15 + unguarded home-shape access in one pass |
| iconify CSS `iconify-icon` → `svg` (not component swap) | Lower risk; `Icon.svelte` already emits svg; lets us delete `iconify-bridge.css` |
| `--desc` → `#6b6b6b` (4.95:1) | Smallest AA-passing change; dark token already passes (~6.9:1) |
| Dead CSS removed, not fixed | L1-L3 have zero usages — verified by grep |

---

## 4. Reference files

| File | Role |
|------|------|
| `frontend/src/styles/styles.css` | Most CSS fixes land here |
| `frontend/src/components/ui/Icon.svelte` | Confirms svg output (not `iconify-icon`) |
| `frontend/src/components/shell/Sidebar.svelte` | `isActive` + mobile drawer a11y |
| `frontend/src/layouts/BaseLayout.astro` | head/SEO + skip link + fetch resilience |
| `frontend/src/pages/blogs/[slug].astro` | `depth` fix + 404 |
| `frontend/src/components/home/SpotlightEffect.svelte` | dead `bind:this` fix |
