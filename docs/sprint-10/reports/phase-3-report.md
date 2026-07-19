# Phase 3 Report — New Sections (Selected work + Latest writing)

> Completed: 2026-07-19

---

## 1. How to Run

```bash
cd frontend && npm run build        # ✅ clean (server built in 763ms)
cd frontend && npm run dev          # http://localhost:4321 — Selected work appears after re-seed; Latest writing is live
```

## 2. What Changed (`frontend/src/pages/index.astro`)

- **Fetches (3.1):**
  ```ts
  const selectedWork = await safeFetch<PaginatedResponse<Project>>(
    '/projects?where[showOnHome][equals]=true&where[status][equals]=published&sort=order&limit=3&depth=1');
  const latestWriting = await safeFetch<PaginatedResponse<Article>>(
    '/articles?where[status][equals]=published&sort=-publishedAt&limit=3&select[title]=true&select[slug]=true&select[publishedAt]=true');
  const workDocs = selectedWork.docs || [];   const writeDocs = latestWriting.docs || [];
  ```
- **Selected work (3.2):** 3 cards in `.grid-3` — gradient `.work-icon` tile, `.work-title`, `.work-excerpt`, pastel `.tag-badge tint-i%4` tech tags, whole-card `<a>` → `/projects/[slug]`.
- **Latest writing (3.3):** `.write-list` of rows — title, server-formatted date (`toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})`), arrow; hairline dividers; row hover → surface bg + arrow nudge.
- **Gating + alignment (3.4):** each section gated on `visible.has(...)` **and** `docs.length > 0`; `visible` fallback aligned to all 9 backend `showItems` defaults (was missing `findMe`/`contactCta`).
- Placed between **Stats** and **About/Currently** per the ux-flow wireframe.

CSS: `.work-card/.work-icon/.work-title/.work-excerpt/.work-tags` and `.write-list/.write-row/.write-title/.write-date/.write-arrow` appended to `styles.css` (`.home`-scoped, hover guarded by `@media (hover:hover)`).

## 3. Test Results

| Check | Result |
|-------|--------|
| local `tsc --noEmit` | ✅ exit 0 |
| `npm run build` | ✅ Complete! 763ms, frontend/dist |
| Latest writing query (live) | ✅ 6 published articles; bracket `select` returns `id,title,slug,publishedAt` |
| Selected work query (live) | ✅ filter valid; `totalDocs: 0` until re-seed (expected) |

## 4. Key Decisions / Deviations

| Decision | Reason |
|----------|--------|
| **Bracket `select` syntax** (not AGENTS' comma form) | comma-syntax returns docs with only `id`; bracket `select[title]=true` returns the fields. Phase-1 finding applied. |
| `.work-card` self-styled (not extending `.card`) | avoids specificity conflicts; `<a>` element, full custom chrome |
| `.work-icon` default bg `--n-primary` | white icon visible on default; inline gradient overrides when `bannerColor` present |
| Skill tech-tags cycle `tint-i%4` (work cards) | pastel variety per wireframe; skill-section tags stay uniform lavender |
| Date formatting server-side | zero hydration; per data-design §6 |

## 5. Reference Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/index.astro` | fetches, section markup, gating |
| `frontend/src/styles/styles.css` | `.work-card`, `.write-row` rules |
