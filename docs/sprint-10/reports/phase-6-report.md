# Phase 6 Report — Revision: Home layout + hero glow

> Completed: 2026-07-19 · Trigger: owner requests after Phase 5

---

## 1. What changed

Owner asked to relocate the two sprint-10 sections so they sit **below Skills/Find-me**
and **above the "Let's talk" CTA**.

**Before:** Hero → Stats → **Selected work → Latest writing** → About/Currently → Skills/Find-me → CTA
**After:**  Hero → Stats → About/Currently → Skills/Find-me → **Selected work → Latest writing** → CTA

Only `frontend/src/pages/index.astro` changed: the Selected work + Latest writing
blocks were moved as a unit (cut from after Stats, pasted before the CTA). No logic,
CSS, gating, or markup-content changes — pure reorder.

## 2. How to Run / Verify

```bash
cd frontend && npm run build                       # ✅ Complete! (899 ms)
grep -nE 'HERO|STATS|SELECTED WORK|LATEST WRITING|ABOUT|SKILLS|CONTACT CTA' src/pages/index.astro
```

Section-comment order confirmed: HERO(40) → STATS(84) → ABOUT(87) → SKILLS(126) →
SELECTED WORK(163) → LATEST WRITING(193) → CONTACT CTA(216).

## 3. Test Results

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Complete! 899 ms |
| Section order (grep) | ✅ matches requested order |
| Section logic/gating | unchanged (still `visible.has(...) && docs.length > 0`) |

## 4. Notes

- The ⚠️ owner admin actions from the final-report §8 still apply (add
  `featuredProjects`/`latestWriting` to `showItems`; tick `showOnHome` on projects)
  — moving the sections doesn't change their data requirements.
- Interaction wrappers (`Reveal`/`GlowGrid`) moved with the sections intact.

---

## 5. Hero cursor-glow fix (6.3)

**Symptom:** the hero's purple spotlight never followed the cursor (stuck at its
default `30%/25%`), while the Selected-work cards tracked correctly.

**Root cause:** `SpotlightEffect.svelte` attached its `pointermove` listener to the
`.hero-spotlight` overlay div — but that div is `pointer-events: none` (it's a pure
visual layer), so the listener **never fired** and `--mx/--my` never updated.

**Fix:** listen on the `.hero` section instead (pointermove bubbles up from its
children), set `--mx/--my` on the section (custom properties inherit down to the
overlay), and add the same `matchMedia('(hover: hover) and (pointer: fine)')` +
`prefers-reduced-motion` guards the work-card `glow` action uses.

```diff
- let heroEl: HTMLElement;
- heroEl.addEventListener('pointermove', move);          // overlay is pointer-events:none → never fires
+ let glowEl: HTMLElement;
+ const hero = glowEl.closest('.hero');                   // listen on the hero section
+ if (!fine.matches || reduced.matches) return;           // guard (matches `glow` action)
+ hero.addEventListener('pointermove', move);
```

**Files:** `frontend/src/components/home/SpotlightEffect.svelte` only.
**Verify:** `npm run build` ✅ clean. (Cursor-tracking is client-side — confirm in browser.)
