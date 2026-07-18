# AGENTS.md — Sprint 6: UI Polish & Bugfixes

> **For:** any LLM agent executing sprint-6.
> **FIRST:** Read [`docs/GUIDE.md`](../../GUIDE.md) (phased workflow) + [`plan.md`](./plan.md) + [`tasks.md`](./tasks.md).
> **Mode:** one task at a time. Pick the next ⬜ task, implement, verify by running, write its phase report, update tasks.md, ask before committing.

---

## 0. What this sprint is

A **polish sprint — no new features.** Fix ~28 verified UI issues: functional bugs, fragile fetching, accessibility gaps, mobile bugs, dead CSS. Each task is small and independent.

## 1. The design system rule (non-negotiable)

This is a **Blinko clone**. Every change must match the existing aesthetic — same sidebar/header/cards, purple accent (`--secondary`), spacing, motion. **Do NOT introduce a new visual language.** Reuse tokens from `frontend/src/styles/styles.css`. See root [`../../AGENTS.md`](../../AGENTS.md) §3.

## 2. Audit findings (the source of truth)

All findings with exact `file:line` evidence are in [`reports/phase-0-report.md`](./reports/phase-0-report.md). Read it before touching anything. Each task in `tasks.md` references the finding it fixes.

## 3. Execution rules

- **One task at a time.** Mark it 🔵 in tasks.md, implement, verify, mark ✅.
- **Verify by running it** — `cd frontend && npm run dev` (`:4321`); check both light/dark + mobile widths.
- **No backend changes** unless a task explicitly says so (none do).
- **Match surrounding code** — naming, density, comment style.
- **Ask before committing** — the owner handles git (SSH-signed commits).

## 4. Key files you'll touch

| File | What's there |
|------|--------------|
| `frontend/src/styles/styles.css` | Design tokens + all component CSS (~1000 lines) |
| `frontend/src/components/ui/Icon.svelte` | Renders `<svg>` via `@iconify/svelte` (NOT `iconify-icon`) |
| `frontend/src/components/shell/Sidebar.svelte` | Nav + mobile drawer + `isActive()` |
| `frontend/src/components/shell/{Header,ThemeToggle}.svelte` | Shell controls |
| `frontend/src/layouts/BaseLayout.astro` | Shell + `<head>` + fetches nav/siteConfig |
| `frontend/src/pages/*.astro` | All pages — each hardcodes `const API` |
| `frontend/src/lib/api-types.ts` | TS types for API responses |

## 5. How to run / verify

```bash
cd backend && npm run dev    # :3000 (PayloadCMS)
cd frontend && npm run dev   # :4321 (Astro)

# After fetch-resilience work, test the error path:
# (stop backend) → pages should show a graceful error, NOT a 500

# A11y check:
npx lighthouse http://localhost:4321 --only-categories=accessibility
```

## 6. Done criteria

- [ ] All `tasks.md` rows ✅
- [ ] No `localhost:3000` hardcoded in `src/pages` (uses helper)
- [ ] Lighthouse a11y ≥ 95 on home + contact
- [ ] Mobile (375px) clean — no clipped content, touch targets ≥44px
- [ ] `prefers-reduced-motion` kills all hover transforms
- [ ] `npx astro build` succeeds; existing pages unchanged visually
