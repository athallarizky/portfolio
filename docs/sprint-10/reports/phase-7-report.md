# Phase 7 Report — Right-side mesh gradient background

> Completed: 2026-07-19 · Trigger: owner request ("mesh-like blurry gradient for our right side background, follow DESIGN.md")

---

## 1. Design source

[`DESIGN.md`](../../../DESIGN.md) defines a **decorative sticker palette** —
purple `#d6b6f6`, pink `#ff64c8`, sky `#62aef0`, teal `#2a9d99`, orange `#dd5b00`
(+ green/indigo) — used "only as illustrated blocks, app stickers and category
dots, never as CTAs or structural fills." Notion's depth cue is "illustration, not
shadow" — "glowing sticker constellations" / colourful ambient.

A **blurred multi-blob mesh** from this palette is the spec-faithful reading of
"mesh-like blurry gradient": decorative-only ambient colour, no structural role.

## 2. What changed

**`frontend/src/pages/index.astro`** — added a decorative layer as the first child
of `.home`:
```astro
<div class="home-mesh" aria-hidden="true"></div>
```

**`frontend/src/styles/styles.css`** — the mesh + stacking:
```css
.home { position: relative; isolation: isolate; … }            /* stacking context */
.home > *:not(.home-mesh) { position: relative; z-index: 1; }   /* cards above mesh */
.home-mesh {
  position: fixed; top: -10vh; right: -6vw; width: 60vw; height: 120vh;
  z-index: 0; pointer-events: none;
  background:
    radial-gradient(38% 32% at 64% 14%, rgba(214,182,246,.50), transparent 70%),  /* purple */
    radial-gradient(34% 28% at 33% 38%, rgba(255,100,200,.30), transparent 70%),  /* pink   */
    radial-gradient(44% 38% at 80% 52%, rgba(98,174,240,.42), transparent 72%),   /* sky    */
    radial-gradient(36% 32% at 46% 74%, rgba(42,157,153,.28), transparent 70%),   /* teal   */
    radial-gradient(30% 26% at 78% 90%, rgba(221,91,0,.26),  transparent 70%);    /* orange */
  filter: blur(50px); opacity: .5;
}
.dark .home-mesh { opacity: .36; }
@media (max-width: 768px) { .home-mesh { display: none; } }
```

## 3. How it reads

- **Viewport-fixed** so it stays as a persistent right-side background while the
  content scrolls; positioned in the right ~60vw, bleeding off the top/right.
- **z-index 0 under the cards (z-index 1)** — the opaque Notion cards keep text
  crisp; the mesh shows through the right gutter and the gaps between sections.
- **Home-scoped** (rendered only in `index.astro`) — other pages keep the shell's
  `.corner-blob` unchanged.
- **Light:** soft pastel wash (.5 opacity). **Dark:** dimmed nebula glow (.36).
- **Mobile (≤768px):** hidden (no right gutter; keeps the mobile view clean).

## 4. Test Results

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Complete! 820 ms |
| SSR render | ✅ `.home-mesh` present as first child of `.home`; no `TypeError`/`ReferenceError` |
| Stacking | cards z-index 1 > mesh z-index 0 (CSS verified) |

> Visual confirmation (color balance / position) needs a browser — confirm on light + dark.

## 5. Notes / tunables

- The shell's `.corner-blob` (single purple, top-right) still renders behind; the
  mesh sits above it and shares the purple, so they harmonise. If it reads as too
  busy, suppressing `.corner-blob` on home is a one-line follow-up (needs a page
  hook in `BaseLayout`, e.g. `data-page` on `.layout-container`).
- Easy knobs: `opacity`, `filter: blur()`, blob positions/sizes, or adding a slow
  `@keyframes` drift (would need a `prefers-reduced-motion` guard) — currently
  static by choice (no motion concerns, no perf cost).
