# Phase 1 Report — Unified human-friendly filenames

> Completed: 2026-07-20

Shared `formatStamp(date)` in `src/data-sync/filenames.ts` → local `YYYY-MM-DD-HH-MM`. Applied to:
- `cli/export.ts` → `portfolio-data-YYYY-MM-DD-HH-MM.zip` (was ISO `…T…Z`).
- `cli/snapshot.ts` → `portfolio-snapshot-YYYY-MM-DD-HH-MM.zip` (was inline ISO).
- `cli/wrap-projects.ts` → refactored to call `formatStamp` (was its own inline copy; now DRY).
- `endpoints.ts` → timestamped `Content-Disposition` for `/data-export` + `/data-snapshot`.

Internal `.bak` filenames (`backupDb`, `restoreSnapshot`) **unchanged** — ISO, machine-sortable.

Admin download: `DataSyncClient.download()` now reads the server's timestamped `Content-Disposition`
filename (parses the header; falls back to the passed default), so the browser saves the dated name.

**Tests:** `filenames.test.ts` — `formatStamp` for a fixed local date + zero-padding of single-digit fields (2/2). Constructed from local components → tz-independent.
