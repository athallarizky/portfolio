# Task Breakdown — Sprint-21: Article Polish Tool + Upload Fix

> Status: ✅ Completed | Created: 2026-08-11
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery

| ID   | Task                                        | Difficulty | Dependencies | Status |
|------|---------------------------------------------|------------|-------------|--------|
| 0.1  | Debug root cause upload di body — cek API response article test123 dengan depth=1 vs depth=2 | Easy | — | ✅ |
| 0.2  | Baca `backend/src/cli/wrap-projects.ts` — pahami pattern wrap CLI | Easy | — | ✅ |
| 0.3  | Cek article yang ada di database — export 1-2 artikel published via API (depth=2) untuk sample | Easy | — | ✅ |

### Service Summary

- **Root cause confirmed:** depth=1 doesn't populate upload node's nested fields (filename, url, alt). depth=2 does.
- **Wrap CLI pattern:** `buildSingleCollectionArchive('projects', rows)` reused for articles.

---

## Phase 1 — Fix upload rendering

| ID   | Task                                        | Difficulty | Dependencies | Status |
|------|---------------------------------------------|------------|-------------|--------|
| 1.1  | Ubah `depth=1` → `depth=2` di `blogs/[slug].astro` line 11 | Easy | 0.1 | ✅ |
| 1.2  | Verifikasi upload di body article test123 muncul di FE | Easy | 1.1 | ✅ |

### Service Summary

- **Runtime:** Astro SSR
- **Files:** `frontend/src/pages/blogs/[slug].astro`
- **Key output:** API-downloaded upload nodes now populate filename + url, `renderLexical()` produces `<img>` tags

> 📄 Full report: [`final-report.md`](./final-report.md)

---

## Phase 2 — InsertArticleFromJson admin UI

| ID   | Task                                        | Difficulty | Dependencies | Status |
|------|---------------------------------------------|------------|-------------|--------|
| 2.1  | Copy `InsertProjectFromJson.tsx` → `InsertArticleFromJson.tsx`, ganti collection + label + sample JSON | Easy | 0.2 | ✅ |
| 2.2  | Register component di `Articles.ts` (`afterListTable`) | Easy | 2.1 | ✅ |
| 2.3  | Test flow: buka admin Articles → paste JSON → Preview → Apply → refresh list | Easy | 2.2 | ✅ |

### Service Summary

- **Runtime:** React (PayloadCMS admin UI)
- **Files:** `backend/src/data-sync/admin/InsertArticleFromJson.tsx`, `backend/src/collections/Articles.ts`
- **Key output:** Button "＋ Create new from JSON" on `/admin/collections/articles` list

---

## Phase 3 — Static samples + wrap CLI

| ID   | Task                                        | Difficulty | Dependencies | Status |
|------|---------------------------------------------|------------|-------------|--------|
| 3.1  | Export 1-2 artikel published via API (depth=2) → simpan ke `tools/article-polish/samples/sample-N.json` | Easy | 0.3 | ✅ |
| 3.2  | Bangun `backend/src/cli/wrap-articles.ts` — reuse `buildSingleCollectionArchive('articles', rows)` | Medium | 0.2 | ✅ |
| 3.3  | Tambah `"wrap:articles"` di `backend/package.json` | Easy | 3.2 | ✅ |
| 3.4  | Test `wrap:articles` → generate zip → `npm run import -- <zip> -- --dry-run` | Easy | 3.3 | ✅ |

### Service Summary

- **Runtime:** Node.js CLI (tsx)
- **Files:** `backend/src/data-sync/cli/wrap-articles.ts`, `backend/package.json`, `tools/article-polish/samples/sample-1.json`
- **Key output:** Importable zip + dry-run verified: `updated: { articles: 1 }`, 0 errors

---

## Phase 4 — Article polish SKILLS.md

| ID   | Task                                        | Difficulty | Dependencies | Status |
|------|---------------------------------------------|------------|-------------|--------|
| 4.1  | Tulis `tools/article-polish/SKILLS.md` dengan workflow step 0–6 | Medium | 3.1, 3.2 | ✅ |
| 4.2  | Siapkan dummy `input.md` untuk test | Easy | 4.1 | ✅ |
| 4.3  | Jalankan tool → AI polish → generate article.json + article.md | Medium | 4.2 | ⬜ |
| 4.4  | Verifikasi Lexical JSON valid — render lewat `renderLexical()` | Medium | 4.3 | ⬜ |
| 4.5  | Import article hasil polish via insert-one / wrap+import | Easy | 4.4 | ⬜ |

### Service Summary

- **Runtime:** Manual invocation (AI agent follows SKILLS.md)
- **Files:** `tools/article-polish/SKILLS.md`
- **Key output:** Full 6-step workflow: identity → read input+styles → AI polish → write JSON+MD → wrap zip → dry-run
- **Notes:** Tasks 4.2–4.5 are the actual usage steps (invoked manually by the user, not automated)

---

## Phase 5 — Verify & docs

| ID   | Task                                        | Difficulty | Dependencies | Status |
|------|---------------------------------------------|------------|-------------|--------|
| 5.1  | `tsc --noEmit` (frontend) — pastikan clean | Easy | 1.1, 2.2 | ✅ |
| 5.2  | `npm run build` (backend) — pastikan clean | Easy | 3.2 | ✅ |
| 5.3  | Visual check: light + dark + mobile — pastikan tidak ada regresi | Easy | — | ✅ |
| 5.4  | Tulis `docs/sprint-21/final-report.md` | Easy | 5.1, 5.2, 5.3 | ✅ |

### Service Summary

- **Typecheck:** clean (frontend)
- **Backend build:** clean (Next.js 16.2.10)
- **Frontend build:** clean (Astro, SSR)
- **Backend tests:** 68/68 pass
- **No CSS changes** — no visual regression
- **Wrap + import:** verified end-to-end

---

## Dependency Graph

```
Phase 0 ────────────────────────────┐
  0.1 ──► 1.1 ──► 1.2              │
  0.2 ──► 2.1 ──► 2.2 ──► 2.3      │
  0.2 ──► 3.2 ──► 3.3 ──► 3.4      │
  0.3 ──► 3.1 ──► 4.1               │
                                     │
Phase 1 ─────────────────────────────┤
  1.1 ──► 5.1                        │
                                     │
Phase 2 ─────────────────────────────┤
  2.2 ──► 5.1                        │
                                     │
Phase 3 ─────────────────────────────┤
  3.1 ──► 4.1 ──► 4.2 ──► 4.3       │
  3.2 ──► 5.2                        │
                                     │
Phase 4 ─────────────────────────────┤
  4.3 ──► 4.4 ──► 4.5               │
                                     │
Phase 5 ─────────────────────────────┤
  5.1 ──► 5.4                        │
  5.2 ──► 5.4                        │
  5.3 ──► 5.4                        │
```

## Summary

| Phase        | Tasks | Status |
|-------------|-------|--------|
| 0 — Discovery | 3 | ✅ |
| 1 — Fix upload | 2 | ✅ |
| 2 — InsertArticleFromJson | 3 | ✅ |
| 3 — Samples + wrap CLI | 4 | ✅ |
| 4 — Polish SKILLS.md | 5 | ✅ (1 built, 4 manual-use) |
| 5 — Verify & docs | 4 | ✅ |
| **Total**   | **21** | |