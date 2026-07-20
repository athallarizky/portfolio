# Design — Repo → Portfolio Project (sprint-16)

> Companion: [`../plan.md`](../plan.md) · [`../tasks.md`](../tasks.md).
> Source schema: `backend/src/collections/Projects.ts` · `backend/src/data-sync/{keys,types,import}.ts`.

---

## 0. Tool location & layout

The tool is a self-contained folder in the repo. Invoked **manually** — the owner points Claude at the
procedure file and gives a repo path (no auto-discovery, no `.claude/skills/` wiring):

```
portfolio/
└── tools/repo-to-project/
    ├── SKILLS.md          # the procedure (human-readable) — owner references this when invoking
    ├── README.md          # what this tool is + how to invoke
    ├── content/<slug>/
    │   ├── project.json   # generated v2 row (importable; also feeds sprint-17 CMS insert)
    │   └── project.md     # human-readable rendering of the same project
    └── collection/
        └── <YYYY-MM-DD-HH-MM>-<slug>.zip   # dated history — THIS is the file you `npm run import`
```

**Invocation (manual):** *"follow `tools/repo-to-project/SKILLS.md`, repo: ~/development/foo"* → Claude
reads the file, runs the flow below, writes outputs under `tools/repo-to-project/`.

**`collection/` doubles as history + the importable artifact:** every generation writes a date-stamped
zip there. Import that zip; the dated filename is the audit trail. No separate "history" copy needed.

## 1. The v2 project row (`content/<slug>/project.json`)

A single `projects` row in the v2 archive format. `techTags` are plain slugs (the import resolves them
by slug via the primed resolver — no technology uuids needed). The skill assigns a fresh `uuid` so the
import **creates** the project.

```jsonc
{
  "uuid": "<randomUUID>",
  "title": "My Repo",
  "slug": "my-repo",
  "year": 2025,
  "excerpt": "One-sentence summary from the README.",
  "descriptor": "Personal · OSS",
  "techTags": ["go", "docker"],
  "links": [{ "label": "Source", "icon": "mdi:github", "url": "https://github.com/user/repo" }],
  "body": "## Overview\n\nTwo-three Markdown paragraphs summarizing the project.\n",
  "architecture": "my-repo/\n├── cmd/\n├── internal/\n└── README.md",
  "status": "published"
}
```

Left blank for manual polish: `bannerColor`, `bannerIcon`, `features`, `screenshots`, `seo`, `order`,
`showOnHome`. Omitting a field is safe (null on create).

## 2. The human-readable sheet (`content/<slug>/project.md`)

The same data rendered for reading/review:

```markdown
# My Repo

> Personal · OSS · 2025

One-sentence summary from the README.

**Tech:** go, docker
**Source:** https://github.com/user/repo

## Overview

Two-three Markdown paragraphs summarizing the project.

## Architecture

    my-repo/
    ├── cmd/
    ├── internal/
    └── README.md
```

## 3. Technology name → slug map (canonical, 24)

Derivation (from `seed/phases/projects.ts`): `name.toLowerCase().replace(/[^a-z0-9]/g, '-')`. The skill
embeds the explicit map and reports any unmatched tech (never silently dropped).

`Next.js→next-js` · `tRPC→trpc` · `Prisma→prisma` · `Go→go` · `FastAPI→fastapi` · `RAG→rag` ·
`Docker→docker` · `Cobra→cobra` · `Node.js→node-js` · `SSE→sse` · `Redis→redis` · `React→react` ·
`S3→s3` · `Postgres→postgres` · `WASM→wasm` · `Edge→edge` · `TypeScript→typescript` · `Vite→vite` ·
`TailwindCSS→tailwindcss` · `Express→express` · `Tauri→tauri` · `OpenAI→openai` · `MobX→mobx` · `HNSW→hnsw`

Detection sources: `package.json` deps, `go.mod`, `Cargo.toml`, `pyproject.toml`/`requirements.txt`,
`mix.exs`, `pom.xml`.

## 4. Skill flow (`tools/repo-to-project/SKILLS.md`)

```
user: "follow tools/repo-to-project/SKILLS.md, repo: <path>"   (manual reference)
  │
  ▼
0. RESOLVE identity + existing polish (§4.5): slug ← slugify(repo); reuse existing uuid
   (content/<slug>/project.json or /api/projects if backend up); snapshot existing cosmetic fields to carry over
1. READ <path>:  README.md (title/desc) · manifests (name, deps) ·
                 git remote get-url origin (→ links) · git log --reverse (→ year) ·
                 git ls-files (depth-limited) → architecture ASCII
2. MAP detected techs → slugs via §3 (collect unmatched)
3. WRITE  content/<slug>/project.json (§1, uuid from step 0; cosmetic fields OMITTED → preserved on update, §4.5)
       +  content/<slug>/project.md (§2)
4. WRAP:  cd backend && npm run wrap:projects -- ../tools/repo-to-project/content/<slug>/project.json \
             -- --out ../tools/repo-to-project/collection/<YYYY-MM-DD-HH-MM>-<slug>.zip   (collision-safe, §4.5)
5. PREVIEW: cd backend && npm run import -- ../tools/repo-to-project/collection/<...>.zip -- --dry-run
       → report created counts + errors + unmatched techs
6. HAND OFF: tell the owner to drop --dry-run to apply (or apply if they say so)
```

## 4.5. Idempotency & non-replacement

Re-running the skill on a repo that's **already** a portfolio project must **update, not duplicate or wipe**:

1. **Reuse the existing uuid** (step 0) — from `content/<slug>/project.json` (a prior run) or the live DB
   (`/api/projects?where[slug][equals]=<slug>`, if the backend is up); only mint a fresh `randomUUID()` for
   a brand-new project. Reused uuid → import upserts by uuid → **updates in place**.
2. **Refresh only repo-derived fields** — title, slug, year, excerpt, descriptor, techTags, links, body,
   architecture. **Omit** the manually-polished fields (bannerColor, bannerIcon, features, screenshots,
   seo, order, showOnHome) from the generated row → Payload's `update` leaves omitted fields untouched, so
   prior polish is **preserved, never blanked**.
3. **No duplication** — even without uuid reuse, the import's uuid→slug fallback matches the existing
   project by slug and updates it (sprint-15 identity). Import is non-destructive (never deletes).
4. **`collection/` filenames are collision-safe** — `<YYYY-MM-DD-HH-MM>-<slug>.zip`; if that exact name
   exists, append `-2`, `-3`, … so a re-generation never overwrites a prior zip.

The destructive "archive = single source of truth" mode is sprint-17 backlog item 2 — explicitly out of
scope here.

## 5. Wrap helper CLI contract

`backend/src/data-sync/cli/wrap-projects.ts` → `npm run wrap:projects -- <file.json> [-- --out <path>]`

- **Input:** a JSON file — one project row (object) or many (array).
- **Behavior:** assign `uuid` (`randomUUID`) to rows missing one; light validation (`title` + `slug`
  required); write a zip with `manifest.json` (schemaVersion 2, `counts:{projects:N}`) +
  `collections/projects.json`. Reuses `buildManifest` + `createZip` (no new zip code).
- **Output:** default `portfolio-projects-<ISO>.zip`, or `--out <path>` (the skill passes the dated
  `collection/` path). Prints the path.

## 6. Import enhancement — `primeResolver` (Phase 1)

**Problem:** `importFromArchive` builds the resolver only from records **in the archive**. A projects-only
archive has no `technologies` → `techTags` slugs don't resolve → dropped.

**Fix:** before the upsert loop, for each `RELATION_TARGETS` collection **not in `present`**, fetch its
existing records from the DB and populate the resolver. Archive records still win for collections that ARE
present (priming skipped) → full-archive imports unchanged.

```ts
export async function primeResolver(payload: Payload, resolver: IdResolver, present: ReadonlySet<string>) {
  for (const target of RELATION_TARGETS) {
    if (present.has(target)) continue
    const res = await payload.find({ collection: target, depth: 0, limit: 0, pagination: false } as any)
    for (const doc of res.docs as any[]) {
      const key = doc[NATURAL_KEYS[target]]
      if (key != null) resolver.set(target, String(key), doc.id, doc.uuid ?? undefined)
    }
  }
}
```

## 7. Edge cases

- **Slug collision** (existing project has this slug): different uuid → import matches by slug → **updates** it (surfaced in dry-run as `updated`).
- **Unmatched tech**: kept out of `techTags`, listed in the skill's report.
- **No git remote**: `links` empty (owner adds manually).
- **Year unknown** (no git/manifest): `year` is `required` → skill asks the owner instead of guessing.
- **`descriptor` inference**: LICENSE + public remote → "Personal · OSS"; work tree → "Work · …"; toy → "Experiment".

## 8. Sprint-17 handoff (NOT this sprint)

Full sprint-17 backlog: [`../../sprint-17/backlog.md`](../../sprint-17/backlog.md). Covers: (1) human-friendly
timestamped zip filenames, (2) a "replace-all" data-sync mode (archive = single source of truth — fixes the
local↔prod drift upsert-merge causes), (3) CMS insert-a-project from `.json`, (4) CMS insert-an-article from
`.json`. The `.json` this tool emits (single-row v2) is the input format for items 3 & 4.
