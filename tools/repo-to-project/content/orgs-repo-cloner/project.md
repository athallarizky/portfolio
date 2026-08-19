# GitHub Orgs Repo Cloner

> Personal · 2026

A tiny flag-based CLI that enumerates and bulk-clones every repository in a GitHub organization — list to gauge size, clone to mirror the whole org to disk, with archived repos filtered out and agent-driven by design.

**Tech:** typescript, node-js
**Source:** https://github.com/athallarizky/gh-tools

## Overview

GitHub Orgs Repo Cloner does one job well: pull an entire GitHub organization's repositories down to disk. Two subcommands, no ceremony. `list --org <name>` paginates through `gh api orgs/<org>/repos` and prints every clone URL — a cheap smoke test for "how big is this org?" before you commit to a bulk clone. `clone --org <name>` runs the same listing, drops archived repos by default, and streams `git clone` into `<dest>/<repo>/`, one repo at a time, so you see git's native progress as it goes.

The design is deliberately thin. Listing shells out to the `gh` CLI (no token handling of your own); cloning shells out to plain `git`, so SSH keys and credential helpers you already have just work — including for private repos, as long as `gh auth login` and git auth are set up. There's no concurrency pool, no shallow-clone flag, no manifest sidecar: just pagination, dedup by `full_name`, archived filtering, and a destination directory. Re-runs are safe — `git clone` skips what's already on disk.

What makes it more than a five-line script is the agent contract. Every flag is deterministic and prompt-free, and the per-package `SKILLS.md` is written *to the LLM* — it lists the exact user phrases that should trigger each subcommand ("clone all of <org>'s repos", "mirror an entire GitHub organization") and contrasts it with its siblings so an agent knows when *not* to reach for it. That makes it a clean primitive for the workflows it's built for: org backup and mirroring, offboarding or migrating between GitHub instances, and air-gapped local analysis — drop every repo onto a laptop so an agent can grep, read, or reason over an org's code without round-tripping to the API.

## Architecture

```
gh-tools/                              # npm workspaces monorepo
├── packages/
│   └── orgs-repo-cloner/             # the leanest of the three — ~117 LoC
│       ├── src/
│       │   ├── cli.ts                # entry — list + clone subcommands (commander)
│       │   │                         # list:  print <name>\t[archived]?\t<url>
│       │   │                         # clone: filter archived → mkdir dest → git clone loop
│       │   └── github.ts             # listOrgRepos() — paginated gh api (≤20 pages, dedup)
│       ├── SKILLS.md                 # LLM-agent manifest (when/when-not to invoke)
│       └── README.md
└── package.json                      # workspaces: ["packages/*"]

# deps: commander + execa only — no zod, no dotenv, no logger factory.
# auth: gh-CLI (list) + git (clone) — deliberately NOT dual-mode (documented).
```

---

> **Unmatched tech (not in techTags):** commander, execa — add these as `technologies` in the
> admin, or map manually, if you want them on the project. (Note: this package does **not** use zod
> or dotenv, unlike its siblings.)

> **Caveats / notes for the owner:**
> - **Monorepo link:** source points at `gh-tools` (the monorepo), not an `orgs-repo-cloner` repo. Package is live on `origin/main` (commit `566dfe1`, working tree clean) — link resolves, no 404.
> - **`descriptor`: `Personal`** — no LICENSE; README states "Private — personal tooling." Flip to `Personal · OSS` if you ever open-source it.
> - **Honest gaps kept out of the marketing copy but worth knowing:** **no tests** (the only untested package in the monorepo — compare 7 files / 23 tests in `daily-work-log` and 4 files / 39 tests in `starred-collector`); **sequential clones** (no concurrency — fine for dozens of repos, slow for hundreds); **no `--depth` / shallow clones** (full history by default). The copy leans into the "deliberately thin" framing rather than overselling.
> - **Provenance:** migrated from a standalone `gh-org-cloner` repo into the `gh-tools` monorepo (commit `566dfe1`). The standalone repo no longer exists on disk. No prior portfolio entry existed — this is a clean new entry, not a duplicate.
