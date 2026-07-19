# Phase 4 Report — Interactions & Cleanup

> Completed: 2026-07-19

---

## 1. How to Run

```bash
cd frontend && ./node_modules/.bin/tsc --noEmit && npm run build   # ✅ clean
cd frontend && npm run dev                                         # http://localhost:4321 — interact in browser
```

## 2. What Changed

**New files:**
- `frontend/src/lib/actions/glow.ts` — `glow` Svelte action; writes `--gx/--gy` (%); self-disables on touch / reduced-motion.
- `frontend/src/components/home/GlowGrid.svelte` — slot-wrapper island; imperatively applies `glow` to every slotted `.glowable` descendant (keeps cards as SSR Astro, one tiny hydration per grid).
- `frontend/src/components/home/MagneticButton.svelte` — `<span class="magnetic">` slot wrapper; ≤6px pull within 40px, springs back; `$effect` guards for fine-pointer + reduced-motion (SSR-safe).
- `frontend/src/components/home/Reveal.svelte` — one-shot IntersectionObserver, `root: el.closest('.content-scroll')`, threshold 0.15; reduced-motion → `.is-in` immediately.

**`frontend/src/pages/index.astro` rewired:**
- Hero CTAs + CTA button wrapped in `<MagneticButton client:visible>` (3 instances).
- Work grid wrapped in `<Reveal>` → `<GlowGrid>` (cursor-tracking glow); work cards get `glowable`.
- Latest writing, About/Currently grid, Skills/Find-me grid, CTA wrapped in `<Reveal>`; those cards get `glowable`.
- Legacy load-time `reveal` + `--d` removed from below-fold cards (hero + stats keep load-time reveal).
- Skill tags get `style="--i:{i}"` + `.skills-chips` container for stagger.

**`frontend/src/styles/styles.css`:** `.glowable` (radial `::after`, content z-indexed above), `.reveal-io`/`.is-in`, `.magnetic`, `.skills-chips` stagger (`@keyframes skill-in`, `--i*40ms`), reduced-motion guards (reveal shown, magnetic no-transition, stagger off, glow hidden).

**`frontend/src/data/home.ts`** — already deleted (task 4.6, done early; confirmed zero imports).

## 3. Test Results

| Check | Result |
|-------|--------|
| local `tsc --noEmit` | ✅ exit 0 |
| `npm run build` | ✅ Complete! 821ms, frontend/dist |
| Runtime SSR (curl :4321/) | ✅ HTTP 200, 70 KB, no `TypeError`/`ReferenceError`/500 markers |
| Rendered sections | ✅ hero/stats/about/currently/skills(12)/findme(2)/CTA all in DOM; gating pipeline proven |
| Interaction QA (glow/magnetic/reveal) | ⏳ deferred to browser (Phase 5) — client-side, fires on pointer/scroll |

## 4. ⚠️ Key Finding — new sections need admin toggles to appear

Live dev DB state (queried directly):

```
home.showItems = ['hero','stats','about','skills','contactCta','currently','findMe']
                 — NO 'featuredProjects' / 'latestWriting'
projects        = all 6 have showOnHome:false
```

So **Selected work** and **Latest writing** are correctly gated off (`visible.has(...) && docs.length > 0`). This is **data state, not a code bug** — the same gating path renders every other section.

The `home.showItems` value is **manually customized** by the owner (note `contactCta` before `currently`/`findMe`), so a re-seed would clobber their ordering. Recommended owner actions in `/admin`:

1. **Home global → showItems:** add *Featured projects* + *Latest writing* ( Latest writing then renders live — 6 articles are published).
2. **Projects:** tick `showOnHome` on the 3 to feature (or `npm run seed:projects` if no manual project edits to lose — note: it won't touch the Home global).

## 5. Key Decisions

| Decision | Reason |
|----------|--------|
| `GlowGrid` slot-wrapper applies the action imperatively | lets work cards stay plain Astro (SSR); only the wrapper hydrates |
| `.glowable` default centered glow (`var(--gx,50%)`) | all glowable cards get a hover glow even pre-hydration; action upgrades to cursor-tracking |
| Below-fold sections migrated load-time `.reveal` → `Reveal` (IO) | scroll-aware entrance; hero/stats stay load-time (above fold) |
| Skill stagger scoped to `.reveal-io.is-in` | fires when the skills section actually reveals, not on page load |
| Not re-seeding the dev DB | owner's `showItems` is custom-ordered; re-seed would overwrite it |

## 6. Reference Files

| File | Purpose |
|------|---------|
| `frontend/src/lib/actions/glow.ts` | `glow` action |
| `frontend/src/components/home/{GlowGrid,MagneticButton,Reveal}.svelte` | interaction islands |
| `frontend/src/pages/index.astro` | wiring |
| `frontend/src/styles/styles.css` | `.glowable`/`.reveal-io`/`.magnetic`/stagger + guards |
