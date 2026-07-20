# RCA — replace-all reported deletions but the DB never converged

> **Date:** 2026-07-20 · **Severity:** High · **Component:** `backend/src/data-sync` (replace-all engine + `/admin/data-sync` UI)
> **Status:** ✅ Resolved

## 1. Summary

Replace-all's dry-run correctly reported "Would delete: social-profiles 6, …" but a **real** apply deleted
**nothing** — the DB stayed at 7 social-profiles. **Two compounding causes:**

1. **Engine (the real bug):** `replaceDrift` deleted collections in **parents-first** order, so deleting a
   drift `document-categories` row while a drift `documents` row still referenced it threw a **SQLite
   foreign-key error**, which — caught by a single try/catch around the whole pass — **aborted every
   remaining deletion** (including social-profiles). Dry-run masked it because it writes nothing.
2. **UX (why it persisted after the engine fix):** the modal's Merge / Replace-all buttons only
   **started a dry-run preview**; the actual write needed a separate confirm + Apply step that wasn't
   visually prominent, so the user stopped at the preview. Server logs (two `POST /api/data-import` at
   181 ms / 151 ms) confirmed **no writes occurred**.

## 2. Impact

- First real use of replace-all (local, converging the dev DB to a prod export) appeared broken.
- Owner could not converge local → prod; lost ~1 cycle of trust in the feature before the cause was found.
- No data loss (deletes never ran); prod was never affected (sprint-17 was not yet committed/deployed).

## 3. Symptoms (observed)

| Signal | Value |
|---|---|
| Dry-run report | `Would delete: {social-profiles:6, projects:1, authors:2, documents:7, document-categories:1}`, errors 0 |
| Real apply report (before fix) | `errors: 1 — Failed query: delete from "document_categories" where … = ?`, **no `deleted` line** |
| social-profiles count after "replace" | 7 (unchanged) |
| Server access log after engine fix | `POST /api/data-import` ×2, both ~150–180 ms (too fast to be a real write over ~60 records) |

## 4. Timeline

| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | Owner reports: replace-all ran, social-profiles still 7 | — | observation |
| 2 | Inspect the uploaded `portfolio-data (3).zip` | `sourceEnv: production`, exactly **1** social-profile → archive is correct | rules out "wrong file" |
| 3 | Reproduce locally: `import … --replace --dry-run` | Reports `deleted:{social-profiles:6,…}` → logic *looks* correct | **red herring** (dry-run writes nothing) |
| 4 | Reproduce locally: real `import … --replace` | `errors:1` (FK `document_categories`), 0 deletes, still 7 | **the cause #1** |
| 5 | Fix `replaceDrift`: reverse dependency order + per-delete try/catch; re-run real apply | `deleted:{social-profiles:6,…}`, `errors:0`, count → **1** | **real fix #1** |
| 6 | Owner re-runs via the admin UI | Still 7 | new symptom |
| 7 | Read dev-server logs: two `POST /api/data-import` at ~150 ms | Dry-runs only — no writes ever happened | **the cause #2** |
| 8 | Redesign UI: explicit Step 1 modal → Step 2 preview+Apply (prominent, inline confirm) + loading + success states; owner re-runs | Converges to 1 ✓ | **real fix #2** |

## 5. Root cause

**#1 — engine (`import.ts: replaceDrift`).** Collections were iterated in import (parents-first) order
(`document-categories` before `documents`, etc.). When the pass reached a drift `document-categories`
row, a drift `documents` row still in the DB referenced it → SQLite FK constraint → `payload.delete`
threw. The whole drift pass was wrapped in **one** try/catch, so that single throw aborted the entire
loop — nothing after `document-categories` (tags, authors, …, social-profiles) was even visited.

**Why dry-run didn't catch it:** `replaceDrift` in dry-run calls `payload.find` but **never**
`payload.delete`, so the FK is never exercised. The dry-run "passed" while the real run failed — a
destructive-op testing trap.

**#2 — UX (`DataSyncClient.tsx`).** After picking Merge/Replace-all in the modal, the only thing that
ran was the dry-run preview. The confirm-checkbox + Apply button (the only step that writes) was a
separate, low-visual-weight element below the preview. A user could reasonably read the preview result
as "done." The access log confirmed it: the two imports were sub-200 ms (dry-runs), and the DB was
unchanged.

## 6. The fix

**#1 — FK-safe, isolated deletion** (`import.ts`):

```diff
- for (const [collection, identities] of archiveIdentities) {
+ const order = [...archiveIdentities.keys()].reverse() // children before parents (FK-safe)
+ for (const collection of order) {
+   const identities = archiveIdentities.get(collection)!
    …
    if (!dryRun) {
-     await payload.delete({ collection, id: doc.id } as any)
+     try {
+       await payload.delete({ collection, id: doc.id } as any)
+     } catch (e) {
+       report.errors.push({ collection: '(replace-all)', key: identity,
+         message: `delete failed: ${e instanceof Error ? e.message : String(e)}` })
+       continue
+     }
    }
```

**#2 — unmistakable preview → Apply** (`DataSyncClient.tsx`): modal relabeled "Step 1 of 2"; after the
preview, a "Step 2 of 2" card renders with **"Nothing written yet."**, the deletion count inline in the
confirm (`I understand 6 record(s) … will be deleted`), and a prominent Apply button labelled
`⚠ Apply — delete 6 & write changes`. Added a loading state (spinner + "Applying changes…") and a
success card (`✅ Import applied`) shown inline in the Content section once the write lands.

## 7. Verification

| Metric | Before fix | After fix |
|---|---|---|
| Real replace-all errors | 1 (FK) | 0 |
| `deleted` (real apply) | — (aborted) | `{social-profiles:6, projects:1, authors:2, documents:7, document-categories:1}` |
| social-profiles count | 7 | **1** |
| Re-run dry-run after apply | still 6 to delete | nothing to delete (converged) |
| Unit tests | — | 68/68 (incl. `replaceDrift: a delete that throws … is reported without aborting the pass`) |
| Owner (UI, after #2) | stuck at 7 | converged to 1 ✓ |

## 8. Why it was hard to find (contributing factors)

- **Dry-run/real-run divergence.** The dry-run is the natural first test, and it passed — but it never
  executes `delete`, so FK/constraint bugs are invisible to it. False confidence.
- **One error aborted everything.** A single FK throw, caught at pass scope, silently skipped every
  later collection. The report said `errors: 1` with no hint that the *rest* of the pass was skipped.
- **Fast POSTs looked complete.** In the access log, 150 ms `POST /api/data-import` entries looked like
  finished imports; only the timing + the unchanged DB revealed they were dry-runs.
- **Preview read as completion.** The preview card showed a result; nothing flagged that a write was
  still pending.

## 9. Lessons & action items

- [x] Destructive ops need a **real-write** test path, not only dry-run — the sprint-17 e2e now does a
      real apply + a convergence re-check (re-dry-run expects 0 deletes).
- [x] Bulk delete must respect **dependency order (children first)** + **per-item isolation** so one
      failure can't abort the pass.
- [x] Destructive UI flows must make **"preview ≠ applied"** unmistakable: explicit numbered steps,
      a prominent Apply, and a success state that confirms the write landed.
- [ ] Consider surfacing "pass aborted at collection X" distinctly in the report (vs a single error),
      so a partial-abort is obvious.
- [ ] Note for future: editing server-side engine code while `npm run dev` runs does **not** always
      hot-reload (Payload loads config + imports at boot) — restart the dev server after engine edits.

## 10. References

- `backend/src/data-sync/import.ts` — `replaceDrift`, `assertFullArchive`
- `backend/src/data-sync/admin/DataSyncClient.tsx` — upload modal + Step 2 + success states
- [`docs/sprint-17/resources/design.md`](../resources/design.md) §3 (replace-all, FK-safe deletion order)
- [`docs/sprint-17/reports/phase-3-report.md`](../reports/phase-3-report.md)
- Repro archive: prod export `portfolio-data (3).zip` (`sourceEnv: production`, 1 social-profile)
