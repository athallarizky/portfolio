# Phase 0 Report — Discovery + design

> Completed: 2026-08-19

## 1. Findings

| Question | Answer |
|---|---|
| What does deploy rsync to the VPS? | only `backend/` + `frontend/` — `tools/` on the box is stale since first clone → the publish pipeline must carry its own content |
| Endpoint auth? | every data-sync endpoint requires an authenticated Payload user (`req.user`) |
| Replace-all support? | sprint-17 `--replace` exists but **requires a full archive** (all 9 collections incl. media) — unusable for a text-only git source of truth without putting binaries in the repo |
| Deps available where? | runner: everything (npm ci); VPS: nothing new needed (insert happens inside the running server) |

## 2. Design settled with the owner

1. **GitHub = source of truth** for articles/projects; importer = the VPS's own running Payload process (zero script execution on the box).
2. **Scoped replace-all** (owner picked A over full 1:1): drift-deletion only for the target collection; refs (tags/technologies) upsert, never delete. Consequences accepted: admin is no longer a place to author articles/projects (un-committed drafts die on next publish); cosmetic fields survive via omit-on-upsert; refs can accumulate orphans.
3. Insert path: runner → login service account → `POST /api/data-import` (multipart) with new `replaceOnly` field.
4. Two dispatch buttons (publish-article / publish-project), one reusable implementation. No slug input — replace-all semantics ship the full collection set every run.

## 3. Reference files

| File | Why it matters |
|---|---|
| `backend/src/data-sync/import.ts:134-170` | `assertFullArchive` + `replaceDrift` — the code scoped replace extends |
| `.github/workflows/deploy.yml` | the SSH/secrets pattern publish deliberately does NOT reuse |
