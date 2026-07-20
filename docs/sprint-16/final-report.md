# Sprint-16 Final Report — Repo → Portfolio Project (skill + import helper)

> Status: ✅ Delivered | 2026-07-20
> Audience: sprint-17 context + owner. Read this + [`../../AGENTS.md`](../../AGENTS.md) (§5).
> Companion: [`plan.md`](./plan.md) · [`tasks.md`](./tasks.md) · [`resources/design.md`](./resources/design.md) · phase reports in [`reports/`](./reports/)

---

## 1. Sprint goal & outcome

**Goal:** from a local repo path, produce an importable portfolio `projects` entry via one command chain.

**Outcome:** ✅ Delivered and **verified by running** (55 unit tests + a full e2e on a real repo).

A manually-invoked tool (`tools/repo-to-project/`) + a wrap helper + a small import enhancement:

- **Skill procedure** (`tools/repo-to-project/SKILLS.md`) — read a repo, emit a v2 project row (`.json`) +
  a human sheet (`.md`).
- **Wrap helper** (`npm run wrap:projects`) — json → importable `collection/<date>-<slug>.zip`.
- **Import priming** — a projects-only archive now resolves `techTags` against existing `technologies`
  (no-op for full archives).
- **Idempotent & non-replacing** — re-running on an existing project **updates in place** (reuses uuid)
  and **preserves manually-polished fields**; never duplicates or wipes.

## 2. Final structure

```
portfolio/
├── tools/repo-to-project/
│   ├── SKILLS.md            # NEW — the procedure (manually referenced)
│   ├── README.md            # NEW — what it is + how to invoke
│   ├── content/<slug>/      # generated .json + .md (gitignored artifacts)
│   └── collection/          # dated importable zips (gitignored)
└── backend/
    └── src/data-sync/
        ├── import.ts                 # MOD — + primeResolver()
        ├── import.test.ts            # MOD — + 2 priming tests
        └── cli/wrap-projects.ts      # NEW — json → importable zip
```
Also: `package.json` (`wrap:projects` script), `.gitignore` (`portfolio-projects-*.zip`,
`tools/repo-to-project/{content,collection}/`).

## 3. Key deliverables

| Area | Delivered |
|------|-----------|
| Skill | `tools/repo-to-project/SKILLS.md` — 6-step procedure (resolve-uuid → read repo → map techs → write json+md → wrap → dry-run import) + 24-entry tech map + idempotency rules + edge cases |
| Wrap helper | `npm run wrap:projects -- <file.json> [-- --out <path>]` — uuid-fill, v2 manifest + projects.json, collision-safe dated filename |
| Import priming | `primeResolver()` — projects-only archives resolve `techTags`; no-op for full archives |
| Idempotency | reuse existing uuid → update in place; omit cosmetic fields → polish preserved; collision-safe collection zips |
| Tests | `node:test` **55/55** |

## 4. How it's used

```
user: "follow tools/repo-to-project/SKILLS.md, repo: ~/development/foo"
→ reads repo → writes content/foo/{project.json, project.md}
→ wrap → collection/<date>-foo.zip
→ import -- --dry-run → preview
→ (drop --dry-run to apply)
```

## 5. Key decisions

| Decision | Rationale |
|----------|-----------|
| Manual invocation (reference SKILLS.md + repo path) | owner wants explicit control; `.claude` is gitignored anyway |
| Skill + helper, not a pure script | deterministic fields scriptable; excerpt/body/architecture-judgment best by the LLM |
| `techTags` as plain slugs; prime resolver for absent targets | skill never needs technology uuids; projects-only archives still resolve |
| OMIT cosmetic fields in the generated row | Payload `update` leaves absent fields untouched → polish survives re-generation |
| Reuse existing uuid (content/ or DB) | update in place, no duplicate; stable identity across regenerations |
| `collection/` zip = history + importable artifact | one dated file; collision-safe |

## 6. Verification (all run)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm test` | **55/55** |
| `npm run build` | ✅ |
| E2E on `ai-labs/slack-rag` → generate → wrap → import | `created:{projects:1}`, 0 errors |
| techTags resolved via priming | all 7 → dual refs (not dropped) |
| Idempotent re-gen | gen2/gen3 → `updated` (no dup); gen3 omits bannerColor → **preserved**; excerpt refreshed |

## 7. How to run

```bash
# In Claude Code:
#   "follow tools/repo-to-project/SKILLS.md, repo: ~/development/<repo>"
# (Claude writes content/<slug>/{project.json,project.md}, wraps, dry-run imports, hands off.)

# Manual wrap/import:
cd backend
npm run wrap:projects -- ../tools/repo-to-project/content/<slug>/project.json -- --out ../tools/repo-to-project/collection/<date>-<slug>.zip
npm run import -- ../tools/repo-to-project/collection/<...>.zip -- --dry-run   # preview
npm run import -- ../tools/repo-to-project/collection/<...>.zip                # apply
npm test
```

## 8. Sprint-17 handoff

[`../sprint-17/backlog.md`](../sprint-17/backlog.md): (1) human-friendly timestamped zip filenames;
(2) "replace-all" data-sync mode (archive = single source of truth — fixes local↔prod drift); (3) CMS
insert-a-project from `.json`; (4) CMS insert-an-article from `.json`. Items 3 & 4 consume this sprint's
`.json` format directly.
