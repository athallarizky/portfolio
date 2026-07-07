# UX Flow — Sprint 3: Astro + Svelte Frontend

## 1. Navigation

```
Home (/) ─────────────────────────────────────────────────────┐
  ├── Projects (/projects) ──► Project detail (/projects/:slug)
  ├── Blogs (/blogs) ──► Article detail (/blogs/:slug)
  ├── Documents (/documents)
  └── Social (/social)
```

All pages share:
- Left sidebar (collapsible on desktop, drawer on mobile)
- Top header (hamburger, page title, search box, action slot)
- Theme toggle in sidebar (light/dark, persisted)
- Active nav highlight based on current URL path prefix

---

## 2. Screen-by-Screen

### 2.1 Home (`/`)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: Home] [Search…] [🔔]                   │
│           │ ┌──────────────────────────────────────────────┐ │
│           │ │  HERO                                        │ │
│           │ │  [Avatar]  // hello, I'm                     │ │
│           │ │  AT        Atha Tharizky                     │ │
│           │ │            Full-Stack Engineer| ← typed       │ │
│           │ │            [Open to projects] [Remote·UTC+7] │ │
│           │ │  [View Projects] [Read the blog]             │ │
│           │ └──────────────────────────────────────────────┘ │
│           │ ┌──────────┬──────────┬──────────┬─────────────┐ │
│           │ │  6+      │   24     │    3     │     ∞       │ │
│           │ │ Years    │ Projects │ Languages│ Cups coffee │ │
│           │ └──────────┴──────────┴──────────┴─────────────┘ │
│           │ ┌─────────────────────┬────────────────────────┐ │
│           │ │ About               │ Currently              │ │
│           │ │ paragraph 1         │ 📚 Deepening Go...     │ │
│           │ │ paragraph 2         │ 🧪 Exploring RAG...    │ │
│           │ └─────────────────────┴────────────────────────┘ │
│           │ ┌─────────────────────┬────────────────────────┐ │
│           │ │ Skills              │ Find me                │ │
│           │ │ [TS][Go][Python]... │ [GH][LI][X][TH][IG]...│ │
│           │ └─────────────────────┴────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- **Hero spotlight** — radial gradient follows pointer on hero section (`client:visible`)
- **Typed role** — cycles through 4 roles (type→pause→delete→next), respects `prefers-reduced-motion`
- **Stats count-up** — numbers animate from 0 to target on scroll-into-view
- **Live clock** — updates every 15s showing Asia/Jakarta time
- All static content rendered at build time

**Error/empty states:** N/A — static data, always present.

---

### 2.2 Projects (`/projects`)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: Projects] [Search…] [🔽]               │
│           │ "A selection of things I've built..."           │
│           │ ┌──────────┬──────────┬──────────┐              │
│           │ │ [banner] │ [banner] │ [banner] │              │
│           │ │ NoteFlow │ Rent-H.. │ DevPlat..│              │
│           │ │ excerpt  │ excerpt  │ excerpt  │              │
│           │ │ [NX][tr] │ [Go][API]│ [Go][Dk] │              │
│           │ └──────────┴──────────┴──────────┘              │
│           │ ┌──────────┬──────────┬──────────┐              │
│           │ │ [banner] │ [banner] │ [banner] │              │
│           │ │ Realtime │ Wallpapr │ Edge Wkr │              │
│           │ │ excerpt  │ excerpt  │ excerpt  │              │
│           │ │ [Node]   │ [React]  │ [WASM]   │              │
│           │ └──────────┴──────────┴──────────┘              │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Cards link to `/projects/[slug]` detail pages
- External links (Source, Live Demo) open in new tab
- **Search filter** (`client:load`) — text input filters cards by title, excerpt, techTags (case-insensitive)
- Responsive: 3-col → 2-col → 1-col

**States:**
- **Empty filter:** Show "No projects match your search" empty state
- **All visible:** Default state (no search term)

---

### 2.3 Project Detail (`/projects/[slug]`)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: NoteFlow]          [← All projects]    │
│           │ ┌──────────────────────────────────────────────┐ │
│           │ │ [Banner gradient]                            │ │
│           │ │ NoteFlow · 2025     [Next.js][tRPC][Prisma]  │ │
│           │ │ excerpt                                      │ │
│           │ │ [Source] [Live Demo]                         │ │
│           │ └──────────────────────────────────────────────┘ │
│           │ Overview (Lexical prose)                        │
│           │ ┌──────────────────────────────────────────────┐ │
│           │ │ Features (2-col grid)                        │ │
│           │ │ ⚡ Instant capture  │ 🔒 Self-hosted         │ │
│           │ │ 💾 Semantic search  │ 🏷️  Tags & references  │ │
│           │ │ 💬 AI chat          │ 📱 Cross-platform      │ │
│           │ └──────────────────────────────────────────────┘ │
│           │ Screenshots (2-col placeholders)                 │
│           │ Stats footer: 480 stars · ~12k LOC · 15MB       │
│           │ Architecture (code block)                        │
│           │ [→ Next project: Rent-House-AI]                  │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Rendered statically at build time via `getStaticPaths()`
- "All projects" back-link navigates to `/projects`
- "Next project" links to next slug in order
- Features rendered in 2-col grid with icons
- Architecture displayed as `<pre><code>` block

**States:**
- **Invalid slug (404):** Astro's built-in 404 page
- **Draft project:** Not rendered (filtered at build time)

---

### 2.4 Blogs (`/blogs`)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: Blogs] [Search…] [RSS]                 │
│           │ "Notes on backend systems, AI tooling..."       │
│           │ ┌──────────────────────┬───────────────────────┐ │
│           │ │ Blog list            │ Filter sidebar        │ │
│           │ │ ┌──────────────────┐ │ ┌───────────────────┐ │ │
│           │ │ │ [AI][Workflow]   │ │ │ Categories        │ │ │
│           │ │ │ Jul 7 · 8 min    │ │ │ [All] [AI] [Go]   │ │ │
│           │ │ │ Running a Soft.. │ │ │ [RAG] [TS] [tRPC] │ │ │
│           │ │ │ excerpt...       │ │ │ [DX] [Postgres]   │ │ │
│           │ │ └──────────────────┘ │ │ [Testing][WF]     │ │ │
│           │ │ ┌──────────────────┐ │ └───────────────────┘ │ │
│           │ │ │ [RAG][Go]        │ │                       │ │
│           │ │ │ Jun 22 · 12 min  │ │                       │ │
│           │ │ │ Stop Building... │ │                       │ │
│           │ │ └──────────────────┘ │                       │ │
│           │ │ ... (4 more)        │                       │ │
│           │ └──────────────────────┴───────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Category chips **derived from article tags** (same as sprint-1's `blogs.js`)
- Clicking a chip filters the blog list — only articles with matching tags shown
- "All" chip resets filter
- Chips show count: "AI (3)", "Go (3)"
- Search box filters by title/excerpt in addition to category chip
- Articles link to `/blogs/[slug]`

**States:**
- **All visible:** Default state
- **Category filter active:** Only matching articles shown
- **Search + category combined:** Both filters apply
- **No results:** "No articles match your filters" empty state

---

### 2.5 Article Detail (`/blogs/[slug]`)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: Article title]   [← All articles]      │
│           │ ┌──────────────────────┬───────────────────────┐ │
│           │ │ Article body         │ Related articles      │ │
│           │ │ .prose               │ ┌───────────────────┐ │ │
│           │ │ ## heading           │ │ Article 2 →       │ │ │
│           │ │ paragraph text       │ │ Article 3 →       │ │ │
│           │ │ ```code block```     │ └───────────────────┘ │ │
│           │ │ > blockquote         │                       │ │
│           │ │ [Author card]        │                       │ │
│           │ └──────────────────────┴───────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Prose rendered from Lexical JSON via `renderLexical()` at build time
- Author card with avatar initials, name, role, bio
- Related articles sidebar (links to other article slugs)
- "All articles" back-link

**States:**
- **Invalid slug (404):** Astro 404 page

---

### 2.6 Documents (`/documents`)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: Documents] [Search…]                   │
│           │ ┌──────────────────────────────────────────────┐ │
│           │ │ 📌 Pinned (3)                                │ │
│           │ │ The essentials — résumé, CV, cover letter.   │ │
│           │ │ ┌──────────────────┐ ┌──────────────────┐    │ │
│           │ │ │📄 Résumé     [PDF]│ │📄 CV Detailed [PDF]│   │ │
│           │ │ │ excerpt...   [⬇] │ │ excerpt...    [⬇] │   │ │
│           │ │ │ Jul 2026 · 184KB │ │ Jun 2026 · 260KB │   │ │
│           │ │ └──────────────────┘ └──────────────────┘    │ │
│           │ ├──────────────────────────────────────────────┤ │
│           │ │ 📚 Research (2)                              │ │
│           │ │ (hint text)                                  │ │
│           │ │ ┌──────────────────┐ ┌──────────────────┐    │ │
│           │ │ │📄 AI Workflow [MD]│ │📄 Case Study [PDF]│   │ │
│           │ │ │ excerpt...   [⬇] │ │ excerpt...    [⬇] │   │ │
│           │ │ └──────────────────┘ └──────────────────┘    │ │
│           │ ├──────────────────────────────────────────────┤ │
│           │ │ 📂 Other (1)                                 │ │
│           │ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Documents grouped by category, rendered statically at build time
- Each card shows: icon, title, file type badge, excerpt, updated date, file size
- Download button links to file URL (opens/downloads based on browser)
- Categories with zero documents are hidden
- Categories displayed in `order` sequence

**States:**
- **Empty category:** Hidden (filtered during render)
- **All categories empty:** Show "No documents available" empty state

---

### 2.7 Social (`/social`)

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: Socials] [Search…]                     │
│           │ "Find me across the web..."                     │
│           │ ┌──────────┬──────────┬──────────┐              │
│           │ │ 🐙 GitHub│ │ 💼 LinkdI│ │ 🐦 X     │              │
│           │ │ @athath..│ │ @athath..│ │ @athath..│              │
│           │ │ ↗        │ │ ↗        │ │ ↗        │              │
│           │ └──────────┴──────────┴──────────┘              │
│           │ ┌──────────┬──────────┬──────────┐              │
│           │ │ 🧵 Threads│ │ 📸 Instagr│ │ 📘 Facebk │              │
│           │ │ @athath..│ │ @athath..│ │ @athath..│              │
│           │ │ ↗        │ │ ↗        │ │ ↗        │              │
│           │ └──────────┴──────────┴──────────┘              │
│           │ ┌──────────┐                                     │
│           │ │ ▶️ YouTube│                                     │
│           │ │ @athath..│                                     │
│           │ │ ↗        │                                     │
│           │ └──────────┘                                     │
└──────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Cards link to external profile URLs (open in new tab)
- Icons from `simple-icons:*` set
- Search filter by platform name or handle

**States:**
- **Empty filter:** "No profiles match your search" empty state

---

## 3. Interaction Flow

### Theme Toggle
```
1. Page loads → inline <script> reads localStorage, sets .dark class
2. User clicks moon/sun icon in sidebar
3. Svelte store flips, DOM class toggles, icon swaps, localStorage updated
4. All elements respond to CSS variable changes instantly (no flash)
```

### Mobile Drawer
```
1. User taps hamburger (< 768px viewport)
2. Sidebar slides in from left, backdrop fades in
3. User taps a nav link → drawer closes, navigates to page
4. OR user taps backdrop → drawer closes
5. OR window resizes > 768px → drawer closes
```

### Desktop Sidebar Collapse
```
1. User clicks collapse button (chevron) in sidebar bottom
2. Sidebar shrinks to 72px (icon-only mode)
3. State persisted in localStorage
4. On hover, tooltip shows nav item label (title attribute)
```

### Blog Filtering
```
1. Page loads → category chips derived from article tags, "All" active
2. User clicks "Go" chip → only articles tagged "Go" shown
3. User types in search → further filters by title/excerpt
4. User clicks "All" → all articles shown, search cleared
```

### Document Download
```
1. User clicks download icon on a document card
2. Browser downloads file from /documents/[filename]
```

### Home Animations
```
1. Page loads → hero and stats are below fold
2. User scrolls → IntersectionObserver triggers
3. Typed role starts cycling, stats count up, spotlight activates, clock ticks
4. If prefers-reduced-motion → all animations disabled, fallback to static text
```

---

## 4. Responsive Breakpoints

| Width | Sidebar | Header | Grids |
|-------|---------|--------|-------|
| ≥ 1280px | Visible (collapsible) | No hamburger | `.grid-3`: 3 cols |
| 768px – 1279px | Visible (collapsible) | No hamburger | `.grid-3`: 2 cols |
| < 768px | Hidden (drawer) | Shows hamburger | `.grid-3`: 1 col, `.grid-2`: 1 col, `.blog-layout`: single col |

---

## 5. Empty / Error States

| Page | State | Display |
|------|-------|---------|
| Projects | No search results | Centered `.empty-state`: "No projects match your search" |
| Blogs | No filter results | Centered `.empty-state`: "No articles match your filters" |
| Blogs | No articles at all | `.empty-state`: "No articles published yet" |
| Documents | Empty category | Category section hidden |
| Documents | No documents | `.empty-state`: "No documents available" |
| Social | No search results | `.empty-state`: "No profiles match your search" |
| Any | 404 (invalid slug) | Astro default 404: "Page not found" + link to home |
