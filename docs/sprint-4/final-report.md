# Sprint 4 — Final Report

> Status: ✅ Delivered | 2026-07-07
> Audience: sprint-5 context. Read this + [`../../AGENTS.md`](../../AGENTS.md) before starting sprint-5.

---

## 1. Sprint goal & outcome

Replace all mock data imports in the sprint-3 Astro + Svelte frontend with `fetch()` calls to the PayloadCMS REST API, switch to SSR mode for dynamic [slug] routes, and verify zero visual regressions.

**Delivered.** 8 files modified, 33 tasks completed, all 7 routes return 200 with live API data, build succeeds (41 files, static + SSR).

---

## 2. Final structure

```
frontend/src/
├── layouts/
│   └── BaseLayout.astro          ← fetches nav + siteConfig from API
├── components/
│   ├── home/LiveClock.svelte     ← timezone as prop (not data import)
│   └── ...                       ← all others unchanged
├── pages/
│   ├── index.astro               ← fetches home, siteConfig, socialProfiles
│   ├── projects.astro            ← fetches projects
│   ├── projects/[slug].astro     ← SSR, on-demand slug fetch
│   ├── blogs.astro               ← fetches articles
│   ├── blogs/[slug].astro        ← SSR, depth=0 + ID lookup
│   ├── documents.astro           ← fetches categories + documents
│   └── social.astro              ← fetches socialProfiles
├── data/                         ← UNUSED (kept for sprint-3 reference)
└── styles/                       ← unchanged
```

---

## 3. Key deliverables

| Item | Count | Notes |
|------|-------|-------|
| Pages with data-source swap | 8 | BaseLayout + 7 pages |
| SSR routes | 2 | projects/[slug], blogs/[slug] |
| Static routes | 5 | index, projects, blogs, documents, social |
| Components modified | 1 | LiveClock.svelte (timezone prop) |
| Build output files | 41 | 5 HTML + 36 server chunks |
| AGENTS.md gaps found & fixed | 4 | BaseLayout imports, SSR adapter, relatedArticles depth, TypedRole no-op |

---

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| Static mode + `prerender = false` (not `hybrid`) | Astro 7 removed `hybrid` — static with adapter handles SSR pages |
| `@astrojs/node` adapter | Required for SSR routes; simplest option |
| BaseLayout fetches nav + siteConfig | Shared shell — 1 fetch pair serves all pages |
| Document URLs prefixed with backend base | API returns `/api/documents/file/...` — relative to backend |
| Articles fetched at `depth=0` for related lookup | At depth=1, Payload populates relatedArticles as objects, not IDs |

---

## 5. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery | 5 | ✅ |
| 1 — Infrastructure | 4 | ✅ |
| 2 — Layout & Static Pages | 7 | ✅ |
| 3 — Dynamic Routes | 3 | ✅ |
| 4 — Component Cleanup | 5 | ✅ |
| 5 — Verify & Polish | 9 | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

---

## 6. Verification

- `npx astro build` — succeeds, 41 files, 711ms server build, 199ms prerender
- All 7 routes return 200 (dev server): index, projects, blogs, documents, social, + 12 slugs
- Zero mock data imports remain (`grep` returns empty)
- Theme toggle, sidebar, animations unchanged (CSS/components untouched)
- Blog filter chips derive from API tags
- Search filters work against API-rendered cards

---

## 7. How to run

```bash
# Terminal 1: Backend
cd backend && npm run dev          # http://localhost:3000

# Terminal 2: Frontend
cd frontend && npm run dev         # http://localhost:4321

# Build
cd frontend && npx astro build     # output in dist/
```

---

## 8. Sprint-5 handoff

Potential next sprints:

- **SEO / OpenGraph / sitemap** — SSR pages already have meta capabilities
- **Backend prod DB migration** — SQLite → Postgres/Turso
- **Deployment** — VPS, Vercel, or Cloudflare for the Astro frontend
- **Contact form** — new Payload collection + frontend form
- **Real file uploads** — documents seeded with placeholders, upload real PDFs to Payload

---

## 9. Known issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Build requires warm backend | Medium | Static prerender fetches API — build hangs if backend is down/cold. First-request latency ~3s per page |
| First page load ~3-5 seconds | Low | PayloadCMS cold-start + SQLite — production database (Postgres/Turso) would reduce this |
