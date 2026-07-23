# Sprint-19 Plan — Media Library Implementation

> Status: ✅ Completed · 2026-07-24
> Companion: [`tasks.md`](./tasks.md) · [`final-report.md`](./final-report.md)
> RCA: [`rca/`](./rca/)

---

## Context

Payload 3 has a built-in `upload` field type (`{ type: 'upload', relationTo: 'media' }`) — not just collection-level `upload: true`. Pattern: a single `media` collection holds ALL images; other collections reference via `{ type: 'upload', relationTo: 'media' }`.

**Before:** all images rendered as gradient backgrounds + iconify icons. `screenshots` were `{bannerColor, icon}` objects. `renderLexical()` dropped inline upload nodes.

## Goal

Add `media` collection → wire to Authors (+avatar), Projects (+bannerImage, screenshots → upload hasMany), Articles (+featuredImage), SiteConfig (+avatar). Fix Lexical renderer for inline images.

## Phasing

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Create Media collection with image sizes | ✅ |
| 1 | Wire upload fields to 5 collections | ✅ |
| 2 | Frontend rendering with fallback | ✅ |
| 3 | Data-sync: media in export/import | ✅ |
| 4 | Verify: tsc + test + build | ✅ |

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Single `media` collection | Payload's `upload` field natively references one collection |
| Keep `bannerColor`/`bannerIcon` as fallback | No-image projects/articles still look good |
| `hasMany: true` for screenshots | Multiple screenshots per project |
| `mimeTypes: ['image/*']` | Visual media only; Documents handles general files |
| Media in data-sync | Full backup must include uploaded images |
| Use Payload's `url`/`thumbnailURL`/`sizes` fields | Don't reconstruct paths from `filename` — Payload provides correct relative URLs |
| `API_ORIGIN + field.url` pattern | Payload mounts under `/api/[...slug]`, so all URLs are `/api/media/file/...` |
| No upload field on Users (auth collection) | Breaks create-first-user flow — profile photos on Author + SiteConfig |

## Issues encountered (5 RCA documents)

| Issue | RCA |
|------|-----|
| 404 on all images | [media-url-404.md](./rca/media-url-404.md) |
| 500 on sized images | [sharp-not-configured.md](./rca/sharp-not-configured.md) |
| create-first-user 500 with avatar field | [create-first-user-upload.md](./rca/create-first-user-upload.md) |
| Seed fails after screenshots schema change | [seed-screenshots-mismatch.md](./rca/seed-screenshots-mismatch.md) |
| Seed fails on fresh DB (no tables) | [seed-schema-push-deadlock.md](./rca/seed-schema-push-deadlock.md) |
