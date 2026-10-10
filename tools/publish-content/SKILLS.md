# publish-content — trigger the prod publish for articles/projects

> **Manually invoked.** When the user says something like
> *"publish artikel"*, *"publish project"*, *"tolong publish ke prod"* — or
> *"follow `tools/publish-content/SKILLS.md`, collection: articles | projects | both"* —
> run this procedure end-to-end.
> You are dispatching the GitHub Actions publish pipeline (sprint-23) and verifying prod
> converged 1:1 with git. **You never import by hand in the happy path — the workflow does it.**

All commands run from the repo root (`portfolio/`). Prod = `https://athallarizky.com`.

---

## What this does

Dispatches **Publish Article** / **Publish Project** (manual workflows). The runner builds the
full-set zip from git (`tools/*/content/*/<row>.json` + `*.id.json` overlays + `tools/content/refs/`)
and imports it to prod with `replaceOnly=<collection>` — the collection converges 1:1 with git
(rows absent from git are deleted; refs upsert only; admin-only cosmetic fields survive).

---

## Procedure

### Step 0 — Preconditions (refuse to continue if any fails)

1. **Working tree pushed:** `git status --short tools/` is clean AND `git log origin/main..HEAD`
   is empty. GitHub runs the REMOTE copy — unpushed content will silently not ship.
2. **gh authenticated:** `gh auth status` shows a logged-in account.
3. **(Only when bilingual rows exist) backend deployed ≥ sprint-24:** v3 zips need the migrated
   prod importer. EN-only publishes work against the old importer (v2 stamp).
4. **Refs fresh** (after admin tag/technology edits): `cd backend && npm run refs:export`, commit
   `tools/content/refs/` — otherwise new tags fail to resolve in prod.

### Step 1 — Optional dry-run (recommended for first-time or risky sets)

```bash
gh workflow run publish-article.yml  --ref main -f dry_run=true   # or publish-project.yml
```
Poll the run (Step 3), read the report in the run summary — expect `0 errors` and the intended
created/updated counts. No writes happened.

### Step 2 — Dispatch the real publish

```bash
gh workflow run publish-article.yml  --ref main -f dry_run=false  # articles
gh workflow run publish-project.yml  --ref main -f dry_run=false  # projects
```
("both" = run the two commands sequentially, then watch both runs.)

### Step 3 — Watch the run

```bash
sleep 8 && gh run list --workflow=publish-article.yml --limit 1     # grab the run id
gh run watch <run-id> --exit-status                                  # ~2–3 min
```
On failure: `gh run view <run-id> --log-failed`. Usual suspects:
- `refs not found` / tag resolve error → Step 0.4 (refs:export) wasn't done
- `missing "uuid"` → a content row lacks identity; re-run its generator tool
- `unsupported schemaVersion: 3` → prod backend predates sprint-24 → deploy first
- DB connection errors → the `DATABASE_URL` secret is wrong/expired (Neon console)
- media/S3 errors → the `S3_*` secrets are wrong or the token was rotated

> Sprint-27: the workflow imports **runner-direct** (the Actions runner executes the
> data-sync engine against Neon + R2 via repo secrets) — there is no API login in the
> CI path anymore. The API path still exists for manual/admin publishes.

### Step 4 — Verify prod converged

```bash
# the new/changed slugs are live in the API immediately (both locales when translated)
curl -s 'https://api.athallarizky.com/api/articles?limit=100&depth=0&locale=id' | jq -r '.docs[].slug'
# the public site picks them up within ~5 min (ISR, 300 s) — force-fresh check:
curl -s -o /dev/null -w '%{http_code}\n' 'https://athallarizky.com/id/blogs/<new-slug>'
# removed-from-git rows are GONE (replace-only contract) — check a deleted slug returns null/404/301
```

### Step 5 — Sync the local dev DB (always, after a successful publish)

Publishing moves prod ahead of the local dev DB — the next local dry-run or UI test then
runs against stale content (missing the new rows, false relation errors). Keep local 1:1
by pulling a prod export through the API (needs `backend/.env` with the service-account
creds or the owner to provide them):

```bash
cd backend
TOKEN=$(curl -s -X POST https://api.athallarizky.com/api/users/login \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$PUBLISH_EMAIL\",\"password\":\"$PUBLISH_PASSWORD\"}" | jq -r .token)
curl -s -H "Authorization: JWT $TOKEN" -o portfolio-data-prod.zip \
  'https://api.athallarizky.com/api/data-export'
npm run import -- portfolio-data-prod.zip            # upsert merge into local SQLite
```

Skip only when the owner says there is no local env to keep in sync.

### Step 6 — Fallback (only if Actions is down or the workflow itself is broken)

Run the same import the runner would, from any machine with `backend/.env` pointing at
Neon + R2 (the migration machine qualifies):

```bash
cd backend && npm run wrap:publish -- --articles        # or --projects (auto-attaches *.id.json)
set -a && source .env && set +a                         # CLI doesn't load .env by itself
npx tsx src/data-sync/cli/import.ts portfolio-data-*.zip --replace-only <collection>
```

Or, without local env, via the API path (small zips only — 4.5 MB serverless body cap):
`node scripts/publish-content.mjs <zip> --collection <collection>` with `PUBLISH_*`
env vars; media-heavy zips go through R2 automatically when `S3_*` env vars are set.

### Step 7 — Handoff

Report: workflow run URL + conclusion · created/updated/locale-overlay counts from the log ·
prod verification results (slug list, spot-check URL + status) · any drift deletions ·
local-sync result.

---

## Edge cases

- **Publish workflow file was just edited** → it must be PUSHED before dispatch (GitHub runs the
  remote copy of the workflow too).
- **Drafts only in the prod admin, not in git** → they die on next publish (by contract). Remind
  the owner to author via the git pipeline (`repo-to-portfolio` skill).
- **Both collections after a bilingual authoring session** → dispatch both; article and project
  are separate zips.
- **Nothing changed since last publish** → safe to re-run (idempotent upserts by uuid).
