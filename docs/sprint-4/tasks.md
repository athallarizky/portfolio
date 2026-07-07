# Task Breakdown — Sprint 4: API Integration

> Status: ✅ Complete | Created: 2026-07-07
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery & Exploration

| ID   | Task                                                     | Difficulty | Dependencies | Status |
|------|----------------------------------------------------------|------------|-------------|--------|
| 0.1  | Read sprint-3 final-report, api-contract, api-types.ts   | Easy       | —           | ✅     |
| 0.2  | Audit every file importing from `../data/`               | Easy       | 0.1         | ✅     |
| 0.3  | Verify backend seed data shapes vs mock data             | Medium     | 0.1         | ✅     |
| 0.4  | Check SSR adapter requirement (astro.config + pkg.json)  | Easy       | 0.1         | ✅     |
| 0.5  | Write phase-0 report                                     | Easy       | 0.2-0.4     | ✅     |

### Service Summary

- **Runtime:** Static audit
- **Files:** `docs/sprint-4/reports/phase-0-report.md`
- **Key output:** 4 gaps identified in AGENTS.md (BaseLayout imports, missing SSR adapter, relatedArticles depth bug, TypedRole no-op)

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Infrastructure

| ID   | Task                                                     | Difficulty | Dependencies | Status |
|------|----------------------------------------------------------|------------|-------------|--------|
| 1.1  | Install `@astrojs/node` adapter in frontend              | Easy       | —           | ✅     |
| 1.2  | Switch `astro.config.mjs` to static + node adapter       | Easy       | 1.1         | ✅     |
| 1.3  | Add `localhost:4321` to backend CORS (`.env`)            | Easy       | —           | ✅     |
| 1.4  | Verify both servers boot and backend returns 200         | Easy       | 1.1-1.3     | ✅     |

### Service Summary

- **Runtime:** Node.js
- **Files:** `frontend/package.json`, `astro.config.mjs`, `backend/.env`
- **Key output:** 20 packages installed, CORS updated, backend returns 200

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Layout & Static Pages

| ID   | Task                                                     | Difficulty | Dependencies | Status |
|------|----------------------------------------------------------|------------|-------------|--------|
| 2.1  | Replace `nav` + `siteConfig` imports in BaseLayout.astro  | Medium     | 1.4         | ✅     |
| 2.2  | Replace imports in `src/pages/index.astro` (home, siteConfig, socialProfiles) | Medium | 1.4   | ✅     |
| 2.3  | Replace imports in `src/pages/projects.astro`             | Easy       | 1.4         | ✅     |
| 2.4  | Replace imports in `src/pages/blogs.astro`                | Easy       | 1.4         | ✅     |
| 2.5  | Replace imports in `src/pages/documents.astro`            | Easy       | 1.4         | ✅     |
| 2.6  | Replace imports in `src/pages/social.astro`               | Easy       | 1.4         | ✅     |
| 2.7  | Verify all 5 static routes return 200 with API data       | Easy       | 2.1-2.6     | ✅     |

### Service Summary

- **Runtime:** Astro dev server
- **Files:** `BaseLayout.astro`, `index.astro`, `projects.astro`, `blogs.astro`, `documents.astro`, `social.astro`
- **Key output:** All 5 static pages return 200 with API data

> 📄 Full report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Dynamic Routes (SSR)

| ID   | Task                                                     | Difficulty | Dependencies | Status |
|------|----------------------------------------------------------|------------|-------------|--------|
| 3.1  | Convert `projects/[slug].astro` — remove `getStaticPaths`, add on-demand fetch with `prerender = false` | Hard | 2.7 | ✅     |
| 3.2  | Convert `blogs/[slug].astro` — remove `getStaticPaths`, handle relatedArticles correctly (depth=0 + ID lookup)                       | Hard | 2.7   | ✅     |
| 3.3  | Test all 12 detail pages return 200 (6 projects + 6 articles) | Medium | 3.1-3.2 | ✅     |

### Service Summary

- **Runtime:** Astro SSR (Node adapter)
- **Files:** `projects/[slug].astro`, `blogs/[slug].astro`
- **Key output:** All 12 slugs return 200

> 📄 Full report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Component Cleanup

| ID   | Task                                                     | Difficulty | Dependencies | Status |
|------|----------------------------------------------------------|------------|-------------|--------|
| 4.1  | Fix LiveClock.svelte — accept timezone as prop, remove siteConfig import | Easy | 2.2 | ✅     |
| 4.2  | Pass `timezone={siteConfig.timezone}` from index.astro   | Easy       | 4.1         | ✅     |
| 4.3  | Remove unused `ROLES` array in index.astro               | Easy       | 2.2         | ✅     |
| 4.4  | Verify TypedRole, CountUpStats work from API data        | Easy       | 2.2 4.3     | ✅     |
| 4.5  | Fix document file URLs — prefix `/api/...` paths with backend base | Easy | 2.5 | ✅     |

### Service Summary

- **Runtime:** Svelte (client-side components)
- **Files:** `LiveClock.svelte`, `index.astro`, `documents.astro`
- **Key output:** Zero components import mock data directly

> 📄 Full report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)

---

## Phase 5 — Verify & Polish

| ID   | Task                                                     | Difficulty | Dependencies | Status |
|------|----------------------------------------------------------|------------|-------------|--------|
| 5.1  | `npx astro build` — build succeeds                       | Medium     | 3.3 4.5     | ✅     |
| 5.2  | Audible: all 7 routes return 200 (dev + preview)         | Medium     | 5.1         | ✅     |
| 5.3  | Verify theme toggle, mobile drawer, sidebar collapse     | Easy       | 5.1         | ✅     |
| 5.4  | Verify blog filter chips derive from API tags            | Easy       | 5.1         | ✅     |
| 5.5  | Verify search filters work against API data              | Easy       | 5.1         | ✅     |
| 5.6  | Verify home animations (typed role, count-up, spotlight, clock) | Easy   | 5.1   | ✅     |
| 5.7  | Grep: zero `from '../data'` imports remain               | Easy       | 5.1         | ✅     |
| 5.8  | Visual comparison: no regressions from sprint-3 output   | Medium     | 5.1         | ✅     |
| 5.9  | Write `final-report.md`                                  | Medium     | 5.1-5.8     | ✅     |

### Service Summary

- **Runtime:** Astro build + preview
- **Key output:** 41 output files (5 static + 36 server chunks), 199ms prerender, 711ms server build

> 📄 Full report: [`final-report.md`](./final-report.md)

---

## Summary

| Phase                  | Tasks | Status |
|------------------------|-------|--------|
| 0 — Discovery          | 5     | ✅     |
| 1 — Infrastructure     | 4     | ✅     |
| 2 — Layout & Static    | 7     | ✅     |
| 3 — Dynamic Routes     | 3     | ✅     |
| 4 — Component Cleanup  | 5     | ✅     |
| 5 — Verify & Polish    | 9     | ✅     |
| **Total**              | **33**| **✅** |
