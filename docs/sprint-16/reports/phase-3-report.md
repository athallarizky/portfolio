# Phase 3 Report — Tool folder + skill

> Completed: 2026-07-20

## 1. What was built

- **`tools/repo-to-project/SKILLS.md`** — the canonical procedure (manually referenced). Covers:
  - Step 0 — resolve identity + snapshot existing polish (idempotency: reuse uuid from `content/` or DB).
  - Step 1 — read the repo (README, manifests, git remote/year, `ls-files` → architecture tree).
  - Step 2 — map detected techs → the 24 slugs; collect unmatched.
  - Step 3 — write `content/<slug>/{project.json, project.md}` (v2 row, cosmetic fields OMITTED).
  - Step 4 — `wrap:projects --out collection/<date>-<slug>.zip`.
  - Step 5 — `import -- --dry-run` preview.
  - Step 6 — hand off (report unmatched techs; tell owner to drop `--dry-run`).
  - v2 row schema (fill vs omit table), the 24-entry tech map, merge semantics, edge cases.
- **`tools/repo-to-project/README.md`** — what it is + how to invoke (manual reference + repo path).

## 2. How it's invoked

```
user: "follow tools/repo-to-project/SKILLS.md, repo: ~/development/foo"
→ Claude reads SKILLS.md → scans repo → writes content/<slug>/{project.json,project.md}
→ wrap → collection/<date>-<slug>.zip → import --dry-run → hands off
```

No `.claude/skills/` wiring (`.claude` is gitignored anyway); manual trigger per the owner's choice.

## 3. Test results

| Check | Result |
|---|---|
| files written | `tools/repo-to-project/{SKILLS.md, README.md}` |
| `npx tsc --noEmit` | clean (markdown — n/a) |

The procedure itself is exercised end-to-end in Phase 4 (real repo → generate → wrap → import).

## 4. Decisions

| Decision | Reason |
|----------|--------|
| Cosmetic fields OMITTED (not nulled) in the generated row | Payload `update` leaves absent fields untouched → owner's polish survives re-generation |
| `architecture` truncated to ~15–25 lines, deep dirs collapsed | keeps the field scannable; `node_modules`/`dist`/lockfiles excluded |
| `descriptor` inferred (Personal · OSS / Work · / Experiment) | owner can edit; better than blank |
