# Task Breakdown — Portfolio Sprint-20

> Status: ✅ Completed | 2026-08-10
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery

| ID   | Task | Difficulty | Dependencies | Status |
|------|------|-----------|--------------|--------|
| 0.1  | Inventory uncommitted fixes (avatar, location chip, env.ts) | Easy | — | ✅ |
| 0.2  | Audit homepage hero (light/dark/mobile) | Easy | — | ✅ |
| 0.3  | Audit all pages: projects, blogs, documents, social, contact, 404 | Medium | — | ✅ |
| 0.4  | Check motion (prefers-reduced-motion), hover/touch behavior | Medium | — | ✅ |
| 0.5  | Write phase-0 report | Easy | 0.1–0.4 | ✅ |

### Findings
- Avatar pixelated/stretched → fixed with aspect-ratio + object-fit
- Hero missing location chip → added from `siteConfig.location` (updated to "Jakarta, Indonesia")
- Clock icon color inconsistent → switched from `Icon.svelte` to `<iconify-icon>` inline
- "Currently" card stretching to match "About" height → `align-self: start`
- Skills should live under Currently → restructured layout to right-column stack
- **safeFetch query filter failed** — bracket `[]` not URL-encoded for Payload
- **showItems missing `featuredProjects` + `latestWriting`** — set in production DB but not exported

## Phase 1 — Homepage Hero

| ID   | Task | Difficulty | Dependencies | Status |
|------|------|-----------|--------------|--------|
| 1.1  | Avatar fix: aspect-ratio 1:1, object-fit cover, soft rounded | Easy | — | ✅ |
| 1.2  | Location chip: render `siteConfig.location` in hero | Easy | — | ✅ |
| 1.3  | Update `location` value to "Jakarta, Indonesia" (local DB) | Easy | — | ✅ |
| 1.4  | Verify hero renders (light/dark/mobile) | Easy | 1.1–1.3 | ✅ |
| 1.5  | Commit hero fixes | Easy | 1.4 | ⬜ (bundled) |

## Phase 2 — Logic Hardening

| ID   | Task | Difficulty | Dependencies | Status |
|------|------|-----------|--------------|--------|
| 2.1  | `lib/env.ts` single source of truth — verify all consumers | Easy | — | ✅ |
| 2.2  | **safeFetch bracket encode fix** — `[]` → `%5B`/`%5D` | Medium | — | ✅ |
| 2.3  | **showItems restore** — add `featuredProjects` + `latestWriting` to DB | Medium | — | ✅ |

## Phase 3 — UI Audit

| ID   | Task | Difficulty | Dependencies | Status |
|------|------|-----------|--------------|--------|
| 3.1  | Clock icon: use `<iconify-icon>` for theme-consistent color | Easy | — | ✅ |
| 3.2  | Layout restructure: About (left) | Currently → Skills → Find me (right) | Medium | — | ✅ |
| 3.3  | "Currently" card: `align-self: start` to fix stretch | Easy | — | ✅ |
| 3.4  | Remove "Local time {time}" from currently list (DB) | Easy | — | ✅ |
| 3.5  | Aurora effect: WebGL shader behind hero, black overlay | Hard | — | ✅ |
| 3.6  | Remove SpotlightEffect (cursor-follow glow) from hero | Easy | — | ✅ |

## Phase 4 — Verify & Docs

| ID   | Task | Difficulty | Dependencies | Status |
|------|------|-----------|--------------|--------|
| 4.1  | `tsc --noEmit` (frontend) | Easy | — | ✅ |
| 4.2  | Verify homepage renders all sections locally | Easy | — | ✅ |
| 4.3  | Write RCA: safeFetch bracket encode | Easy | 4.2 | ✅ |
| 4.4  | Write RCA: showItems incomplete in export | Easy | 4.2 | ✅ |
| 4.5  | Write final report | Easy | 4.3–4.4 | ✅ |

### Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery | 5 | ✅ |
| 1 — Homepage Hero | 5 | ✅ 1.1–1.4 done, 1.5 bundled |
| 2 — Logic Hardening | 3 | ✅ |
| 3 — UI Audit | 6 | ✅ |
| 4 — Verify & Docs | 5 | ✅ |
| **Total** | **24** | ✅ |
