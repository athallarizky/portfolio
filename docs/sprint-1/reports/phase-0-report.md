# Phase 0 Report — Discovery & Exploration

> Completed: 2026-07-07
> Reference repo: `temp/blinko/` (Blinko note-taking app, v1.8.8)

---

## 1. How to Run the Reference App

Blinko is a Bun-managed monorepo (workspaces: `app`, `server`, `shared`).

```bash
cd temp/blinko
bun install
bun run prisma:generate
cp .env.tmpl .env          # then fill DATABASE_URL etc.
bun run dev:frontend       # frontend only (Vite) on port 1111
# or
bun run dev:backend        # backend only
bun run dev                # full Tauri desktop app
```

For this sprint we are **not** running Blinko — we are cloning its visual
layout/style into a static HTML demo. No Bun/Postgres needed.

---

## 2. Tech Stack (Blinko)

| Layer            | Technology                                                    |
|------------------|---------------------------------------------------------------|
| Framework        | React 18                                                      |
| Build            | Vite                                                          |
| Styling          | TailwindCSS v4 (`@import "tailwindcss"`) + HeroUI (`@heroui/react`) |
| State            | MobX (`mobx`, `mobx-react-lite`) with custom `RootStore`      |
| Routing          | React Router v7                                               |
| Icons            | `@iconify/react` (e.g. `solar:*`, `hugeicons:*`, `mdi:*`)     |
| Markdown editor  | Vditor                                                        |
| i18n             | i18next                                                       |
| Desktop          | Tauri                                                         |

**Relevant files read:**
- `app/src/App.tsx` — routes + `<CommonLayout>` wrapper
- `app/src/components/Layout/index.tsx` — the dashboard chrome
- `app/src/components/Layout/Sidebar.tsx` — left navigation
- `app/src/components/BlinkoCard/index.tsx` — card component pattern
- `app/src/pages/index.tsx` — home page (masonry of cards)
- `app/src/store/baseStore.ts` — `routerList` (nav items)
- `app/src/styles/globals.css` — theme tokens + base styles

---

## 3. Layout Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │  Header bar                                        │
│         │  ┌─ vertical accent + bold title + sync icon        │
│ avatar  │  └─ search box + filter + notification icons        │
│ ────────│─────────────────────────────────────────────────────│
│ Home    │                                                     │
│ Notes   │   Main content (ScrollArea)                         │
│ Todo    │   ┌─────────────────────────────────────────────┐   │
│ Analytics│   │  blurred purple corner blob (top-right)     │   │
│ Resources│   │                                             │   │
│ ...     │   │  Masonry card grid  (react-masonry)         │   │
│         │   │   ┌─────┐ ┌─────┐                            │   │
│ [halation│   │   │card │ │card │                            │   │
│  blur]  │   │   └─────┘ └─────┘                            │   │
│         │   └─────────────────────────────────────────────┘   │
│ theme tg│                                                     │
└─────────┴─────────────────────────────────────────────────────┘
```

### Sidebar (`Sidebar.tsx:42-121`)
- Width: `base.sideBarWidth` px, collapsible + resizable (right edge drag handle)
- Top: user avatar dropdown + collapse/expand chevron button
- Middle: vertical nav list, each item = icon + translated label
- Active item: `!bg-primary !text-primary-foreground` (inverted)
- Bottom-left decoration: `.halation` — blurred yellow circle (`#ffc65c`, opacity 20%, `clip-path circle`)
- Mobile (`<768px`): hidden by default, slides in via `react-burger-menu`

### Header (`Layout/index.tsx:102-200`)
- Height: `md:h-16` (desktop) / `h-14` (mobile)
- Left: `w-[4px] h-[16px] bg-primary rounded-xl` vertical accent bar + bold title + sync icon (`fluent:arrow-sync-12-filled`, hover rotates 180°)
- Right: `BarSearchInput`, `FilterPop`, daily-review badge, notifications
- Mobile: fixed top, `border-radius: 0 0 12px 12px`, glass effect (`backdrop-filter: blur(10px)`)

### Main content (`Layout/index.tsx:205-212`, `pages/index.tsx:194-216`)
- `ScrollArea` with `layout-container` wrapper
- Background blob: `absolute top-[-37%] right-[5%] h-[350px] w-[350px] blur-3xl` purple (`#9936e6`, opacity 20%)
- Masonry grid: `card-masonry-grid` / `card-masonry-grid_column` CSS classes
- Breakpoints: default 2 cols, 1280px 2 cols, 768px 1 col (configurable in Blinko settings)

### Card (`BlinkoCard/index.tsx:119-168`)
- HeroUI `<Card shadow="none">` with manual styling
- `p-4`, `bg-background`, `flex flex-col`
- Desktop hover: `hover:translate-y-1` + `transition-all`
- Multi-select: `border-2 border-primary`
- Contains: `CardHeader`, optional `CardBlogBox`, `NoteContent`, plugin slots, `CardFooter`

---

## 4. Theme System (`globals.css:163-271`)

Tailwind v4 `@theme`-style CSS variables defined on `:root` (light) and
overridden under `.dark`. Key tokens to port verbatim:

### Light (`:root`)
| Token                | Value                    | Used for            |
|----------------------|--------------------------|---------------------|
| `--font-family`      | `'Inter', sans-serif`    | body                |
| `--background`       | `hsl(0 0% 100%)`         | page bg             |
| `--secondbackground` | `#f8f8f8`                | main bg             |
| `--foreground`       | `hsl(222.2 47.4% 11.2%)` | text                |
| `--hover`            | `#efeee7d9`              | hover bg            |
| `--desc`             | `#808080`                | muted text/time     |
| `--ignore`           | `#bababa`                | empty state         |
| `--primary`          | `black`                  | accent              |
| `--primary-foreground`| `hsl(210 40% 98%)`      | text on primary     |
| `--border`           | `#E7E7E5`                | borders             |
| `--shadow`           | `1px 1px 7px 3px #b1b1b142` | soft shadow      |

### Dark (`.dark`)
| Token                | Value                    |
|----------------------|--------------------------|
| `--background`       | `#0B0B0C`                |
| `--secondbackground` | `#1C1C1E`                |
| `--foreground`       | `#E1E1E1`                |
| `--hover`            | `#292929`                |
| `--desc`             | `#999999`                |
| `--primary`          | `#f9f9f9`                |
| `--primary-foreground`| `hsl(0, 0%, 0%)`        |
| `--border`           | `#0b0b0c`                |
| `--shadow`           | `0 0 1px 1px #303030`    |

### Misc base styles to port
- `html, body { overflow-y: hidden; height: var(--doc-height); }`
- `::selection { background: #47a3f3; color: #fefefe; }`
- Custom scrollbar: 8px wide, `var(--primary)` thumb, transparent track
- `.glass-effect { background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); }` (+ dark variant)
- `.blinko-tag` style: `color-mix(in srgb, var(--primary) 10%, transparent)` pill bg

---

## 5. Navigation Items (`baseStore.ts:14-72`)

Blinko's `routerList`. We will mirror this shape with our three portfolio items:

| Blinko route  | Blinko icon                 | Portfolio route   | Portfolio icon      |
|---------------|-----------------------------|-------------------|---------------------|
| `/` (blinko)  | `basil:lightning-outline`   | `/` (Home)        | `solar:user-outline`|
| `/?path=notes`| `hugeicons:note`            | `/projects.html`  | `solar:widget-bold` |
| `/?path=todo` | `solar:bill-check-linear`   | `/blogs.html`     | `solar:document-text-outline` |

Active state detection: `baseStore.isSideBarActive` — pathname + optional `?path=` match.

---

## 6. Key Decisions

| Decision | Reason |
|----------|--------|
| Use Tailwind CDN + Inter (Google Fonts) + Iconify CDN | Matches Blinko's icon/font set exactly; no build step for a static demo |
| Separate `home/projects/blogs` HTML files, not SPA tabs | User preference; closer to a real multi-page site, easier to migrate later |
| Shared `assets/styles.css` + `assets/app.js` | Avoid duplicating ~300 lines of theme CSS in each HTML file |
| Port CSS variables verbatim from `globals.css` | Pixel-faithful clone of Blinko's light/dark look |
| Use HeroUI **classes** but not the React runtime | We hand-build the few components needed (Card, Button, ScrollShadow) in plain HTML/CSS |
| Theme toggle persisted in `localStorage` key `theme` | Simplest pattern; matches what Blinko does via `next-themes` |
| Active nav from `window.location.pathname` | Works across static `.html` files with no router |

---

## 7. Reference Files (Clone Sources)

| Source file                                         | What to copy                                       |
|-----------------------------------------------------|----------------------------------------------------|
| `app/src/styles/globals.css:163-271`                | Full light/dark CSS variable theme                 |
| `app/src/styles/globals.css:273-283`                | `.glass-effect`                                    |
| `app/src/styles/globals.css:287-315`                | Scrollbar + `.hide-scrollbar`                      |
| `app/src/components/Layout/Sidebar.tsx:42-121`      | Sidebar structure + halation blur                  |
| `app/src/components/Layout/index.tsx:96-216`        | Header + main shell + corner blob                  |
| `app/src/components/BlinkoCard/index.tsx:119-168`   | Card pattern (p-4, hover-lift, rounded)            |
| `app/src/pages/index.tsx:194-216`                   | Masonry grid usage                                 |
| `app/src/store/baseStore.ts:14-72`                  | Nav item shape (title/href/icon)                   |

---

## 8. Surprises / Notes

- Blinko uses `var(--doc-height)` instead of `100vh` to dodge mobile browser
  URL-bar resize bugs — we'll do the same with a tiny JS setter.
- Active sidebar item uses inverted colors (`bg-primary` + `text-primary-foreground`),
  not just a tint — easy to replicate with CSS variables.
- The decorative blurred blobs (`#9936e6` purple corner + `#ffc65c` yellow
  halation) are what give Blinko its signature "soft glow" — important to port.
- HeroUI `<Card shadow="none">` means Blinko relies on borders + hover-lift
  for card depth, not heavy shadows. We'll match that.
- `react-burger-menu` handles the mobile drawer; we'll hand-roll a simple
  translateX drawer in vanilla JS for the demo.
