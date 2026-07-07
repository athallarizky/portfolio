# Phase 2 Report — Data Layer

> Completed: 2026-07-07

---

## 1. How to Run

No runtime output — data files and types are compile-time only. Verify with:

```bash
cd frontend && npx tsc --noEmit    # zero errors
```

---

## 2. What Was Done

| Task | File | Status |
|------|------|--------|
| API type interfaces | `src/lib/api-types.ts` | ✅ |
| Lexical renderer | `src/lib/render-lexical.ts` | ✅ |
| Nav mock | `src/data/nav.ts` | ✅ |
| Site config mock | `src/data/site-config.ts` | ✅ |
| Home mock | `src/data/home.ts` | ✅ |
| Projects mock | `src/data/projects.ts` (6 projects) | ✅ |
| Articles mock | `src/data/articles.ts` (6 articles) | ✅ |
| Document categories mock | `src/data/document-categories.ts` (3 categories) | ✅ |
| Documents mock | `src/data/documents.ts` (6 documents) | ✅ |
| Social profiles mock | `src/data/social-profiles.ts` (7 profiles) | ✅ |
| Technologies mock | `src/data/technologies.ts` (24 technologies) | ✅ |
| Tags mock | `src/data/tags.ts` (9 tags) | ✅ |
| Authors mock | `src/data/authors.ts` (1 author) | ✅ |

---

## 3. Key Decisions

| Decision | Reason |
|----------|--------|
| Lexical renderer as pure function | Called at Astro build time, outputs HTML strings, zero client JS |
| Articles use builder helpers (`t()`, `p()`, `h()`, `code()`, `blockquote()`) | Reduces verbosity of Lexical JSON; still produces correct shapes |
| Projects export `projects` instead of default | Consistent with articles pattern; both used as named imports |
| All mock collections export `PaginatedResponse<T>` | Mirror API contract; sprint-4 swap is a 1-line diff |
| Documents reference categories inline (not by ID) | Matches `?depth=1` API response; simpler for sprint-3 rendering |

---

## 4. Reference Files

| File | Purpose |
|------|---------|
| `src/lib/api-types.ts` | 10 interfaces + Lexical types |
| `src/lib/render-lexical.ts` | Handles 7 node types, 5 format bits |
| `src/data/*.ts` (11 files) | Exact values from `backend/src/seed.ts` |
