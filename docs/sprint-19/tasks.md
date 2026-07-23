# Task Breakdown — Portfolio Sprint-19

> Status: ✅ Completed | 2026-07-24

---

## Phase 0 — Media Collection

| ID   | Task | Status |
|------|------|--------|
| 0.1  | Create `Media.ts` with upload config, image sizes, alt/caption | ✅ |
| 0.2  | Register in `payload.config.ts` + add `sharp` | ✅ |
| 0.3  | Add `'media'` to `CONTENT_COLLECTIONS`, `NATURAL_KEYS`, `IMPORT_ORDER` | ✅ |
| 0.4  | Generate types (`payload generate:types`) | ✅ |

## Phase 1 — Wire Upload Fields

| ID   | Task | Status |
|------|------|--------|
| 1.1  | Authors: add `avatar` upload field | ✅ |
| 1.2  | Projects: add `bannerImage`, replace `screenshots` array with `upload hasMany` | ✅ |
| 1.3  | Articles: add `featuredImage` upload field | ✅ |
| 1.4  | SiteConfig: add `avatar` upload field | ✅ |
| 1.5  | Users: skip (breaks create-first-user) | ❌ reverted |

## Phase 2 — Data-sync

| ID   | Task | Status |
|------|------|--------|
| 2.1  | Export: generalize isUpload + media bundle path to `media/<collection>/<filename>` | ✅ |
| 2.2  | Import: generalize isUpload + backwards-compat read | ✅ |
| 2.3  | Fix seed: remove `screenshots` from seed data, reset DB + re-seed | ✅ |

## Phase 3 — Frontend

| ID   | Task | Status |
|------|------|--------|
| 3.1  | `api-types.ts`: add `Media`, update Author/Project/Article/SiteConfig | ✅ |
| 3.2  | `render-lexical.ts`: handle `upload` node → `<img>` | ✅ |
| 3.3  | `blog/[slug].astro`: banner + author avatar with fallback | ✅ |
| 3.4  | `projects/[slug].astro`: banner + screenshots with fallback | ✅ |
| 3.5  | `index.astro`: hero avatar with fallback | ✅ |
| 3.6  | `Screenshots.svelte`: render actual images, lightbox, fallback | ✅ |
| 3.7  | `api.ts`: `API_ORIGIN` + `mediaUrl()` helper | ✅ |

## Phase 4 — Verify & Docs

| ID   | Task | Status |
|------|------|--------|
| 4.1  | `tsc --noEmit` (frontend + backend) | ✅ |
| 4.2  | `npm test` (68/68) | ✅ |
| 4.3  | `npm run build` (frontend + backend) | ✅ |
| 4.4  | Write final report | ✅ |
| 4.5  | Write 5 RCA documents | ✅ |

### Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Media Collection | 4 | ✅ |
| 1 — Wire Fields | 5 | ✅ (1 reverted) |
| 2 — Data-sync | 3 | ✅ |
| 3 — Frontend | 7 | ✅ |
| 4 — Verify & Docs | 5 | ✅ |
| **Total** | **24** | ✅ |
