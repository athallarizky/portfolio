# Sprint-23 Final Report — Content Publish Pipeline (GitHub → prod)

> Status: ✅ Delivered locally — first prod dispatch pending owner | 2026-08-19
> Audience: sprint-24 context + owner review. Read this + [`../../AGENTS.md`](../../AGENTS.md).
> Companion: [`plan.md`](./plan.md) · [`tasks.md`](./tasks.md) · reports in [`reports/`](./reports/)

---

## 1. Sprint goal & outcome

**Goal:** two GitHub Actions pipelines (`publish-article`, `publish-project`) that make **GitHub the source of truth** for article/project content and converge **local & prod 1:1** with it — via scoped replace-all, driven entirely from the runner.

**Outcome:** ✅ delivered. The full path — git sources → `wrap:publish` zip → service-account login → `POST /api/data-import` with `replaceOnly` — is implemented and **proven end-to-end against the local backend over REST** (the exact path the runner takes). Local DB is already 1:1 with git. The first prod dispatch is the owner's (setup + smoke test below).

## 2. What was built

### Engine (backend)

| File | Change |
|---|---|
| `src/data-sync/import.ts` | `ImportOptions.replaceCollections` (scoped replace-all) + `assertReplaceCollectionsPresent()` + drift-pass scoping — refs collections are never deleted |
| `src/data-sync/cli/import.ts` | `--replace-only <csv>` flag |
| `src/data-sync/endpoints.ts` | `replaceOnly` form field on `/api/data-import` |
| `src/data-sync/cli/wrap-publish.ts` | **new** — builds the publish zip from git sources (ALL rows of the target collection + refs manifest); enforces uuid + duplicate-free rows |
| `src/data-sync/cli/refs-export.ts` | **new** — `npm run refs:export` → `tools/content/refs/{tags,technologies}.json` |
| `src/data-sync/cli/publish-user.ts` | **new** — `npm run publish:account` (service account creator; password via env) |

### Pipeline

| File | Role |
|---|---|
| `scripts/publish-content.mjs` | runner-side publish: login → multipart import (dryRun + replaceOnly) → report → exit≠0 on errors |
| `.github/workflows/publish.yml` | reusable implementation (checkout → npm ci → wrap:publish → publish) |
| `.github/workflows/publish-article.yml` / `publish-project.yml` | dispatch buttons (dry-run checkbox) |

### Source of truth in git (was gitignored)

- `tools/article-polish/content/*/{article.json,article.md}` (flat, same shape as repo-to-project; drafts stay ignored)
- `tools/repo-to-project/content/*/project.json|project.md`
- `tools/content/refs/{tags,technologies}.json`

## 3. Key decisions (full table in [`plan.md`](./plan.md))

| Decision | Rationale |
|---|---|
| Scoped replace-all, not sprint-17 full replace | full replace demands all 9 collections in git incl. media/PDF binaries and makes admin read-only; scoped keeps git text-only and admin alive for images/cosmetics |
| Zero VPS execution | owner requirement — the import runs inside the VPS's own Payload process over HTTPS |
| Publish rows must carry a uuid | stable identity; minting fresh uuids per build would duplicate records |
| wrap:publish refuses duplicate uuid/slug | catches copy-pasted entry folders before they become prod duplicates |
| No slug input on the workflows | replace-all ships the full collection set every run |

## 4. The contract (behavioral change ⚠️)

1. **Articles/projects are authored via git** (article-polish / repo-to-project → commit → publish). A draft created directly in the **prod admin is deleted by the next publish** (drift). Dry-run reports deletions first; every real import auto-backs-up the DB.
2. Cosmetic fields (featuredImage, banner, screenshots, seo, showOnHome, order) are omitted from the JSONs → **admin polish survives publishes**.
3. Refs (tags/technologies) upsert only — they never get deleted by publishing; refresh the manifest with `npm run refs:export` after admin changes.

## 5. Verification

- [x] 76/76 backend tests (8 new: scoped-replace assertions + publish-row validation)
- [x] Backend `npm run build` clean · workflow YAML parsed clean · frontend untouched
- [x] Local E2E over REST (exact runner path): login ✓ · articles dry-run ✓ · articles real ✓ (+backup, 0 errors) · projects dry-run ✓
- [x] Deletion path proven live: junk `test123` article deleted by `--replace-only articles`; tags untouched
- [x] Local DB now 1:1 with git: articles = 1 (`how-to-learn-…`), projects = 5 (slack-rag created from git)
- [ ] **Owner:** first prod dispatch (below)

## 6. How to run

```bash
# local (sync local DB 1:1 with git — same as the pipeline does)
cd backend && npm run wrap:publish -- --articles
npm run import -- ../tools/collection/portfolio-publish-articles-<stamp>.zip -- --replace-only articles
# refresh refs after admin tag/tech changes
npm run refs:export
# create the publish service account (prod: run once on the VPS backend)
PUBLISH_PASSWORD='<strong password>' npm run publish:account -- --email publish@athallarizky.com
```

## 7. Owner setup + first dispatch (one-time)

1. **Deploy first** (the sprint-22 renderer fix must be live before the article lands): push → Actions → "Deploy to VPS".
2. Create the service account on **prod**: SSH-free option — run locally against prod is NOT possible; do it in the prod admin (`/admin` → Users → Add) with a strong password. (Or one-off: `cd backend && PUBLISH_PASSWORD=… npm run publish:account` on the VPS.)
3. GitHub → Settings → Secrets → Actions: add `PUBLISH_EMAIL` + `PUBLISH_PASSWORD`.
4. Actions → **Publish Article** → Run workflow with **dry_run ✓** → expect `created: {articles:1, tags:3}`, 0 errors.
5. Run again with dry_run ✗ (real). Then **Publish Project** (dry-run → real) → expect `created: {projects:2}` (ai-guided-learning + slack-rag) on prod.
6. Spot-check prod `/blogs` + `/projects` (light/dark/mobile), then polish images in admin (featuredImage/banner).

## 8. Sprint-24 handoff

- **Content workflow from here:** raw.md → `article-polish` SKILLS.md → commit → Publish Article. Repo → `repo-to-project` → commit → Publish Project. `refs:export` when refs change.
- **Local↔prod parity:** run the same two imports locally after pulling (or re-add `sync:local` convenience script if it gets tedious).
- Backlog: `article-polish` as invocable skill · SKILLS.md Markdown-body note · renderer `console.warn` on unknown nodes · `slack-rag` prod entry goes live with the first Publish Project run.
- Gotcha to remember: publish zips are gitignored build artifacts — the pipeline builds them fresh each run; never hand-edit a zip.

## 9. Addendum — English polish policy (same session, post-delivery)

Owner decision: article output language is now **English — professional but casual** (was casual Bahasa Indonesia).
`article-polish` SKILLS.md carries the policy (translate non-English drafts while polishing); the sprint-22 article
was re-polished in English (same uuid → updated in place), the `samples/` style anchor now reflects the English
tone, and the local DB was re-converged via `import --replace-only articles` (`updated`, 0 errors). No prod impact —
nothing had landed yet, so the first dispatch ships the English version.

## 10. Sprint stats

- 21 tasks, 5 phases · 4 phase reports · 76/76 tests green · 2 builds clean
- New: 3 CLIs, 1 engine option, 1 runner script, 3 workflows, refs manifest · git surface: content JSONs/MDs now tracked
