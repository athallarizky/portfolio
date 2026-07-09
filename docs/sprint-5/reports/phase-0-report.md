# Phase 0 Report — Discovery & Exploration

> Completed: 2026-07-09

---

## 1. How to Run

```bash
cd backend && npm run dev      # http://localhost:3000  (PayloadCMS)
cd frontend && npm run dev     # http://localhost:4321  (Astro)
```

---

## 2. Architecture decision — server-side fetch everywhere

| Page | Fetch site | Pattern |
|------|-----------|---------|
| `BaseLayout.astro:7-12` | server (frontmatter) | `Promise.all([nav, site-config])` |
| `index.astro` | server (frontmatter) | `Promise.all([home, site-config, social-profiles])` |
| `projects.astro` / `blogs.astro` / `social.astro` / `documents.astro` | server (frontmatter) | single `fetch` |
| `projects/[slug].astro` / `blogs/[slug].astro` | server (frontmatter, SSR) | on-demand slug fetch |

**Finding:** every display page fetches server-side via the Astro frontmatter (`const API = 'http://localhost:3000/api'` is a server-side constant). The browser never talks to Payload directly. This is why no CORS issue exists for reads.

**Implication for the contact form:** the `AGENTS.md`-specified inline client-direct `fetch` to `:3000` would be the *only* client-side fetch in the codebase. This plan deviates to a **same-origin Astro server endpoint** (`src/pages/api/contact.ts`) that proxies the POST server-side — consistent with the existing architecture, no client-side CORS exposure.

---

## 3. CORS — already correctly configured

| Source | Value |
|--------|-------|
| `backend/src/payload.config.ts:25-28` | `cors = (process.env.PAYLOAD_PUBLIC_CORS \|\| 'http://localhost:8080').split(',')` |
| `backend/.env:8` | `PAYLOAD_PUBLIC_CORS=http://localhost:4321,http://localhost:8080,http://127.0.0.1:8080` |

Frontend origin `:4321` is allow-listed. With the server-endpoint approach, CORS is irrelevant for the POST anyway (browser → `/api/contact` is same-origin).

---

## 4. Bug found — sidebar active-nav highlight is broken on ALL pages

**Root cause:** `Sidebar.svelte:33-37` matches `activeNav.startsWith(item.href)`:

```js
function isActive(href: string): boolean {
  if (activeNav === '/' && href === '/') return true;
  if (activeNav !== '/' && href !== '/' && activeNav.startsWith(href)) return true;
  return false;
}
```

Pages pass clean `activeNav` (e.g. `"/social"`), but `seed.ts:403-407` emits stale `.html` hrefs:

```js
{ label: 'Socials', href: 'social.html', ... }   // "/social".startsWith("social.html") === false
```

So **no sidebar link is ever highlighted.** Fixing hrefs to clean paths (`/`, `/projects`, `/blogs`, `/documents`, `/social`) will fix highlight on every page — a latent sprint-4 bug caught for free.

---

## 5. Collection convention to follow

`backend/src/collections/SocialProfiles.ts` — minimal, the closest pattern to a simple collection:

```ts
import type { CollectionConfig } from 'payload'
export const SocialProfiles: CollectionConfig = {
  slug: 'social-profiles',
  admin: { useAsTitle: 'platform', group: 'Social' },
  access: { read: () => true },
  fields: [ ... ],
}
```

Registration at `payload.config.ts:8-16` (named import) + `:35` (append to `collections` array). `ContactMessages` will mirror this, but with `access: { read: () => false, create: () => true }`.

---

## 6. Astro config — SSR-by-default

`frontend/astro.config.mjs`: `output: 'server'`, `@astrojs/node` adapter (`mode: 'standalone'`). All pages are dynamic on-demand — **no `prerender` config needed** on `contact.astro`. A server endpoint is just a `export async function POST({ request })` in `src/pages/api/contact.ts`, no config change.

---

## 7. CSS tokens & input pattern confirmed

`frontend/src/styles/styles.css` — existing input pattern (`.search input`, `:369-378`) uses transparent bg + no border + `color: var(--foreground)`. Design tokens all present in both themes: `--secondary` (`hsl(253,53%,59%)`), `--border`, `--radius` (`0.5rem`), `--input`, `--secondbackground`, `--foreground`, `--desc`, `--hover`, `--destructive`.

---

## 8. Key Decisions

| Decision | Reason |
|----------|--------|
| Astro server endpoint `/api/contact` (not client-direct fetch) | Matches existing server-side fetch architecture; same-origin POST, no CORS exposure |
| Fix `.html` → clean-path nav hrefs in this sprint | Active-nav bug caught in discovery; touching nav anyway to add Contact |
| `ContactMessages`: `read:false, create:true` | Submissions writable by all, never leak publicly; admin still sees via auth path |

---

## 9. Reference Files

| File | Purpose |
|------|---------|
| `backend/src/payload.config.ts` | Register new collection (`:8-16`, `:35`) |
| `backend/src/collections/SocialProfiles.ts` | Simplest collection pattern to mirror |
| `backend/src/seed.ts` | Nav global seed (`:399-415`) — hrefs to fix |
| `backend/.env` | CORS allow-list (`PAYLOAD_PUBLIC_CORS`) |
| `frontend/astro.config.mjs` | `output: 'server'` |
| `frontend/src/layouts/BaseLayout.astro` | Page shell + props (`title`, `pageTitle`, `activeNav`) |
| `frontend/src/pages/social.astro` | Cleanest page template to copy |
| `frontend/src/components/shell/Sidebar.svelte` | `isActive()` logic (`:33-37`) |
| `frontend/src/styles/styles.css` | Design tokens + `.search` input pattern |
