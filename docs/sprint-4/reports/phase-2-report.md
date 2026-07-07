# Phase 2 Report — Layout & Static Pages

> Completed: 2026-07-07

---

## 1. How to Run

```bash
# Keep backend running
curl http://localhost:3000/api/globals/nav    # verify

cd frontend && npm run dev
curl http://localhost:4321/                   # home
curl http://localhost:4321/projects           # projects
curl http://localhost:4321/blogs              # blogs
curl http://localhost:4321/documents          # documents
curl http://localhost:4321/social             # social
```

## 2. Changes

| File | Old | New |
|------|-----|-----|
| `BaseLayout.astro` | `import { nav } from '../data/nav'`, `import { siteConfig } from '../data/site-config'` | `fetch()` from `/api/globals/nav` + `/api/globals/site-config` |
| `index.astro` | `import { home }`, `import { siteConfig }`, `import { socialProfiles }` | `Promise.all([fetch('/api/globals/home'), ...])` |
| `projects.astro` | `import { projects }` | `fetch('/api/projects?sort=order&depth=1')` |
| `blogs.astro` | `import { articles }` | `fetch('/api/articles?sort=-publishedAt&depth=1')` |
| `documents.astro` | `import { documentCategories }`, `import { documents }` | `fetch()` from both endpoints, document URLs prefixed with backend base |
| `social.astro` | `import { socialProfiles }` | `fetch('/api/social-profiles?sort=order')` |

## 3. Test Results

| Route | HTTP | Content |
|-------|------|---------|
| `/` | 200 | ✅ Hero, stats, about, skills render from API |
| `/projects` | 200 | ✅ 6 project cards with tech tags |
| `/blogs` | 200 | ✅ BlogFilter receives API articles |
| `/documents` | 200 | ✅ Document categories + file cards with API URLs |
| `/social` | 200 | ✅ 7 social profile cards |

## 4. Key Decisions

| Decision | Reason |
|----------|--------|
| BaseLayout fetches nav + siteConfig from API | Shared shell — 1 fetch pair serves all 7 pages. Every page depends on it |
| Document URLs prefixed with `http://localhost:3000` | API returns `/api/documents/file/<name>` — relative to backend, not frontend |
