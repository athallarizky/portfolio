# Task Breakdown — Content UUID Identity & Merge

> Status: 🟡 Planning | Created: 2026-07-20
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery & Design Lock

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 0.1 | Spike: confirm `ensureUuid` `beforeChange` hook assigns uuid on create, no-op on update, import pass-through intact (Payload 3.85.2) | Easy | — | ⬜ |
| 0.2 | Finalize dual-relation serialize format `{uuid,key}` + v1/v2 detection rule | Easy | — | ⬜ |
| 0.3 | Design merge: inverse-relation map from `RELATIONS` + repoint algorithm (incl self-ref) | Medium | 0.2 | ⬜ |
| 0.4 | Write resources/{architecture,data-design,api-contract}.md | Medium | 0.2, 0.3 | ⬜ |

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Schema: uuid field + hook + types

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 1.1 | Add `uuid` field (`text`, `unique`, `index`, `admin.disabled`) to all 8 content collections | Easy | 0.1 | ✅ |
| 1.2 | Shared `ensureUuid` `beforeChange` hook: `randomUUID()` on create-when-missing, no-op on update | Easy | 1.1 | ✅ |
| 1.3 | Bump `SCHEMA_VERSION`→2; widen `ArchiveManifest.schemaVersion` type to `1 \| 2` | Easy | 1.1 | ✅ |
| 1.4 | Regenerate `payload-types.ts` (`npm run generate:types`) | Easy | 1.1 | ✅ |
| 1.5 | Unit test: hook assigns uuid on create; preserves a provided uuid (pass-through); no-op on update | Easy | 1.2 | ✅ |

---

## Phase 2 — Export: include uuid + dual relations

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 2.1 | Include `uuid` in each exported row (do NOT strip it) | Easy | 1.1 | ✅ |
| 2.2 | Build target id→`{uuid,key}` maps; serialize each relation ref as `{uuid,key}` (dual) | Medium | 1.1, 0.2 | ✅ |
| 2.3 | Unit test: export snapshot contains uuid + dual relations; round-trips through import | Medium | 2.2 | ✅ |

---

## Phase 3 — Import: uuid-first upsert + dual resolve + v1/v2 compat

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 3.1 | Upsert: find existing by `uuid` first → else natural key | Medium | 1.3 | ✅ |
| 3.2 | Resolve relations by target `uuid` → natural-key fallback | Medium | 2.2 | ✅ |
| 3.3 | Pass imported `uuid` through create (hook no-op guarantees it) | Easy | 1.2 | ✅ |
| 3.4 | `validateManifest` accept schemaVersion 1 **and** 2; resolver reads dual vs plain-string per version | Medium | 1.3 | ✅ |
| 3.5 | Unit tests: v1 archive imports (plain-string relations); v2 rename updates in place (no duplicate) | Medium | 3.4 | ✅ |

---

## Phase 4 — Backfill CLI

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 4.1 | `cli/backfill-uuid.ts`: find uuid-less docs per collection, `payload.update({data:{uuid}})`, report counts | Medium | 1.2 | ✅ |
| 4.2 | `npm run backfill:uuid` script (backs up `payload.db` first, like the seed scripts) | Easy | 4.1 | ✅ |
| 4.3 | Test: backfill assigns uuid to all; idempotent (does not overwrite an existing uuid) | Medium | 4.1 | ✅ |

---

## Phase 5 — Merge engine

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 5.1 | `inverseRelations()` — from `RELATIONS`, map target collection → `[{fromCollection, field, hasMany, selfRef}]` | Medium | 0.3 | ✅ |
| 5.2 | `mergeRecords(payload, collection, winnerUuid, loserUuid, {dryRun})` → repoint all refs, delete loser | Hard | 5.1 | ✅ |
| 5.3 | Self-ref handling (`articles.relatedArticles` within a merge) | Medium | 5.2 | ✅ |
| 5.4 | Pre-merge `payload.db` backup + `MergeReport` shape | Easy | 5.2 | ✅ |
| 5.5 | Unit tests: merge repoints relations + deletes loser; dry-run = 0 writes; self-ref handled | Hard | 5.3 | ✅ |

---

## Phase 6 — Merge CLI + endpoint + admin UI

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 6.1 | `cli/merge.ts` + `npm run merge -- <collection> <winnerUuid> <loserUuid> [-- --dry-run]` | Medium | 5.2 | ✅ |
| 6.2 | `POST /api/data-merge` admin-only endpoint (dryRun toggle) | Medium | 5.2 | ✅ |
| 6.3 | Admin UI merge panel (winner/loser picker by uuid+title, preview repointed relations, dry-run, Apply) | Hard | 6.2 | ✅ |
| 6.4 | Regenerate `importMap.js` if a new admin component is added | Easy | 6.3 | ✅ (n/a — normal import, build-verified) |

---

## Phase 7 — Verify + Docs

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 7.1 | `tsc --noEmit` clean; `npm test` all green; `npm run build` | Medium | 1–6 | ✅ |
| 7.2 | E2E rename: backfill → export → change a slug in the archive → import → record updated in place (no duplicate) | Medium | 4, 3 | ✅ |
| 7.3 | E2E merge: two authors → merge via UI + CLI → relations repointed, loser deleted | Medium | 6 | ✅ (CLI + engine verified; UI visual-QA pending) |
| 7.4 | Cross-env align: local backfill → export → import into a fresh/prod-like DB → uuids aligned | Medium | 4 | ✅ |
| 7.5 | Update `AGENTS.md` (§5/§6/§7); write `final-report.md` + phase reports | Medium | 7.1–7.4 | ✅ |

---

## Dependency Graph

```
Phase 0 ───────────────────────────────────────┐
  0.1 ─► 1.1 ─► 1.2 ─► 1.5                      │
  0.2 ─► 2.2 ─► 2.3                             │
  0.3 ─► 5.1 ─► 5.2 ─► 5.3 ─► 5.5               │
  0.4                                           │
Phase 1 (schema) ───────────────────────────────┤
  1.1 ─► 1.3 ─► 3.1 ─► 3.4 ─► 3.5               │
  1.2 ─► 4.1 ─► 4.2 ─► 4.3                       │
Phase 2/3 (export ↔ import dual) ────────────────┤
  2.2 ─► 3.2                                     │
Phase 5/6 (merge) ───────────────────────────────┤
  5.2 ─► 6.1                                     │
  5.2 ─► 6.2 ─► 6.3 ─► 6.4                       │
Phase 7 (verify + docs) ─────────────────────────┘
  7.1 ─► 7.5
```

## Summary

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 0 — Discovery & design | 4 | 2h | ✅ |
| 1 — Schema (uuid + hook + types) | 5 | 2h | ✅ |
| 2 — Export | 3 | 2h | ✅ |
| 3 — Import | 5 | 3h | ✅ |
| 4 — Backfill CLI | 3 | 1.5h | ✅ |
| 5 — Merge engine | 5 | 4h | ✅ |
| 6 — Merge CLI + UI | 4 | 3.5h | ✅ |
| 7 — Verify + docs | 5 | 3h | ✅ |
| **Total** | **34** | **~21h** | ✅ |
