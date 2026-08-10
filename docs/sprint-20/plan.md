# Sprint-20 Plan — Bug Fixes: Logic & UI

> Status: ✅ Completed | 2026-08-10
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-19/final-report.md`](../sprint-19/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Production (athallarizky.com) runs sprint-19 media library. After syncing local DB to production (replace-all import, 3 projects / 0 articles / 2 social profiles), several frontend logic & UI issues surfaced during a homepage review:

- Avatar image stretched/pixelated (no aspect-ratio, no object-fit) — fixed, uncommitted
- Hero missing location/domisili chip; `location` field ("Remote · UTC+7") duplicated timezone info; updated to "Jakarta, Indonesia" in local DB, uncommitted
- `API_ORIGIN`/`isDev` logic was fragile (`import.meta.env.DEV` broken by global `NODE_ENV=production`) — centralized into `lib/env.ts` (committed)

## 1. Sprint goal

Audit and fix logic + UI bugs across the portfolio frontend (and backend where needed), leaving the site consistent in light/dark/mobile, with production-safe media URLs.

## 2. Scope

**In scope:**
- Homepage hero fixes (avatar rendering, location chip) — verify + commit
- Logic hardening: `isDev`/`API_ORIGIN` single source of truth (already centralized; verify all consumers)
- UI audit: light + dark + mobile across all pages, motion (prefers-reduced-motion), hover/touch behavior
- Any logic bugs found in data fetching (`safeFetch`), rendering, links, empty states

**Out of scope:**
- New features (no new sections/pages)
- Content changes (data lives in Payload, not code)
- Design language changes (match existing aesthetic — dashboard Blinko shell + Notion home layer)

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Sprint theme = bug fixes only | User explicitly wants logic + UI bug fixes this sprint |
| Keep DB change (location → Jakarta, Indonesia) in local; sync via data-sync later | Prod sync is a separate operation, not code |
| `lib/env.ts` as single source of truth for dev/prod detection | Avoids duplicated `import.meta.env` checks (taste: centralize env logic) |

## 4. Phasing

- **Phase 0 — Discovery:** audit current bugs (homepage, pages, light/dark/mobile), inventory open fixes
- **Phase 1 — Homepage hero:** commit avatar + location fixes, verify rendering
- **Phase 2 — Logic hardening:** env centralization consumers, media URL handling, safeFetch edge cases
- **Phase 3 — UI audit:** per-page visual pass (projects, blogs, documents, social, contact, 404), mobile + reduced-motion
- **Phase 4 — Verify & docs:** tsc, tests, build, final report, update tasks.md
