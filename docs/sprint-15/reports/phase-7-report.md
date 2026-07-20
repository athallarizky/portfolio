# Phase 7 Report — Verify + Docs

> Completed: 2026-07-20

All checks **run, not asserted**, against real Payload 3.85.2 + SQLite. End-to-end tests ran on a
**copy** of the DB (`payload.test.db`, gitignored) — the production `payload.db` was never mutated.

## 1. Static + unit

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm test` | **53/53** (identity 5, export 5, import 10, backfill 4, merge 8, + 21 prior) |
| `npm run build` | ✅ compiled; routes `/admin/[[...segments]]` + `/api/[...slug]` |
| Test hermeticity | merge tests inject a no-op backup → 0 real `.bak` files created during `npm test` |

## 2. End-to-end (real Payload, real SQLite adapter)

| Check | Setup | Result |
|---|---|---|
| **Hook fires on create** | `payload.create({collection:'tags'})` (no uuid provided) | uuid auto-assigned (`e0b2c994-…`) ✓ |
| **Backfill** | `DATABASE_URL=file:./payload.test.db npm run backfill:uuid` | schema-push added the `uuid` column; **66 records backfilled** across 8 collections ✓ |
| **Export v2 format** | export the backfilled DB | manifest `schemaVersion: 2`; rows carry `uuid`; relations are dual `{uuid,key}` ✓ |
| **Rename round-trip** (the core feature) | change an article's slug in the archive → import | dry-run `created:{}` (matched by uuid); real import → **6 articles still** (no duplicate), slug updated in place, old slug gone ✓ |
| **Merge** | merge author "Athalla Rizky" (loser, referenced by 6 articles) → "BARU" (winner) | dry-run `repointed: articles.author: 6`; real → loser deleted (3→2 authors), **all 6 articles repointed** to winner ✓ |
| **Cross-env align** | import a v2 archive into a fresh DB that has **no uuids** | matched by natural key → uuids written; loser's `Athalla Rizky` uuid = `58fe9152…` **identical to the archive** ✓ |
| **v1 backward-compat** | synthesize a v1 archive (plain-string relations, `schemaVersion:1`) → import | `created:{}`, **updated all, errors 0** — existing sprint-14 archives keep importing ✓ |

## 3. What "rename-safe" means now (before vs after)

| Action | Sprint-14 (natural-key identity) | Sprint-15 (uuid identity) |
|---|---|---|
| Edit a record's slug/name/title in the archive, re-import | **creates a duplicate** (old record orphaned) | **updates in place** (uuid matches) |
| Rename a relationship target between export & import | relation **breaks** (stale key) | relation **resolves by uuid** |
| Merge two duplicate records | not possible | repoints all refs, deletes the loser |

## 4. Decisions / notes

| Decision | Reason |
|----------|--------|
| E2E on a DB copy, not prod | `payload.db` untouched; test DBs/zips gitignored + cleaned after |
| Hook-create verified separately | backfill/import use `update` (hook no-op); needed a real `create` to prove the hook fires |
| Test backup injection (`opts.backup`) | keeps the merge unit tests hermetic (no filesystem, no real DB) |

## 5. Artifacts cleaned

All e2e byproducts removed: `payload.test.db*`, `portfolio.align.db*`, `portfolio-data-{test,rename,after,merged,v1}.zip`,
`portfolio-align-out.zip`, and the temporary `_hookcheck.ts`. `git status` shows only intended source + doc changes.
