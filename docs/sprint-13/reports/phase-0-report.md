# Phase 0 Report — Discovery (sidebar bug + design-system map)

> Completed: 2026-07-19 · two parallel read-only agents over `frontend/`

---

## 1. How to run (discovery)

Two exploration agents mapped (a) the sidebar navigation bug and (b) the design system / responsive /
SEO state. All findings below are `file:line`-referenced for the implementing phases.

## 2. Sidebar navigation bug — ROOT CAUSE (confirmed)

**Symptom:** on mobile (≤767px), tapping a sidebar menu link closes the drawer but does **not**
navigate to the page.

**Root cause — z-index layering.** `frontend/src/styles/styles.css`:
- `.sidebar-backdrop` (`:858-865`) — full-viewport, `z-index: 40`, `pointer-events: auto` when open.
- `.sidebar` (`:181-192`) — base `z-index: 30`.
- Mobile media query (`:868-875`) fixes the sidebar's position but **never raises z-index above 40**.

So on mobile the backdrop paints **over** the sidebar → taps land on the backdrop `<div>` (which only
runs `closeDrawer`, `Sidebar.svelte:18-20`) instead of the `<a href>` links (`Sidebar.svelte:84-94`,
which are correct plain anchors with no `preventDefault`). Desktop is unaffected (backdrop has
`pointer-events: none` when closed).

**Fix (Phase 1):** `z-index: 50` on the mobile `.sidebar` (anything > 40).

**Cleared suspects:** no `preventDefault` near nav; no Astro ClientRouter / view transitions; no global
click interceptors; `use:glow`/`use:magnetic` not on nav links; compiled `Sidebar.js` has 0
`preventDefault` refs.

**Secondary (latent, not the active bug):**
- Dead SPA CSS `[data-page]:not(.sidebar-link){display:none}` (`:892-897`) — no element has
  `data-page`, no `app.js` exists → dead landmine. Remove in Phase 1.
- Shell components (`Sidebar.svelte`, `Header.svelte`, `Icon.svelte`) run Svelte 5 in **legacy**
  (Svelte 4) syntax — works today; flagged as tech debt (out of scope).

## 3. Design-system map

### Token layers (`frontend/src/styles/styles.css`)
- **Notion layer (`--n-*`)** defined on `:root`/`.dark` (NOT `.home`-scoped — only consumer rules are).
  Light (`:1019-1031`) uses **purple** `--n-primary:#5645d4`; only `--n-link:#0075de` is the spec blue.
  Dark (`:1033-1047`) delegates to the original layer (`var(--card)`, `color-mix(... var(--foreground))`).
- **Original layer (`--*`)** light `:7-58`, dark `:60-108`. `--primary:#5645d4` (purple),
  `--secondbackground:#f6f5f4` (✓ Notion canvas-soft), `--desc:#615d59` (✓ ink-muted),
  `--foreground: hsl(222,47%,11%)` (cool — warmer than Notion ink), `--border:#E7E7E5`.
- **Gap:** surfaces already Notion-warm; the differences are **ink warmth**, **primary = purple**
  (vs DESIGN.md blue), and component discipline — not the values of canvas/surface.

### Page token usage
Only **Home** (`index.astro:39` `class="home"`) uses the Notion layer. All 8 other pages render
inside `BaseLayout.astro`'s `.content-inner` (`:82`) with original tokens. One crossover: `.author-card`
(`:769-790`) already consumes `--n-*` (works only because they're on `:root`).

### Responsive (`@media` in styles.css)
`768px` pervasive; `1024` (blog-layout), `1100` (article-layout), `1280` (grid-3) ad hoc. Mobile drawer
at `max-width:767` (`:868`) — accessible (`role=dialog`, Escape, backdrop, auto-close ≥768).

**vs DESIGN.md (`:343-349`):** Wide 1440 (missing) · Desktop 1080–1300 (partial) · Tablet 768–840
(approx; no 840 boundary) · Mobile ≤600 (**mismatch** — drawer fires at 768).

### Component vocabulary (shared classes to restyle)
`.card/.is-hoverable/.doc-card/.social-card` (`:451+`), `.btn/.btn-primary/.btn-outline/.btn-ghost`
(`:832-848`), `.tag/.tech-chip` (`:475+`), `.grid-2/.grid-3` (`:491-504`), `.sidebar-link` (`:275`),
`.icon-btn` (`:241`), `.form-input/.form-textarea` (contact), `.detail-*`, `.prose`, `.author-card`.

### Dead code
- Duplicate `.contact-alt*`/`.contact-cta*` at `:1396-1411` (of `:1367-1382`).
- Vestigial `[data-page]` SPA rule (`:892-897`).

## 4. SEO current state (placeholder tier)
`BaseLayout.astro:22-59` `<head>`: static description (`:25`), `theme-color:#c35af7` (old purple),
OG tags present but **no `og:image`/`og:url`**, canonical uses request-derived origin (`:40`),
per-page `<title>` works (`:42`). `astro.config.mjs` has **no `site` key**, no `@astrojs/sitemap`.
`public/` has no `robots.txt`/favicon/og-image/webmanifest.

## 5. Decisions made (for plan.md)
- **Accent: keep purple `#5645d4`** (recommended) — DESIGN.md's discipline is surface+type, not the blue.
- **Depth: token + component + responsive alignment** (not a full per-page teardown).
- **Dark mode: keep** (derive; already delegates to original layer).
- **Sidebar: z-index fix.**
