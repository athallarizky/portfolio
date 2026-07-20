# Sprint-15 Plan — Content UUID Identity & Merge

> Status: 🟡 Planning | Created: 2026-07-20
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-14/final-report.md`](../sprint-14/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)
> Design basis: [`../sprint-14/resources/identity-uuid-future.md`](../sprint-14/resources/identity-uuid-future.md)

---

## Context

Sprint-14 shipped a portable content export/import + raw-DB-snapshot tool. Today a record's **identity is
its natural key** (slug / name / title / platform) — chosen so archives port between local & prod (whose
DB `id`s differ). The sharp edge: **renaming a record (changing its key) creates a duplicate** — the old
record is orphaned. This surprised the owner mid-bulk-edit. It is by-design for portability (not a bug),
but it is the main UX gotcha of the current design — documented in
[`sprint-14/resources/identity-uuid-future.md`](../sprint-14/resources/identity-uuid-future.md).

This sprint upgrades record identity from natural-key → a stable, **content-level `uuid`**, so renames
update in place while staying portable. Natural keys remain the display handle + human-readable
relationship target (and the sole identity for v1 archives — fully backwards compatible).

Owner decisions (2026-07-20):
- **Migration:** standalone `npm run backfill:uuid` CLI per env (local & prod independently); uuids
  self-align on the next sync. A `beforeChange` hook is the safety-net so any record ever created always
  gets a uuid.
- **Scope:** rename-safety + portability **+ merge tooling** (CLI **+** admin UI).

## 1. Sprint goal

Make record identity a stable content-level `uuid` so content survives renames/moves across local & prod,
and add a **merge** tool to combine duplicate records (re-pointing every incoming relationship).

## 2. Scope

**In scope:**
- `uuid` field on all 8 content collections + immutable-on-create `beforeChange` hook (`ensureUuid`).
- Export: include `uuid`; serialize relationships as `{ uuid, key }` (dual) — uuid primary, natural-key fallback.
- Import: upsert by `uuid` first → else natural key (v1 archive fallback); resolve relations by `uuid` → natural key.
- Backfill CLI (`npm run backfill:uuid`) for existing records in each env.
- Merge engine: combine two same-collection records, repoint all incoming relations (incl self-ref), delete loser.
- Merge CLI (`npm run merge`) + admin UI panel (in `/admin/data-sync`) + admin-only endpoint.
- Tests (extend the node:test suite) + docs (resources, phase reports, final report, AGENTS update).

**Out of scope:**
- UUIDs on globals (single-instance by slug — no rename-safety needed).
- UUIDs on `users` / `contact-messages` (excluded from sync entirely).
- **Move as a separate tool** — reassigning a single relationship target is normal relationship editing,
  and rename-safety already makes key changes non-destructive. **Merge** is the new tool; "move" is subsumed.
  *(If the owner meant something different by "move", this is the place to correct it.)*
- Scheduled/automated sync (still manual).

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Identity = content-level `uuid` (not DB `id`, not natural key) | Portable across envs (content-level) AND stable across renames (unlike natural key) |
| Natural key stays as display handle + relationship fallback | Human-readable archives; v1 archives keep importing unchanged |
| `beforeChange` hook fills `uuid` on create (not `defaultValue`) | Version-proof, explicit, uniform across admin/seed/import; import pass-through just works (hook is a no-op when `uuid` is present) |
| Relations serialize `{ uuid, key }` (dual) | A renamed target's incoming relations still resolve (by uuid) — rename-safety is end-to-end, not just for the record itself |
| `schemaVersion` → **2** (v1 + v2 both importable) | Detect dual-serialize via version; no big-bang, existing archives keep working |
| Backfill = standalone CLI, per-env, self-aligning | No cross-env coordination/downtime; one sync round aligns uuids (export env1 → natural-key match on env2 → uuid overwritten) |
| Upsert by `uuid` first → natural-key fallback | Rename-safe updates; falls back gracefully for v1 / un-backfilled records |
| Merge: winner-takes-all fields, repoint relations, delete loser | Standard merge semantic; relationships never orphan; loser removed |
| Merge dry-run + pre-merge backup (same safety model as import) | Merge is destructive; every path opt-in + recoverable |
| Merge surface = CLI + admin UI (data-sync pattern) | Consistent with sprint-14; one reusable engine under both |

## 4. Phasing

- **Phase 0 — Discovery & design lock:** confirm hook approach (spike); finalize dual-relation format + merge inverse-relation map; write resources.
- **Phase 1 — Schema (`uuid` + hook + types):** add `uuid` to the 8 collections, shared immutable-on-create hook, bump `SCHEMA_VERSION`→2.
- **Phase 2 — Export:** emit `uuid` + dual relations.
- **Phase 3 — Import:** uuid-first upsert, dual relation resolve, v1/v2 compat.
- **Phase 4 — Backfill CLI:** `npm run backfill:uuid` per env.
- **Phase 5 — Merge engine:** inverse-relation map + `mergeRecords()` (dry-run + backup).
- **Phase 6 — Merge CLI + endpoint + admin UI.**
- **Phase 7 — Verify + docs:** tsc/test/build green; rename round-trip; merge e2e; cross-env align; final report + AGENTS.

> 📄 Task-level detail: [`tasks.md`](./tasks.md). Design deltas: [`resources/`](./resources/).
