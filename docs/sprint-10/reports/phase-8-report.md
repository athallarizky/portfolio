# Phase 8 Report — Project detail revamp (width + sidebar)

> Completed: 2026-07-19 · Trigger: owner request — width to follow the blog detail; sidebar shows only "Other projects" (3–5).

---

## 1. What changed

`frontend/src/pages/projects/[slug].astro` restructured to mirror the blog detail
(`blogs/[slug].astro`):

- **Layout:** content wrapped in `.article-layout` (grid `minmax(0,1fr) 220px`) →
  `.article-main` (max-width **760px**, matching the blog). Previously a single
  full-width (~1200px) column.
- **Sidebar:** added `<aside class="related-articles">` containing **only** an
  "Other projects" list — published projects excluding the current one, sorted by
  `order`, capped at **5** (reuses the blog's `.filter-head` + `.related-item`
  styles for visual consistency).
- **Frontmatter:** `otherProjects = docs.filter(p => p.slug !== slug && p.status === 'published').slice(0, 5)`.

No new CSS — reuses the existing `.article-layout` / `.article-main` /
`.related-articles` / `.related-item` rules (already responsive: ≤1100px collapses
to one column with the sidebar below).

## 2. How to Run / Verify

```bash
cd frontend && npm run build
curl -s 'http://localhost:4321/projects/noteflow' | grep -o 'Other projects'
```

## 3. Test Results

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Complete! 723 ms |
| `curl /projects/noteflow` | ✅ HTTP 200, no errors |
| `.article-layout` / `.article-main` | ✅ present (width matches blog) |
| "Other projects" sidebar | ✅ renders, 5 entries |
| Current project excluded | ✅ `noteflow` not in sidebar slugs |
| Sidebar slugs | `rent-house-ai, devplatform-cli, realtime-polls, wallpaper-hub, edge-tiny-go-worker` |

## 4. Notes

- The bottom **"Next project"** button is kept (sequential nav) — distinct from the
  sidebar's full list; not redundant.
- Sidebar cap is `slice(0, 5)`; with 6 seed projects, viewing one shows all 5
  others. Change to `slice(0, 3)` if a shorter list is preferred.
- Visual width/check needs a browser (dev server on :4321).
