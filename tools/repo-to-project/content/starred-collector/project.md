# GitHub Starred Collector

> Personal · 2026

A flag-based TypeScript CLI that pulls any GitHub user's starred repos into a categorized, Obsidian-flavored knowledge base — markdown to read, CSV to feed an agent or RAG pipeline, and a merge command for cross-user tool catalogs.

**Tech:** typescript, node-js
**Source:** https://github.com/athallarizky/gh-tools

## Overview

GitHub Starred Collector turns the endless scroll of starred repos into something you can actually search. Run `collect --user <login>` and it pulls every starred repo — yours or anyone else's, since stars are public — validates each one against a zod schema, sorts and filters, then drops two files into `collections/<user>/`: a human-readable `starred.md` and a flat `data.csv` ready for an agent or RAG pipeline.

What makes it more than a scraper is the categorization. A 22-rule regex engine routes every repo into a bucket — AI/Agents/LLM, Frontend/UI/Design, Security/Privacy, Awesome Lists, and so on — and that structure carries into the output. The markdown reads like a curated catalog: YAML frontmatter, a `Daftar Isi` table of contents with per-category counts, ASCII bar-chart language stats, and per-repo detail blocks with stars, license, maintenance recency, and ARCHIVED/TEMPLATE badges. Auth is dual-mode — a `GITHUB_TOKEN` uses raw `fetch` with rate-limit handling, otherwise it shells out to the `gh` CLI. No auth code of your own to maintain either way.

The real pitch is the workflow it unlocks. A `combine` command deduplicates across multiple users' collections (highest-star snapshot wins on conflict) and tracks which repos are starred by N users, so you can build a shared tool catalog across a team. The whole thing is flag-based and prompt-free by design — a per-tool `SKILLS.md` manifest teaches an external agent when and how to invoke it, so the loop becomes *collect → read → reason* rather than babysitting a script. Want a tool for X? Hand the agent your starred catalog and ask.

## Architecture

```
gh-tools/                          # npm workspaces monorepo
├── packages/
│   └── starred-collector/
│       ├── src/
│       │   ├── cli.ts           # entry — collect + combine subcommands (commander)
│       │   ├── config.ts        # zod schemas for both subcommands
│       │   ├── types.ts         # repoSchema → Repo (types = z.infer)
│       │   ├── fetch.ts         # paginated fetcher (100/page, 2000 cap)
│       │   ├── combine.ts       # merge/dedup engine + starredBy counts
│       │   ├── categorize.ts    # 22-category regex ruleset
│       │   ├── logger.ts        # createLogger(debug)
│       │   ├── github/
│       │   │   ├── client.ts    # dual-mode auth (token fetch vs `gh` CLI)
│       │   │   └── queries.ts   # pure REST path builders
│       │   └── output/
│       │       ├── markdown.ts  # Obsidian knowledge-base writer
│       │       ├── csv.ts       # RFC 4180 writer + parser (hand-rolled)
│       │       └── json.ts      # json writer
│       ├── tests/               # vitest — categorize, fetch, combine, output
│       ├── SKILLS.md            # LLM-agent manifest (when/how to invoke)
│       └── README.md
├── collections/                 # (gitignored) output — <user>/{data.csv, starred.md}
└── package.json                 # workspaces: ["packages/*"]
```

---

> **Unmatched tech (not in techTags):** commander, zod, execa, dotenv, vitest — add these as
> `technologies` in the admin, or map manually, if you want them on the project.

> **Caveats / notes for the owner:**
> - **Monorepo link:** the GitHub remote points at `gh-tools` (the monorepo), not a `starred-collector` repo. This is the canonical source for the tool. The repo is fully pushed (2 commits on `origin/main`, working tree clean) — link resolves, no 404.
> - **`descriptor`: `Personal`** (no LICENSE; README states "Private — personal tooling"). Change to `Personal · OSS` if you ever open-source it.
> - **Linkedin-post accuracy:** the post is essentially correct but understated the tool — it omitted the 22-category engine, the dual-mode auth, and the `SKILLS.md` agent manifest. The copy above reflects what the tool actually does.
