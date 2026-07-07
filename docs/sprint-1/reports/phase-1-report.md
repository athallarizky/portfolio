# Phase 1 Report — Setup & Foundation

> Completed: 2026-07-07
> Reconstructed retrospectively (2026-07-07) from `tasks.md` + the codebase — not written contemporaneously.

---

## 1. What was built

The foundation for a static, multi-page portfolio: the sprint doc structure,
the shared Blinko-cloned theme (`styles.css`), and the shared behavior
(`app.js`). Everything downstream composes on top of these two assets.

- `docs/sprint-1/` with `tasks.md` + `reports/phase-0-report.md`
- `assets/styles.css` — Blinko's CSS-variable theme ported to plain CSS
  (light + dark), plus base resets and scrollbar styling
- `assets/app.js` — theme toggle (persisted), active-nav highlight, mobile
  doc-height fix

---

## 2. How to run

No build step. Open any page directly:

```bash
open index.html
```

---

## 3. Files

| File                  | Purpose                                                                  |
|-----------------------|--------------------------------------------------------------------------|
| `docs/sprint-1/tasks.md`          | Task breakdown, dependency graph, status tracking              |
| `docs/sprint-1/reports/phase-0-report.md` | Discovery findings (Blinko source, theme tokens)        |
| `assets/styles.css`   | Theme tokens (`:root` + `.dark`), base, scrollbar (ported from `globals.css:163-271`) |
| `assets/app.js`       | Theme toggle, active nav, `--doc-height`, (later: drawer, collapse, title map) |

---

## 4. Key decisions

| Decision | Reason |
|----------|--------|
| Port Blinko's CSS-variable theme **verbatim** (light + dark) | Pixel-level visual fidelity to the reference; variables make theming + dark mode trivial |
| Vanilla JS, no framework/runtime | "No build step" constraint — static HTML files served as-is |
| Theme persisted in `localStorage` (`portfolio-theme`) | Survives reloads; falls back to `prefers-color-scheme` on first visit |
| Active nav derived from `location.pathname` | Each static page self-highlights its menu item without per-page wiring |
| `--doc-height` custom property (JS-set) | Avoids the mobile URL-bar resize jump (`100vh` is unreliable on mobile) |

---

## 5. Reference

- Blinko theme tokens: `temp/blinko/app/.../globals.css:163-271`
- Resulting tokens: `--background`, `--foreground`, `--primary`, `--secondary`,
  `--card`, `--border`, `--radius`, `--shadow`, `--hover`, `--muted`, `--desc`
  (and `.dark` overrides)
