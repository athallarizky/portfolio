# Phase 0 Report — Discovery

> Completed: 2026-08-19

## 1. What was audited

Prod API (`athallarizky.com/api`), local DB, both content tools, the raw draft, the `agent-playbooks` repo.

## 2. Key findings

| Area | Finding |
|---|---|
| Prod blogs | **0 articles** (incl. drafts) — `article-polish` never ran on a real article |
| Prod projects | 3 published (`orgs-repo-cloner`, `github-daily-work-log`, `github-starred-collector`) |
| slack-rag | import zip generated 2026-07-20, never applied (deferred — out of scope) |
| Draft | `content/how-to-learn-new-things-in-ai-era/draft/raw.md` — 2.4 KB, casual Bahasa Indonesia |
| Playbook | `agent-playbooks/ai-guided-learning/SKILL.md` — 4-step workflow, "user writes all code" rule; repo first commit 2026-08-10 |
| tags collection | only `github` exists — **no fitting tags for an AI/learning article** |
| technologies | github, productivity, tools, javascript, typescript |

## 3. Key decisions

| Decision | Reason |
|---|---|
| Combined content zip (tags + technologies + article + project in one archive) | one file to import locally **and** hand to the owner for prod; import order handled by `IMPORT_ORDER` |
| Article body authored as **Markdown string**, not hand-built Lexical JSON | `import.ts:328-331` converts MD→Lexical via Payload's official converter — strictly more robust than hand-writing node JSON (same path exports take). Noted as SKILLS.md improvement (backlog) |
| 3 new tags (AI, Learning, Workflow) + 1 technology (AI Agents) ride in the zip | relation targets present in the archive disable DB priming for that collection — must carry every referenced row (see phase-3 report) |
| **No direct VPS access** (owner directive, mid-sprint) | prod apply is the owner's action via Payload admin; agent prepares + verifies locally only |

## 4. Reference files

| File | Purpose |
|---|---|
| `backend/src/data-sync/keys.ts` | natural keys, relations, `IMPORT_ORDER`, priming targets |
| `backend/src/data-sync/import.ts:251-264` | `primeResolver` — the "collection present in archive ⇒ no priming" rule |
| `tools/article-polish/SKILLS.md` | article pipeline contract |
