# Sprint-16 Plan — Repo → Portfolio Project (LLM skill + import helper)

> Status: 🟡 Planning | Created: 2026-07-20
> Companion: [`tasks.md`](./tasks.md) · [`resources/design.md`](./resources/design.md) · previous: [`../sprint-15/final-report.md`](../sprint-15/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-15 made content identity uuid-based and added the data-sync import (upsert by uuid). The owner
authors portfolio projects by hand in the admin or seed. Most of those projects already exist as **local
repos** (`~/development/...`) — the title, slug, year, tech stack, repo URL, and architecture tree are all
derivable from the repo itself. This sprint automates that: an **LLM skill** reads a local repo and emits a
portfolio `projects` row in the v2 archive format, a **helper** wraps it into an importable zip, and the
existing `npm run import` adds it — no hand-typing, no seed edits.

## 1. Sprint goal

From a local repo path, produce an importable portfolio project entry (v2 archive) via one command chain:
`skill → wrap → npm run import`.

## 2. Scope

**In scope:**
- A self-contained tool at **`tools/repo-to-project/`**: `SKILLS.md` (canonical procedure) + `README.md`; generated outputs under `content/<slug>/` (`.json` + `.md`) and `collection/<YYYY-MM-DD>-<slug>.zip` (dated, importable).
- A **manually-invoked** procedure at `tools/repo-to-project/SKILLS.md` — the owner references it + gives a repo path (no `.claude/skills/` auto-trigger wiring).
- A **wrap helper** (`backend/src/data-sync/cli/wrap-projects.ts` + `npm run wrap:projects`) turning project row(s) into an importable zip (the skill calls it → writes to `collection/`).
- A small **import enhancement**: prime the id resolver from existing DB records for relation-target collections **not present** in the archive, so a projects-only archive still resolves `techTags`. Skipped for full archives → zero behavior change.
- **Idempotent, non-destructive generation**: re-running the skill on a repo that's already a project **updates in place** (reuses its uuid) and **preserves manually-polished fields** (banner/features/screenshots/seo) by omitting them; never duplicates or wipes. `collection/` zips are collision-safe (dated + suffix).
- `.gitignore` for `tools/repo-to-project/{content,collection}/` artifacts; tests; docs; AGENTS.md.

**Out of scope:**
- Generating `articles` / other collections (projects only this sprint).
- Auto-creating new `technologies` (the skill maps to **existing** slugs; unmatched are reported for the owner to add manually).
- Filling cosmetic fields (`bannerColor`, `bannerIcon`, `features`, `screenshots`, `seo`) — left blank for manual polish.
- Scanning a folder of repos at once (one repo per invocation; can be looped).
- **CMS one-by-one insert UI** (paste/upload a `.json` to create a record) → **sprint-17**. Sprint-16's `.json` is designed so sprint-17 can consume it directly.

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Tool folder at `tools/repo-to-project/` (SKILLS.md + content/ + collection/) | self-contained, browsable unit co-locating procedure + outputs + dated history, as the owner wants |
| Manual invocation (reference `tools/repo-to-project/SKILLS.md` + repo path) | the owner wants explicit control over when it runs; no `.claude/skills/` wiring to maintain |
| Dual output per project: `.json` (v2 row) + `.md` (human sheet) | `.json` for import + sprint-17 CMS insert; `.md` for the owner to read/review |
| `collection/<date>-<slug>.zip` = history AND the importable file | one artifact, dated filename = audit trail; no separate history copy |
| Skill (markdown) + helper script, not a pure script | deterministic fields are scriptable, but `excerpt`/`descriptor`/`body` are judgment → LLM via skill; helper does the zip wrapping |
| Emit `techTags` as **plain slugs** | the import's `toRef` accepts strings; resolver resolves by slug; skill never needs technology uuids |
| Prime resolver from DB for absent relation targets | a projects-only archive has no `technologies` → `techTags` would be dropped; priming fills the gap. Skipped for full archives |
| `architecture` auto-generated from the real file tree | it's literally an ASCII dir tree — the "read the repo" sweet spot |
| Cosmetic fields left blank | banner/features/screenshots are design choices; auto-filling guesses poorly |
| Re-generation is idempotent & non-replacing | reuse the existing uuid (content/ or DB) → update in place; refresh only repo-derived fields, OMIT cosmetic ones so manual polish is preserved (Payload `update` leaves omitted fields untouched); collection zips collision-safe. Import is non-destructive upsert |

## 4. Phasing

- **Phase 0 — Discovery:** pin the technology name→slug map; confirm the import priming approach; design the skill flow + v2 row shape + wrap contract. → [`resources/design.md`](./resources/design.md)
- **Phase 1 — Import: partial-archive resolver priming:** `primeResolver()` (extracted) + unit test.
- **Phase 2 — Wrap helper CLI:** `wrap-projects.ts` + `npm run wrap:projects` + `.gitignore`.
- **Phase 3 — Claude skill:** `.claude/skills/project-from-repo/SKILL.md`.
- **Phase 4 — Verify + docs:** e2e on a real repo → generated row → zip → dry-run import → project + techTags resolve; final-report; AGENTS.md.

> 📄 Task detail: [`tasks.md`](./tasks.md). Design: [`resources/design.md`](./resources/design.md).
