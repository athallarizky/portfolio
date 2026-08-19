# GitHub Daily Work Log

> Personal · 2026

A flag-based TypeScript CLI that gathers one day of GitHub activity — commits, issues, and pull requests you opened, updated, or reviewed — into an agent-ready bundle, so a terminal agent can write your daily engineering log in one shot.

**Tech:** typescript, node-js
**Source:** https://github.com/athallarizky/gh-tools

## Overview

GitHub Daily Work Log answers the question every engineer fumbles at standup: *what did I actually do yesterday?* Activity scatters across commits in one repo, a PR in another, an issue you commented on, a review you left — and most of it isn't in your head anymore. Point this CLI at a date and a timezone and it gathers the full picture into one deterministic, structured bundle for an agent to summarize.

Collection runs three passes and merges them. A commits track discovers repos through GitHub's contributions API, lists each repo's commits for the day, and enriches every one with file stats and linked PRs. A parallel issues & PRs track fires seven Search API queries — issues authored-created, authored-updated, assignee-created, assignee-updated; PRs authored-created, authored-updated, reviewed-by — and deduplicates by node id. A third pass walks each PR's own commits, catching work that lives on a feature branch and never hit the default. Everything unions under `mergeRepositories`, deduped by SHA. All of it shells out to the `gh` CLI — zero auth code of your own, just `gh auth login` and you're in.

The deliberate design choice is that the tool never calls an LLM. It writes four files to `runs/<date>/`: a Markdown prompt primed with grouping rules and an "outcomes over activity" instruction, a normalized JSON model, the raw API responses, and a manifest. Hand the prompt to Codex, Claude, or whatever you run, and the day's work log writes itself. Because it's fully flag-based and deterministic, the same loop drops cleanly into a cron job, an n8n flow, or a Codex/Cowork automation — daily reporting and KPI evidence without the manual archaeology.

## Architecture

```
gh-tools/                              # npm workspaces monorepo
├── packages/
│   └── daily-work-log/
│       ├── src/
│       │   ├── cli.ts             # entry — collect subcommand (commander)
│       │   ├── config.ts          # zod schemas for the collect options
│       │   ├── model.ts           # NormalizedDay + search schemas (z.infer types)
│       │   ├── normalize.ts       # raw API → normalized domain model
│       │   ├── output.ts          # writes the 4-file context bundle
│       │   ├── date-window.ts     # local date + IANA tz → UTC window (hand-rolled)
│       │   ├── logger.ts          # createLogger(debug)
│       │   ├── github/
│       │   │   ├── client.ts      # gh-CLI-only wrapper (execa) — no token path
│       │   │   ├── queries.ts     # pure REST path builders
│       │   │   ├── discovery.ts   # repo discovery + viewer login
│       │   │   ├── enrichment.ts  # commit detail, file stats, linked PRs
│       │   │   └── search.ts      # the 7 Search API queries + categorize
│       │   ├── search/
│       │   │   ├── deduplicate.ts # merge by node id, best-category-wins
│       │   │   └── normalize.ts   # search item → normalized schema
│       │   └── context/
│       │       ├── agent-input.ts # renders the agent prompt markdown
│       │       └── manifest.ts    # bundle metadata writer
│       ├── tests/                 # vitest — 7 spec files
│       ├── SKILLS.md              # LLM-agent manifest (collect → read → reason)
│       └── README.md
└── package.json                   # workspaces: ["packages/*"]
```

---

> **Unmatched tech (not in techTags):** commander, zod, execa, dotenv, vitest — add these as
> `technologies` in the admin, or map manually, if you want them on the project.

> **Caveats / notes for the owner:**
> - **Monorepo link:** source points at `gh-tools` (the monorepo), not a `daily-work-log` repo. Repo is fully pushed (`feat: add daily-work-log` commit on `origin/main`, working tree clean) — link resolves, no 404.
> - **`descriptor`: `Personal`** — no LICENSE; README states "Private — personal tooling." Flip to `Personal · OSS` if you ever open-source it.
> - **Supersedes the earlier `gh-journey-summarizer` entry** we drafted this session — same tool lineage, migrated into the `gh-tools` monorepo and matured (added the full issues/PRs search track + dedup). The old `content/gh-journey-summarizer/` dir has been deleted from disk; **remember to also delete the old `gh-journey-summarizer` project record in the DB** (via `/admin/collections/projects` or the merge tool) to avoid a duplicate on the frontend.
> - **Draft accuracy:** the LinkedIn-style draft was accurate on auth (gh-CLI), coverage (issues + PRs + commits + reviews), and the agent angle. The one nuance to keep honest: "automation-ready" (flag-based, deterministic, agent contract) — not "ships with a scheduler." The copy above reflects that.
