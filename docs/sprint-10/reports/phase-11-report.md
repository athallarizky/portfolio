# Phase 11 Report — Project detail: section spacing + screenshot lightbox

> Completed: 2026-07-19 · Trigger: owner request.

---

## 1. Section spacing (11.1)

The project-detail sections (Tech stack, Features, Screenshots, Architecture) were
crowded: `.project-section { margin: 24px 0 }` had its top margin overridden by the
`mt-4` utility (16px) on each section.

**Fix:** `.project-section { margin: 2rem 0 }` and removed `mt-4` from all 4 sections
so the 2rem applies cleanly (adjacent margins collapse → 2rem between sections).

## 2. Screenshot lightbox (11.2)

### Research
react-photo-view (`/minjieliu/react-photo-view`, via Context7) is an **exquisite React
photo preview** — `PhotoProvider` + `PhotoView`, with `src` (lightbox image) or a
`render` prop for **custom content** (videos/arbitrary HTML). Its `render` prop means
it can display the current gradient-placeholder screenshots without real image files.

### Decision: Svelte, not React
react-photo-view is React; the frontend is Astro + **Svelte** with no React. Adding it
would mean `@astrojs/react` + react + react-dom + the React runtime on the
project-detail page, and a second UI framework in the repo (contrary to the AGENTS.md
"no new framework without approval" guideline). **Owner chose the Svelte equivalent** —
same UX, zero added runtime, reuses iconify natively.

### Implementation: `frontend/src/components/project/Screenshots.svelte`
A Svelte 5 island (runes: `$props`, `$state`, `$effect`):
- **Thumbnails:** gradient `.thumb` buttons with an expand-icon hover hint.
- **Lightbox:** click → fullscreen overlay (`position: fixed`, z-index 1000, blurred backdrop).
  - **Zoom:** mouse-wheel + double-click toggle (1× ↔ 2.2×), clamped 1–5×.
  - **Pan:** pointer drag (mouse + touch) via `setPointerCapture`.
  - **Navigate:** on-screen prev/next buttons + `←`/`→` keys; `Esc` / backdrop-click to close.
  - Count indicator (`n / total`).
  - Reduced-motion guard (disables transitions/animation).

Renders the gradient content directly (mirrors react-photo-view's `render` prop) — no
image `src` needed, so it works on the current placeholders. Swap `.thumb` / `.lb-photo`
content to `<img>` when real screenshots exist.

### Integration
`projects/[slug].astro`:
```astro
<section class="project-section">
  <h3>Screenshots</h3>
  <Screenshots client:visible items={project.screenshots} />
</section>
```

## 3. Test Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ exit 0 |
| `npm run build` | ✅ Complete! |
| thumbnails render (noteflow) | ✅ 4 `.thumb` + 4 expand-hints |
| `.project-section` margin | ✅ `2rem 0` |
| `mt-4` removed from sections | ✅ none remaining |
| runtime errors | ✅ none |

> Lightbox interactions (open / zoom / pan / nav / keyboard) are client-side — confirm in the browser.

## 4. Notes

- The lightbox shows the gradient placeholders for now; meaningful photo-zoom needs real
  screenshot images (add an `image`/`upload` field to the `screenshots` schema later and
  point `.thumb`/`.lb-photo` at the image URL).
- Keyboard handling is on `document` via `$effect` (one listener, cleaned up on unmount).

## 5. Follow-up fixes (lightbox) — owner bug report

Owner reported: image-preview style/position wrong, and the prev button "not exist".

Root causes + fixes:
- **Broken icon:** `solar:maximize-minimalistic-bold` → HTTP 404 (empty expand-hint on thumbnails). Replaced with the valid `solar:maximize-square-bold`. (Arrow + close icons verified 200.)
- **Prev-button visibility + overlay position:** the overlay was `position: fixed` inside the island's DOM. To eliminate any chance of an ancestor's overflow / stacking / transform affecting it, the overlay is now **portaled to `<body>`** via a `use:portal` action (`z-index: 9999`). Backdrop and preview are separate layers (backdrop = click-to-close / drag-pan / wheel-zoom; preview above it); nav buttons are a clear top layer.
- **Prominent controls:** prev/next/close buttons are now 48px, `rgba(255,255,255,.2)` + `backdrop-filter: blur` + drop-shadow — unmistakable on the dark backdrop; hover bumps to `.36`.

Verify: `tsc --noEmit` + `npm run build` clean; live page shows the valid expand icon ×4. Interaction (open / zoom / pan / nav) still browser-QA.
