# Phase 4 Report — Import engine (sync + bulk-update)

> Completed: 2026-07-20
> Companion: [`phase-1-report.md`](./phase-1-report.md) · [`../resources/data-design.md`](../resources/data-design.md) §5

## 1. How to run
```bash
cd backend
ZIP=portfolio-data-<ISO>.zip
npm run import -- "$ZIP" --dry-run     # report only, zero writes
npm run import -- "$ZIP"                # upsert-merge (backs up payload.db first)
```

## 2. What it does
`importFromArchive(payload, zip, { dryRun })`: validate manifest → (real run) take a `.preimport.bak` → upsert each collection in dependency order by natural key → resolve relationships natural-key→id (2nd pass for self-ref `relatedArticles`) → MD→Lexical for bodies → re-upload Documents media → upsert globals. Required refs that can't resolve abort that row (counted in `errors`); hasMany refs drop unresolved silently.

## 3. Test results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm test` (units incl. relations) | **21/21 pass** |
| Dry-run on main DB | `updated` counts **== export manifest**, **0 errors** |
| Fresh-DB import (created path) | `created` counts **== manifest** (4/7/9/2/6/24/6/7), **0 errors** |
| Idempotent re-import | `updated`, **0 duplicates, 0 errors** |

**Relation verify (depth:1 on fresh import):**
- article `running-a-software-project-with-an-ai-agent` → author **"Athalla Rizky"** (required ✓), tags `["ai","workflow"]` (hasMany ✓)
- project `noteflow` → techTags `["next-js","trpc","prisma","typescript","react","vite"]` (hasMany ✓)
- document `Résumé` → category **"pinned"** (required ✓), filename re-uploaded ✓

→ Every relationship (required + hasMany + self-ref targets) resolves correctly.

## 4. Key decisions / fixes
- **Dry-run populates the resolver** with *existing* ids (not just would-create) so downstream required relations can be checked without writes. Fixed mid-phase (initial version left the resolver empty → false errors).
- **`backupDb` names the backup after the actual DB file** (`path.basename(dbPath)`), not hardcoded `payload.db` — correct when `DATABASE_URL` points elsewhere (e.g. test DBs). Fixed mid-phase.
- **`filename` stripped from document import data** — it's Payload-auto-managed; the `file` param sets it.
- **"unchanged" not computed** — existing rows are reported as `updated` (deep-equality vs the live doc is out of scope for v1); noted in the report.
- Pre-import backup + manifest version guard + admin-only endpoints (Phase 6) = the safety model.

## 5. Reference files
`backend/src/data-sync/{relations,import}.ts`, `backend/src/data-sync/cli/import.ts`, `backend/package.json` (`import` script)
