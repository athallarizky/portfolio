# Sprint-21 Plan — Article Polish Tool + Upload Fix

> Status: 🟡 Planning | Created: 2026-08-11
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-20/final-report.md`](../sprint-20/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-20 menuntaskan bug fixes logic + UI (safeFetch bracket encoding, showItems incomplete, homepage hero restructure, aurora effect). Sprint-21 membangun **article polish tool** — tool AI-assisted untuk mempolish artikel Markdown menjadi Lexical rich text yang siap di-import ke database. Plus fix bug upload rendering di article body dan admin UI "Insert article from JSON".

## 1. Sprint goal

Bangun `tools/article-polish/` — tool manual-invocation yang menerima file Markdown mentah, mempolish kalimat dengan AI berdasarkan contoh gaya artikel dari static sample files, menghasilkan Lexical rich text body yang siap di-import. Plus fix bug upload di body article dan tambah admin UI "Insert article from JSON" di Articles collection.

## 2. Scope

**In scope:**
- Fix bug: upload dalam Lexical body article tidak render di frontend (`depth=1` → `depth=2`)
- Tambah admin UI component `InsertArticleFromJson` di Articles collection
- Export 1-2 artikel published sebagai static sample files untuk style reference
- Bangun `tools/article-polish/` dengan SKILLS.md + workflow lengkap
- Tool: baca Markdown input + static sample articles → AI polish → Lexical JSON → article.json + article.md
- Support wrap ke importable zip + dry-run via `/api/data-insert-one`
- Tambah `npm run wrap:articles` CLI

**Out of scope:**
- Multi-language support (sprint terpisah)
- Batch polish (satu artikel per run)
- Media upload handling di tool (author handle manual via admin)

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| `depth=2` di article detail API call | Payload perlu populate nested upload fields dalam Lexical body; depth=1 hanya populate di level pertama. `renderLexical()` baca `mediaData.filename` — kosong dengan depth=1 |
| `InsertArticleFromJson` copy full dari `InsertProjectFromJson` | Pattern identik, hanya beda collection + label. Hindari abstraksi berlebihan |
| Article polish tool ikuti struktur `tools/repo-to-project/` | Pattern sprint-16 terbukti: content/ + collection/ + SKILLS.md |
| AI output format: Lexical JSON langsung | Tidak perlu intermediate Markdown-to-Lexical converter; AI bisa generate Lexical nodes dari contoh struktur |
| **Static sample files** untuk style reference | Sample article disimpan di `tools/article-polish/samples/` — tidak perlu backend running, bisa diedit manual |
| **Author resolve by name** (`authors.name` natural key) | Import resolve by natural key; jika nama tidak ditemukan di DB → `UnresolvedRelationError` (required relationship) → import gagal, artikel tidak terbuat — aman |
| Cosmetic fields OMIT di regenerate | Payload `update` biarkan field absent untouched → manual polish di admin survive re-import |

## 4. Phasing

- **Phase 0 — Discovery:** Debug root cause upload di body, cek existing wrap-projects CLI, verifikasi article samples
- **Phase 1 — Fix upload rendering:** Bump depth di article detail + verifikasi upload muncul di FE
- **Phase 2 — InsertArticleFromJson admin UI:** Copy component, register di Articles collection, test flow
- **Phase 3 — Static samples + wrap CLI:** Export sample articles, bangun `wrap-articles.ts` CLI
- **Phase 4 — Article polish SKILLS.md:** Tulis full workflow instructions, test dengan dummy article
- **Phase 5 — Verify & docs:** Typecheck, build, visual check, final report

---

## 5. Implementation details

### Phase 1: Fix upload rendering

**Root cause:** `blogs/[slug].astro` line 11 fetch dengan `depth=1`. Upload node di Lexical body berisi `{ type: 'upload', value: { id: 123 } }` — dengan depth=1, Payload tidak populate nested fields (filename, url, sizes, alt). `renderLexical()` line 50-55 baca `mediaData?.filename` → kosong → return `''`.

**Fix:** `depth=1` → `depth=2` di API call.

### Phase 2: InsertArticleFromJson admin UI

Copy `backend/src/data-sync/admin/InsertProjectFromJson.tsx` → `InsertArticleFromJson.tsx`:
- Eyebrow/title: "Projects" → "Articles"
- Help text: article context
- API call: `collection: 'articles'`
- SAMPLE JSON: article fields

Register di `backend/src/collections/Articles.ts`:
```ts
components: {
  afterListTable: ['/data-sync/admin/InsertArticleFromJson#InsertArticleFromJson'],
},
```

### Phase 3: Static samples + wrap CLI

Export 1-2 artikel published dari API (depth=2, include full body) ke `tools/article-polish/samples/sample-N.json`.

Bangun `backend/src/cli/wrap-articles.ts` — reuse `buildSingleCollectionArchive('articles', rows)` pattern dari `wrap-projects.ts`. Tambah `"wrap:articles"` di `backend/package.json`.

### Phase 4: Article polish SKILLS.md

Tool invoke: *"follow `tools/article-polish/SKILLS.md`, input: `<path-to-input.md>`"*

**Step 0 — Resolve identity:** Slug → cek existing article (content file / API / fresh uuid).

**Step 1 — Read input + style:** Baca `input.md` + `samples/*.json`. Ekstrak karakteristik: panjang kalimat, struktur heading, tone.

**Step 2 — AI polish + Lexical conversion:** Prompt AI dengan style reference → polish → output Lexical JSON.

**Step 3 — Write article.json + article.md:**
- `article.json`: uuid, title, slug, excerpt, tags (slugs), author (name string), publishedAt, readMinutes, body (Lexical JSON), status
- `article.md`: human-readable review

**Step 4 — Wrap zip (full mode):** `npm run wrap:articles`

**Step 5 — Dry-run import (full mode):** `npm run import -- <zip> -- --dry-run`

**Step 6 — Hand off:** Summary + suggestions

**v2 article row schema:**

| Field | Fill? | Source |
|-------|-------|--------|
| `uuid` | fill | step 0 |
| `title` | fill | user / AI |
| `slug` | fill | step 0 |
| `excerpt` | fill | AI |
| `tags` | fill (slugs) | AI / user |
| `author` | fill (name) | user → resolve by `authors.name` |
| `publishedAt` | fill | user or today |
| `readMinutes` | fill | word count ÷ 200 |
| `body` | fill (Lexical JSON) | AI |
| `status` | fill `"published"` | default |
| `bannerColor`, `bannerIcon` | **OMIT** | owner polishes |
| `featuredImage` | **OMIT** | owner polishes |
| `seo` | **OMIT** | owner polishes |
| `relatedArticles` | **OMIT** | owner polishes |

### Phase 5: Verify & docs

- `tsc --noEmit` (frontend)
- `npm run build` (backend)
- Visual check: light + dark + mobile
- Write `docs/sprint-21/final-report.md`

---

## 6. Verification

- [ ] Upload image dalam body article test123 muncul di FE
- [ ] InsertArticleFromJson berfungsi — create/preview/apply
- [ ] Import article dengan author tidak ditemukan → error proper
- [ ] AI Lexical JSON valid → dirender oleh `renderLexical()`
- [ ] Article ter-import ke database via wrap + import
- [ ] Update article (re-run tool) — manual polish survive
- [ ] `tsc --noEmit` clean (frontend)
- [ ] `npm run build` clean (backend)
- [ ] Light + dark + mobile tidak berubah

---

## 7. Files to create/modify

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/pages/blogs/[slug].astro` | modify | `depth=1` → `depth=2` |
| `backend/src/data-sync/admin/InsertArticleFromJson.tsx` | **create** | Admin UI insert article JSON |
| `backend/src/collections/Articles.ts` | modify | Register `afterListTable` |
| `backend/src/cli/wrap-articles.ts` | **create** | CLI wrap article → zip |
| `backend/package.json` | modify | `"wrap:articles"` script |
| `tools/article-polish/SKILLS.md` | **create** | Full workflow instructions |
| `tools/article-polish/samples/sample-1.json` | **create** | Static style reference |
| `tools/article-polish/samples/sample-2.json` | **create** | Additional reference |
| `docs/sprint-21/plan.md` | **create** | This file |
| `docs/sprint-21/tasks.md` | **create** | Task breakdown |
| `docs/sprint-21/final-report.md` | **create** | End-of-sprint report |
