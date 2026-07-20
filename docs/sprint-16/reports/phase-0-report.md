# Phase 0 Report — Discovery & Design Lock

> Completed: 2026-07-20

## 1. Findings (locked during planning)

- **Technology name→slug map (24)** confirmed from the DB: `Next.js→next-js`, `tRPC→trpc`, `Node.js→node-js`,
  `TailwindCSS→tailwindcss`, … derivation rule `name.toLowerCase().replace(/[^a-z0-9]/g,'-')`
  (`seed/phases/projects.ts:9`). The SKILLS.md embeds the explicit map + reports unmatched tech.
- **Partial-archive problem confirmed:** `importFromArchive` builds the resolver only from records in the
  archive. A projects-only generated archive has no `technologies` → `techTags` would be dropped. Fix =
  `primeResolver()` (Phase 1).
- **Projects v2 row shape** confirmed from `collections/Projects.ts` + `seed/data/projects.ts`.

## 2. Owner decisions (2026-07-20)

- **Regenerate existing project = Merge** — refresh repo-derived fields, preserve manually-polished
  cosmetic fields (omit them → Payload `update` leaves them untouched).
- **Trigger = Manual** — owner references `tools/repo-to-project/SKILLS.md` + gives a repo path. No
  `.claude/skills/` auto-trigger wiring.
- **Idempotent & non-replacing** — reuse existing uuid (content/ or DB) → update in place; collision-safe
  `collection/` filenames; import is non-destructive upsert (never deletes; "replace-all" is sprint-17).

## 3. Reference map

| File | Role |
|---|---|
| `backend/src/data-sync/import.ts` | + `primeResolver()` (Phase 1) |
| `backend/src/data-sync/cli/wrap-projects.ts` | NEW — json → importable zip (Phase 2) |
| `tools/repo-to-project/SKILLS.md` | NEW — the procedure (Phase 3) |
| `tools/repo-to-project/{content,collection}/` | NEW — generated outputs (Phase 3/4) |
