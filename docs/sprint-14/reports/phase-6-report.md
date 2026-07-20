# Phase 6 Report — Admin UI + endpoints

> Completed: 2026-07-20
> Companion: [`../resources/api-contract.md`](../resources/api-contract.md)

## 1. How to run
```bash
cd backend && npm run dev      # http://localhost:3000
# Admin: http://localhost:3000/admin/data-sync  (log in first)
# Endpoints: GET /api/data-export · POST /api/data-import · GET /api/data-snapshot
```

## 2. What was built
- `endpoints.ts` — three admin-only endpoints wrapping the engine: `data-export` (GET → zip), `data-import` (POST multipart `file` + `dryRun` → `ImportReport`), `data-snapshot` (GET → zip). Every handler: `if (!req.user) return 401`.
- `payload.config.ts` — `endpoints: dataSyncEndpoints` + `admin.components.views.dataSync` (`/admin/data-sync`).
- `admin/DataSyncView.tsx` (server) + `admin/DataSyncClient.tsx` (`'use client'`) — the buttons: Download content / Upload content (dry-run toggle) / Download snapshot, hitting the endpoints.
- `version.ts` — shared `resolvePkgVersion` (used by export CLI + endpoint).
- `generate:importmap` — registered `"/data-sync/admin/DataSyncView#DataSyncView"`.

## 3. Test results
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` (next build) | ✅ compiled successfully; routes `/admin/[[...segments]]` + `/api/[...slug]` |
| `GET /api/data-export` (no auth) | **401** |
| `GET /api/data-snapshot` (no auth) | **401** |
| `POST /api/data-import` (no auth) | **401** |
| `GET /admin/data-sync` | **200** (view registered + reachable) |

## 4. Key decisions / deviations
- **`DefaultTemplate` does not exist** in `@payloadcms/ui` v3.85 (the Context7 snippet was outdated). Custom views registered via `admin.components.views` render inside Payload's admin shell automatically, so the view component just provides content (server wrapper + interactive client).
- **No `/api/db-restore` endpoint** (deviation from the original task list) — restoring overwrites the SQLite file the running server holds open (lock). Restore stays **CLI-only** (`snapshot:restore`, backend stopped). The UI offers download-snapshot only.
- **`req.formData()`** for the upload (standard web `Request` API) rather than `req.file` — framework-agnostic.
- Full interactive UI testing (logged-in click-through) is a **manual visual-QA step** for the owner; wiring + auth + build are verified here.

## 5. Reference files
`backend/src/data-sync/{endpoints,version}.ts`, `backend/src/data-sync/admin/{DataSyncView,DataSyncClient}.tsx`, `backend/src/payload.config.ts`
