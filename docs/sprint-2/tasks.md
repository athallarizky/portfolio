# Task Breakdown — Sprint 2 (Headless CMS Backend — **BE-only**)

> Status: ✅ Completed | Created: 2026-07-07
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked
>
> Plan: [`plan.md`](./plan.md)
>
> **Scope:** backend only. No frontend integration — the FE will be rebuilt in
> Astro + Svelte in a later sprint against this API. The sprint-1 static
> `frontend/` is legacy/reference only.

---

## Sprint Goal

A **PayloadCMS 3** backend (`backend/`) modeling all sprint-1 content, exposing
a public REST API. All content managed in the admin UI (or seeded). Verified via
`/api/*` and `payload-types.ts`.

---

## Phase 0 — Bootstrap ✅

| ID  | Task                                                                                  | Difficulty | Status |
|-----|---------------------------------------------------------------------------------------|------------|--------|
| 0.1 | Write `docs/sprint-2/plan.md` + `tasks.md`                                            | Easy       | ✅     |
| 0.2 | Scaffold `backend/` Payload 3 app (Next.js + SQLite)                                  | Medium     | ✅     |
| 0.3 | `payload.config.ts`: CORS, `secret`, SQLite `DATABASE_URI`                            | Easy       | ✅     |
| 0.4 | Confirm boot: `/admin` 200, `/api/*` returns Payload JSON, types auto-generate        | Easy       | ✅     |

---

## Phase 1 — Documents & categories

| ID  | Task                                                                                  | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------|------------|--------------|--------|
| 1.1 | Review/finalize `document-categories` + `documents` fields vs spec                    | Easy       | 0.4          | ✅     |
| 1.2 | `backend/src/seed.ts` + `npm run seed` (Local API)                                    | Medium     | 1.1          | ✅     |
| 1.3 | Seed categories (Pinned/Research/Other) + documents from legacy `documents.js`        | Easy       | 1.2          | ✅     |
| 1.4 | Upload real `ai-workflow-template.md` as a `documents` record                          | Easy       | 1.3          | ✅     |
| 1.5 | Verify `GET /api/documents?depth=1` returns grouped data; `generate:types`            | Easy       | 1.4          | ✅     |

---

## Phase 2 — Blog

| ID  | Task                                                                                  | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------|------------|--------------|--------|
| 2.1 | `tags` + `authors` collections (public read)                                          | Easy       | 1.5          | ✅     |
| 2.2 | `articles` collection (slug, tags, publishedAt, readMinutes, Lexical body, related)   | Medium     | 2.1          | ✅     |
| 2.3 | Seed tags + authors + articles from legacy `blogs.html` / `article.html`              | Easy       | 2.2          | ✅     |
| 2.4 | Verify `/api/articles`, `/api/tags`; tag→article filter; `generate:types`             | Easy       | 2.3          | ✅     |

---

## Phase 3 — Projects

| ID  | Task                                                                                  | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------|------------|--------------|--------|
| 3.1 | `technologies` taxonomy                                                               | Easy       | 2.4          | ✅     |
| 3.2 | `projects` collection (card + detail fields, banner group, features, screenshots)     | Medium     | 3.1          | ✅     |
| 3.3 | Seed technologies + projects from legacy `projects.html` / `project.html`             | Easy       | 3.2          | ✅     |
| 3.4 | Verify `/api/projects?sort=order`; `generate:types`                                   | Easy       | 3.3          | ✅     |

---

## Phase 4 — Globals & social

| ID  | Task                                                                                  | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------|------------|--------------|--------|
| 4.1 | Globals: `site-config`, `home`, `nav`                                                  | Medium     | 3.4          | ✅     |
| 4.2 | `social-profiles` collection (`showOnHome` flag)                                       | Easy       | 4.1          | ✅     |
| 4.3 | Seed globals + social from legacy `index.html` / `social.html`                         | Easy       | 4.2          | ✅     |
| 4.4 | Verify `/api/globals/*` + `/api/social-profiles`; `generate:types`                     | Easy       | 4.3          | ✅     |

---

## Phase 5 — Polish

| ID  | Task                                                                                  | Difficulty | Dependencies | Status |
|-----|---------------------------------------------------------------------------------------|------------|--------------|--------|
| 5.1 | `status` (draft/published) + access gating on content collections                      | Medium     | 4.4          | ✅     |
| 5.2 | SEO fields group (meta title/description, OG image)                                    | Medium     | 5.1          | ✅     |
| 5.3 | Prod DB (Postgres) + media storage (S3/R2 plugin) — documented, not installed          | Medium     | 5.2          | ✅     |
| 5.4 | Final sprint-2 report + update root `AGENTS.md` + `tasks.md`                            | Easy       | 5.3          | ✅     |

---

## Dependency Graph

```
Phase 0 ✅  →  Phase 1 (Documents)  →  Phase 2 (Blog)  →  Phase 3 (Projects)
                                                     ↓
                              Phase 4 (Globals & social)  →  Phase 5 (Polish)
```

---

## Summary

| Phase            | Tasks | Status |
|------------------|-------|--------|
| 0 — Bootstrap    | 4     | ✅     |
| 1 — Documents    | 5     | ✅     |
| 2 — Blog         | 4     | ✅     |
| 3 — Projects     | 4     | ✅     |
| 4 — Globals      | 4     | ✅     |
| 5 — Polish       | 4     | ✅     |
| **Total**        | **25**| ✅     |
