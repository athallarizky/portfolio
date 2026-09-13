# repo-to-project

Generate a portfolio **project** entry from a local git repo, a raw draft, or both. Reads the repo
(README, manifests, git remote, file tree) and/or polishes your draft, and produces a portable
`.json` (importable via data-sync) + a human-readable `.md`.

## Invoke (manual)

In Claude Code, point at this procedure and give a repo path and/or a draft:

> *follow `tools/repo-to-project/SKILLS.md`, repo: ~/development/foo*
> *follow `tools/repo-to-project/SKILLS.md`, draft: ~/notes/my-project.md, repo: ~/development/foo*

When both are given, the **draft owns the narrative** (title/excerpt/body — polished, English
professional-casual) and the **repo owns the metadata** (year, links, architecture, tech verification).

Claude reads `SKILLS.md`, scans the sources, and writes:

```
tools/repo-to-project/
├── content/<slug>/draft/          # raw draft snapshot (gitignored; only when a draft was given)
├── content/<slug>/project.json    # v2 archive row (importable)
├── content/<slug>/project.md      # human-readable sheet
├── content/<slug>/project.id.md   # optional Indonesian review copy (sprint-24)
├── content/<slug>/project.id.json # optional ID overlay sibling (sprint-24)
└── collection/<date>-<slug>.zip   # importable zip (dated, collision-safe)
```

Then previews the import (dry-run). You apply it with `npm run import -- <zip>` (drop `--dry-run`).

**Optional Indonesian translation** (`SKILLS.md` step 3b): asking for a translation also writes
`project.id.md` + `project.id.json` — an overlay with the same `uuid`+`slug` as the EN row,
localized fields only (`title`, `excerpt`, `body`, optional `features`/`seo`). Wrap tools attach
it automatically; imports write only the `id` locale — `techTags`, `links`, `architecture` are
shared and never translated.

## What it fills vs leaves blank

**Fills** (from the draft and/or repo): `title, slug, year, excerpt, descriptor, techTags, links, body, architecture, status, uuid`.
**Omits** (you polish in the admin): `bannerColor, bannerIcon, features, screenshots, seo, order, showOnHome`.

Re-running on a repo that's already a project **updates it in place** (reuses its uuid) and **preserves
your manual polish** — it never duplicates or wipes.

## techTags

Mapped to the 24 existing `technologies` slugs (see `SKILLS.md`). Unmatched techs are reported — add them
as `technologies` in the admin, or map manually.

## Requirements

- At least one input: a local git repo (for remote/year/file-tree) and/or a Markdown draft.
  Draft-only runs ask you for the `year` (required) and omit `links`/`architecture` unless known.
- The backend runs for the dry-run import + the tech-slug/uuid DB lookups: `cd backend && npm run dev`.
- Import happens via data-sync (`npm run import`); the generated `.json` is also the input format for the
  future CMS one-by-one insert (sprint-17).

See `SKILLS.md` for the full procedure. Design: `docs/sprint-16/resources/design.md`.
