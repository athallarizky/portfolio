# Sprint-13 Plan — Notion system across all pages + responsive + sidebar fix + SEO

> Status: ✅ Core delivered + build-verified | Created: 2026-07-19
> Builds on: [`../sprint-12/final-report.md`](../sprint-12/final-report.md) (deploy OOM-proofed). Read [`../../AGENTS.md`](../../AGENTS.md) §3 (design system) + §8 (deploy).
> Companion: [`tasks.md`](./tasks.md) · Phase 0 discovery: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Context

Sprint-10 redesigned **Home** against [`DESIGN.md`](../../DESIGN.md) (Notion), but scoped it to a
`.home` wrapper — the other 8 pages kept the original Blinko-style tokens. Three problems now block
the site from reading as one product:

1. **Mobile sidebar links don't navigate** — a z-index bug (backdrop overlays the sidebar).
2. **Responsive breakpoints don't match DESIGN.md** (mobile drawer fires at 768; spec wants ≤600; no
   1440 wide tier or 840 tablet tier).
3. **The non-Home pages don't follow the Notion system** (token values + component discipline differ).
4. **SEO is at placeholder tier** (no `site` config, no sitemap, no og:image, static description).

## Goal

One cohesive product: every page reads as the Notion system (warm canvas, Inter tracking, disciplined
components, correct responsive tiers), the sidebar works on mobile, and the site is SEO/perf-ready.

## Scope

**In scope:**
- Sidebar nav bug fix + remove dead SPA CSS.
- Token alignment to Notion values (accent stays **purple** — see decisions).
- Shared-component Notion discipline (`.btn`→pill, `.card`→12px+hairline, badges, inputs, sidebar/header).
- Responsive breakpoint overhaul to DESIGN.md tiers (1440 / 1080–1300 / 768–840 / ≤600).
- Per-page polish so all 8 pages read as one product; dead-code cleanup.
- SEO + performance: `site` config, `@astrojs/sitemap`, per-page meta/OG, `robots.txt`, JSON-LD,
  `og:image`, image optimization.

**Out of scope:**
- Svelte 4→5 migration of the shell (noted as tech debt — works today).
- Backend changes.
- A full layout teardown of each page (keep existing layouts; restyle tokens/components).

## Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color accent | **Keep purple `#5645d4`** (recommended; pending user confirm) | Established brand; DESIGN.md's real discipline is surface + typography + restraint, not the specific blue. Flip to `#0075de` is a one-token change if user prefers truest spec. |
| Depth | Token + component + responsive alignment (not full per-page teardown) | Existing layouts are fine; the gap is tokens, shared components, and breakpoints. |
| Dark mode | Keep — derive Notion dark tokens (already mostly delegated to the original layer) | DESIGN.md is light-only; the site has dark mode and Home already has `--n-*` dark variants. |
| Sidebar bug | `z-index: 50` on the mobile `.sidebar` (above backdrop's 40) | Root cause confirmed: backdrop overlays the sidebar and steals taps. |
| Svelte legacy | Leave shell in Svelte 4 syntax; flag as tech debt | Out of scope; mixing runes into legacy components risks silent hydration breaks. |

## Phasing

- **Phase 0 — Discovery** ✅ (sidebar bug diagnosed; design system mapped — see report)
- **Phase 1 — Fix sidebar nav** (z-index + remove dead SPA CSS)
- **Phase 2 — Token alignment** (Notion values; purple accent)
- **Phase 3 — Shared component Notion discipline** (`.btn`, `.card`, badges, inputs, sidebar/header)
- **Phase 4 — Responsive overhaul** (1440 / 840 / ≤600 tiers; reconcile existing 768/1024/1100/1280)
- **Phase 5 — Per-page polish + dead-code cleanup**
- **Phase 6 — SEO + performance**

## Discovery findings (summary → full detail in the Phase 0 report)

- **Sidebar bug** — `styles.css` mobile `.sidebar` z-index `30` < backdrop `40` → backdrop intercepts
  taps. Fix: raise sidebar to `z-index: 50` in the `@media (max-width: …)` block.
- **Tokens** — `--primary: #5645d4` (purple) in both layers; surfaces already Notion-warm
  (`--secondbackground: #f6f5f4`, `--desc: #615d59`); gap = ink warmth + component discipline.
  `--n-*` live on `:root` (not `.home`-scoped) — only consumer rules are `.home`-scoped.
- **Responsive** — `768px` used pervasively; `1024/1100/1280` ad hoc. DESIGN.md wants 1440/1080–1300/
  768–840/≤600. Mobile drawer is accessible (`role=dialog`, Escape, backdrop) — keep it, shift trigger
  to ≤600.
- **SEO** — no `site` key in `astro.config.mjs`; no `@astrojs/sitemap`; no `og:image`; static
  description; no `robots.txt`; `theme-color` = old purple.
- **Dead code** — duplicate `.contact-alt*`/`.contact-cta*` (`styles.css:1396-1411`); vestigial
  `[data-page]` SPA rule (`styles.css:893-897`).
