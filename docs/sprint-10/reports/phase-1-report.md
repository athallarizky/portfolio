# Phase 1 Report — Backend & Types

> Completed: 2026-07-19

---

## 1. How to Run

```bash
cd backend && npm run build                 # schema + types compile
cd frontend && npx tsc --noEmit             # api-types union change type-checks

# (backend dev server already running on :3000 during verification)
curl -sg 'http://localhost:3000/api/projects?where[showOnHome][equals]=true&where[status][equals]=published&sort=order&limit=3&depth=1'
curl -sg 'http://localhost:3000/api/articles?where[status][equals]=published&sort=-publishedAt&limit=3&select[title]=true&select[slug]=true&select[publishedAt]=true'
```

> **Re-seed required to see flagged projects:** the running `payload.db` was seeded
> before this change, so existing project docs have `showOnHome=false`. Run
> `cd backend && npm run seed:projects` (or toggle the checkbox in `/admin`) to
> populate the 3 flagged seed projects (NoteFlow, Rent-House-AI, DevPlatform CLI).
> Seeding touches the DB, so it is left to the owner — not done here.

## 2. Service Architecture

```
backend/src/collections/Projects.ts   + showOnHome checkbox (sidebar)
backend/src/globals/Home.ts           + showItems options: featuredProjects, latestWriting
backend/src/payload-types.ts          regenerated (showOnHome + expanded showItems union)
backend/src/seed/data/globals.ts      − 'Local time {time}' currently-item
backend/src/seed/data/projects.ts     + showOnHome?: boolean  (interface)
                                      + showOnHome: true on orders 1,2,3 (NoteFlow, Rent-House-AI, DevPlatform CLI)
backend/src/seed/phases/projects.ts   + showOnHome: proj.showOnHome ?? false  (writer mapping)
frontend/src/lib/api-types.ts         + Project.showOnHome?
                                      ~ Home.showItems: string[] → explicit union
                                      + SiteConfig.contactFormEnabled? / documentsEnabled?  (type-sync, see §4)
```

## 3. Test Results

| Check | Command | Result |
|-------|---------|--------|
| Backend build | `npm run build` | ✅ Next 16.2.10, TS check passed, `/api/[...slug]` route generated |
| Frontend types | `npx tsc --noEmit` | ✅ exit 0 (union change type-safe; index.astro `Set` usage still valid) |
| Q4 showOnHome filter | `curl …where[showOnHome][equals]=true…` | ✅ HTTP 200, `totalDocs: 0` (filter accepted; empty only because DB not yet re-seeded) |
| Q5 latest articles | `curl …sort=-publishedAt&limit=3` | ✅ HTTP 200, `totalDocs: 6` published |
| Field in API output | `/api/projects?limit=1` | ✅ `"showOnHome": false` present → schema is live |
| Correct `select` syntax | `select[title]=true&select[slug]=true&select[publishedAt]=true` | ✅ returns `id,title,slug,publishedAt` |

## 4. Key Decisions / Findings

| Decision | Reason |
|----------|--------|
| Flag exactly orders 1–3 (NoteFlow, Rent-House-AI, DevPlatform CLI) | First 3 by `order`, per data-design §4; deterministic strip |
| `Home.showItems` typed as an explicit string-literal union | Matches backend options; makes `visible.has('featuredProjects')` type-safe in Phase 3 |
| `select=title,slug,publishedAt` (AGENTS.md §4.2) is **wrong** for this Payload version | Comma-syntax returns docs with **only `id`**. Must use bracket form `select[title]=true&select[slug]=true&select[publishedAt]=true`. **Action for Phase 3.1.** |
| `SiteConfig.contactFormEnabled?` / `documentsEnabled?` kept | These are real backend fields (`globals/SiteConfig.ts:19-20`, seeded in `globals.ts:9-10`) that the frontend type was missing. Correct type-sync that was already in the working tree — out of sprint scope but harmless and accurate; left as-is. |
| `home.ts` already deleted | Task 4.6 was done early in the working tree; confirmed zero imports — deletion is safe. |

## 5. Reference Files

| File | Purpose |
|------|---------|
| `backend/src/collections/Projects.ts` | `showOnHome` checkbox (sidebar position, mirrors `SocialProfile.showOnHome`) |
| `backend/src/globals/Home.ts` | `showItems` multi-select + `defaultValue` |
| `backend/src/seed/data/projects.ts` | seed flag on first 3 projects |
| `frontend/src/lib/api-types.ts` | `Project.showOnHome?`, `Home.showItems` union |
