# UX Flow — Sprint 10: Home Page Redesign

## 1. Navigation

Unchanged — dashboard shell: `Home (/) → Projects → Blogs → Documents → Socials → Contact` via sidebar. This sprint touches **only `/`**.

## 2. Screen — Home (`/`), desktop

```
┌──────────────────────────────────────────────────────────────────┐
│ HERO  (canvas · dot-grid · pointer spotlight)                    │
│                                                                  │
│  ┌───┐   ATHA · FULL-STACK ENGINEER        ← micro-upper eyebrow │
│  │ava│   Atha Tharizky                    ← clamp(32–40px) 600   │
│  │tar●│   Building with {TypedRole ▌}     ← slate, typewriter    │
│  └───┘   [● Open to work] [🕐 UTC+7 · 14:32] ← pill chips        │
│          [ View Projects ]  [ Read the blog ] ← purple 8px /     │
│            ↑ magnetic          outline 8px, magnetic             │
├──────────────────────────────────────────────────────────────────┤
│ STATS BAND (surface tint, 12px radius, count-up on view)         │
│    6+              24               3                ∞           │
│    Years building  Projects shipped Languages        Cups        │
├──────────────────────────────────────────────────────────────────┤
│ SELECTED WORK                              All projects → (blue) │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐                   │
│ │ ◈ icon     │  │ ◈ icon     │  │ ◈ icon     │  ← glow tracks    │
│ │ Title (h5) │  │ Title      │  │ Title      │    cursor, whole  │
│ │ excerpt…   │  │ excerpt…   │  │ excerpt…   │    card = link    │
│ │ [tag][tag] │  │ [tag][tag] │  │ [tag][tag] │  ← pastel chips   │
│ └────────────┘  └────────────┘  └────────────┘                   │
├──────────────────────────────────────────────────────────────────┤
│ LATEST WRITING                             All writing → (blue)  │
│  Post title one                              Jul 12, 2026   →    │
│ ───────────────────────────────────────────────────────────────  │
│  Post title two                              Jun 28, 2026   →    │
│ ───────────────────────────────────────────────────────────────  │
│  Post title three                            Jun 03, 2026   →    │
│                                              ↑ row hover: bg     │
│                                                surface + arrow   │
│                                                nudge             │
├──────────────────────────────┬───────────────────────────────────┤
│ ABOUT (canvas card)          │ CURRENTLY (lavender tint card)    │
│  paragraph…                  │  ◦ item  ◦ item  ◦ item           │
├──────────────────────────────┼───────────────────────────────────┤
│ SKILLS (canvas card)         │ FIND ME (canvas card)             │
│  [ts][go][py][pg]…           │  GitHub ↗                         │
│  ↑ pastel chips stagger in,  │  LinkedIn ↗                       │
│    hover lifts + deepens     │                                   │
├──────────────────────────────┴───────────────────────────────────┤
│ CTA BANNER (surface band, centered)                              │
│        Let's talk — sub copy — [ Get in touch ] ← magnetic       │
│                                                                  │
│ footer: Made with ♥ by Atha              (unchanged)             │
└──────────────────────────────────────────────────────────────────┘
```

**Section gating:** each section renders only if enabled in the Home global `showItems` (`hero`, `stats`, `featuredProjects`, `latestWriting`, `about`, `currently`, `skills`, `findMe`, `contactCta`) **and** its data is non-empty.

## 3. Screen — Home, mobile (≤768px)

- Single column; hero stacks (avatar above text); actions full-width
- Stats band → 2×2 grid
- Selected work → 1 column of full-width cards; Latest writing rows keep title/date/arrow (truncate title)
- About/Currently, Skills/Find-me stack; CTA banner padding shrinks
- Sidebar is the existing drawer (unchanged)

## 4. Interaction & Motion Spec

| Element | Trigger | Effect | Duration/Easing |
|---------|---------|--------|-----------------|
| Sections below fold | scroll into view (IO, root `.content-scroll`, threshold .15, once) | fade + translateY(14px) → 0, stagger `--d` | 600ms cubic-bezier(.22,.68,.18,1) |
| Hero | page load | existing `.reveal` entrance (unchanged) | existing |
| Cards (work, about, skills…) | pointermove (fine pointer) | radial glow at `--gx/--gy`, 10% purple | fade .2s |
| Cards | hover | translateY(-2px) + level-1 shadow (light) / border shift (dark) | 150–200ms ease |
| Hero + CTA buttons | pointermove within 40px | magnetic pull ≤6px; spring back on leave | transform .2s ease-out |
| Latest writing row | hover | bg → `--n-surface`; arrow translateX(3px) | 150ms |
| Skill tags | parent revealed | stagger in via `--i` (i × 40ms) | 300ms |
| Skill tags | hover | translateY(-2px) + tint deepens | 150ms |
| Stats | band in view | count-up 1500ms cubic ease-out (existing) | existing |
| Typed role | hero visible | typewriter loop (existing) | existing |

**States:**

- **Loading:** none client-side — all data is SSR-fetched.
- **Empty:** no flagged projects / no articles → that section is not rendered (no placeholder card). Other sections unaffected.
- **Backend down:** `safeFetch` → `{docs: []}` → strips hidden; hero falls back to "Portfolio"/"??"; hardcoded CTA still renders.
- **`prefers-reduced-motion`:** reveals instant (`.is-in` set immediately), count-up renders final values, typed role shows first role statically, glow/magnetic/stagger/ping/caret all off.
- **Touch / no-hover:** glow + magnetic disabled at runtime (`matchMedia('(hover: hover) and (pointer: fine)')`); hover CSS guarded by `@media (hover: hover)`.

## 5. Flow

```
1. User lands on /
2. SSR: index.astro fetches home/site-config/social-profiles/projects/articles
3. Hero animates in (load), typed role starts, clock ticks
4. Stats count up when the band enters view
5. User scrolls → sections reveal one-shot with stagger
6. Pointer over cards → glow follows; hero/CTA buttons pull magnetically
7. Click a work card → /projects/[slug]; click a writing row → /blogs/[slug]
8. "All projects/writing →" → listing pages; "Get in touch" → /contact
```
