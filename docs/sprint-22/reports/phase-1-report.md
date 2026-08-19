# Phase 1 Report — Article: how-to-learn-new-things-in-ai-era

> Completed: 2026-08-19 · owner review deferred to sprint end (owner instruction)

## 1. How to run (reproduce)

```bash
# backend dev server running on :3000
cd backend && npm run wrap:articles -- ../tools/article-polish/content/how-to-learn-new-things-in-ai-era/formatted/article.json \
  -- --out ../tools/article-polish/collection/2026-08-19-00-00-how-to-learn-new-things-in-ai-era.zip
npm run import -- ../tools/article-polish/collection/2026-08-19-00-00-how-to-learn-new-things-in-ai-era.zip -- --dry-run
# (the sprint-22 combined zip in phase-3 supersedes this single-article zip)
```

## 2. What was produced

| Artifact | Content |
|---|---|
| `content/<slug>/draft/raw.md` | owner's raw draft, untouched |
| `content/<slug>/polished/article.md` | polished BI article — 5 sections, 459 words, 3 min read |
| `content/<slug>/formatted/article.json` | v2 row (uuid `67281e82-…`), body as Markdown string |
| `samples/2026-08-19-how-to-learn-new-things-in-ai-era.md` | **first style anchor** — samples/ was empty (sprint-21 backlog #1 cleared) |

## 3. Style rules applied (samples/ was empty → derived from the raw draft itself)

1. Casual Bahasa Indonesia, Indo-English tech terms (vibe coding, phase, verified working).
2. Short paragraphs — 1–3 sentences, direct.
3. Bold for the two load-bearing rules (agent DILARANG nulis kode / menghafal + memahami).
4. Numbered list for the workflow steps; quoted example prompt as blockquote.

## 4. Row details

- title: *How to Learn New Things in the AI Era (Tanpa Jadi Vibe Coder)*
- tags: `ai`, `learning`, `workflow` (created in the combined zip)
- author: `Athalla Rizky` (existing record — resolved via priming)
- publishedAt: 2026-08-19 · readMinutes: 3 · status: published
- cross-link: body closes with `[AI-Guided Learning Playbook](/projects/ai-guided-learning)`

## 5. Key decisions

| Decision | Reason |
|---|---|
| Body = Markdown string, engine converts | official `convertMarkdownToLexical` > hand-written node JSON (phase-0 decision) |
| Excerpt written fresh (not copied from body) | crisper for list cards |
