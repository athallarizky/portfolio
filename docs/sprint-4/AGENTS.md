# AGENTS.md — Sprint 4: API Integration

> **For:** Any LLM agent integrating the sprint-3 Astro + Svelte frontend with the sprint-2 PayloadCMS REST API.
> **FIRST:** Read [`docs/GUIDE.md`](../../GUIDE.md) and follow its rules — phased workflow, per-phase reports, update tasks.md, ask before committing.

---

## 0. What Already Exists (Do NOT Rebuild)

```
frontend/                         ← Sprint-3 Astro + Svelte (YOU MODIFY THIS)
├── src/
│   ├── layouts/BaseLayout.astro  ← shared shell
│   ├── components/               ← 10 Svelte components (DO NOT TOUCH)
│   │   ├── shell/                ← Sidebar, Header, ThemeToggle
│   │   ├── home/                 ← TypedRole, CountUpStats, SpotlightEffect, LiveClock
│   │   ├── blog/BlogFilter.svelte
│   │   └── ui/                   ← Icon, SearchFilter
│   ├── lib/
│   │   ├── api-types.ts          ← TS interfaces (DO NOT TOUCH)
│   │   └── render-lexical.ts     ← Lexical → HTML (DO NOT TOUCH)
│   ├── data/                     ← Mock data files (REPLACE with fetch)
│   ├── styles/                   ← styles.css + iconify-bridge.css (DO NOT TOUCH)
│   └── pages/
│       ├── index.astro           ← Home page
│       ├── projects.astro        ← Projects listing
│       ├── projects/[slug].astro ← Project detail (getStaticPaths → REMOVE, use on-demand)
│       ├── blogs.astro           ← Blog listing
│       ├── blogs/[slug].astro    ← Article detail (getStaticPaths → REMOVE, use on-demand)
│       ├── documents.astro       ← Documents
│       └── social.astro          ← Socials

backend/                          ← Sprint-2 PayloadCMS (RUN IT, DO NOT MODIFY)
└── src/
    ├── payload.config.ts         ← CORS: localhost:8080
    ├── collections/              ← 8 collections
    └── globals/                  ← 3 globals

docs/
├── GUIDE.md                      ← READ THIS FIRST — workflow rules
└── sprint-4/                     ← YOU ARE HERE
```

**Backend REST API:** `http://localhost:3000/api/` (run `cd backend && npm run dev`)

---

## 1. Sprint Goal

Replace all mock data imports in the Astro frontend with `fetch()` calls to the sprint-2 PayloadCMS REST API. Component props, types, and templates must not change — only the data source.

---

## 2. The Pattern (What to Change)

### Before (sprint-3 — mock data)

```astro
---
import { projects } from '../data/projects';
---

<div class="grid-3">
  {projects.docs.map((p) => (...))}
</div>
```

### After (sprint-4 — API fetch)

```astro
---
const API = 'http://localhost:3000/api';

const res = await fetch(`${API}/projects?sort=order&depth=1`);
const projects = await res.json();
// projects.docs — same shape as before
---

<div class="grid-3">
  {projects.docs.map((p) => (...))}
</div>
```

### Globals (no envelope)

```astro
---
const API = 'http://localhost:3000/api';

const [homeRes, siteConfigRes, socialRes] = await Promise.all([
  fetch(`${API}/globals/home`),
  fetch(`${API}/globals/site-config`),
  fetch(`${API}/social-profiles?sort=order`),
]);
const home = await homeRes.json();
const siteConfig = await siteConfigRes.json();
const socialProfiles = await socialProfilesRes.json();
// home, siteConfig — direct object, no .docs
// socialProfiles.docs — paginated envelope
---
```

---

## 3. Every File — Exact Changes (8 files total)

### 3.0 `src/layouts/BaseLayout.astro` (Shared Shell — CRITICAL, do this FIRST)

**All 7 pages use this layout.** It imports `nav` and `siteConfig` from mock data:

```ts
import { nav } from '../data/nav';
import { siteConfig } from '../data/site-config';
```

**Replace with:**
```ts
const API = 'http://localhost:3000/api';
const [navRes, siteRes] = await Promise.all([
  fetch(`${API}/globals/nav`),
  fetch(`${API}/globals/site-config`),
]);
const nav = await navRes.json();
const siteConfig = await siteRes.json();
// Globals return the object directly — no .docs
```

The sidebar props (`menuItems`, `connectLinks`, `initials`, `name`, `role`) all use these objects. No template changes needed.

---

### 3.1 `src/pages/index.astro` (Home)

**Current imports:**
```ts
import { home } from '../data/home';
import { siteConfig } from '../data/site-config';
import { socialProfiles } from '../data/social-profiles';
```

**Replace with:**
```ts
const API = 'http://localhost:3000/api';
const [homeRes, siteRes, socialRes] = await Promise.all([
  fetch(`${API}/globals/home`),
  fetch(`${API}/globals/site-config`),
  fetch(`${API}/social-profiles?sort=order`),
]);
const home = await homeRes.json();
const siteConfig = await siteRes.json();
const socialProfiles = await socialRes.json();
// Globals return the object directly. socialProfiles is a collection — use .docs
```

**Also remove:** the unused `ROLES` array on line that follows the imports. `TypedRole.svelte` has its own hardcoded roles — no changes needed there.

---

### 3.2 `src/pages/projects.astro` (Projects Listing)

**Current:**
```ts
import { projects } from '../data/projects';
```

**Replace with:**
```ts
const API = 'http://localhost:3000/api';
const res = await fetch(`${API}/projects?sort=order&depth=1`);
const projects = await res.json();
```

---

### 3.3 `src/pages/projects/[slug].astro` (Project Detail)

**Sprint-3 used `getStaticPaths()` with mock data.** This must change to **on-demand rendering** since slugs come from the API dynamically.

**Replace the entire frontmatter with:**
```ts
import type { Project } from '../../lib/api-types';

const API = 'http://localhost:3000/api';
const { slug } = Astro.params;

// Fetch all projects to find the current one + determine next
const allRes = await fetch(`${API}/projects?sort=order&depth=1`);
const allData = await allRes.json();
const project = allData.docs.find((p: Project) => p.slug === slug);

if (!project) {
  return Astro.redirect('/projects');
}

const nextProject = allData.docs.find((p: Project) => p.order === project.order + 1) || null;
```

**Remove `getStaticPaths()`** — it's no longer needed.

**Must also switch to SSR mode** for catch-all dynamic routes. In `astro.config.mjs`, add:
```js
export default defineConfig({
  output: 'server',   // ADD THIS — needed for on-demand [slug] routes
  integrations: [svelte()]
});
```

Or alternatively, keep static mode with `export const prerender = false` on each `[slug].astro` page.

---

### 3.4 `src/pages/blogs.astro` (Blog Listing)

**Current:**
```ts
import { articles } from '../data/articles';
```

**Replace with:**
```ts
const API = 'http://localhost:3000/api';
const res = await fetch(`${API}/articles?sort=-publishedAt&depth=1`);
const articles = await res.json();
```

**BlogFilter receives `articles.docs`** — same as before.

---

### 3.5 `src/pages/blogs/[slug].astro` (Article Detail)

**Same pattern as projects/[slug].astro — remove `getStaticPaths()`, use on-demand:**

```ts
import type { Article } from '../../lib/api-types';

const API = 'http://localhost:3000/api';
const { slug } = Astro.params;

// Fetch at depth=0 so relatedArticles comes as IDs
const res = await fetch(`${API}/articles?where[slug][equals]=${slug}&depth=0`);
const data = await res.json();
const article = data.docs[0];

if (!article) {
  return Astro.redirect('/blogs');
}

// Fetch related articles (IDs) + author + tags at depth=1
const relIds = article.relatedArticles || [];
const relatedArticles = relIds.length > 0
  ? (await (await fetch(`${API}/articles?where[id][in]=${relIds.join(',')}&depth=0`)).json()).docs
  : [];
```

**Remove `getStaticPaths()`.**

---

### 3.6 `src/pages/documents.astro` (Documents)

**Current:**
```ts
import { documentCategories } from '../data/document-categories';
import { documents } from '../data/documents';
```

**Replace with:**
```ts
const API = 'http://localhost:3000/api';
const [catRes, docRes] = await Promise.all([
  fetch(`${API}/document-categories?sort=order`),
  fetch(`${API}/documents?depth=1`),
]);
const documentCategories = await catRes.json();
const documents = await docRes.json();
```

---

### 3.7 `src/pages/social.astro` (Socials)

**Current:**
```ts
import { socialProfiles } from '../data/social-profiles';
```

**Replace with:**
```ts
const API = 'http://localhost:3000/api';
const res = await fetch(`${API}/social-profiles?sort=order`);
const socialProfiles = await res.json();
```

---

## 4. Home Animations — LiveClock Data Source

`src/components/home/LiveClock.svelte` currently imports `siteConfig` directly from the mock data module:

```ts
import { siteConfig } from '../../data/site-config';
```

This works in sprint-3 because it's a static `.ts` file. For sprint-4, the component needs the timezone as a prop instead:

**Change LiveClock.svelte — add prop:**
```ts
export let timezone: string = 'UTC+7';
```

**Remove the import of siteConfig.** Pass timezone from the page:

In `index.astro`:
```astro
<LiveClock client:visible timezone={siteConfig.timezone || 'UTC+7'} />
```

**TypedRole.svelte and CountUpStats.svelte need no changes** — TypedRole has its own hardcoded roles (never imported from data), and CountUpStats already receives stats as a prop.

---

## 5. CORS Configuration

The backend allows CORS from `localhost:8080` by default. The Astro dev server runs on `localhost:4321`.

**Add `localhost:4321` to backend CORS.** Either:

1. Set env var: `PAYLOAD_PUBLIC_CORS=http://localhost:4321,http://localhost:8080` in `backend/.env`
2. Or edit `backend/src/payload.config.ts` to include the Astro origin

---

## 6. BlogFilter.svelte — No Changes Needed

`BlogFilter.svelte` receives `articles` as a prop (`Article[]`). The API returns the same shape. **Zero changes needed** — it already works.

---

## 7. SearchFilter.svelte — No Changes Needed

`SearchFilter.svelte` is DOM-based (scans `.content-inner` for cards). **Zero changes needed.**

---

## 8. Document File URLs

In sprint-3, document URLs are local paths like `/documents/...`. The backend returns relative URLs like `/api/documents/file/...`.

**Update `documents.astro`** — the `url` field from the API is the correct download URL. The `doc.url` already has the right path. If the API returns a relative URL, prefix with the backend base:

```ts
const fileUrl = doc.url?.startsWith('/api') ? `http://localhost:3000${doc.url}` : doc.url;
```

---

## 9. What NOT to Change

- **Zero changes to CSS** — `styles.css` and `iconify-bridge.css` are untouched
- **Zero changes to Svelte components** (except LiveClock/TypedRole if they import data directly)
- **Zero changes to component props shapes** — they already match the API
- **Zero changes to the Lexical renderer** — it already handles API-format bodies
- **Zero changes to shell components** — Sidebar, Header, ThemeToggle, shell stores
- **No Astro component migration** — file-based routing stays
- **No build tool changes** — same `npm run dev` / `npm run build`

---

## 10. SSR Mode Requirement

The `[slug].astro` pages use `Astro.params` with data fetched at request time, not `getStaticPaths()`. This requires the Astro project to run in **hybrid** mode and needs the Node.js adapter.

### Step 1 — Install the adapter

```bash
cd frontend && npm install @astrojs/node
```

### Step 2 — Configure astro.config.mjs

```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';

export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  integrations: [svelte()]
});
```

### Step 3 — Mark [slug] pages for SSR

**On each `[slug].astro` page, add at the top:**
```ts
export const prerender = false;
```

---

## 11. Implementation Order

1. **Phase 0 — Verify backend:** Run `cd backend && npm run dev`, verify all endpoints return 200 via curl
2. **Phase 1 — CORS + SSR config:** Add Astro origin to backend CORS, switch Astro to hybrid mode, install `@astrojs/node`
3. **Phase 2 — Layout + static pages:** BaseLayout FIRST (shared shell), then index, projects listing, blogs listing, documents, socials
4. **Phase 3 — Dynamic routes:** `projects/[slug].astro`, `blogs/[slug].astro` — remove `getStaticPaths`, add on-demand fetch
5. **Phase 4 — Component data props:** Fix LiveClock to use prop instead of data import, remove unused ROLES array
6. **Phase 5 — Verify:** Run both servers, test all pages, run `astro build`

After each phase: run `npm run dev` and curl all pages. Write a phase report in `docs/sprint-4/reports/`. Update `docs/sprint-4/tasks.md`.

---

## 12. Reference Files

| File | How to Use |
|------|-----------|
| `docs/GUIDE.md` | **READ FIRST** — workflow rules, phased approach, report format |
| `docs/sprint-3/final-report.md` | Sprint-3 context — what was built, key decisions |
| `docs/sprint-2/resources/api-contract.md` | **ALL** endpoint URLs, response shapes, query params |
| `frontend/src/lib/api-types.ts` | TS interfaces — verify API responses match these types |
| `frontend/src/data/*.ts` | Reference for what the mock data looks like — API responses should match |
| `backend/src/payload.config.ts` | CORS config location |
| `backend/.env` | CORS env var |

---

## 13. How to Run

```bash
# Terminal 1: Backend
cd backend && npm run dev          # http://localhost:3000

# Terminal 2: Frontend
cd frontend && npm run dev         # http://localhost:4321

# Verify backend:
curl http://localhost:3000/api/projects?sort=order
curl http://localhost:3000/api/articles?sort=-publishedAt
curl http://localhost:3000/api/globals/home
```

---

## 14. Done Criteria

- [ ] `backend/` boots and all `/api/` endpoints return 200
- [ ] `frontend/` boots and all 7 routes return 200
- [ ] Home page renders with real data from API (hero, stats, about, skills)
- [ ] Projects listing renders 6 project cards from API
- [ ] Project detail pages work for all 6 slugs
- [ ] Blog listing renders 6 articles + category filter works
- [ ] Article detail pages work for all 6 slugs
- [ ] Documents page renders from API categories + documents
- [ ] Socials page renders 7 profiles from API
- [ ] Theme toggle, mobile drawer, sidebar collapse still work
- [ ] Blog filter chips derive from API tags correctly
- [ ] Search filters work against API data
- [ ] Home animations work (typed role, count-up, spotlight, clock)
- [ ] No mock data imports remain in any page or component
- [ ] `npx astro build` succeeds
- [ ] Zero regressions from sprint-3 visual output
- [ ] Documentation complete: `tasks.md` updated, phase reports written, `final-report.md`
