# AGENTS.md — Sprint 10 Implementation Guide (Home Redesign, Notion DESIGN.md)

> **For:** any LLM agent implementing sprint-10.
> **Read first:** [`plan.md`](./plan.md) · [`resources/architecture.md`](./resources/architecture.md) (token mapping) · [`resources/ux-flow.md`](./resources/ux-flow.md) (wireframes) · [`resources/data-design.md`](./resources/data-design.md) (queries/schema) · root [`DESIGN.md`](../../../DESIGN.md) (the design spec — source of truth for home UI).

---

## 0. What Already Exists (Do NOT Rebuild)

- **App shell:** `BaseLayout.astro`, `Sidebar.svelte`, `Header.svelte`, theme system, `.corner-blob`, mobile drawer — untouched by this sprint.
- **Home page** `frontend/src/pages/index.astro`: SSR-fetches `/globals/home`, `/globals/site-config`, `/social-profiles` via `safeFetch()`; sections gated by `showItems`.
- **Home islands** (`frontend/src/components/home/`, all `client:visible`): `TypedRole.svelte` (typewriter), `CountUpStats.svelte` (count-up), `SpotlightEffect.svelte` (`--mx/--my` pointer glow on hero), `LiveClock.svelte` — **reuse as-is.**
- **API endpoints:** everything needed already exists (see §5). No new endpoints.
- **Design tokens/components:** existing token set + `.card`/`.btn`/`.tag`/`.grid-2` etc. in `frontend/src/styles/styles.css`.

## 1. Tech Stack (EXACT — Do Not Change)

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 7 (SSR, node adapter) + Svelte 5 islands |
| Styling | Single `frontend/src/styles/styles.css`, CSS vars |
| Backend | PayloadCMS 3 (Next.js + SQLite), vanilla TS |
| Icons | `iconify-icon` web component (Solar set) + `@iconify/svelte` |
| Font | Inter (Google Fonts) — **do not add Notion Sans or any font** |
| Design spec | `DESIGN.md` (notion) at repo root |

## 2. Files to Create / Modify / Delete

**Create:** `frontend/src/lib/actions/glow.ts` · `frontend/src/components/home/MagneticButton.svelte` · `frontend/src/components/home/Reveal.svelte`
**Modify:** `frontend/src/pages/index.astro` · `frontend/src/styles/styles.css` · `frontend/src/lib/api-types.ts` · `backend/src/collections/Projects.ts` · `backend/src/globals/Home.ts` · `backend/src/seed/data/globals.ts` · `backend/src/seed/data/projects.ts` · root `AGENTS.md` (Phase 5)
**Delete:** `frontend/src/data/home.ts` (dead mock — grep first: zero `from '../data/home'` imports)

## 3. Implementation Order

Follow [`tasks.md`](./tasks.md): **Phase 1** backend/types → **Phase 2** token layer + re-skin → **Phase 3** new sections → **Phase 4** interactions + cleanup → **Phase 5** QA + docs. After every phase: `npx tsc --noEmit` + `npx astro build` (frontend) or `npm run build` (backend) must pass; write the phase report; update tasks.md; **ask before committing**.

## 4. Critical Code Snippets

### 4.1 Backend — `Projects.ts` field (Phase 1)

```ts
{
  name: 'showOnHome',
  type: 'checkbox',
  defaultValue: false,
  admin: { position: 'sidebar', description: 'Feature in the Home "Selected work" strip' },
}
```

`Home.ts` `showItems` options — append: `{ label: 'Featured projects', value: 'featuredProjects' }`, `{ label: 'Latest writing', value: 'latestWriting' }` (+ both in `defaultValue`).

### 4.2 Frontend fetches (Phase 3, top of `index.astro`)

```ts
const selectedWork = await safeFetch<PaginatedResponse<Project>>(
  '/projects?where[showOnHome][equals]=true&where[status][equals]=published&sort=order&limit=3&depth=1'
)
const latestWriting = await safeFetch<PaginatedResponse<Article>>(
  '/articles?where[status][equals]=published&sort=-publishedAt&limit=3&select=title,slug,publishedAt'
)
```

### 4.3 Token layer skeleton (Phase 2, append to `styles.css`)

```css
/* ===== Notion DESIGN.md — home-scoped token layer ===== */
:root {
  --n-primary: #5645d4; --n-primary-pressed: #4534b3;
  --n-ink: #1a1a1a; --n-charcoal: #37352f; --n-slate: #5d5b54;
  --n-steel: #787671; --n-stone: #a4a097;
  --n-canvas: #ffffff; --n-surface: #f6f5f4;
  --n-hairline: #e5e3df; --n-hairline-soft: #ede9e4; --n-hairline-strong: #c8c4be;
  --n-link: #0075de;
  --n-tint-lavender: #e6e0f5; --n-tint-lavender-ink: #391c57;
  --n-tint-peach: #ffe8d4;    --n-tint-peach-ink: #793400;
  --n-tint-mint: #d9f3e1;     --n-tint-mint-ink: #1aae39;
  --n-tint-sky: #dcecfa;      --n-tint-sky-ink: #005bab;
}
.dark {
  --n-primary: #7c6fe4; --n-primary-pressed: #6357d6;
  --n-ink: #e8e6e1; --n-charcoal: #cfccc4; --n-slate: #9c998f;
  --n-steel: #7d7a71; --n-stone: #6d6a62;
  --n-canvas: var(--card);
  --n-surface: color-mix(in srgb, var(--foreground) 4%, var(--card));
  --n-hairline: var(--border);
  --n-hairline-soft: color-mix(in srgb, var(--border) 60%, transparent);
  --n-hairline-strong: color-mix(in srgb, var(--foreground) 20%, var(--border));
  --n-link: #4b9bf0;
  --n-tint-lavender: color-mix(in srgb, #7b3ff2 18%, var(--card)); --n-tint-lavender-ink: #cdb9f6;
  --n-tint-peach: color-mix(in srgb, #dd5b00 18%, var(--card));    --n-tint-peach-ink: #f0b48a;
  --n-tint-mint: color-mix(in srgb, #1aae39 16%, var(--card));     --n-tint-mint-ink: #8fdca4;
  --n-tint-sky: color-mix(in srgb, #0075de 18%, var(--card));      --n-tint-sky-ink: #9ecdf5;
}
/* All re-skin rules hang off .home — never restyle global classes directly. */
```

Full mapping table + type scale + elevation rules: [`resources/architecture.md`](./resources/architecture.md) §5.

### 4.4 Glow action (Phase 4, `frontend/src/lib/actions/glow.ts`)

```ts
import type { Action } from 'svelte/action'

export const glow: Action<HTMLElement> = (node) => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!fine.matches || reduced.matches) return

  const onMove = (e: PointerEvent) => {
    const r = node.getBoundingClientRect()
    node.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`)
    node.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  node.addEventListener('pointermove', onMove)
  return { destroy: () => node.removeEventListener('pointermove', onMove) }
}
```

```css
.glowable { position: relative; }
.glowable::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(240px circle at var(--gx, 50%) var(--gy, 50%),
    color-mix(in srgb, var(--n-primary) 10%, transparent), transparent 70%);
  opacity: 0; transition: opacity .2s;
}
@media (hover: hover) { .glowable:hover::after { opacity: 1; } }
```

Usage: `<div class="card glowable" use:glow>` inside any home Svelte component. For Astro-static cards, wrap the section loop in one tiny Svelte island that only applies the action, or keep glow to Svelte-rendered cards — do **not** hydrate whole cards just for glow; prefer a single `GlowGrid.svelte` island per section if needed.

### 4.5 Reveal (Phase 4, `Reveal.svelte`)

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  export let delay = '0s'
  let el: HTMLElement

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('is-in'); io.disconnect() }
      },
      { root: el.closest('.content-scroll'), threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  })
</script>

<div bind:this={el} class="reveal-io" style="--d:{delay}">
  <slot />
</div>
```

```css
.reveal-io { opacity: 0; transform: translateY(14px); transition: opacity .6s cubic-bezier(.22,.68,.18,1) var(--d, 0s), transform .6s cubic-bezier(.22,.68,.18,1) var(--d, 0s); }
.reveal-io.is-in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal-io { opacity: 1; transform: none; transition: none; } }
```

Usage: wrap sections below the fold: `<Reveal client:visible delay=".05s"><section …>…</section></Reveal>`. **Hero stays on the existing load-time `.reveal`.**

### 4.6 MagneticButton (Phase 4, `MagneticButton.svelte`)

```svelte
<script lang="ts">
  const MAX = 6, RANGE = 40
  let el: HTMLElement
  let enabled = false

  function onMove(e: PointerEvent) {
    if (!enabled) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, (v / RANGE) * MAX))
    el.style.transform = `translate(${clamp(dx)}px, ${clamp(dy)}px)`
  }
  function onLeave() { el.style.transform = '' }

  $effect(() => {
    enabled =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
</script>

<span bind:this={el} class="magnetic" onpointermove={onMove} onpointerleave={onLeave}>
  <slot />
</span>
```

```css
.magnetic { display: inline-block; transition: transform .2s ease-out; will-change: transform; }
```

Note the Svelte 5 style: `$effect` for mount-time media checks (**never** `$:` + `window` — breaks SSR), `onpointermove` attribute syntax. Existing components use `onMount` — either is fine; `$:` with browser APIs is not.

### 4.7 New section markup sketch (Phase 3, plain Astro inside `index.astro`)

```astro
{visible.has('featuredProjects') && workDocs.length > 0 && (
  <section class="home-section work-strip">
    <header class="section-head">
      <h2 class="section-title">Selected work</h2>
      <a class="section-link" href="/projects">All projects →</a>
    </header>
    <div class="grid-3">
      {workDocs.map(p => (
        <a class="card work-card glowable" href={`/projects/${p.slug}`}>
          <span class="work-icon" style={p.bannerColor ? `background:${p.bannerColor}` : ''}>
            <iconify-icon icon={p.bannerIcon || 'solar:folder-bold-duotone'} width="20" height="20" />
          </span>
          <h3>{p.title}</h3>
          <p class="text-desc text-sm">{p.excerpt}</p>
          <div class="flex flex-wrap gap-1">
            {(p.techTags ?? []).map((t, i) =>
              typeof t === 'object' && <span class={`tag-badge tint-${i % 4}`}>{t.name}</span>)}
          </div>
        </a>
      ))}
    </div>
  </section>
)}
```

Latest writing rows: `<a class="write-row">` per article — title (`.section-row-title`), formatted `publishedAt`, `solar:arrow-right-linear` arrow; rows separated by `--n-hairline-soft` borders. Date formatting server-side: `new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`.

## 5. API Contracts

See [`resources/data-design.md`](./resources/data-design.md) §1 — five queries, all existing endpoints. `PaginatedResponse<T> = { docs: T[]; … }`; `safeFetch` never throws (returns `{docs: []}`).

## 6. Reference Files (Copy Patterns From)

| Source | What to copy |
|--------|--------------|
| `frontend/src/components/home/SpotlightEffect.svelte` | pointer → CSS-var pattern (basis of `glow`) |
| `frontend/src/components/home/CountUpStats.svelte` | `onMount` + `matchMedia('(prefers-reduced-motion: reduce)')` guard |
| `backend/src/collections/SocialProfiles.ts` | `showOnHome` checkbox pattern |
| `frontend/src/pages/index.astro` | `safeFetch` usage, `showItems` gating, section markup style |
| `DESIGN.md` (repo root) | Colors, type scale, spacing, component rules |

## 7. Deviations from the Notion Spec (Intentional)

| DESIGN.md says | We do | Why |
|----------------|-------|-----|
| Notion Sans | Inter | repo rule: no new fonts; Notion Sans is Inter-based |
| Navy hero band + workspace mockup | Canvas hero, dot-grid + spotlight stay | dashboard shell cohesion; mockup is marketing-site material |
| Global token replacement | `--n-*` scoped under `.home` | other pages unchanged this sprint |
| No dark tokens (spec gap) | Custom dark mapping (arch §5) | site is light + dark |
| Pill CTAs "Get Notion free" style | 8px rectangular buttons | spec's own rule: rectangles, not pills |
| 150–200ms hovers | same | align existing `.2s` transitions to this |

## 8. Implementation Checklist

1. [ ] Phase 1: backend field + options + seed fixes + `api-types.ts`; backend build + curl pass
2. [ ] Phase 2: `--n-*` tokens (light/dark); re-skin hero/stats band/cards/tags/CTA under `.home`; dead CSS removed; `astro build` passes
3. [ ] Phase 3: Selected work + Latest writing fetch/markup/gating/empty-hide; build passes
4. [ ] Phase 4: glow action, MagneticButton, Reveal, skill stagger; reduced-motion + no-hover guards; `data/home.ts` deleted; build passes
5. [ ] Phase 5: full verification matrix; root `AGENTS.md` refreshed; `final-report.md` written
6. [ ] Phase report + tasks.md update after **every** phase; ask before each commit

## 9. How to Run

```bash
cd backend && npm run dev      # :3000 → /admin, /api
cd frontend && npm run dev     # :4321
cd frontend && npx tsc --noEmit && npx astro build   # verify
```

## 10. Done Criteria

- [ ] Home matches `resources/ux-flow.md` wireframe + DESIGN.md tokens, in **light + dark**
- [ ] Both new sections render from live API; hide when empty or gated off; admin toggles work
- [ ] All 4 interactions work; all motion inert under `prefers-reduced-motion`; glow/magnetic off on touch
- [ ] No literal `{time}`; no dead CSS/mock; other pages pixel-unchanged
- [ ] `npx tsc --noEmit` + `npx astro build` + backend `npm run build` all clean
- [ ] Mobile: 1-col grids, 2×2 stats, drawer intact
- [ ] `final-report.md` + updated root `AGENTS.md`; tasks.md all ✅
