# Sprint-18 Plan — Replace-All Prod Observation

> Status: 🟢 Active | Created: 2026-07-23 · Updated: 2026-07-23
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-17/final-report.md`](../sprint-17/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)
> Backlog: [`resources/backlog.md`](./resources/backlog.md)

---

## Context

- **Sprint-17** delivered replace-all mode: after upserting a full archive, it deletes DB records absent from the archive.
- **Sprint-15/16/17** built the full data-sync pipeline: export/import by uuid, repo→project skill, insert-one, replace-all.
- **Backlog item #1** (article authoring skill) — canceled by owner for sprint-18.
- **Backlog item #2** (media cleanup) — **invalidated after code audit.** PayloadCMS 3's `deleteAssociatedFiles()` is called with `overrideDelete: true` on every document delete (local API, REST API, admin UI) — it `fs.unlink`s the file + all sizes from `staticDir`. No orphaned files possible through normal data-sync paths.
- **Uncommitted change:** `tools/repo-to-project/SKILLS.md` has a local diff adding content-only vs full mode.

## Phase 0 — Discovery: Does Payload delete uploaded files? ✅ YES

**Source:** `payload/dist/collections/operations/deleteByID.js:90`:
```js
await deleteAssociatedFiles({
    collectionConfig, config,
    doc: docToDelete,
    overrideDelete: true,
    req
});
```

`deleteAssociatedFiles()` does `fs.unlink(staticDir/filename)` + all sizes. Called on every delete path (Local API, REST, admin). **Item #2 is unnecessary — no orphaned files can exist.**

## 1. Sprint goal

Run a replace-all in production, observe behavior, and fix any edge cases not covered by local e2e tests.

## 2. Scope

**In scope:**
- Deploy sprint-17 code to production
- Run a replace-all in production (export → re-import as replace-all)
- Document findings; fix bugs if any

**Out of scope:**
- Article authoring skill (canceled)
- Media cleanup (invalidated — Payload handles it natively)

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Replace-all observation is the sole deliverable | Item #2 confirmed unnecessary; item #1 canceled. |
| Deploy sprint-17 code first | Replace-all was built in sprint-17 but hasn't been deployed to prod. |

## 4. Phasing

- **Phase 0 — Discovery ✅:** verified Payload deletes upload files on document delete.
- **Phase 1 — Deploy:** push sprint-17 + sprint-18 docs to main, deploy via GitHub Actions.
- **Phase 2 — Prod observation:** export from prod → import back as replace-all → observe.
- **Phase 3 — Verify + docs:** final report + sprint-19 backlog.

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Replace-all deletes unexpected content | Backup inherited from sprint-17; dry-run preview; test export first. |
| Deploy pipeline issues | Pipeline unchanged since sprint-12, proven stable. |
