# Architecture — Sprint 10: Home Page Redesign (Notion DESIGN.md)

## 1. Project Structure (what this sprint touches)

```
portfolio/
├── DESIGN.md                       ← NEW (Phase 0 ✅) Notion design spec — home page source of truth
├── backend/
│   └── src/
│       ├── collections/Projects.ts ← MODIFY: + showOnHome checkbox
│       ├── globals/Home.ts         ← MODIFY: showItems += featuredProjects, latestWriting
│       └── seed/data/
│           ├── globals.ts          ← MODIFY: remove 'Local time {time}' currently-item
│           └── projects.ts         ← MODIFY: showOnHome: true on 3 projects
└── frontend/
    └── src/
        ├── pages/index.astro       ← MODIFY: restructure + 2 new fetches/sections
        ├── styles/styles.css       ← MODIFY: append Notion token layer + home re-skin; delete dead CSS
        ├── lib/
        │   ├── api-types.ts        ← MODIFY: Project.showOnHome?, Home.showItems union
        │   └── actions/glow.ts     ← NEW: pointer-glow Svelte action
        ├── components/home/
        │   ├── MagneticButton.svelte  ← NEW
        │   ├── Reveal.svelte          ← NEW
        │   ├── TypedRole.svelte       ← reuse as-is
        │   ├── CountUpStats.svelte    ← reuse as-is
        │   ├── LiveClock.svelte       ← reuse as-is
        │   └── SpotlightEffect.svelte ← reuse as-is (hero spotlight stays)
        └── data/home.ts          ← DELETE (dead since sprint-4)
```

**Unchanged:** `BaseLayout.astro`, `Sidebar.svelte`, `Header.svelte`, all other pages, the `.corner-blob`/`.halation` ambient effects, all backend endpoints.

## 2. Tech Stack Decisions

### Decision Matrix

| Area | Choice | Why |
|------|--------|-----|
| Design spec | `DESIGN.md` (notion) at repo root | User-selected; markdown spec for agents, zero runtime cost |
| Token application | `--n-*` vars scoped under `.home` | Other pages keep Blinko style; no regressions |
| New sections | Plain Astro markup in `index.astro` | SSR, zero JS shipped; interactions are CSS + one action |
| Cursor glow | Svelte action `use:glow` | No wrapper DOM; attaches to any element; tiny footprint |
| Reveals | `Reveal.svelte` (IntersectionObserver) | SSR-safe (onMount), one-shot, rootable at `.content-scroll` |
| Magnetic buttons | `MagneticButton.svelte` slot wrapper | Only 3 buttons need it; wrapper keeps markup declarative |

### Why NOT Alternatives

| Rejected | Reason |
|----------|--------|
| Site-wide token replacement (change `:root` globals) | Restyles every page — out of scope; high regression risk |
| Notion Sans web font | Root AGENTS.md forbids new fonts; it's Inter-based anyway — keep Inter |
| Wrapper `<GlowCard>` component | Extra DOM node per card; an action achieves the same with less markup |
| `window` scroll listener for reveals | Body doesn't scroll — `.content-scroll` does; IO is also cheaper |
| New API endpoints / backend filtering | Existing query params (`where`, `sort`, `limit`) cover both strips |
| Navy hero band from the Notion spec | Clashes with the light dashboard shell; canvas hero + dot-grid + spotlight stays |
| Svelte 5 `{#snippet}` for Reveal | `<slot>` is supported and matches existing component style |

## 3. Service Boundaries

### Backend (Payload)
- **Does:** add one checkbox field, two select options, seed-data tweaks
- **Does NOT:** gain new endpoints, change access control, change any existing field

### Frontend home (`index.astro` + `components/home/`)
- **Does:** all visual/interaction work, two new `safeFetch` calls
- **Does NOT:** touch the shell (sidebar/header/layout), other pages, global tokens outside the `.home` scope, or `styles.css` sections used by other pages (except deleting confirmed-dead selectors)

## 4. Key Architectural Decisions

### Decision 1: Scoped `--n-*` token layer
**Decision:** introduce Notion tokens as new CSS custom properties prefixed `--n-*`, defined on `:root` + remapped on `.dark`, and *applied* only within `.home` selectors.
**Reasoning:**
- Zero impact on the other 6+ pages that share `styles.css`
- Existing home markup keeps working (class names unchanged); only values change
- Future site-wide rollout = widen the selector scope, no renames

### Decision 2: Dark mode = reuse shell surfaces, re-map ink/accent/tints
**Decision:** in `.dark`, `--n-canvas`/`--n-surface`/`--n-hairline` alias the existing dark tokens (`--card`, `--border`, …); ink scale and tints get explicit dark values; tints become `color-mix` alphas over `--card`.
**Reasoning:**
- The Notion spec has no dark tokens (documented "Known gap")
- Aliasing shell surfaces keeps home cards identical in tone to the sidebar/header in dark mode — cohesion beats purity
- `color-mix` tints preserve the pastel *relationship* without inventing 8 new hex values blindly

### Decision 3: IntersectionObserver rooted at `.content-scroll`
**Decision:** `Reveal.svelte` finds `el.closest('.content-scroll')` and passes it as IO `root`.
**Reasoning:** the app shell pins `body { overflow: hidden }`; only `.content-scroll` scrolls. Default root (viewport) still works for IO *technically*, but rooting at the scroller is correct and future-proof (e.g. if layout gains internal padding/margins).

### Decision 4: Glow as a Svelte action
**Decision:** `frontend/src/lib/actions/glow.ts` exports `glow`, used as `<div class="card glowable" use:glow>`. It writes `--gx/--gy` percentages; CSS renders the radial highlight.
**Reasoning:** mirrors the proven `SpotlightEffect` pattern (JS feeds coords, CSS paints), adds no DOM, self-disables on touch/reduced-motion, reusable on any future element.

### Decision 5: CMS gating for new sections
**Decision:** `showItems` gains `featuredProjects` + `latestWriting`; sections render only when gated on AND data is non-empty.
**Reasoning:** every existing home section is gated the same way — consistency; lets the owner hide a strip from the admin without a deploy.

## 5. Notion → Portfolio Token Mapping

Applied under `.home` (and `.dark .home` for dark). Prefix `--n-` avoids collisions with the existing token set.

| Token | Light | Dark | Used for |
|-------|-------|------|----------|
| `--n-primary` | `#5645d4` | `#7c6fe4` | Primary CTA bg, focus rings |
| `--n-primary-pressed` | `#4534b3` | `#6357d6` | CTA active/pressed |
| `--n-ink` | `#1a1a1a` | `#e8e6e1` | Headings, strong text |
| `--n-charcoal` | `#37352f` | `#cfccc4` | Body emphasis, tint-card text |
| `--n-slate` | `#5d5b54` | `#9c998f` | Secondary text, descriptions |
| `--n-steel` | `#787671` | `#7d7a71` | Tertiary text, dates |
| `--n-stone` | `#a4a097` | `#6d6a62` | Muted labels |
| `--n-canvas` | `#ffffff` | `var(--card)` | Card surfaces |
| `--n-surface` | `#f6f5f4` | `color-mix(in srgb, var(--foreground) 4%, var(--card))` | Stat band, CTA banner, row hover |
| `--n-hairline` | `#e5e3df` | `var(--border)` | Card borders, dividers |
| `--n-hairline-soft` | `#ede9e4` | `color-mix(in srgb, var(--border) 60%, transparent)` | Row dividers |
| `--n-hairline-strong` | `#c8c4be` | `color-mix(in srgb, var(--foreground) 20%, var(--border))` | Secondary button border |
| `--n-link` | `#0075de` | `#4b9bf0` | "All projects →" inline links only |
| `--n-tint-lavender` / `-ink` | `#e6e0f5` / `#391c57` | `color-mix(in srgb, #7b3ff2 18%, var(--card))` / `#cdb9f6` | Currently card, tag chips |
| `--n-tint-peach` / `-ink` | `#ffe8d4` / `#793400` | `color-mix(in srgb, #dd5b00 18%, var(--card))` / `#f0b48a` | Tag chips |
| `--n-tint-mint` / `-ink` | `#d9f3e1` / `#1aae39` | `color-mix(in srgb, #1aae39 16%, var(--card))` / `#8fdca4` | Tag chips |
| `--n-tint-sky` / `-ink` | `#dcecfa` / `#005bab` | `color-mix(in srgb, #0075de 18%, var(--card))` / `#9ecdf5` | Tag chips |

**Type scale (home only, Inter):** hero name `clamp(32px, 4vw, 40px)` / 600 / −0.5px · section titles 15–18px / 600 · body 14px / 400 / 1.5 · micro-uppercase eyebrow 11px / 600 / +1px.

**Geometry:** buttons 8px radius (rectangles, never pills) · cards 12px · chips/badges pill or 6px · tags 6px (`badge-tag` style).

**Elevation:** flat by default (hairline border, no shadow); hover → Notion level-1 `rgba(15,15,15,.04) 0 1px 2px` (light) / border-color shift (dark). No heavy shadows anywhere.

**Motion:** 150–200ms ease for hovers (per Notion spec gap note); reveal 600ms cubic-bezier(.22,.68,.18,1) (no overshoot — calmer than current).
