# Phase 3 Report — Replace-all (full-archive only)

> Completed: 2026-07-20

**Engine** (`import.ts` + `types.ts`):
- `ImportOptions.replaceAll?: boolean`; `ImportReport.deleted` + `skippedReferenced`.
- `ReplaceAllError` + `assertFullArchive(present)` — called early (before the backup) so a partial archive fails fast.
- `archiveIdentitySet(collection, rows)` — uuid if present, else natural key (consistent with `upsertDoc`'s uuid-first → key lookup).
- `collectReferenced(zip, pfx, resolver)` — walks every archive row's relation fields (`RELATIONS`, incl. self-ref) and collects resolved target ids per target collection. **Query-free** — uses ids already resolved during upsert.
- `replaceDrift(payload, archiveIdentities, refIds, report, dryRun)` — per collection: delete DB records whose identity ∉ the archive; **skip** those in `refIds[collection]` (report them); else delete (real) / count (dry-run).
- Wired into `importFromArchive` after the globals pass, gated on `replaceAll`. The pre-import `backupDb()` already runs for real imports → replace-all inherits it.

**FK-safe deletion order (post-prod hotfix).** `replaceDrift` deletes in **reverse dependency order**
(children before parents: documents → document-categories, articles → tags/authors, projects →
technologies) and isolates each `payload.delete` in its own try/catch. Without this, deleting a drift
`document-categories` row while a drift `documents` row still referenced it threw an SQLite FK error
that aborted the entire pass — so (in the first prod test) `errors:1` and **nothing** got deleted
(including social-profiles), even though the dry-run reported the deletions correctly (dry-run writes
nothing, so it never hit the FK). Verified after the fix: real replace-all of the prod archive into a
local copy deletes all drift (`social-profiles:6, …`), `errors:0`, social-profiles → **1**.

**CLI** — `npm run import -- <zip> -- --replace` (+ `--dry-run` prints `would-delete` / `skipped`).

**Endpoint** — `/api/data-import` reads a `replaceAll` form field.

**UI** (`DataSyncClient.tsx`, redesigned):
- Dry-run checkbox **removed**. Flow: **Upload content (.zip)** → a **mode modal** ("Step 1 of 2") with two choice buttons **[Merge]** / **[⚠ Replace all]** → the choice runs the dry-run preview.
- A **"Step 2 of 2" preview card** (white, colored left border by mode) shows would-create/update/delete + skipped; **"Nothing written yet."**
- `ReportCard`/badges render `deleted` + `skippedReferenced`.
- **Loading state** (spinner + "Running preview…/Applying changes…") during the request.
- **Contextual confirm** ("I understand N record(s) … will be deleted") + prominent **Apply** (`⚠ Apply — delete N & write changes`) — gated on clean preview; Replace-all requires the confirm.
- On apply, the preview card is replaced inline by a **success card** (`✅ Import applied`, green) in the content section.

**Tests** — `import.test.ts` +6: `assertFullArchive` (throws/ok), `archiveIdentitySet` (uuid-or-key), `collectReferenced` (target ids), `replaceDrift` (delete absent / keep in-archive / skip referenced), `replaceDrift` dry-run (counts, no delete).
