# RCA: Media URL Resolution (404 on images)

> Date: 2026-07-24 · Sprint-19 · Severity: High
> Related: `frontend/src/lib/api.ts`, `frontend/src/pages/**/*.astro`, `Screenshots.svelte`

---

## What happened

All images rendered with broken sources (`src="/api/media/file/..."` on frontend port 4321), returning 404. The frontend (Astro dev server on port 4321) was requesting images from itself instead of the backend (Payload on port 3000).

## Root cause

Three sequential mistakes in URL construction:

1. **Hardcoded relative paths.** All image `src` attributes used `/api/media/file/...` — relative to the current origin (frontend port 4321), not the backend (port 3000).

2. **Wrong assumption about `/api/` prefix.** We initially assumed Payload serves uploads at root (`/:slug/file/:filename`) like standard Payload, so we stripped `/api` via `API_ORIGIN`. But this project configures Payload under `/api/[...slug]` (Next.js route), so media files are actually served at `/api/media/file/:filename`.

3. **Wrong image size filename pattern.** We guessed size files would be named `thumbnail-filename` / `hero-filename`, but Payload 3 actually uses `filename-WxH.ext` (e.g., `file-400x300.png`). We tried to hardcode these instead of using Payload's response fields (`url`, `thumbnailURL`, `sizes.hero.url`).

4. **Manual URL construction instead of Payload fields.** Payload's REST API response already includes correct relative URLs in `url`, `thumbnailURL`, and `sizes.<name>.url`. We should have used these directly instead of reconstructing from `filename`.

## Timeline

| Time | Event |
|------|-------|
| 23:31 | Initial implementation: hardcoded `/api/media/file/card-${filename}` |
| 23:57 | First deploy — images 404 |
| 23:58 | Fix 1: switch to `API_ORIGIN` (strip /api) — broken, Payload serves at `/api/media/file/...` |
| 00:02 | Fix 2: revert to `${API}/media/file/...` — correct path, but 500 on sized files (sharp not configured) |
| 00:08 | Fix 3: add `sharp` to Payload config — existing files still 500 (uploaded before sharp) |
| 00:13 | Fix 4: use `field.url` from Payload response with `API_ORIGIN` prepend — works |
| 00:28 | Final: helper `mediaUrl()`, use `sizes.hero.url` / `thumbnailURL`, `API_ORIGIN + field.url` pattern everywhere |

## Resolution

1. Added `sharp` to `payload.config.ts` for image resizing
2. Created `mediaUrl()` helper in `api.ts` that prepends `API_ORIGIN` to Payload's relative `url`
3. All image sources use `media.sizes.<size>.url` or `media.thumbnailURL` from the API response
4. `API_ORIGIN = 'http://localhost:3000'` strips `/api` suffix so `${API_ORIGIN}/api/media/file/...` = correct full URL

## Prevention

- Always use Payload's response fields (`url`, `thumbnailURL`, `sizes`) instead of reconstructing paths from `filename`
- Test image loading on dev server BEFORE declaring feature done
- Verify Payload mount path (`/api/[...slug]` sets all routes under `/api/`)
