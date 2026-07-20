# Phase 5 Report — DB snapshot

> Completed: 2026-07-20
> Companion: [`../resources/api-contract.md`](../resources/api-contract.md) §2

## 1. How to run
```bash
cd backend
npm run snapshot                                    # → portfolio-snapshot-<ISO>.zip
npm run snapshot:restore -- portfolio-snapshot-*.zip -- --yes   # destructive; stop backend first
```

## 2. What it does
- `createSnapshot()` — zips the active SQLite DB (`payload.db` + any `-wal`/`-shm`) + the entire `documents/` upload folder + a `snapshot-manifest.json`. No Payload boot (pure file I/O — safe to run while the backend is up).
- `restoreSnapshot(buf, { confirm })` — the **only** replace-all path: backs up the current DB, then overwrites the DB files + media. Requires `confirm: true`; the CLI also requires `--yes`. Best run with the backend **stopped** (SQLite file lock).

## 3. Test results
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| Snapshot contents | `payload.db` (626 KB) + **18 media files** (matches disk) + manifest; zip 99 KB |
| Restore round-trip | `cmp payload.db /tmp/snap-restored.db` → **byte-identical**; 18 media files restored |
| CLI guard | `snapshot:restore` without `--yes` → refuses (exit 1) |

## 4. Key decisions / fixes
- **Snapshot doesn't boot Payload** — just reads files (faster, no lock). Media dir defaults to `<cwd>/documents`.
- **WAL/SHM siblings bundled** if present (consistent SQLite backup).
- **Restore honors `dbPath`** — the DB file is written to the caller's `dbPath` (not the snapshot's basename). Fixed mid-phase (initial version always wrote `payload.db`).
- **Restore is CLI-only** (no REST endpoint) — overwriting the running server's DB would hit a SQLite lock; the UI offers download-snapshot only. Restore is an offline op.
- **Pre-restore backup is best-effort** — only if the target DB already exists.

## 5. Reference files
`backend/src/data-sync/snapshot.ts`, `backend/src/data-sync/cli/{snapshot,snapshot-restore}.ts`, `backend/package.json`
