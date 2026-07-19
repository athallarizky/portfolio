# Phase 14 Report — Final polish: collapsed-sidebar fixes + global Notion token alignment

> Completed: 2026-07-19 · Trigger: owner request ("last phase").

---

## 1. Collapsed sidebar bottom row — theme + expand in a row (14.1)

When the sidebar collapses to its 72px rail, the bottom row holds two `.icon-btn`s
(ThemeToggle + the expand toggle). At 72px width with `padding: 1rem`, the content area
is only ~40px, but the two 32px-min-width buttons need 68px — so they overflowed and the
expand button was clipped.

`styles.css`:
```css
.sidebar.is-collapsed { width: 72px; padding-left: .5rem; padding-right: .5rem; }
.sidebar.is-collapsed .sidebar-bottom { justify-content: center; gap: .25rem; }
@media (min-width: 768px) {
  .sidebar.is-collapsed .sidebar-bottom .icon-btn { width: 26px; height: 26px; min-width: 26px; min-height: 26px; }
}
```
Tighter collapsed padding gives ~56px of content; two 26px buttons + 4px gap = 56px → both
fit, centered, in a flex row. Scoped to `min-width: 768px` so the mobile drawer (forced to
256px) keeps its 44px touch targets.

## 2. Scrollbar "moving left" on collapse — root cause + fix (14.2)

**Symptom:** collapsing the sidebar shifted the main content (and its scrollbar) ~184px
inset from the right edge of the viewport.

**Root cause:** Astro renders Svelte islands inside a custom `<astro-island>` element
(`display: contents` for layout, but it is still a real DOM node). So the DOM is:
```html
<div class="layout">
  <astro-island …> <aside class="sidebar">…</aside> </astro-island>
  <main class="main">…</main>
</div>
```
`.sidebar` and `.main` are therefore **not siblings** — `.sidebar`'s parent is
`<astro-island>`, `.main`'s parent is `.layout`. The rule that widens main on collapse:
```css
.sidebar.is-collapsed ~ .main { width: calc(100% - 72px); }
```
uses the general-sibling combinator `~`, which only matches elements that share a parent.
It never matched. So on collapse the sidebar shrank to 72px but `.main` stayed at
`calc(100% - 256px)`, leaving `256 - 72 = 184px` of empty space where the sidebar was.
`.main`'s right edge (and its scrollbar) sat 184px from the viewport's right edge → the
"moved left" effect. (`display: contents` does not affect DOM selector matching, only box
generation.)

**Fix:** target `.main` through the shared `.layout` ancestor with `:has()`:
```css
/* `.sidebar` lives inside an <astro-island> wrapper, so it is NOT a DOM sibling of
   `.main` — a `~ .main` selector never matches. Use :has() on the shared .layout
   ancestor so `.main` actually widens when the sidebar collapses. */
.layout:has(.sidebar.is-collapsed) .main { width: calc(100% - 72px); }
```
`:has()` traverses the full subtree regardless of the island wrapper, so `.main` now
correctly widens to `calc(100% - 72px)` on collapse — the gap closes and the scrollbar
stays at the viewport's right edge. `:has()` is supported in all current browsers
(Chrome 105+, Safari 15.4+, Firefox 121+).

## 3. Global Notion token alignment (14.3)

Every non-home page, plus the shared sidebar and top nav, used the pre-re-skin global
tokens (`--primary: black`, neutral `#f8f8f8` canvas, heavy shadow) — out of step with the
Notion `--n-*` layer applied to the home page in Phase 2. Aligned the globals so the whole
site reads as one system. `styles.css` `:root` / `.dark`:

| Token | Before | After | Rationale (DESIGN.md) |
|-------|--------|-------|-----------------------|
| `--primary` (light) | `black` | `#5645d4` | The single structural accent. Active sidebar link, primary buttons, scrollbar thumb, active chips now use the accent instead of black. |
| `--primary` (dark) | `#f9f9f9` | `#7c6fe4` | Dark-mode accent (matches home `--n-primary` dark). |
| `--primary-foreground` (dark) | `#000` | `#fff` | On-accent text in dark mode. |
| `--secondbackground` | `#f8f8f8` | `#f6f5f4` | Warm `canvas-soft` — "warm paper-soft canvas over pure white, never clinical." |
| `--shadow` | `1px 1px 7px 3px #b1b1b142` | `0 1px 2px rgba(0,0,0,.05), 0 4px 12px rgba(0,0,0,.04)` | Barely-there layered elevation, not a heavy cast. |
| `--desc` (light) | `#6b6b6b` | `#615d59` | Warm `ink-muted` for secondary copy. |

`--secondary` was left untouched (it feeds several small accent spots — focus outlines,
form-focus borders, doc icons, the "all" sidebar links — and its current purple is already
consistent with the accent).

### Hue note

DESIGN.md specifies `primary` as Notion **blue** `#0075de`. The home page (Phases 2–13) was
implemented with a purple-indigo accent (`--n-primary: #5645d4`), which the owner approved
across those phases. To keep the whole site consistent with the approved home-page look,
the global `--primary` was aligned to the same `#5645d4` rather than to DESIGN.md's literal
blue. Switching the entire site (home included) to `#0075de` is a one-token change if a
literal-blue reading of DESIGN.md is preferred.

## 4. Test Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ exit 0 |
| `npm run build` | ✅ Complete! |
| served CSS has `.layout:has(.sidebar.is-collapsed) .main` | ✅ present |
| old `.sidebar.is-collapsed ~ .main` | ✅ gone |
| collapsed bottom `.icon-btn { width: 26px … }` | ✅ present |
| `--primary: #5645d4` (light) / `#7c6fe4` (dark) | ✅ both present |
| `--secondbackground: #f6f5f4` | ✅ present |
| `--shadow` softened | ✅ present |
| rendered DOM confirms `<astro-island>` wraps the sidebar | ✅ (re-validates 14.2 root cause) |
| runtime errors | ✅ none |

## 5. Notes

- The `:has()` fix is the load-bearing change: it also future-proofs against any other
  sibling-based selector that would silently fail across the Astro/Svelte island boundary.
- The token alignment propagates Notion styling to **every** page/component at once because
  they all consume the global tokens (`/blogs`, `/documents`, `/social`, `/contact`,
  `/projects`, sidebar, header, cards, buttons, chips, scrollbar).
- Visual/interaction confirmation of the collapsed-rail row layout and the sidebar-collapse
  scrollbar stability is best verified in the browser (the markup + rules are confirmed in
  the served CSS).
