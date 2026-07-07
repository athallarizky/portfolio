# AGENTS.md — Sprint 3 Implementation Guide

> **For:** Any LLM agent implementing the Astro + Svelte frontend rebuild.
> **Context:** Sprint-2 delivered a PayloadCMS 3 backend with REST API. Sprint-3 builds the **UI only** — no API integration yet. Sprint-4 will connect to the API.

---

## 0. What Already Exists (Do NOT Rebuild)

```
backend/                     ← PayloadCMS 3 (DO NOT TOUCH)
├── src/collections/         ← 8 collections
├── src/globals/             ← 3 globals
├── src/seed.ts              ← 36.5 KB seed data (SOURCE OF TRUTH for mock data)
└── src/payload-types.ts     ← auto-generated types

docs/
├── sprint-1/final-report.md
├── sprint-2/
│   ├── final-report.md
│   └── resources/api-contract.md    ← TypeScript interfaces (SOURCE OF TRUTH)
└── sprint-3/                ← THIS SPRINT's planning docs (you are here)
    ├── tasks.md
    ├── architecture.md
    ├── data-design.md
    └── ux-flow.md

frontend/                    ← Sprint-1 STATIC HTML (will be DELETED in phase 1)
├── *.html                   ← reference for visual output
├── assets/styles.css        ← COPY VERBATIM into Astro
├── assets/app.js            ← CONVERT to shell stores + Svelte
├── assets/home.js           ← CONVERT to 4 Svelte components
├── assets/blogs.js          ← CONVERT to BlogFilter.svelte
├── assets/documents.js      ← DATA → mock .ts files + Astro rendering
└── assets/documents/        ← MOVE to public/documents/
```

**The sprint-1 frontend is the visual reference.** Every page you build must look identical. Side-by-side comparison in browser is the acceptance test.

**The sprint-2 API contract is the data shape reference.** Component props must match those interfaces.

---

## 1. Tech Stack (EXACT — Do Not Change)

| Layer | Technology |
|-------|-----------|
| Framework | **Astro 5** with TypeScript |
| Interactive UI | **Svelte 5** |
| Icons | **@iconify/svelte** (npm package, not CDN) |
| Styling | Sprint-1's `styles.css` — imported verbatim |
| Fonts | Google Fonts CDN — **Inter**, same `<link>` tags |
| Data (sprint-3) | Static `.ts` files in `src/data/` |
| Build output | Static HTML — `astro build` → `dist/` |

**DO NOT add:** Tailwind, React, Vue, CSS modules, new fonts, new icon sets.

---

## 2. File Structure to Create

```
frontend/             ← scaffold with `npm create astro@latest`
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   └── documents/    ← copy from sprint-1 assets/documents/
├── src/
│   ├── env.d.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── shell/
│   │   │   ├── Sidebar.svelte
│   │   │   ├── Header.svelte
│   │   │   └── ThemeToggle.svelte
│   │   ├── home/
│   │   │   ├── TypedRole.svelte
│   │   │   ├── CountUpStats.svelte
│   │   │   ├── SpotlightEffect.svelte
│   │   │   └── LiveClock.svelte
│   │   ├── blog/
│   │   │   └── BlogFilter.svelte
│   │   └── ui/
│   │       └── Icon.svelte
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── theme.ts
│   │   │   └── shell.ts
│   │   ├── api-types.ts
│   │   └── render-lexical.ts
│   ├── data/
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
│   │   ├── styles.css       ← copied verbatim from sprint-1
│   │   └── iconify-bridge.css
│   └── pages/
│       ├── index.astro
│       ├── projects.astro
│       ├── projects/
│       │   └── [slug].astro
│       ├── blogs.astro
│       ├── blogs/
│       │   └── [slug].astro
│       ├── documents.astro
│       └── social.astro
```

---

## 3. Implementation Order

Follow `docs/sprint-3/tasks.md` phase by phase. Each phase builds on the previous.

**Phase 1:** Scaffold + copy files  
**Phase 2:** Data types + mock data  
**Phase 3:** Shell components (sidebar, header, theme, stores)  
**Phase 4:** Static pages (social, documents, projects list + detail)  
**Phase 5:** Blog pages + filter + Lexical renderer  
**Phase 6:** Home page (typed role, count-up, spotlight, clock)  
**Phase 7:** Search filters on listing pages  
**Phase 8:** Verify everything (side-by-side with sprint-1)

After each phase: run `npm run dev` and verify visually. Write a phase report in `docs/sprint-3/reports/phase-N-report.md`. Update `tasks.md`.

---

## 4. Shell Layout Pattern (`BaseLayout.astro`)

This is the most important component — it's the `<html>` shell for every page.

```astro
---
import '../styles/styles.css';
import '../styles/iconify-bridge.css';
import Sidebar from '../components/shell/Sidebar.svelte';
import Header from '../components/shell/Header.svelte';
import type { Nav } from '../lib/api-types';
import { nav } from '../data/nav';
import { siteConfig } from '../data/site-config';

interface Props {
  title: string;
  pageTitle: string;
  activeNav: string;  // '/' | '/projects' | '/blogs' | '/documents' | '/social'
}

const { title, pageTitle, activeNav } = Astro.props;
// Find header-right slot content
const headerRight = Astro.slots.headerRight;
---

<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- FOUC prevention — must run before first paint -->
  <script is:inline>
    (function() {
      var t = localStorage.getItem('portfolio-theme');
      if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (t === 'dark') document.documentElement.classList.add('dark');
    })();
  </script>
</head>
<body>
  <div class="layout">
    <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

    <Sidebar
      client:load
      activeNav={activeNav}
      menuItems={nav.menuItems}
      connectLinks={nav.connectLinks}
      initials={siteConfig.initials}
      name={siteConfig.name}
      role={siteConfig.role || ''}
    />

    <main class="main">
      <Header client:load pageTitle={pageTitle}>
        {headerRight && <Fragment slot="header-right">{headerRight}</Fragment>}
      </Header>

      <div class="content-scroll">
        <div class="layout-container">
          <div class="corner-blob"></div>
          <div class="content-inner">
            <slot />
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

---

## 5. Sidebar.svelte

Key behaviors:
- **Active nav** — received as `activeNav` prop (e.g., `'/projects'`). Match by path prefix: `url.startsWith(activeNav)`.
- **Mobile drawer** — imports `mobileDrawerOpen` from `shell.ts`. When `$mobileDrawerOpen` is true, add `.is-open` to `#sidebar` and `.sidebar-backdrop`. Backdrop click closes.
- **Link click** — close drawer (set `mobileDrawerOpen` to false).
- **Desktop collapse** — `#sidebar-collapse` button toggles `sidebarCollapsed` store. `.is-collapsed` class on sidebar.
- **Resize listener** — close drawer on window width ≥ 768px.

Props:
```ts
export let activeNav: string;
export let menuItems: Nav['menuItems'];
export let connectLinks: Nav['connectLinks'];
export let initials: string;
export let name: string;
export let role: string;
```

---

## 6. Header.svelte

```svelte
<script lang="ts">
  import { mobileDrawerOpen } from '../../lib/stores/shell';
  import Icon from '../ui/Icon.svelte';

  export let pageTitle: string;
</script>

<header class="header">
  <div class="header-left">
    <button id="hamburger" class="icon-btn hamburger" on:click={() => ($mobileDrawerOpen = true)}>
      <Icon icon="solar:hamburger-menu-outline" width={24} height={24} />
    </button>
    <div class="header-title-row">
      <div class="accent-bar"></div>
      <span class="page-title">{pageTitle}</span>
      <span class="sync-icon" title="Refresh">
        <Icon icon="fluent:arrow-sync-12-filled" width={20} height={20} />
      </span>
    </div>
  </div>
  <div class="header-right">
    <slot name="header-right" />
  </div>
</header>
```

---

## 7. Theme System

### `src/lib/stores/theme.ts`

```ts
import { writable } from 'svelte/store';

function getInitial(): 'light' | 'dark' {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'light';
}

export const theme = writable<'light' | 'dark'>(getInitial());

export function toggleTheme() {
  theme.update(t => {
    const next = t === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('portfolio-theme', next);
    return next;
  });
}
```

### `src/lib/stores/shell.ts`

```ts
import { writable } from 'svelte/store';

export const mobileDrawerOpen = writable(false);

const savedCollapsed = typeof localStorage !== 'undefined'
  ? localStorage.getItem('portfolio-sidebar-collapsed') === '1'
  : false;
export const sidebarCollapsed = writable(savedCollapsed);

export function toggleSidebarCollapsed() {
  sidebarCollapsed.update(v => {
    const next = !v;
    localStorage.setItem('portfolio-sidebar-collapsed', next ? '1' : '0');
    return next;
  });
}
```

---

## 8. Icon.svelte

```svelte
<script lang="ts">
  import { Icon as IconifyIcon } from '@iconify/svelte';

  export let icon: string;
  export let width: number | string = 20;
  export let height: number | string = 20;
</script>

<IconifyIcon {icon} {width} {height} />
```

`@iconify/svelte` renders `<svg>` elements instead of `<iconify-icon>`. The `iconify-bridge.css` handles the 3 CSS selectors that break:

```css
/* iconify-bridge.css */
.doc-group-head svg      { color: var(--secondary); flex-shrink: 0; }
.feature-list li svg     { color: var(--secondary); flex-shrink: 0; margin-top: 2px; }
.filter-head svg         { color: var(--desc); }
```

---

## 9. Mock Data Pattern

Collections export `PaginatedResponse<T>`, globals export singletons:

```ts
// src/data/projects.ts
import type { Project, PaginatedResponse } from '../lib/api-types';

export const projects: PaginatedResponse<Project> = {
  docs: [
    { id: 1, title: 'NoteFlow', slug: 'noteflow', ... },
    // ... 5 more
  ],
  totalDocs: 6,
  limit: 10,
  totalPages: 1,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
};
```

```ts
// src/data/site-config.ts
import type { SiteConfig } from '../lib/api-types';

export const siteConfig: SiteConfig = {
  name: 'Atha Tharizky',
  initials: 'AT',
  role: 'Full-Stack Engineer',
  bioShort: '...',
  status: 'Open to side-projects',
  timezone: 'UTC+7',
  location: 'Remote · UTC+7',
};
```

**Source of truth for values:** `backend/src/seed.ts`. Copy exact strings, not approximations.

---

## 10. Page Patterns

### Listing page (e.g., `projects.astro`)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { projects } from '../data/projects';
---

<BaseLayout title="Projects" pageTitle="Projects" activeNav="/projects">
  <p class="text-desc text-sm mb-4">
    A selection of things I've built — side projects, tooling, and the occasional over-engineered experiment.
  </p>
  <div class="grid-3">
    {projects.docs.map((p) => (
      <article class="card is-hoverable">
        <!-- gradient banner -->
        <a href={`/projects/${p.slug}`} style="display:block; text-decoration:none; color:inherit;">
          <div style={`height: 140px; border-radius: 12px; background: ${p.bannerColor}; display:flex; align-items:center; justify-content:center; margin-bottom:12px;`}>
            <Icon icon={p.bannerIcon} width={48} height={48} style="color:#fff; opacity:.85" />
          </div>
          <div class="card-header">
            <span class="card-title">{p.title}</span>
            <span class="card-date">{p.year}</span>
          </div>
          <p class="card-excerpt">{p.excerpt}</p>
          <div class="flex flex-wrap mt-2">
            {p.techTags.map((t) => <span class="tag is-secondary">{t.name}</span>)}
          </div>
        </a>
        <div class="card-footer">
          <span class="text-xs text-desc">{p.descriptor}</span>
          <div class="flex gap-2">
            {p.links.map((l) => (
              <a class="icon-btn" href={l.url || '#'} title={l.label}>
                <Icon icon={l.icon || 'solar:link-circle-bold'} width={18} height={18} />
              </a>
            ))}
          </div>
        </div>
      </article>
    ))}
  </div>
</BaseLayout>
```

### Detail page with `getStaticPaths()` (e.g., `projects/[slug].astro`)

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Icon from '../../../components/ui/Icon.svelte';
import { projects } from '../../../data/projects';

export function getStaticPaths() {
  return projects.docs
    .filter(p => p.status === 'published')
    .map(p => ({ params: { slug: p.slug }, props: { project: p } }));
}

const { project } = Astro.props;
---

<BaseLayout title={project.title} pageTitle={project.title} activeNav="/projects">
  <a class="back-link" href="/projects" slot="header-right">
    <Icon icon="solar:alt-arrow-left-linear" client:load width={16} height={16} />
    All projects
  </a>

  <!-- Banner, excerpt, tags, links -->

  <!-- Body (Lexical prose) -->
  <div class="prose mt-4">
    {renderLexical(project.body, project)}
  </div>

  <!-- Features grid -->
  <div class="grid-2 mt-4">
    {project.features.map((f) => (...))}
  </div>

  <!-- Screenshots, stats, architecture, next project -->
</BaseLayout>
```

---

## 11. Lexical Renderer (`src/lib/render-lexical.ts`)

```ts
import type { LexicalRoot, LexicalNode, LexicalText } from './api-types';

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;

function renderText(text: LexicalText): string {
  let html = escapeHtml(text.text);
  if (text.format & FORMAT_BOLD) html = `<strong>${html}</strong>`;
  if (text.format & FORMAT_ITALIC) html = `<em>${html}</em>`;
  if (text.format & FORMAT_UNDERLINE) html = `<u>${html}</u>`;
  if (text.format & FORMAT_STRIKETHROUGH) html = `<del>${html}</del>`;
  if (text.format & FORMAT_CODE) html = `<code>${html}</code>`;
  return html;
}

function renderNode(node: LexicalNode): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${node.children.map(renderText).join('')}</p>`;
    case 'heading':
      return `<${node.tag}>${node.children.map(renderText).join('')}</${node.tag}>`;
    case 'code':
      return `<pre><code class="language-${node.language}">${node.children.map(t => t.text).join('')}</code></pre>`;
    case 'quote':
      return `<blockquote>${node.children.map(renderNode).join('')}</blockquote>`;
    case 'list':
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      return `<${tag}>${node.children.map(renderNode).join('')}</${tag}>`;
    case 'listitem':
      return `<li>${node.children.map(renderNode).join('')}</li>`;
    default:
      return '';
  }
}

export function renderLexical(root: LexicalRoot): string {
  return root.root.children.map(renderNode).join('');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

---

## 12. Svelte Component Directives

| Component | Directive | Why |
|-----------|-----------|-----|
| `Sidebar` | `client:load` | Must be ready for mobile hamburger immediately |
| `Header` | `client:load` | Hamburgers tappable on load |
| `ThemeToggle` | (inside Sidebar) | Loaded with sidebar |
| `TypedRole` | `client:visible` | Below fold, defer |
| `CountUpStats` | `client:visible` | Animate only when visible |
| `SpotlightEffect` | `client:visible` | Pointer tracking on hero |
| `LiveClock` | `client:visible` | Defer interval start |
| `BlogFilter` | `client:load` | Filter must be immediately interactive |

---

## 13. Reference Files (Code You Can Copy From)

| Source | What to Copy |
|--------|-------------|
| `frontend/assets/styles.css` | Entire file → `src/styles/styles.css` |
| `frontend/index.html` | Hero/stats/about/skills HTML structure → `index.astro` |
| `frontend/projects.html` | Project card grid structure → `projects.astro` |
| `frontend/project.html` | Detail page structure → `projects/[slug].astro` |
| `frontend/blogs.html` | Blog list + filter sidebar → `blogs.astro` |
| `frontend/article.html` | Article detail + related sidebar → `blogs/[slug].astro` |
| `frontend/documents.html` | Document group structure → `documents.astro` |
| `frontend/social.html` | Social card grid → `social.astro` |
| `frontend/assets/app.js` | Theme toggle logic → `theme.ts`, sidebar collapse → `shell.ts`, mobile drawer → `shell.ts` |
| `frontend/assets/home.js` | Typed role → `TypedRole.svelte`, count-up → `CountUpStats.svelte`, spotlight → `SpotlightEffect.svelte`, clock → `LiveClock.svelte` |
| `frontend/assets/blogs.js` | Category derivation + filter → `BlogFilter.svelte` |
| `backend/src/seed.ts` | All data values → `src/data/*.ts` |
| `docs/sprint-2/resources/api-contract.md` | TypeScript interfaces → `src/lib/api-types.ts` |

---

## 14. Deviations from Sprint-1 (What to Do Differently)

| Sprint-1 | Sprint-3 | Why |
|----------|----------|-----|
| Duplicated sidebar/header in all 7 HTML files | Shared `BaseLayout.astro` | DRY — one shell, 7 pages |
| `<iconify-icon>` web component (CDN) | `<svg>` via `@iconify/svelte` | No CDN dep, tree-shakeable |
| `data-page="projects.html"` on sidebar links | `href="/projects"` with path-prefix matching | Clean URLs standard for Astro |
| `blogs.js` scans DOM for tags | Tags come from mock data array, `BlogFilter` receives as prop | Data-driven instead of DOM-driven |
| `documents.js` renders HTML via innerHTML | Astro renders document cards statically | No client-side rendering for static data |
| `home.js` — 4 functions (IIFE) | 4 separate Svelte components | Better encapsulation, lazy loading |
| Hardcoded data in HTML | Data in `.ts` files, imported by pages | Separation of concerns, ready for API swap |
| `.html` extensions in URLs | Clean URLs (`/projects`, `/blogs/noteflow`) | Standard Astro routing |
| Search boxes are decorative | Client-side text filter against mock data | Adds value at no API cost |

---

## 15. Implementation Checklist

- [ ] Phase 1: Scaffold Astro, copy CSS, move documents
- [ ] Phase 2: All 11 mock data files + api-types.ts + render-lexical.ts
- [ ] Phase 3.1-3.2: theme.ts + shell.ts stores
- [ ] Phase 3.3: Icon.svelte
- [ ] Phase 3.4: ThemeToggle.svelte
- [ ] Phase 3.5: Sidebar.svelte (full implementation)
- [ ] Phase 3.6: Header.svelte
- [ ] Phase 3.7: BaseLayout.astro
- [ ] Phase 4.1: social.astro (grid of profile cards)
- [ ] Phase 4.2: documents.astro (grouped document cards)
- [ ] Phase 4.3: projects.astro (grid of project cards)
- [ ] Phase 4.4: projects/[slug].astro (project detail page)
- [ ] Phase 5.1: render-lexical.ts (Lexical JSON → HTML)
- [ ] Phase 5.2: BlogFilter.svelte (category chips + filtering)
- [ ] Phase 5.3: blogs.astro (blog list + filter)
- [ ] Phase 5.4: blogs/[slug].astro (article detail)
- [ ] Phase 6.1: TypedRole.svelte
- [ ] Phase 6.2: CountUpStats.svelte
- [ ] Phase 6.3: SpotlightEffect.svelte
- [ ] Phase 6.4: LiveClock.svelte
- [ ] Phase 6.5: index.astro (home page assembled)
- [ ] Phase 7.1: Search filter on projects.astro
- [ ] Phase 7.2: Search filter on blogs.astro
- [ ] Phase 7.3: Search filter on social.astro
- [ ] Phase 8: Verify all pages (light/dark/mobile) against sprint-1
- [ ] Phase 8: `astro build` produces valid output
- [ ] Phase 8: Write final-report.md

---

## 16. How to Run

```bash
cd frontend && npm install && npm run dev    # http://localhost:4321
```

Compare against sprint-1:
```bash
cd frontend-legacy && python3 -m http.server 8080    # http://localhost:8080
```

---

## 17. Done Criteria

- [ ] Every page looks identical to sprint-1 in light + dark + mobile
- [ ] Theme toggle works, persists across navigation, no FOUC
- [ ] Mobile drawer opens/closes, backdrop works, closes on link click
- [ ] Sidebar collapses on desktop, state persists
- [ ] Active nav highlights correct section on all pages
- [ ] Blog filter chips derive from article tags, filtering works, "All" resets
- [ ] Document groups render in order, empty categories hidden
- [ ] Home animations work (typed role, count-up, spotlight, clock)
- [ ] Home animations respect `prefers-reduced-motion`
- [ ] Search filters work on projects, blogs, socials
- [ ] All internal links navigate correctly
- [ ] External links open in new tab
- [ ] Document download links work
- [ ] `astro build` produces clean static output in `dist/`
- [ ] Zero console errors
- [ ] Motion respects `prefers-reduced-motion` globally
