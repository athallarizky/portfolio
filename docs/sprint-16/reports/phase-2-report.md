# Phase 2 Report — Wrap helper CLI

> Completed: 2026-07-20

## 1. What was built

- **`backend/src/data-sync/cli/wrap-projects.ts`** → `npm run wrap:projects -- <file.json> [-- --out <path>]`
  - Reads a JSON file (one row or an array) → assigns `randomUUID()` to rows missing one → validates
    `title` + `slug` → writes an importable zip (`manifest.json` schemaVersion 2 + `collections/projects.json`).
  - Reuses `buildManifest` + `createZip` (no new zip code).
  - Default output `portfolio-projects-<YYYY-MM-DD-HH-MM>-<slug>.zip`; **collision-safe** (appends `-2`,
    `-3`, … if the file exists); `mkdir -p` the output dir.
- **`package.json`** — `"wrap:projects"` script.
- **`.gitignore`** — `backend/portfolio-projects-*.zip`, `tools/repo-to-project/content/`,
  `tools/repo-to-project/collection/`.

## 2. Smoke test (run)

Input: one project row (no uuid). Output zip → `manifest.schemaVersion: 2`, `counts:{projects:1}`,
`collections/projects.json` row has an auto-assigned uuid + `techTags:["go","docker"]` preserved.

## 3. Test results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| wrap smoke (json → zip → manifest + projects.json) | ✓ uuid auto-assigned, v2 manifest, techTags intact |

## 4. Note

`createZip` is async (`Promise<Buffer>` — archiver streams) → the helper `await`s it. (No unit test for the
CLI itself — same as the export/import CLIs; verified by the Phase 4 e2e.)
