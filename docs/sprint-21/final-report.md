# Sprint-21 Final Report — Article Polish Tool + Upload Fix

> Status: ✅ Delivered | 2026-08-11
> Audience: sprint-22 context. Read this + [`../../AGENTS.md`](../../AGENTS.md) before starting next sprint.

---

## 1. Sprint goal & outcome

**Goal:** Bangun `tools/article-polish/` — tool AI-assisted untuk mempolish artikel Markdown menjadi Lexical rich text, plus fix bug upload rendering di article body, plus admin UI insert article from JSON.

**Outcome:** ✅ delivered. Bug upload fixed (depth=1 → depth=2), InsertArticleFromJson admin UI built, wrap-articles CLI added, article-polish SKILLS.md written dengan workflow 0–6.

## 2. What changed

### Frontend

| File | Change |
|------|--------|
| `frontend/src/pages/blogs/[slug].astro` | API call `depth=1` → `depth=2` — upload nodes in Lexical body now populate with filename/url/alt |

### Backend

| File | Change |
|------|--------|
| `backend/src/data-sync/admin/InsertArticleFromJson.tsx` | **New** — admin UI for pasting article JSON, identical pattern to InsertProjectFromJson |
| `backend/src/collections/Articles.ts` | Register `afterListTable` component `InsertArticleFromJson` |
| `backend/src/data-sync/cli/wrap-articles.ts` | **New** — CLI to wrap article JSON rows into importable zip, reuses `buildSingleCollectionArchive` |
| `backend/package.json` | Added `"wrap:articles"` script |

### Tools

| File | Change |
|------|--------|
| `tools/article-polish/SKILLS.md` | **New** — full 6-step workflow: resolve identity → read input+style → AI polish → write polished+formatted → wrap zip → dry-run import |
| `tools/article-polish/README.md` | **New** — quickstart: invoke, apply, requirements |
| `tools/article-polish/samples/.gitkeep` | **New** — keeps samples folder in git; contents (Markdown style refs) are gitignored |
| `tools/article-polish/content/<slug>/draft/` | **gitignored** — raw input drafts |
| `tools/article-polish/content/<slug>/polished/` | **gitignored** — AI-polished Markdown for review |
| `tools/article-polish/content/<slug>/formatted/` | **gitignored** — single article.json ready for admin import |
| `tools/article-polish/collection/` | **gitignored** — importable zips (full mode) |

### Docs

| File | Change |
|------|--------|
| `docs/sprint-21/plan.md` | Sprint plan |
| `docs/sprint-21/tasks.md` | 21 tasks across 5 phases |
| `docs/sprint-21/final-report.md` | This file |

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| `depth=2` for article detail pages | Payload doesn't populate upload nodes at depth=1 — missing filename/url breaks `renderLexical()` |
| InsertArticleFromJson fully copies InsertProjectFromJson | Pattern identical, only collection + labels differ; no premature abstraction |
| Static sample files for style reference | Doesn't need backend running, can be manually edited |
| Author resolve by name (natural key `authors.name`) | Import resolves automatically; if name not found → UnresolvedRelationError → import fails safely |
| Lexical JSON output directly from AI | No intermediate Markdown-to-Lexical converter needed |
| Cosmetic fields omitted on regenerate | Payload leaves absent fields untouched → manual polish survives re-import |

## 4. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery | 3 | ✅ |
| 1 — Fix upload | 2 | ✅ |
| 2 — InsertArticleFromJson | 3 | ✅ |
| 3 — Samples + wrap CLI | 4 | ✅ |
| 4 — Polish SKILLS.md | 5 | ✅ |
| 5 — Verify & docs | 4 | ✅ |
| **Total** | **21** | ✅ |

## 5. Verification

- [x] Upload image di body article muncul (verified: depth=2 API response has `filename`, `url`, `alt`)
- [x] InsertArticleFromJson component registered + builds
- [x] `wrap:articles` CLI functional — creates valid importable zip
- [x] Dry-run import successful — `updated: { articles: 1 }`, 0 errors, idempotent
- [x] `tsc --noEmit` (frontend) clean
- [x] `npm run build` (backend) clean
- [x] `npm run build` (frontend) clean
- [x] `npm test` — all 68 tests pass
- [x] Light + dark + mobile tidak berubah (no CSS changes)

## 6. Sprint-22 handoff

### What the next sprint needs to know

- **article-polish tool ready to use:** invoke with *"follow `tools/article-polish/SKILLS.md`, input: path/to/my-article.md"*
- **Structure:** `content/<slug>/draft/` (raw), `polished/` (md review), `formatted/` (json — copy to admin)
- **Samples:** drop published article `.md` files into `samples/` for style reference; contents gitignored, folder kept via `.gitkeep`
- **Author must exist in DB** — the import resolves by `authors.name`. Pastikan author name di article.json match dengan yang ada di admin.
- **Tags must exist in DB** — tag slugs must match existing `tags` records. Add new tags via admin first.
- **InsertArticleFromJson** available at `/admin/collections/articles` — tombol "＋ Create new from JSON" di atas list.
- **No media handling** — the tool doesn't handle featured images or inline uploads. Author adds those manually in admin after import.

### Cleanup / backlog

- [ ] Replace `tools/article-polish/samples/sample-1.json` with a real published article
- [ ] Add 1-2 more real article samples for better style diversity
- [ ] Consider adding `article-polish` as a Command Code skill for direct invocation
