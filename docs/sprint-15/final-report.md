# Sprint-15 Final Report — Content UUID Identity & Merge

> Status: ✅ Delivered | 2026-07-20
> Audience: sprint-16 context + owner. Read this + [`../../AGENTS.md`](../../AGENTS.md) (esp. §5).
> Companion: [`plan.md`](./plan.md) · [`tasks.md`](./tasks.md) · [`resources/`](./resources/) · phase reports in [`reports/`](./reports/)

---

## 1. Sprint goal & outcome

**Goal:** make record identity a stable content-level `uuid` so content survives renames/moves across
local & prod, and add a merge tool for duplicate records.

**Outcome:** ✅ Delivered and **verified by running** (53 unit tests + 6 end-to-end checks on a real
Payload/SQLite DB copy).

- **UUID identity** — every content record now has an immutable content-level `uuid` (auto-assigned on
  create by a `beforeChange` hook). Upsert/import/merge key on `uuid`; the natural key stays as the
  display handle + v1-archive fallback. **Renaming a record updates it in place instead of duplicating.**
- **v2 archive format** — relationships serialize as dual `{ uuid, key }` refs (rename-safe end-to-end).
  v1 archives (sprint-14) still import unchanged.
- **Backfill** — `npm run backfill:uuid` populates the uuid on pre-existing records, per env (uuids
  self-align across envs on the next sync).
- **Merge** — `npm run merge` + admin UI + `/api/data-merge`: combine two same-collection records,
  repoint every incoming relationship, delete the loser (dry-run + backup).

## 2. Final structure

```
backend/src/
├── data-sync/
│   ├── identity.ts        # NEW — uuidField + ensureUuid beforeChange hook (shared by 8 collections)
│   ├── identity.test.ts   # NEW
│   ├── backfill.ts        # NEW — backfillUuids() engine
│   ├── backfill.test.ts   # NEW
│   ├── merge.ts           # NEW — mergeRecords() + inverseRelations consumer + MergeError
│   ├── merge.test.ts      # NEW
│   ├── export.ts          # MOD — emit uuid + dual {uuid,key} relations (buildIdRefMaps)
│   ├── export.test.ts     # NEW
│   ├── import.ts          # MOD — uuid-first upsert + dual resolve (toRef) + v1/v2 compat; backupDb(label)
│   ├── import.test.ts     # NEW
│   ├── relations.ts       # MOD — IdResolver tracks uuid→id + key→id; resolve(uuid→key)
│   ├── keys.ts            # MOD — + inverseRelations()
│   ├── types.ts           # MOD — SCHEMA_VERSION 2; SUPPORTED_SCHEMA_VERSIONS; RelationRef
│   ├── manifest.ts        # MOD — validateManifest accepts v1 + v2
│   ├── endpoints.ts       # MOD — + POST /api/data-merge (admin-only)
│   ├── cli/{backfill-uuid,merge}.ts  # NEW
│   └── admin/MergePanel.tsx          # NEW (card in DataSyncClient)
├── collections/*.ts       # MOD (×8) — + uuidField + ensureUuid hook
└── payload-types.ts       # REGENERATED — uuid on 8 content interfaces
```

## 3. Key deliverables

| Area | Delivered |
|------|-----------|
| Schema | `uuid` (text, unique, indexed, hidden) on all 8 content collections + immutable-on-create `ensureUuid` hook |
| Export | `schemaVersion: 2`; rows carry `uuid`; relations are dual `{ uuid, key }` |
| Import | upsert by `uuid` → natural-key fallback; resolve relations by `uuid` → key; v1 archives import unchanged |
| Backfill | `npm run backfill:uuid` (per env, idempotent, backs up `payload.db`) |
| Merge | engine + CLI (`npm run merge`) + admin UI panel + `POST /api/data-merge`; repoints incoming relations (incl self-ref), deletes loser, dry-run + backup |
| Tests | `node:test` — **53/53** (identity, export, import, backfill, merge) |
| Safety | admin-only merge endpoint; dry-run default; pre-merge + pre-import backups; `MergeError` → 400 |

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| `uuid` via `beforeChange` hook (not `defaultValue`) | version-proof, explicit, uniform across admin/seed/import create paths; import pass-through automatic |
| Relations as `{ uuid, key }` (dual) | a renamed target's incoming relations still resolve by uuid → rename-safety is end-to-end |
| `schemaVersion` 2, v1 still accepted | no big-bang — existing archives keep importing |
| Version-agnostic ref parsing (`toRef`) | one code path handles v1 strings + v2 objects |
| Backfill per env, self-aligning | no cross-env coordination; one sync round converges uuids |
| Merge inverse-map derived from `RELATIONS` | single source of truth; new relationships auto-flow into merge |
| Merge = repoint + delete, winner-takes-all | standard merge semantic; relations never orphan |
| Test backup injection (`opts.backup`) | keeps merge unit tests hermetic (no real DB/filesystem) |

## 5. Phase summary

| Phase | Outcome |
|-------|---------|
| 0 — Discovery & design lock | ✅ hook approach + dual format + merge algorithm locked |
| 1 — Schema (uuid + hook + types) | ✅ 8 collections wired; SCHEMA_VERSION 2; payload-types regenerated |
| 2 — Export | ✅ uuid + dual relations |
| 3 — Import | ✅ uuid-first upsert + dual resolve + v1/v2 compat |
| 4 — Backfill CLI | ✅ `npm run backfill:uuid` |
| 5 — Merge engine | ✅ `mergeRecords` + inverse map |
| 6 — Merge CLI + endpoint + UI | ✅ `npm run merge`, `/api/data-merge`, MergePanel |
| 7 — Verify + docs | ✅ 53 tests + 6 e2e checks; this report |

> 📄 Per-phase reports: [`reports/phase-{0..7}-report.md`](./reports/).

## 6. Verification (all run, not asserted)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm test` | **53/53 pass** |
| `npm run build` | ✅ compiled |
| Hook fires on real `payload.create` | uuid auto-assigned ✓ |
| Backfill on a DB copy | schema-push + **66 records backfilled** ✓ |
| Rename round-trip | slug changed → **updated in place, no duplicate** (6→6) ✓ |
| Merge e2e | **6 articles repointed**, loser deleted (3→2) ✓ |
| Cross-env align | fresh no-uuid DB → import → **uuids identical to source** ✓ |
| v1 backward-compat | v1 archive → **updated all, errors 0** ✓ |

## 7. How to run

```bash
cd backend
npm run backfill:uuid                                   # one-time, per env (backs up payload.db)
npm run export                                          # → portfolio-data-<ISO>.zip (now schemaVersion 2)
npm run import -- portfolio-data-*.zip -- --dry-run     # preview
npm run merge -- authors <winnerUuid> <loserUuid> -- --dry-run   # preview a merge
npm run merge -- authors <winnerUuid> <loserUuid>              # apply (backs up payload.db)
npm test                                                # 53 units
```
Admin UI: `/admin/data-sync` → "Merge duplicates" card (winner/loser pickers → Preview → Apply).

## 8. Sprint-16 handoff

- **Visual QA (owner):** after `npm run dev` (config change), open `/admin/data-sync` → the new
  **Merge duplicates** card → pick a collection + winner/loser → Preview (dry-run) → Apply. The engine
  + endpoint were verified (curl-equivalent CLI); the polished merge UI wasn't browser-click-tested.
- **Run backfill on prod:** after deploy, run `npm run backfill:uuid` once on the VPS (the dev-server
  boot auto-pushes the `uuid` column; backfill populates it). Local too. They self-align on the next sync.
- **Existing v1 archives keep working** — no re-export needed. New exports are v2.
- **Tech debt still open:** per-page `og:image`, image optimization, Svelte 4→5 shell (from sprint-13).
- **Possible follow-ups:** merge across more surfaces (e.g. a bulk-merge picker); carry-over loser fields
  instead of winner-takes-all; expose uuid read-only in the admin for debugging.
