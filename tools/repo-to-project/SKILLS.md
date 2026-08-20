# repo-to-project — generate a portfolio project from a repo, a draft, or both

> **Manually invoked.** When the user says something like
> *"follow `tools/repo-to-project/SKILLS.md`, repo: ~/development/foo"* or
> *"follow `tools/repo-to-project/SKILLS.md`, draft: ~/notes/my-project.md"* — run this procedure end-to-end.
> You are generating a portfolio `projects` entry from a local git repo and/or a raw draft.

## What this produces

For the given input, write under `tools/repo-to-project/`:

| Path | Purpose |
|---|---|
| `content/<slug>/draft/<original>.md` | the raw, unmodified draft you started with (gitignored) — **only when a draft was given** |
| `content/<slug>/project.json` | a **v2 archive row** — importable via data-sync |
| `content/<slug>/project.md` | a human-readable rendering (for the owner to review) |
| `collection/<YYYY-MM-DD-HH-MM>-<slug>.zip` | the **importable zip** (dated history; collision-safe) — **full mode only** |

Then hand off. In **full mode** you also wrap the zip and preview the import (dry-run). The owner applies it.

All paths are relative to the **repo root** (`portfolio/`). Run backend CLI steps from `backend/`.

---

## Inputs

- `<draft.md>` — path to a Markdown draft (**optional**). The owner's raw write-up of the project.
  When present, it is the **primary source** for `title`, `excerpt`, and `body` — you **polish** it
  (restructure, tighten, fix grammar), never copy it verbatim.
- `<repo>` — absolute path to a local git repo (**optional but recommended**). Supplies the metadata
  a draft can't: `year`, `links`, `techTags`, `architecture`.
- At least **one** of `<draft.md>` / `<repo>` must be given. **Precedence when both are:**
  draft wins for narrative (`title`/`excerpt`/`body`), repo wins for metadata (`year`/`links`/
  `architecture`/`techTags` — techs named in the draft are verified against the repo's manifests).
- `<mode>` — **ask the user first** (unless they already specified). Two modes:
  - **content-only** — write `project.json` + `project.md` only. No backend, no zip, no dry-run. Use this when the owner just wants the copy fast (iterate on excerpt/body, apply later).
  - **full** (default if unclear) — also wrap the importable zip (step 4) and dry-run import against the backend (step 5) to verify it lands cleanly.
- **language & tone** — same policy as `article-polish`: **English, professional but casual** — clear,
  direct, conversational. If the draft is in another language, **translate while polishing** unless the
  owner says otherwise. Keep technical terms as-is.

---

## Procedure

> **First action:** if `<mode>` wasn't specified up front, ask the user — *content-only (just the `.md` + `.json`)* vs *full (also zip + dry-run against the backend)*. Steps 4–6 branch on the answer.

### Step 0 — Resolve identity + snapshot existing polish (idempotency)

1. `slug` ← slugify the repo's directory name (`basename`), or — draft-only — the project title / draft
   filename: lowercase → `replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`.
2. Find an **existing** project with this slug, in this order:
   - `tools/repo-to-project/content/<slug>/project.json` (a prior run) → reuse its `uuid`; remember its
     cosmetic fields (`bannerColor, bannerIcon, features, screenshots, seo, order, showOnHome`).
   - else, if the backend is reachable: `curl -s 'http://localhost:3000/api/projects?where[slug][equals]=<slug>&depth=0'`
     → if `totalDocs>0`, reuse `docs[0].uuid` + remember its cosmetic fields.
   - else → mint a fresh `uuid` (`node -e 'console.log(crypto.randomUUID())'`).
3. **If an existing project was found → this run is an UPDATE.** You will **omit** the cosmetic fields
   (step 3) so the import preserves the owner's manual polish. (See *Merge semantics* below.)

### Step 1 — Read the sources

**If a draft was given:** first snapshot it — copy the file, unmodified, to
`content/<slug>/draft/<original>.md` (gitignored). Then read it in full. It anchors the narrative:
what the project does, why it exists, how it works — and **its leading H1 (`# …`), when present,
is the title** (verbatim — see the Extract rules below).

**If a repo was given:** run these (substitute `<repo>`):

```bash
# Title + description
cat <repo>/README.md            # also try readme.*, README.rst

# Manifests (name + dependencies → tech detection)
cat <repo>/package.json 2>/dev/null
cat <repo>/go.mod 2>/dev/null
cat <repo>/Cargo.toml 2>/dev/null
cat <repo>/pyproject.toml 2>/dev/null; cat <repo>/requirements.txt 2>/dev/null
ls <repo>/Dockerfile <repo>/docker-compose.yml 2>/dev/null

# Repo URL (→ links)
git -C <repo> remote get-url origin 2>/dev/null

# Year (first commit)
git -C <repo> log --reverse --format=%ci 2>/dev/null | head -1

# File tree (→ architecture) — tracked files only (respects .gitignore)
git -C <repo> ls-files 2>/dev/null | head -60
```

Extract:
- **title** — if the draft opens with an H1 (`# …`), that heading **is the title** — carried verbatim
  (strip the leading `# `), never re-authored, and excluded from the body. Else README H1, else
  `package.json` `name` humanized, else the dir name Title-Cased.
- **excerpt** — one sentence, authored crisp (don't copy-paste a wall): the draft's thesis when given, else the README's first paragraph / tagline.
- **year** — year of the first commit; fallback `package.json`; if unknown, **stop and ask the owner** (the field is required).
- **links** — `[{ label: "Source", icon: "mdi:github", url: <origin> }]`. Normalize `git@github.com:u/r.git` → `https://github.com/u/r`. If no remote → omit `links`.
- **architecture** — a depth-limited ASCII tree (top 2–3 levels, ~15–25 lines) built from `ls-files`. Collapse deep/irrelevant dirs (`node_modules`, `dist`, `.git`, `vendor`, lockfiles). End with `…` if truncated.

### Step 2 — Map technologies → slugs

Detect tech from the manifests + README + draft narrative, then map to **slugs** via the table below. Detection hints:
`package.json` deps (`react`, `next`, `@prisma/client`, `@trpc/server`, `express`, `ioredis`/`redis`,
`vite`, `tailwindcss`, `typescript`, `@tauri-apps/*`, `mobx`, `openai`); `go.mod` (`spf13/cobra`→cobra,
go itself); `Cargo.toml` (`wasm-bindgen`→wasm); `pyproject`/`requirements` (`fastapi`, `pgvector`→postgres,
`openai`); a `Dockerfile`/`docker-compose.yml`→docker. README keyword matches (RAG, SSE, Edge, HNSW, S3).
Techs named in a draft: **confirmed** in draft-only runs (the owner wrote them); when a repo is also
given, verify them against the manifests before including.

**Collect anything that looks like a tech but doesn't map → report it (step 6); do not put unmatched
slugs in `techTags`.**

### Step 3 — Write `content/<slug>/project.json` + `content/<slug>/project.md`

Create `tools/repo-to-project/content/<slug>/` and write:

**`project.json`** — a single object (the v2 row). **Fill** the repo-derived fields; **omit** cosmetic
fields (so updates preserve them — see schema below):

```jsonc
{
  "uuid": "<from step 0>",
  "title": "...",
  "slug": "<slug>",
  "year": 2025,
  "excerpt": "One sentence.",
  "descriptor": "Personal · OSS",
  "techTags": ["go", "docker"],
  "links": [{ "label": "Source", "icon": "mdi:github", "url": "https://github.com/u/r" }],
  "body": "## Overview\n\nTwo-three Markdown paragraphs.\n",
  "architecture": "repo/\n├── cmd/\n└── README.md",
  "status": "published"
}
```

**`project.md`** — the human-readable sheet:

```markdown
# <Title>

> <descriptor> · <year>

<excerpt>

**Tech:** <comma-joined slugs/names>
**Source:** <url>

## Overview

<body markdown>

## Architecture

    <architecture tree, indented in a code block>
```

`descriptor` inference: has `LICENSE` + public remote → `Personal · OSS`; obvious work/internal →
`Work · Internal tooling`; toy/experiment → `Experiment`; else `Personal`. The owner can edit.

### Step 4 — Wrap into the importable zip

> **full mode only.** In **content-only mode**, skip this and step 5 — go straight to step 6.
> (The zip is only needed for the import CLI. To apply later via the admin UI's "Add one project from
> JSON" panel at `/admin/collections/projects`, the raw `project.json` is enough.)

```bash
cd backend && npm run wrap:projects -- ../tools/repo-to-project/content/<slug>/project.json \
  -- --out ../tools/repo-to-project/collection/<YYYY-MM-DD-HH-MM>-<slug>.zip
```
(`YYYY-MM-DD-HH-MM` = local now, zero-padded. The helper assigns a uuid if `project.json` lacks one and
makes the filename collision-safe.)

### Step 5 — Preview (dry-run import)

> **full mode only.** Needs the backend running (`cd backend && npm run dev`).

```bash
cd backend && npm run import -- ../tools/repo-to-project/collection/<…>-<slug>.zip -- --dry-run
```
Expect `created: { projects: 1 }` (new) or `updated: { projects: 1 }` (existing slug) and **0 errors**.
`techTags` should resolve (the import primes technologies from the DB — they must already exist as
`technologies` records; unmatched slugs would be silently dropped, which is why step 2 reports them).

### Step 6 — Hand off

Tell the owner, in plain language:
- what was generated (title, slug, year, tech, links) — **always**;
- any **unmatched techs** (suggest adding them as `technologies`, or mapping manually) — **always**;
- **full mode:** the dry-run result (created vs updated, any errors); to apply, drop `--dry-run` from step 5;
- **content-only mode:** to apply later, either re-run in full mode, or upload `project.json` via the admin's "Add one project from JSON" panel at `/admin/collections/projects`.

---

## v2 project row schema — what to FILL vs OMIT

| Field | Fill? | Source |
|---|---|---|
| `uuid` | fill (reuse existing or fresh) | step 0 |
| `title` | fill | README / manifest |
| `slug` | fill | step 0 |
| `year` | fill (required — ask if unknown) | git first commit |
| `excerpt` | fill (1 sentence) | draft / README |
| `descriptor` | fill (infer) | signals |
| `techTags` | fill (slugs only) | step 2 |
| `links` | fill (Source) | git remote |
| `body` | fill (Markdown) | draft (polished) / README |
| `architecture` | fill (ASCII tree) | `ls-files` — draft-only: omit unless the draft implies one |
| `status` | fill `"published"` | default |
| `bannerColor`, `bannerIcon` | **OMIT** | owner polishes in admin |
| `features`, `screenshots` | **OMIT** | owner polishes in admin |
| `seo` | **OMIT** | owner polishes in admin |
| `order`, `showOnHome` | **OMIT** | owner polishes in admin |

**Why OMIT (not null):** Payload's `update` leaves fields absent from `data` untouched → the owner's
manual polish survives a re-generation. (On a brand-new project they simply default null.)

---

## Technology name → slug map (canonical, 24)

Rule: `name.toLowerCase().replace(/[^a-z0-9]/g, '-')`.

| name | slug | | name | slug |
|---|---|---|---|---|
| Next.js | `next-js` | | Node.js | `node-js` |
| tRPC | `trpc` | | SSE | `sse` |
| Prisma | `prisma` | | Redis | `redis` |
| Go | `go` | | React | `react` |
| FastAPI | `fastapi` | | S3 | `s3` |
| RAG | `rag` | | Postgres | `postgres` |
| Docker | `docker` | | WASM | `wasm` |
| Cobra | `cobra` | | Edge | `edge` |
| TypeScript | `typescript` | | Vite | `vite` |
| TailwindCSS | `tailwindcss` | | Express | `express` |
| Tauri | `tauri` | | OpenAI | `openai` |
| MobX | `mobx` | | HNSW | `hnsw` |

If the owner has added technologies via the admin, also match those (query `/api/technologies?depth=0`).

---

## Merge semantics (idempotency)

- **Reuse the existing uuid** (step 0) → import upserts by uuid → **updates in place** (no duplicate).
- **Omit cosmetic fields** → manual polish preserved (never blanked).
- Even without uuid reuse, the import's uuid→slug fallback matches the existing project by slug and
  updates it (sprint-15 identity). The import is **non-destructive** (never deletes).
- `collection/` filenames are collision-safe → a re-run never overwrites a prior zip.

The destructive "archive = single source of truth" mode is **sprint-17** — not this tool.

---

## Edge cases

- **No README** → derive title from the draft / dir name / manifest; write a short generic excerpt; flag it for the owner.
- **No git remote** → omit `links`.
- **Draft-only (no repo)** → no git/manifest to mine: `year` → **ask the owner** (required); `links` →
  omit unless the draft carries a URL; `architecture` → omit unless the draft implies one. Flag all
  three in the handoff (step 6).
- **Both draft + repo** → the draft owns the narrative — don't let README wording override it. The repo
  only fills metadata (year, links, architecture, tech verification).
- **Year unknown** (no git, no manifest) → **stop and ask** (the field is required).
- **Slug collision with an unrelated existing project** → the import would *update* that project. If the
  repo is genuinely different, ask the owner for a distinct slug before generating.
- **Backend not running** → skip the DB lookup (step 0 falls back to content/ or fresh uuid). In **full
  mode**, the dry-run import (step 5) needs the backend — either start it (`cd backend && npm run dev`) or
  fall back to **content-only mode** for this run. **content-only mode** never needs the backend.
