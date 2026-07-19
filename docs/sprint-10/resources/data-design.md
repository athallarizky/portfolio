# Data Design — Sprint 10: Home Page Redesign

## 1. Input Data

All data comes from the existing PayloadCMS REST API (`PUBLIC_API_URL`, default `http://localhost:3000/api`) via `safeFetch()` (`frontend/src/lib/api.ts`) — it returns `{docs: []}` / `{}` on any failure, so every section must degrade gracefully. **No new endpoints.**

### Queries used by `index.astro`

| # | Query | Status | Renders |
|---|-------|--------|---------|
| 1 | `GET /globals/home` | existing | hero, stats, about, currently, skills, roles, `showItems` |
| 2 | `GET /globals/site-config` | existing | initials, status, timezone, name |
| 3 | `GET /social-profiles?sort=order` | existing | Find-me links (filter `showOnHome`) |
| 4 | `GET /projects?where[showOnHome][equals]=true&where[status][equals]=published&sort=order&limit=3&depth=1` | **new** | Selected work cards |
| 5 | `GET /articles?where[status][equals]=published&sort=-publishedAt&limit=3&select=title,slug,publishedAt` | **new** | Latest writing rows |

Notes:
- Query 4 uses `depth=1` so `techTags` (relationship → technologies) resolves to objects with `name`.
- Query 5 renders only title + date, so `select` keeps the payload tiny; no depth needed.
- `showItems` values gating the new sections: `featuredProjects`, `latestWriting`.

## 2. Schema Changes (backend)

### `Projects` collection (`backend/src/collections/Projects.ts`) — add one field

```ts
{
  name: 'showOnHome',
  type: 'checkbox',
  defaultValue: false,
  admin: { position: 'sidebar', description: 'Feature in the Home "Selected work" strip' },
}
```

Same pattern as `SocialProfile.showOnHome`. No migration needed (SQLite, checkbox defaults false).

### `Home` global (`backend/src/globals/Home.ts`) — extend `showItems` options

Add to the existing multi-select (~L56-74):

```ts
{ label: 'Featured projects', value: 'featuredProjects' },
{ label: 'Latest writing', value: 'latestWriting' },
```

Include both in the field's `defaultValue` array so fresh seeds show the sections.

## 3. Type Changes (frontend `src/lib/api-types.ts`)

```ts
interface Project {
  // …existing fields…
  showOnHome?: boolean
}

// Home['showItems'] union gains:
//   'featuredProjects' | 'latestWriting'
```

## 4. Seed Changes

| File | Change |
|------|--------|
| `backend/src/seed/data/globals.ts` | Delete the `currently` item `'Local time {time}'` — renders a literal `{time}`; the live clock already exists in the hero chip |
| `backend/src/seed/data/projects.ts` | `showOnHome: true` on the first 3 seeded projects (by `order`) |

No new seed documents (owner populates content manually).

## 5. Pipeline

```
Payload API ──safeFetch──► index.astro (SSR, per-request)
   ├── home / site-config / social-profiles   (existing sections)
   ├── projects?showOnHome…  ──► Selected work  ──► SSR HTML, no client state
   └── articles?-publishedAt… ─► Latest writing ──► SSR HTML, no client state
```

Client JS is only for motion (TypedRole, CountUpStats, LiveClock, SpotlightEffect, glow action, MagneticButton, Reveal) — it never fetches.

## 6. Quirks & Edge Cases

- **Empty strips:** `docs: []` (no flags set, all drafts, or API down) → section hidden entirely.
- **Fewer than 3:** render what exists (grid auto-fills; no placeholder cards).
- **`showItems` default mismatch:** the page-level fallback set in `index.astro` currently omits `findMe`/`contactCta` while the backend default includes them — align it during this sprint (add all defaults incl. the two new options).
- **Date format:** rows show `publishedAt` as e.g. `Jul 12, 2026` (`toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})`), done server-side in Astro — no hydration needed.
- **Tech tags on cards:** `techTags` objects use `.name`; guard with `?? []` since `depth` failures yield IDs.
