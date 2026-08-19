# Sprint-22 Plan — First Real Content Publish

> Status: 🟡 Planning | Created: 2026-08-19
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-21/final-report.md`](../sprint-21/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprints 14–21 built the whole content tooling arc: data-sync, UUID identity, repo-to-project,
media library, and article-polish. But production is still empty on the content side:

- **Blogs: 0 articles** (not even drafts) — `article-polish` has only ever run on a dummy.
- **Projects: 3 published** (`orgs-repo-cloner`, `github-daily-work-log`, `github-starred-collector`).
- **`slack-rag`** zip was generated 2026-07-20 but never imported (deferred again — see out of scope).
- **`tools/article-polish/samples/`** is still empty (sprint-21 backlog #1).
- Owner dropped the first real raw draft today: `content/how-to-learn-new-things-in-ai-era/draft/raw.md`
  (~2.4 KB, casual Bahasa Indonesia — anti vibe-coding, research-first 4-step learning workflow).

## 1. Sprint goal

Publish the first real content through both pipelines: **1 article** (*how-to-learn-new-things-in-ai-era*)
and **1 project** (the `ai-guided-learning` playbook from `~/development/personal/agent-playbooks`),
live on production, cross-linked — validating the tooling end-to-end and clearing the sprint-21
samples backlog.

## 2. Scope

**In scope:**
- Polish + publish 1 article via `tools/article-polish/SKILLS.md`
- Turn the `ai-guided-learning` playbook into a `projects` entry via `tools/repo-to-project/SKILLS.md`
- Admin polish: featured image (article), banner/screenshots (project) from the media library
- Cross-link article ↔ project
- Replace `samples/` placeholder with the real published article (sprint-21 backlog #1)
- Sprint docs (`tasks.md`, phase reports, final report, AGENTS.md sprint table)

**Out of scope:**
- `slack-rag` publish (zip is ready in `tools/repo-to-project/collection/` — import anytime, not this sprint)
- Additional articles or repos
- Making `article-polish` an invocable skill (sprint-21 backlog #3)
- Media/image generation — owner uploads real images via admin
- Frontend/backend code changes — *except the renderer bugfix that verification forced* ([RCA](./rca/2026-08-19-lexical-link-node-500.md))

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Polish in Bahasa Indonesia, keep the owner's casual voice | Raw draft is casual BI; `samples/` is empty, so **this article becomes the style anchor** for future polish runs |
| One **combined content zip** (tags + technologies + article + project) | one file to import locally and hand to the owner; every referenced relation row rides along (a collection present in the archive disables DB priming — unresolvable refs drop silently) |
| Article body authored as **Markdown string**, engine converts | `import.ts` runs Payload's official `convertMarkdownToLexical` on string bodies — more robust than hand-writing Lexical node JSON |
| Project entry scoped to the **playbook**, not the whole `agent-playbooks` repo | Owner directive — the playbook is the shippable unit; the repo README provides supporting context |
| ~~Content-only sprint → no deploy~~ **Amended:** renderer bugfix ⇒ **deploy before applying content** | verification surfaced a latent 500 (`render-lexical.ts` crashed on link nodes — [RCA](./rca/2026-08-19-lexical-link-node-500.md)); the fix must be live on prod before the article imports, or its detail page 500s |
| **No direct VPS access** (owner directive, mid-sprint) | prod apply = owner via Payload admin (`/admin/data-sync`, Merge mode); the agent prepares + verifies locally only |
| Author/tags resolved at import time | `authors.name` must match; missing tags get added in admin first (UnresolvedRelationError fails safe) |

## 4. Phasing

- **Phase 0 — Discovery:** prod content audit, draft located, playbook inspected, scope confirmed *(done in-session 2026-08-19)*
- **Phase 1 — Article:** SKILLS.md pipeline on `how-to-learn-new-things-in-ai-era` → polished → formatted → local dry-run
- **Phase 2 — Project:** `ai-guided-learning` playbook → v2 `project.json` → wrap → local dry-run
- **Phase 3 — Publish + cross-link:** prod admin inserts, media, article ↔ project links, samples replacement, live verify
- **Phase 4 — Docs:** phase reports, `tasks.md` updates, final report, AGENTS.md sprint table
