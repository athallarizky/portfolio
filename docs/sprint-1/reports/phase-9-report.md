# Phase 9 Report — Home Page Redesign

> Completed: 2026-07-07

---

## 1. What was built

Replaced the flat home page (hero card + 5 static masonry cards) with an
**interactive but minimalist** home, staying inside the existing dashboard
design system (same cards, purple `--secondary` accent, Inter font).

Signature moments:
- **Pointer-follow spotlight** — a radial purple glow tracks the cursor across
  the hero (the one memorable interaction).
- **Staggered reveal** on load — one orchestrated entrance (CSS, `--d` delays).
- **Typing role** — cycles `Full-Stack Engineer → Backend-leaning builder →
  AI-tooling tinkerer → TypeScript · Go · Python`.
- **Count-up stats** — 6+, 24, 3 animate from 0; `∞` is static.
- **Pulsing availability dot** on the avatar + a "now" pulse on the Currently
  card.
- **Live local-time clock** (Asia/Jakarta, UTC+7) in the Currently card.
- Faint **dot-grid texture** + monospace accents (`// hello, I'm`, clock,
  footer) for a dev-tool character without loading a new font.

Reorganized the lower content into a clean **2×2 card grid**: About ·
Currently · Skills · Find me (Find me links to the new Socials page).

---

## 2. Files

| File               | Change                                                          |
|--------------------|-----------------------------------------------------------------|
| `index.html`       | Content area rewritten (hero + stats + 2×2 grid); sidebar/header preserved verbatim; + `home.js` include |
| `assets/styles.css`| + Home section: `.hero`/spotlight/grid, `.stats`, `.now-*`, `.findme-link`, reveal + `ping`/`blink` keyframes, `prefers-reduced-motion` guard |
| `assets/home.js`   | NEW — typing role, count-up, pointer spotlight, live clock     |
| `docs/sprint-1/tasks.md` | + Phase 9; summary → 39 / ~11h                            |

---

## 3. Key decisions

| Decision | Reason |
|----------|--------|
| Pointer spotlight as the single signature interaction | One well-orchestrated moment > scattered micro-interactions; minimalist |
| Motion via CSS only (reveal, pulse, caret) | No library, no runtime cost; JS only for data (count/clock/role/spotlight coords) |
| `prefers-reduced-motion` disables all motion | Accessibility — counters snap to final value, pulses/caret stop |
| Monospace accent via `ui-monospace` (system) | Adds character without a new web-font request |
| Keep Inter + purple accent | Hard cohesion constraint with the other 4 pages; compensated via weight/display treatment + monospace contrast |

---

## 4. Verification

- `node --check assets/home.js` → valid.
- `index.html` div balance 44/44, section balance 6/6 — rewrite didn't break nesting.
- Home CSS selectors present; `prefers-reduced-motion` block present.

## 5. Note

Interaction (spotlight tracking, count-up, typing, clock) is verified by logic
+ syntax, not visually (no browser in this environment). Open `index.html` to
confirm the feel — especially that the hero spotlight follows the cursor and
the stats count up on load.
