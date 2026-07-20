# repo-to-project

Generate a portfolio **project** entry from a local git repo. Reads the repo (README, manifests, git
remote, file tree) and produces a portable `.json` (importable via data-sync) + a human-readable `.md`.

## Invoke (manual)

In Claude Code, point at this procedure and give a repo path:

> *follow `tools/repo-to-project/SKILLS.md`, repo: ~/development/foo*

Claude reads `SKILLS.md`, scans the repo, and writes:

```
tools/repo-to-project/
├── content/<slug>/project.json   # v2 archive row (importable)
├── content/<slug>/project.md     # human-readable sheet
└── collection/<date>-<slug>.zip  # importable zip (dated, collision-safe)
```

Then previews the import (dry-run). You apply it with `npm run import -- <zip>` (drop `--dry-run`).

## What it fills vs leaves blank

**Fills** (from the repo): `title, slug, year, excerpt, descriptor, techTags, links, body, architecture, status, uuid`.
**Omits** (you polish in the admin): `bannerColor, bannerIcon, features, screenshots, seo, order, showOnHome`.

Re-running on a repo that's already a project **updates it in place** (reuses its uuid) and **preserves
your manual polish** — it never duplicates or wipes.

## techTags

Mapped to the 24 existing `technologies` slugs (see `SKILLS.md`). Unmatched techs are reported — add them
as `technologies` in the admin, or map manually.

## Requirements

- The repo is a local git repo (for remote/year/file-tree).
- The backend runs for the dry-run import + the tech-slug/uuid DB lookups: `cd backend && npm run dev`.
- Import happens via data-sync (`npm run import`); the generated `.json` is also the input format for the
  future CMS one-by-one insert (sprint-17).

See `SKILLS.md` for the full procedure. Design: `docs/sprint-16/resources/design.md`.
