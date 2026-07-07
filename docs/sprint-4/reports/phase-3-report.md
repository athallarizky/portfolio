# Phase 3 Report — Dynamic Routes

> Completed: 2026-07-07

---

## 1. How to Run

```bash
# Backend must be running
cd frontend && npm run dev

# Test all 12 slugs
curl http://localhost:4321/projects/noteflow
curl http://localhost:4321/blogs/running-a-software-project-with-an-ai-agent
```

## 2. Changes

| File | Change |
|------|--------|
| `projects/[slug].astro` | Removed `getStaticPaths()`, added `export const prerender = false`, fetch all projects at `depth=1` then find by slug, redirect to `/projects` if not found |
| `blogs/[slug].astro` | Removed `getStaticPaths()`, added `export const prerender = false`, fetch article at `depth=0` (so `relatedArticles` is IDs), fetch related articles in second API call |

## 3. Test Results

| Slug | HTTP | Route |
|------|------|-------|
| `noteflow` | 200 | `/projects/noteflow` |
| `rent-house-ai` | 200 | `/projects/rent-house-ai` |
| `devplatform-cli` | 200 | `/projects/devplatform-cli` |
| `realtime-polls` | 200 | `/projects/realtime-polls` |
| `wallpaper-hub` | 200 | `/projects/wallpaper-hub` |
| `edge-tiny-go-worker` | 200 | `/projects/edge-tiny-go-worker` |
| `running-a-software-project-with-an-ai-agent` | 200 | `/blogs/...` |
| `stop-building-rag-from-scratch` | 200 | `/blogs/...` |
| `trpc-is-the-api-layer` | 200 | `/blogs/...` |
| `designing-cli-tools` | 200 | `/blogs/...` |
| `from-postgres-to-vector-db` | 200 | `/blogs/...` |
| `pragmatic-test-pyramid` | 200 | `/blogs/...` |

All 12 dynamic routes return 200 with live API data.

## 4. Key Decisions

| Decision | Reason |
|----------|--------|
| `depth=0` for articles, separate related fetch | AGENTS.md originally fetched at `depth=1` which populates `relatedArticles` as objects — not IDs. Using `depth=0` keeps them as IDs, then a second fetch resolves them |
| `prerender = false` on both `[slug]` pages | Marks them as SSR-only in static mode, keeping list pages static |
