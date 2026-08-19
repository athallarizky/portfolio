# Task Breakdown — Sprint-22 First Real Content Publish

> Status: 🟡 Delivered locally — prod apply pending owner | Created: 2026-08-19
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 0.1 | Audit prod content state (articles 0, projects 3, slack-rag zip unimported) | Easy | — | ✅ |
| 0.2 | Locate + read the raw draft (`how-to-learn-new-things-in-ai-era/draft/raw.md`) | Easy | — | ✅ |
| 0.3 | Inspect `agent-playbooks` repo + `ai-guided-learning/SKILL.md` | Easy | — | ✅ |
| 0.4 | Confirm scope with owner (1 article + 1 playbook project; slack-rag deferred) | Easy | 0.1–0.3 | ✅ |

### Service Summary

- **Prod state:** `/api/articles` → 0 docs · `/api/projects` → 3 docs
- **Inputs:** `tools/article-polish/content/how-to-learn-new-things-in-ai-era/draft/raw.md` (2.4 KB, casual BI) · `~/development/personal/agent-playbooks/ai-guided-learning/SKILL.md`
- **Ready-made:** slack-rag import zip at `tools/repo-to-project/collection/2026-07-20-10-46-slack-rag.zip` (untouched, deferred)
- **Constraint (owner, mid-sprint):** no direct VPS access — prod apply is the owner's action

> 📄 [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Article: how-to-learn-new-things-in-ai-era

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 1.1 | Follow `tools/article-polish/SKILLS.md` step 0–1: resolve identity (slug, author, tags) + read input & style refs | Easy | 0.4 | ✅ |
| 1.2 | AI polish `raw.md` → `polished/article.md` — Bahasa Indonesia, keep the casual voice, expand into structure | Medium | 1.1 | ✅ |
| 1.3 | **Owner review** of the polished draft | Easy | 1.2 | ⬜ deferred to sprint end (owner instruction: run all phases) |
| 1.4 | Format → `formatted/article.json` + `npm run wrap:articles` → zip | Medium | 1.3 | ✅ |
| 1.5 | Local dry-run import — verify author resolves, tags ride in the combined zip (phase 3) | Medium | 1.4 | ✅ |

### Service Summary

- **Article:** *How to Learn New Things in the AI Era (Tanpa Jadi Vibe Coder)* — 459 words, 3 min, uuid `67281e82-…`
- **Body:** authored as Markdown string → engine converts via `convertMarkdownToLexical` (more robust than hand-built Lexical)
- **Tags:** ai, learning, workflow (new) · author: Athalla Rizky (existing, resolved by priming)
- **Style anchor:** first sample dropped into `samples/` (sprint-21 backlog #1)

> 📄 [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Project: ai-guided-learning playbook

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 2.1 | Follow `tools/repo-to-project/SKILLS.md` on `~/development/personal/agent-playbooks` — scope to the `ai-guided-learning` playbook | Easy | 0.4 | ✅ |
| 2.2 | Generate v2 `content/ai-guided-learning/project.json` (+ `.md`) — techTags honest (no js/ts) | Medium | 2.1 | ✅ |
| 2.3 | `npm run wrap:projects` → zip → local dry-run import (via combined zip, phase 3) | Easy | 2.2 | ✅ |

### Service Summary

- **Project:** *AI-Guided Learning Playbook* — slug `ai-guided-learning`, year 2026, uuid `9ea93585-…`
- **techTags:** ai-agents (new) + productivity (existing, carried verbatim in the zip — see phase-3 priming gotcha)
- **Deviation:** slug from the playbook dir, not repo basename (owner scoped the entry to the playbook)

> 📄 [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Publish + cross-link

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 3.1 | Publish article on prod: `/admin/data-sync` → Import (Merge) with the combined zip | Easy | 1.5, **deploy first** | ⬜ owner |
| 3.2 | Publish project on prod — same zip | Easy | 2.3, **deploy first** | ⬜ owner |
| 3.3 | Admin polish: featured image (article), banner + screenshots (project) from media library | Medium | 3.1, 3.2 | ⬜ owner |
| 3.4 | Cross-link article ↔ project | Easy | 3.1, 3.2 | ✅ (in content, verified rendering) |
| 3.5 | Replace `tools/article-polish/samples/` placeholder with the real published article | Easy | 1.5 | ✅ |
| 3.6 | Verify: list + detail pages render (light/dark/mobile visual pass = owner) | Easy | 3.4 | ✅ local · prod ⬜ owner |

### Service Summary — combined zip

- **File:** `tools/article-polish/collection/portfolio-content-2026-08-19-sprint-22.zip` (4.6 KB, manifest v2)
- **Rows:** tags 3 + technologies 2 + articles 1 + projects 1 · imports idempotent (re-run = pure update)
- **Fixes shipped:** silent techTags drop (carry referenced rows), link-node 500 (`render-lexical.ts` + `api-types.ts` — [RCA](./rca/2026-08-19-lexical-link-node-500.md))

> 📄 [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Docs & wrap-up

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 4.1 | Write phase reports as phases complete | Easy | 1–3 | ✅ |
| 4.2 | Update AGENTS.md sprint history table (+ sprint-22 row, refresh pointer) | Easy | 3.6 | ✅ |
| 4.3 | Write `final-report.md` + sprint-23 handoff | Easy | 4.2 | ✅ |

---

## Dependency Graph

```
Phase 0 (✅)
  0.1–0.4 ─┬──────────────┐
            ▼              ▼
Phase 1 — Article    Phase 2 — Project   (✅ both)
  1.1 ► 1.2 ► 1.3*    2.1 ► 2.2 ► 2.3
        (*deferred          │
         to review)         │
            │               │
            ▼               ▼
Phase 3 — Publish + cross-link
  combined zip ► local import (✅) + renderer fix (✅)
  3.1 + 3.2 + 3.3 ── ⬜ owner applies on prod (deploy FIRST)
  3.4 ✅ · 3.5 ✅ · 3.6 ✅ local
            │
            ▼
Phase 4 — Docs (✅)
```

## Summary

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 0 — Discovery | 4 | 0.5h | ✅ |
| 1 — Article | 5 | 2h | ✅ (review pending) |
| 2 — Project | 3 | 1.5h | ✅ |
| 3 — Publish | 6 | 1.5h | 🟡 local ✅ · prod = owner |
| 4 — Docs | 3 | 0.5h | ✅ |
| **Total** | **21** | **~6h** | |
