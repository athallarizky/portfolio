# Sprint-22 Final Report — First Real Content Publish

> Status: 🟡 Delivered locally — prod apply pending owner | 2026-08-19
> Audience: sprint-23 context + owner review. Read this + [`../../AGENTS.md`](../../AGENTS.md).
> Companion: [`plan.md`](./plan.md) · [`tasks.md`](./tasks.md) · reports in [`reports/`](./reports/)

---

## 1. Sprint goal & outcome

**Goal:** publish the first real content through both pipelines — 1 article + 1 project — live on production, cross-linked, clearing the sprint-21 samples backlog.

**Outcome:** 🟡 everything built, imported, and verified **locally**; the prod apply is the owner's action
(no direct VPS access — owner directive). The article is the first real `article-polish` run and the first
`samples/` style anchor. Verification surfaced and fixed a latent renderer 500 (link nodes).

## 2. What was produced

### Content (one combined zip — `tools/article-polish/collection/portfolio-content-2026-08-19-sprint-22.zip`)

| Row | Details |
|---|---|
| Article | *How to Learn New Things in the AI Era (Tanpa Jadi Vibe Coder)* — 459 words · 3 min · casual BI · tags: AI, Learning, Workflow · author: Athalla Rizky · 2026-08-19 |
| Project | *AI-Guided Learning Playbook* — slug `ai-guided-learning` · 2026 · techTags: AI Agents, Productivity · Source: github.com/athallarizky/agent-playbooks |
| Tags (3) | AI, Learning, Workflow — new |
| Technology (1) | AI Agents (`solar:bot`) — new (Productivity carried verbatim) |

Cross-linked both ways: article closes with a link to the project; the project body links back to the article.

### Code changes (forced by verification)

| File | Change |
|---|---|
| `frontend/src/lib/render-lexical.ts` | paragraphs/headings now recurse via `renderNode`; added `text` + `link` cases — fixes 500 on any body containing a link ([RCA](./rca/2026-08-19-lexical-link-node-500.md)) |
| `frontend/src/lib/api-types.ts` | Lexical types corrected: paragraph/heading children are `LexicalNode[]`; `link` node + `LexicalText` added to the union |

### Docs

`docs/sprint-22/` — plan, tasks, 4 phase reports, 1 RCA · `AGENTS.md` synced (sprint table +22, pointer) · first style sample in `tools/article-polish/samples/` (sprint-21 backlog #1 ✅).

## 3. Key decisions

| Decision | Rationale |
|---|---|
| Combined zip instead of per-tool imports | one file for local verify **and** owner's prod apply; every referenced relation row rides along |
| Body authored as Markdown string | engine converts via Payload's official `convertMarkdownToLexical` — more robust than hand-written Lexical JSON; **SKILLS.md should adopt this** (backlog) |
| Renderer fix instead of dropping the cross-link | the link node is valid Payload data — the renderer was wrong; any future article with a link would have 500'd prod |
| Prod apply = owner (deploy FIRST, then import) | no direct VPS access (owner directive); renderer fix must be live before the article lands or its detail page 500s |

## 4. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery | 4 | ✅ |
| 1 — Article | 5 | ✅ (owner review at sprint end) |
| 2 — Project | 3 | ✅ |
| 3 — Publish + cross-link | 6 | 🟡 local ✅ · prod = owner |
| 4 — Docs | 3 | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

## 5. Verification

- [x] Dry-run import: 6 created, 0 errors — real import identical (+auto-backup)
- [x] Re-import idempotent: pure `updated`, no duplicates
- [x] Relations: 3/3 tags, author, 2/2 techTags resolve (after the priming gotcha fix — phase-3 report §3)
- [x] `/blogs` + `/blogs/[slug]` + `/projects` + `/projects/[slug]` all 200, content + cross-links render
- [x] `tsc --noEmit` clean · `npm run build` clean · backend `npm test` 68/68
- [ ] **Owner:** visual pass light/dark/mobile (dev servers left running — backend :3000, frontend :4321)
- [ ] **Owner:** prod apply (below) + prod spot-check

## 6. How to run (local review)

```bash
# already running in this session: backend :3000, frontend :4321
cd backend && npm run dev    # if restarted needed
cd frontend && npm run dev
# review:
#   http://localhost:4321/blogs/how-to-learn-new-things-in-ai-era
#   http://localhost:4321/projects/ai-guided-learning
```

Owner-review artifacts (edit → re-run pipeline → re-import, all idempotent):
- `tools/article-polish/content/how-to-learn-new-things-in-ai-era/polished/article.md` (the article to review)
- `tools/repo-to-project/content/ai-guided-learning/project.md` (the project sheet)

## 7. Owner prod apply — ⚠️ order matters

1. **Deploy first** — commit + push, then GitHub → Actions → "Deploy to VPS" (the renderer fix must be live before the article, or its detail page 500s on prod).
2. **Import** — prod `/admin/data-sync` → Import card → **Merge** → upload
   `tools/article-polish/collection/portfolio-content-2026-08-19-sprint-22.zip` → dry-run → apply.
   Expected: `created: {tags:3, technologies:1, articles:1, projects:1}`, 0 errors.
   (Alternative: the two single-collection zips in the same folder + `/admin/collections/{articles,projects}` insert-from-JSON — but then create the tags/AI Agents tech in admin first.)
3. **Media polish** — article `featuredImage`, project `bannerImage`/`screenshots` (media library, manual).
4. **Spot-check** — `/blogs`, both detail pages, light/dark/mobile.

## 8. Sprint-23 handoff

- **Pipeline proven end-to-end** — future articles are routine: drop raw.md → SKILLS.md → combined-or-single zip → owner applies. Article #2+ should also land `samples/` for style diversity.
- **SKILLS.md upgrade (backlog):** document the Markdown-string body path (engine converts) as the preferred format; hand-written Lexical JSON only as fallback.
- **Carried backlog:** slack-rag zip still unapplied · `article-polish` as invocable skill · unknown-node `console.warn` in renderer.
- **Gotchas remembered:** a collection present in the zip disables priming for it → carry every referenced row · deploy-before-import whenever body content exercises renderer paths not yet on prod.

## 9. Sprint stats

- 21 tasks, 5 phases (≈6h est) · 4 phase reports · 1 RCA · 68 backend tests green
- Files: 2 frontend libs fixed · ~15 docs/artifacts written · 0 database migrations
