# Phase 0 Report — Discovery & Exploration

> Completed: 2026-07-07

---

## 1. How to Run

No live servers needed for Phase 0 — static code audit only.

```bash
# Verify file counts
grep -r "from '\.\.\/data" frontend/src/ | wc -l      # → 8 files importing mock data
grep -r "import.*from.*data" frontend/src/ | wc -l     # → verify all found

# Check SSR dependency
cat frontend/package.json | grep astrojs/node           # → missing (gap)

# Check backend CORS
cat backend/.env | grep PAYLOAD_PUBLIC_CORS             # → localhost:8080 only (needs :4321)
```

---

## 2. Audit Results — Every Data Import

| File | Imports from `../data/` | API replacement |
|------|------------------------|-----------------|
| `BaseLayout.astro` | `nav`, `siteConfig` | `GET /api/globals/nav`, `GET /api/globals/site-config` |
| `index.astro` | `home`, `siteConfig`, `socialProfiles` | `GET /api/globals/home`, `/globals/site-config`, `/social-profiles` |
| `projects.astro` | `projects` | `GET /api/projects?sort=order&depth=1` |
| `projects/[slug].astro` | `projects` | `GET /api/projects?sort=order&depth=1` + slug lookup |
| `blogs.astro` | `articles` | `GET /api/articles?sort=-publishedAt&depth=1` |
| `blogs/[slug].astro` | `articles` | `GET /api/articles?where[slug][equals]=...&depth=0` + related lookup |
| `documents.astro` | `documentCategories`, `documents` | `GET /api/document-categories?sort=order`, `GET /api/documents?depth=1` |
| `social.astro` | `socialProfiles` | `GET /api/social-profiles?sort=order` |
| `LiveClock.svelte` | `siteConfig` | **Prop-based** — pass timezone from page |

8 files total. 1 component (LiveClock) imports directly — the rest are Astro pages/layouts.

---

## 3. Backend Seed Data Shape Verification

Compared `backend/src/seed.ts` against `frontend/src/data/*.ts` line by line:

| Collection | Seed count | Mock count | Shape match |
|------------|-----------|------------|-------------|
| document-categories | 3 | 3 | ✅ (label, slug, icon, hint, order) |
| documents | 6 | 6 | ✅ (title, category, file, excerpt, updated) |
| articles | 6 | 6 | ✅ (title, slug, tags, author, publishedAt, body: Lexical, bannerColor, bannerIcon, readMinutes, relatedArticles, status) |
| tags | 9 | 9 | ✅ (name, slug) |
| authors | 1 | 1 | ✅ (name, initials, role, bio) |
| technologies | 24 | 24 | ✅ (name, slug) |
| projects | 6 | 6 | ✅ (title, slug, year, descriptor, bannerColor, bannerIcon, techNames/techTags, links, features, screenshots, statsFooter, architecture, order) |
| social-profiles | 7 | 7 | ✅ (platform, icon, handle, url, showOnHome, order) |
| site-config | seeded | 1 | ✅ (name, initials, role, bioShort, status, timezone, location) |
| nav | seeded | 1 | ✅ (menuItems[], connectLinks[]) |
| home | seeded | 1 | ✅ (hero, stats[], about[], currently[], skills[]) |

**All shapes match.** The Lexical body format in seed.ts uses the same node structure as sprint-3's mock data. No field renames or type collisions.

---

## 4. Gaps Found in AGENTS.md

### Gap 1 — BaseLayout.astro imports mock data (CRITICAL)

`src/layouts/BaseLayout.astro` imports `nav` and `siteConfig` from `../data/`. Every page uses this shared shell via `<BaseLayout>`. The sidebar menu items, initials, name, and role all come from mock data. If these aren't replaced, the sidebar breaks on every page.

**Fix:** Fetch `/api/globals/nav` and `/api/globals/site-config` in BaseLayout frontmatter.

### Gap 2 — No SSR adapter installed

`package.json` has no `@astrojs/node`. Astro requires an adapter to run in `server` or `hybrid` mode. Without one, the `[slug]` SSR pages will fail at build time.

**Fix:** `npm install @astrojs/node`, add to `astro.config.mjs`.

### Gap 3 — relatedArticles depth conflict

The AGENTS.md instructions for `blogs/[slug].astro` fetch the article at `depth=1`:

```
const res = await fetch(`${API}/articles?where[slug][equals]=${slug}&depth=1`);
```

At `depth=1`, Payload populates `relatedArticles` as full `Article` objects, not IDs. The subsequent code that treats them as IDs for a second fetch will break.

**Fix:** Fetch at `depth=0`, then do the ID lookup fetch separately. Or fetch at `depth=1` and iterate the populated objects directly (simpler — no second fetch needed).

### Gap 4 — TypedRole is self-contained (no changes needed)

`TypedRole.svelte` has its own hardcoded `ROLES` array. It never imported from `../data/`. The AGENTS.md says "check and pass as props" but there's nothing to pass — the component is self-contained by design. The unused `ROLES` array in `index.astro` should be removed (already caught).

---

## 5. Key Decisions

| Decision | Reason |
|----------|--------|
| Fetch nav + siteConfig in BaseLayout (not per-page) | Shared shell — one fetch serves all pages |
| `output: 'hybrid'` over `output: 'server'` | Static pages (index, projects list, blogs list, documents, socials) get SSG speed; only `[slug]` pages pay SSR cost |
| Fetch articles at `depth=0` for [slug] pages | Avoids the populated objects vs IDs confusion. Simpler to control depth per query |
| Document URLs prefixed with backend base | API returns `/api/documents/file/<filename>` — must point to `http://localhost:3000` |

---

## 6. Reference Files

| File | Purpose |
|------|---------|
| `docs/sprint-2/resources/api-contract.md` | All endpoint URLs, query params, response shapes |
| `frontend/src/lib/api-types.ts` | TS interfaces matching API responses |
| `backend/src/seed.ts` | Seed data source — verified matches mock data |
| `frontend/src/data/*.ts` | Reference for mock data shapes (verified identical to seed) |
| `backend/.env` | CORS config location |
