# Phase 0 Report — Discovery & Setup

> Completed: 2026-07-18

---

## 1. How to Run

```bash
cd backend && npm run dev      # PayloadCMS → http://localhost:3000 (/admin, /api)
cd frontend && npm run dev     # Astro SSR → http://localhost:4321
```

## 2. What Was Explored

| Area | Method | Output |
|------|--------|--------|
| Sprint history (`docs/sprint-1..9`) | codebase exploration | Confirmed next sprint = **10**; sprint-9 (VPS/nginx/SSL) delivered 2026-07-18, not yet run on a real VPS |
| Current home page | codebase exploration | Full section/component/data-provenance breakdown (§3) |
| Design system + motion | codebase exploration | Token/component/motion catalog of `frontend/src/styles/styles.css` |
| Backend schema | direct read | `Projects.ts` fields, `Articles.publishedAt`, seed file layout (`backend/src/seed/data/*.ts`) |
| `getdesign` CLI | npm registry + GitHub + raw template fetch | What it is, what `add notion` installs (§4) |

## 3. Current Home Page (baseline)

`frontend/src/pages/index.astro` (Astro 7 SSR + Svelte 5 islands), inside `BaseLayout.astro` shell:

- **Hero** — avatar + status ping, eyebrow/name, `TypedRole` typewriter, status + `LiveClock` chips, 2 CTA buttons, dot-grid + `SpotlightEffect` pointer glow
- **Stats** — 4 cards, `CountUpStats` count-up
- **About + Currently**, **Skills + Find me** — `.grid-2` card pairs
- **Contact CTA** — hardcoded copy card
- Data: `/globals/home`, `/globals/site-config`, `/social-profiles` via `safeFetch` (silent-empty on failure). Buttons + CTA copy hardcoded.
- Motion: staggered `.reveal` load entrance, `ping`/`blink` keyframes, hover lifts; `prefers-reduced-motion` handled in CSS **and** JS.

## 4. getdesign Research

- `getdesign` (npm, VoltAgent/awesome-design-md) is a CLI that installs **`DESIGN.md`** files — markdown design-system specs (colors, type, spacing, components, motion) intended as agent reference. **Not** a component library, **not** CSS — zero runtime footprint.
- `npx getdesign@latest add notion` ✅ run at repo root → `./DESIGN.md` installed (35 KB spec of notion.com's visual language).
- Key spec traits: primary purple `#5645d4`, warm-charcoal ink `#37352f`, hairline borders, pastel card tints, 8px rectangular buttons / 12px cards, Inter-based type, 150–200ms hover motion, **no dark-mode tokens** (documented gap), navy hero band (rejected for our shell — see plan §3).

## 5. Key Findings (surprises / limitations)

1. **Root `AGENTS.md` is stale** — describes `frontend/` as the legacy sprint-1 static demo; it's actually the Astro + Svelte app since sprint-3. (Fix in Phase 5.)
2. **Bug: seeded `currently` item `'Local time {time}'`** renders the literal `{time}` — the sprint-1 JS substitution was never ported. (Fix in Phase 1; user confirmed.)
3. **Dead code:** `frontend/src/data/home.ts` (zero imports since sprint-4) and CSS selectors `.now-live`, `.pulse`, `.skill-tag`, `#local-time`, `.findme-link .ext` (no matching markup).
4. **Default mismatch:** page-level fallback `visible` set omits `findMe`/`contactCta`; backend `showItems` default includes them. (Align in Phase 3.)
5. **Scroll container:** body is pinned (`overflow: hidden`) — only `.content-scroll` scrolls. Scroll-reveal IO must root at `.content-scroll`, not the viewport.
6. **Spec fit is good:** Notion's Inter-based type + purple primary converge with the existing Blinko style — evolution, not clash. Dark tokens must be invented (mapped in `resources/architecture.md` §5).

## 6. Decisions Made (with owner, during planning)

| Question | Decision |
|----------|----------|
| New sections? | **Both** — Selected work + Latest writing, following the Notion `DESIGN.md` |
| Interactions? | **All four** — card cursor glow, magnetic buttons, scroll-aware reveals, interactive skill tags |
| Backend access? | Allowed — `showOnHome` flag, `showItems` options, **plus fix the `{time}` seed item** |
| Design source | `DESIGN.md` (notion) at repo root; home-scoped application, other pages untouched |
| Sprint number | **10** (sprints 1–9 exist) |

## 7. Phase-0 Deliverables

- [x] `DESIGN.md` installed at repo root
- [x] `docs/sprint-10/plan.md`, `tasks.md`, `AGENTS.md`
- [x] `docs/sprint-10/resources/architecture.md` (token mapping + decisions)
- [x] `docs/sprint-10/resources/ux-flow.md` (wireframes + interaction spec)
- [x] `docs/sprint-10/resources/data-design.md` (queries + schema changes)
- [x] This report
