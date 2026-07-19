# Phase 2 Report — Notion Token Layer & Re-skin

> Completed: 2026-07-19

---

## 1. How to Run

```bash
cd frontend && npx tsc --noEmit && npx astro build   # ✅ clean
cd frontend && npm run dev                            # http://localhost:4321 — visual check (light/dark/mobile)
```

## 2. What Changed

All under `.home` scope (other pages pixel-unchanged). Single append to `frontend/src/styles/styles.css`:

- **Tokens (2.1):** `--n-*` set on `:root` (light) + remapped on `.dark`. Exact values from AGENTS.md §4.3 / architecture.md §5. Dark aliases shell surfaces (`--n-canvas: var(--card)`, `--n-hairline: var(--border)`) and uses `color-mix` for tints — cohesion with the dark sidebar/header over Notion-purity (spec has no dark tokens).
- **Base/typography (2.2):** `.home` body → `--n-charcoal`; headings/card-titles → `--n-ink`; `.text-desc` → `--n-slate`. Type scale per arch §5.
- **Hero (2.3):** canvas surface + hairline; dot-grid + spotlight kept (spotlight now `--n-primary`-tinted); micro-uppercase eyebrow (11px/600/+0.08em/stone); name `clamp(32px,4vw,40px)`/600/−0.02em; pill meta chips on `--n-surface`; buttons → **8px rectangles**, primary `--n-primary` purple, outline hairline-strong.
- **Stats (2.4):** 4 separate cards → **single `--n-surface` band** (12px radius), cells divided by `--n-hairline-soft`; count-up logic in `CountUpStats.svelte` untouched. Mobile → 2×2 with clean dividers.
- **About/Currently + Skills/Find-me (2.5):** cards → flat hairline + 12px radius + level-1 hover shadow (light) / border-shift (dark); **Currently = lavender tint card** (`.is-currently`, markup added in `index.astro`); skill tags → pastel lavender badge-tags that deepen on hover; find-me links → surface tiles.
- **CTA (2.6):** centered `--n-surface` band.
- **Dead CSS removed (2.7):** `.now-live`, `.pulse`, `.pulse::after`, `#local-time`, `.skill-tag`, `.skill-tag:hover`, `.findme-link .ext` — all confirmed zero usages in markup (grepped). Also dropped the `.pulse::after` reference from the reduced-motion block.
- **Shared primitives:** `.section-head/.section-title/.section-link`, `.tag-badge`, `.tint-0..3` defined now for Phase 3 strips.

## 3. Test Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx astro build` | ✅ Complete! server built in 850ms, no errors |
| Dead-CSS usage grep | ✅ all 5 selectors have zero markup references |
| Specificity | ✅ all overrides are `.home …` (0,2,0)+, beating the unscoped baselines (0,1,0) |

## 4. Key Decisions / Deviations

| Decision | Reason |
|----------|--------|
| Purple `--n-primary #5645d4` for CTAs (not Notion blue) | Continuity with the existing purple shell (`--secondary`); blue `--n-link` kept for inline links only. Documented plan §3 deviation. |
| Currently tint via added `.is-currently` class | Explicit/robust vs fragile `:nth-child` on the grid |
| Skill tags uniform lavender (deepen on hover) | Notion restraint; per-tag colour cycling reserved for Phase 3 work tech-tags (`tint-i%4`) |
| Kept inline `var(--secondary)` on CTA icon + foot heart | Already purple, aligns with palette; avoids markup churn |
| No-hover guarded with `@media (hover: hover)` | Touch devices get no lift/glow (Phase 4.5 hardens this) |

## 5. ⚠️ Handoff / Content Notes

- **Hero eyebrow content:** the micro-uppercase style suits a role label (e.g. `FULL-STACK ENGINEER`); current seed `hero.eyebrow` is `"// hello, I'm"` → renders `// HELLO, I'M`. Styling is spec-correct; **content is the owner's to update in `/admin` (Home global)**. Not changed here (out of plan scope).
- **Visual QA deferred to Phase 5:** build is clean but light/dark/mobile pixel-check happens in the Phase 5 verification matrix with the dev server running.

## 6. Reference Files

| File | Purpose |
|------|---------|
| `frontend/src/styles/styles.css` | `--n-*` tokens + `.home`-scoped re-skin (appended after the home motion block) |
| `frontend/src/pages/index.astro` | `is-currently` class on the Currently card |
