# Architecture — Sprint 3: Astro + Svelte Frontend Rebuild

## 1. Project Structure

```
frontend/                        ← NEW Astro project (replaces sprint-1 static)
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   └── documents/               ← downloadable files
├── src/
│   ├── env.d.ts
│   ├── layouts/
│   │   └── BaseLayout.astro     ← <html> shell — sidebar, header, theme FOUC script
│   ├── components/
│   │   ├── shell/
│   │   │   ├── Sidebar.svelte   ← nav, connect links, halation, theme toggle, collapse
│   │   │   ├── Header.svelte    ← hamburger, page title, search, header-right slot
│   │   │   └── ThemeToggle.svelte
│   │   ├── home/
│   │   │   ├── TypedRole.svelte       ← role cycling animation
│   │   │   ├── CountUpStats.svelte    ← count-up animation
│   │   │   ├── SpotlightEffect.svelte ← pointer radial glow
│   │   │   └── LiveClock.svelte       ← ticking local time
│   │   ├── blog/
│   │   │   └── BlogFilter.svelte      ← category chips + filtering
│   │   └── ui/
│   │       └── Icon.svelte            ← @iconify/svelte wrapper
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── theme.ts         ← writable store + FOUC toggle helper
│   │   │   └── shell.ts         ← mobileDrawerOpen, sidebarCollapsed
│   │   ├── api-types.ts         ← TS interfaces from API contract
│   │   └── render-lexical.ts    ← Lexical JSON tree → HTML renderer
│   ├── data/                    ← static mock data (shaped like API responses)
│   │   ├── site-config.ts
│   │   ├── home.ts
│   │   ├── nav.ts
│   │   ├── projects.ts
│   │   ├── articles.ts
│   │   ├── document-categories.ts
│   │   ├── documents.ts
│   │   ├── social-profiles.ts
│   │   ├── technologies.ts
│   │   ├── tags.ts
│   │   └── authors.ts
│   ├── styles/
│   │   ├── styles.css            ← copied verbatim from sprint-1
│   │   └── iconify-bridge.css    ← bridges @iconify/svelte SVG to CSS selectors
│   └── pages/
│       ├── index.astro           ← Home: hero, stats, about, skills, find-me
│       ├── projects.astro        ← .grid-3 of project cards
│       ├── projects/
│       │   └── [slug].astro      ← Project detail
│       ├── blogs.astro           ← Blog list + BlogFilter island
│       ├── blogs/
│       │   └── [slug].astro      ← Article detail
│       ├── documents.astro       ← Grouped document cards
│       └── social.astro          ← .grid-3 of social profile cards
```

## 2. Tech Stack Decisions

### Decision Matrix

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Astro 5 | Zero-JS-by-default, file-based routing, Svelte integration, static output |
| Interactive UI | Svelte 5 | Minimal bundle for islands; familiar reactivity model; fine-grained updates |
| Icons | `@iconify/svelte` | Same icon set as sprint-1 (Solar + simple-icons), tree-shakeable, no CDN dep |
| Styling | Plain CSS (copied from sprint-1) | Exact visual match; no migration risk; no new design system |
| Data (sprint-3) | Static `.ts` files | Shapes match API responses for zero-friction sprint-4 swap |
| Data (sprint-4) | Fetch from REST API | `.ts` files become fetch wrappers; component props unchanged |
| Fonts | Google Fonts CDN (Inter) | Same as sprint-1; avoids bundling 400KB |
| Config | TypeScript | Type safety for mock data + component props |

### Why NOT Alternatives

| Rejected | Reason |
|----------|--------|
| SvelteKit (instead of Astro) | Would bundle JS for every page; Astro's zero-JS-by-default is a better fit for this content-heavy site |
| React / Vue | Unnecessary overhead for a site where most pages are static; Svelte is lighter and closer to vanilla JS patterns |
| Tailwind CSS | Would require total CSS rewrite — violates "match existing aesthetic" constraint |
| CSS Modules / scoped styles | Would add complexity; copying the single `styles.css` file is the simplest path to visual parity |
| `iconify-icon` web component (CDN) | Same as sprint-1, but adds a runtime dependency; `@iconify/svelte` bundles only used icons |
| Server-side rendering | No need — the backend is a separate service; Astro SSG produces pure static output |

## 3. Component Boundaries

### BaseLayout.astro
- **Input:** Astro props (`title`, `pageTitle`, `activeNav`, `headerRight` slot)
- **Output:** Full `<html>` document with sidebar, header, content wrapper
- **Does NOT:** Handle page-specific business logic or data fetching

### Sidebar.svelte (`client:load`)
- **Input:** nav menu items, connect links, site config (via Astro props passed as data attributes or a shared store)
- **Output:** Sidebar DOM with nav highlighting, mobile drawer state, collapse toggle
- **Does NOT:** Fetch data; receives everything as props

### Header.svelte (`client:load`)
- **Input:** `pageTitle` string, optional slot for header-right content
- **Output:** Header bar with hamburger, title, search, header-right
- **Does NOT:** Manage nav state — imports `mobileDrawerOpen` from `shell.ts` store

### Theme System
Split across three layers to prevent FOUC:
1. **Inline `<script is:inline>` in `<head>`** — reads localStorage, sets `.dark` class before paint
2. **`theme.ts` Svelte store** — reactive state for `ThemeToggle.svelte`, syncs with DOM class
3. **`ThemeToggle.svelte`** — UI button that flips the store

### Page Components
Each page (`.astro` file) is responsible for:
- Importing its data from `src/data/`
- Passing it to template markup
- Mounting Svelte islands where interactivity is needed
- Setting page title + active nav for the layout

## 4. Key Architectural Decisions

### Decision 1: Clean URLs (not `.html` extensions)
**Decision:** Use Astro file-based routing (`/projects`, `/blogs/noteflow`)
**Reasoning:**
- Standard for Astro; `.html` extensions require manual redirect config
- Sidebar nav changes from `data-page="projects.html"` to `href="/projects"`; active nav switches from basename match to path-prefix match
- Simpler API integration in sprint-4 (API slugs map directly to route params)
- Astro's `getStaticPaths()` generates clean URLs natively

### Decision 2: Svelte stores for cross-component state (not props/context)
**Decision:** `shell.ts` and `theme.ts` as module-level Svelte writables
**Reasoning:**
- `Sidebar.svelte` and `Header.svelte` both use `client:load` — they hydrate in the same JS context and share store instances
- No prop drilling through Astro → Svelte boundaries for runtime state
- Matches the vanilla JS pattern from sprint-1 (global variables in IIFE), but with reactivity

### Decision 3: `@iconify/svelte` instead of CDN `<iconify-icon>`
**Decision:** npm package with a thin `Icon.svelte` wrapper
**Reasoning:**
- Eliminates runtime CDN dependency
- Tree-shakeable — only used icons are bundled
- Requires `iconify-bridge.css` to handle 3 CSS selectors that targeted `<iconify-icon>` as an element (not class)
- All icons use the same `solar:*` and `simple-icons:*` prefixes — zero migration of icon names

### Decision 4: Single `styles.css` file (not component-scoped CSS)
**Decision:** Import the 974-line `styles.css` in `BaseLayout.astro`, add minimal `iconify-bridge.css`
**Reasoning:**
- Guarantees pixel-identical output to sprint-1
- No CSS migration risk
- All component vocabulary (`.card`, `.tag`, `.btn`, `.grid-3`, etc.) works unchanged
- The only gap is element selectors targeting `<iconify-icon>` — 3 rules bridged in `iconify-bridge.css`

### Decision 5: Mock data shaped like API responses
**Decision:** Collections export `PaginatedResponse<T>`; globals export singletons
**Reasoning:**
- Component props mirror API response interfaces exactly
- Sprint-4 integration is a one-line swap: replace `import { projects } from '../../data/projects'` with `const { projects } = await fetch('/api/projects').then(r => r.json())`
- TypeScript interfaces in `api-types.ts` serve as the contract for both mock data and future API calls

### Decision 6: Lexical renderer as a utility (not a Svelte component)
**Decision:** Pure function `renderLexical(root: LexicalRoot): string` in `src/lib/render-lexical.ts`
**Reasoning:**
- Rich text is static — no interactivity needed (no client JS)
- Astro pages call `renderLexical()` at build time, output HTML in `.prose` containers
- Handles: `paragraph`, `heading` (h1-h6), `code`, `quote`, `list` (bullet/number), `listitem`, `text` (with bold/italic/underline/strikethrough/code format bits)
- Sprint-4: same renderer works against live API data — no change needed

### Decision 7: `client:visible` for home page animations
**Decision:** Defer `TypedRole`, `CountUpStats`, `SpotlightEffect`, `LiveClock` until scrolled into view
**Reasoning:**
- Home hero is tall; stats/animations are below the fold on many viewports
- `client:visible` uses IntersectionObserver — no work done until user scrolls
- Reduces initial JS execution and bundle evaluation cost
- `Sidebar`, `Header`, and `BlogFilter` use `client:load` — must be ready immediately
