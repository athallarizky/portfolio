# Sprint-23 Plan — Content Publish Pipeline (GitHub → prod)

> Status: 🟡 Planning | Created: 2026-08-19
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-22/final-report.md`](../sprint-22/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-22 proved the content pipeline end-to-end locally, but the prod apply is manual: owner opens
`/admin/data-sync`, uploads a zip, clicks import. The artifacts (`tools/*/content/`) are gitignored —
the canonical content lives only on the owner's laptop.

Owner's goal for sprint-23: **GitHub becomes the source of truth for article/project content.**
Push content to git → run a pipeline → content lands in the prod DB.

Existing facts that shape the design (phase-0 discovery):

- The deploy workflow rsyncs only `backend/` + `frontend/` — `tools/` on the VPS is stale since clone.
- All data-sync REST endpoints require an authenticated Payload user (`req.user`).
- `/api/data-import` (multipart zip + `dryRun` form field) already exists and drives the full engine
  (uuid identity, dual refs, `IMPORT_ORDER`, priming, auto-backup, report JSON).
- Sprint-22 lesson: a partial archive whose relation targets aren't in the DB **drop refs silently** —
  the publish archive must always carry the referenced rows (tags, technologies).

## 1. Sprint goal

Two GitHub Actions workflows — **publish-article** and **publish-project** — that publish content
from git to the production DB **entirely from the GitHub runner** (zero script execution on the VPS),
with relations self-contained in every archive.

## 2. Scope

**In scope:**
- Content artifacts tracked in git (import-source JSONs + review `.md` + canonical refs manifest)
- `tools/content/refs/` — `tags.json` + `technologies.json` extracted from the DB (canonical)
- `wrap:publish` CLI — builds a self-contained publish zip (refs + requested row) with tests
- Reusable workflow + two thin dispatch wrappers (`publish-article.yml`, `publish-project.yml`)
- Runner-side publish: Payload login → `POST /api/data-import` (dry-run supported)
- Docs: service-account setup, secrets, usage

**Out of scope:**
- SSH-based execution on the VPS (owner rejected — source of truth runs from GitHub)
- Publishing globals / documents / socials (article + project only for now)
- Auto-publish on push (manual dispatch only — same trigger model as deploy)
- `slack-rag` apply, `article-polish` invocable-skill, renderer `console.warn` (backlog)

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| **Scoped replace-all (`replaceOnly`)** — drift-deletion for the target collection only; refs merge-upsert, never deleted | owner requirement: git ↔ local ↔ prod 1:1 for articles/projects. The sprint-17 `--replace` demands a FULL archive (all 9 collections incl. media binaries in git); scoping keeps git text-only and admin UI alive for images/cosmetics |
| Publish zip = **ALL rows of the target collection from git + refs manifest** | deletion semantics need the full row set per publish ("absent from archive → delete"); refs ride along so tags/technologies always resolve (sprint-22 silent-drop class killed by construction) |
| **Admin UI is no longer a place to author articles/projects** | direct-in-prod drafts that never land in git are deleted by the next publish — the unavoidable consequence of "git is the source of truth". Mitigations: dry-run reports deletions first; import auto-backups the DB |
| Cosmetic fields (featuredImage, banner, seo, showOnHome…) stay omitted from JSONs | upsert leaves absent fields untouched → admin polish survives publishes; 1:1 applies to git-managed fields |
| **GitHub = source of truth; importer = the VPS's own running server** | content JSONs in git are canonical; the pipeline only ships them to the existing REST endpoint. Nothing executes on the box — the DB write happens inside the already-running Payload process (owner's requirement) |
| Insert via `POST /api/data-import` from the runner | reuses the admin UI's exact path; `dryRun` maps to a workflow checkbox; new `replaceOnly` form field carries the scoped semantics |
| Service account (`PUBLISH_EMAIL`/`PUBLISH_PASSWORD` in GitHub secrets) | the only new credential; admin API is already public (owner uses `/admin` remotely); dedicated account = rotatable, revocable |
| Reusable workflow + 2 thin wrappers (no slug input) | one implementation, two dispatch buttons (owner's naming kept). With replace-all semantics a per-slug publish is meaningless — every publish ships the full collection set |
| Track JSONs + polished `.md`; ignore `draft/` + zips | JSONs are the import source (source of truth), `.md` are review artifacts worth versioning; drafts are private raw notes; zips are regeneratable binaries |
| `wrap:publish` runs on the runner | dev tooling (npx tsx) is fine there; the VPS needs nothing new |

### Rejected alternatives

| Rejected | Reason |
|-----------|--------|
| Full-archive replace-all (`--replace` as-is, all 9 collections in git incl. media/PDF binaries) | true total 1:1, but forces binaries into git and makes admin read-only — replace deletes unreferenced media (files too, via Payload `deleteAssociatedFiles`). Right-sized for a personal site: no |
| SSH → import CLI on the VPS | works, but executes a script on the box — owner explicitly wants the pipeline fully runner-driven |
| REST from runner without service account | not possible — every endpoint requires `req.user` |
| Per-slug publish | incompatible with replace-all: drift deletion requires the full row set, so every publish ships the whole collection anyway |
| Storing zips in git | binary bloat; build fresh per run from JSON sources (zip = build artifact) |

## 4. Phasing

- **Phase 0 — Discovery + design:** deploy rsync scope, endpoint auth, deps, gitignore patterns, owner requirements *(done in-session 2026-08-19)*
- **Phase 1 — Content into git:** gitignore refactor + commit existing content JSONs/MDs + extract refs manifest
- **Phase 2 — `wrap:publish` CLI:** combined-archive builder (refs + row) + unit tests
- **Phase 3 — Workflows:** reusable publish workflow + `publish-article` / `publish-project` wrappers + secrets/docs
- **Phase 4 — Verify + docs:** local E2E (wrap → REST login → data-import dry-run against local server), YAML lint, final report
