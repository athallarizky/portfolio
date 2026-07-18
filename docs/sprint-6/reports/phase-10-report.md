# Phase 10 Report — Feature Flags

> Completed: 2026-07-14

---

## 1. What was built

Three CMS-driven feature flags to control frontend visibility without code deploys:

| Flag | Location | What it does when turned OFF |
|------|----------|------------------------------|
| `showItems` (select) | Home global | Hides individual home sections (hero/stats/about/currently/skills) — data still flows, just doesn't render |
| `contactFormEnabled` (checkbox) | SiteConfig global | Replaces contact form with "temporarily unavailable" message; API `/api/contact` returns 503 |
| `documentsEnabled` (checkbox) | SiteConfig global | Replaces document downloads with "temporarily unavailable" message |

## 2. Files changed

| File | Change |
|------|--------|
| `backend/src/globals/Home.ts` | Added `showItems` select field (5 options, hasMany, defaultValue: all) |
| `backend/src/globals/SiteConfig.ts` | Added `contactFormEnabled` and `documentsEnabled` checkbox fields (default: true) |
| `backend/src/seed.ts` | Added `contactFormEnabled: true, documentsEnabled: true` to site-config seed |
| `frontend/src/lib/api-types.ts` | Added `showItems: string[]` to Home, `contactFormEnabled: boolean` and `documentsEnabled: boolean` to SiteConfig |
| `frontend/src/pages/index.astro` | Added `visible` Set + conditional rendering per section |
| `frontend/src/pages/contact.astro` | Added `safeFetch` for siteConfig + ternary guard |
| `frontend/src/pages/api/contact.ts` | Rejects POST with 503 when `contactFormEnabled` is false |
| `frontend/src/pages/documents.astro` | Added `safeFetch` for siteConfig + ternary guard |

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| `showItems` uses a single select field, not individual booleans | One field, cleaner admin UI, no extra fetches — data already comes via the Home global |
| Toggled sections don't remove data from the API response | Simplifies the frontend — no conditional fetching logic. If data exists but isn't rendered, it's invisible to the user, same effect |
| Astro ternary (`condition ? <div>... : <div>...`) instead of `{#if}` | Astro's `{#if}` doesn't support `!` negation; ternaries are cleaner for simple toggles |
| Added `if (!form) return` guard in contact inline script | Prevents JS errors when the form doesn't exist in the DOM (toggle off) |

## 4. Verification

- `npx astro build` succeeds
- All flags default to ON in seed — zero visual change from previous behavior
- Backend admin: `showItems` multi-select + two checkboxes visible and functional
