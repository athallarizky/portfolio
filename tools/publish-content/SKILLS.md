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
- service-account login failure → retry; if it persists, use the fallback (Step 5)

### Step 4 — Verify prod converged

```bash
# the new/changed slugs are live (both locales when translated)
curl -s 'https://athallarizky.com/api/articles?limit=100&depth=0&locale=id' | jq -r '.docs[].slug'
curl -s -o /dev/null -w '%{http_code}\n' 'https://athallarizky.com/id/blogs/<new-slug>'
# removed-from-git rows are GONE (replace-only contract) — check a deleted slug returns null/404/301
```

### Step 5 — Fallback (only if Actions is down or the workflow itself is broken)

Build locally + import on the VPS over SSH (owner-granted access; host/user per `deploy.yml` secrets):
```bash
cd backend && npm run wrap:publish -- --articles        # or --projects (auto-attaches *.id.json)
scp ../tools/collection/portfolio-publish-<collection>-<stamp>.zip root@<VPS>:/root/portfolio/backend/
ssh root@<VPS> 'cd /root/portfolio/backend && pm2 stop portfolio-backend && \
  npm run import -- portfolio-publish-<collection>-<stamp>.zip -- --replace-only <collection> && \
  pm2 start portfolio-backend'
```

### Step 6 — Handoff

Report: workflow run URL + conclusion · created/updated/locale-overlay counts from the log ·
prod verification results (slug list, spot-check URL + status) · any drift deletions.

---

## Edge cases

- **Publish workflow file was just edited** → it must be PUSHED before dispatch (GitHub runs the
  remote copy of the workflow too).
- **Drafts only in the prod admin, not in git** → they die on next publish (by contract). Remind
  the owner to author via the git pipeline (`repo-to-portfolio` skill).
- **Both collections after a bilingual authoring session** → dispatch both; article and project
  are separate zips.
- **Nothing changed since last publish** → safe to re-run (idempotent upserts by uuid).
