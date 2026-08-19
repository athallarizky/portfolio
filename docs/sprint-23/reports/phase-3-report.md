# Phase 3 Report — Workflows + runner publish script

> Completed: 2026-08-19

## 1. Files

| File | Role |
|---|---|
| `scripts/publish-content.mjs` | runner-side: login → `POST /api/data-import` (multipart: zip + dryRun + replaceOnly) → print ImportReport → non-zero exit on any error |
| `.github/workflows/publish.yml` | reusable implementation (`workflow_call`): checkout → node 22 → `npm ci` backend → `wrap:publish` from git → publish-content.mjs |
| `.github/workflows/publish-article.yml` | dispatch button → `collection: articles` |
| `.github/workflows/publish-project.yml` | dispatch button → `collection: projects` |
| `backend/src/data-sync/cli/publish-user.ts` | `npm run publish:account` — creates the service account (password via `PUBLISH_PASSWORD` env, never in shell history) |

## 2. Design notes

- **Zero VPS execution** — the workflow only makes HTTPS calls; the import runs inside the already-running Payload process.
- No slug input: replace-all ships the full collection set each run; the only input is the `dry_run` checkbox.
- `PUBLISH_BASE` env override (default `https://athallarizky.com`) lets the same workflow target any env.
- Secrets: `PUBLISH_EMAIL` + `PUBLISH_PASSWORD` (service account). See final-report §setup for the one-time owner steps.

## 3. Local E2E (proves the exact path the runner takes)

Created `publish-e2e@e2e.local` via `npm run publish:account`, then against `http://localhost:3000`:

| Step | Result |
|---|---|
| login → token | ✓ |
| articles dry-run via REST | `updated: {tags:4, articles:1, technologies:6}` · 0 errors |
| articles REAL via REST | same + backup created · 0 errors |
| projects dry-run via REST | `updated: {…, projects:5}` · 0 errors |

(The deletion path was proven live in phase 2 via the CLI — same engine, same flag semantics.)

## 4. Known limitations

- The runner builds the zip with `npm ci` on backend each run (~1 min) — acceptable for manual dispatch.
- Workflow YAML syntax-checked (no actionlint locally); first real dispatch is the owner's smoke test (dry-run first).
