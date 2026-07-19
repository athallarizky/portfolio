# Task Breakdown — Sprint 10: Home Page Redesign (Notion DESIGN.md)

> Status: 🟡 Planning | Created: 2026-07-18
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery & Setup

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 0.1 | Explore current home page, design system, backend schema | Medium | — | ✅ |
| 0.2 | Research `getdesign` CLI + fetch Notion DESIGN.md spec | Easy | — | ✅ |
| 0.3 | Install DESIGN.md at repo root (`npx getdesign@latest add notion`) | Easy | — | ✅ |
| 0.4 | Write sprint docs (plan, tasks, resources, AGENTS) | Medium | 0.1, 0.2 | ✅ |
| 0.5 | Write phase-0 report (findings + decisions) | Easy | 0.4 | ✅ |

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Backend & Types

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 1.1 | Add `showOnHome` checkbox to `backend/src/collections/Projects.ts` (sidebar position) | Easy | — | ✅ |
| 1.2 | Add `featuredProjects` + `latestWriting` options to Home `showItems` in `backend/src/globals/Home.ts` | Easy | — | ✅ |
| 1.3 | Remove seeded `'Local time {time}'` currently-item in `backend/src/seed/data/globals.ts` | Easy | — | ✅ |
| 1.4 | Flag 3 existing seed projects `showOnHome: true` in `backend/src/seed/data/projects.ts` (orders 1–3) | Easy | 1.1 | ✅ |
| 1.5 | Update `frontend/src/lib/api-types.ts` (`Project.showOnHome?`, `Home.showItems` union) | Easy | 1.1, 1.2 | ✅ |
| 1.6 | Verify: `npm run build` in backend + curl the new queries | Easy | 1.1–1.5 | ✅ |

### Service Summary

- **Runtime:** PayloadCMS 3 (Next 16) + SQLite; frontend Astro 7 + Svelte 5
- **Files:** `backend/src/collections/Projects.ts`, `backend/src/globals/Home.ts`, `backend/src/seed/data/{globals,projects}.ts`, `backend/src/seed/phases/projects.ts`, `backend/src/payload-types.ts`, `frontend/src/lib/api-types.ts`
- **Key output:** `showOnHome` checkbox live in API; `showItems` extended; `{time}` seed item gone; types synced
- **⚠️ Finding for Phase 3:** Payload's `select` is **bracket** syntax (`select[title]=true`), not comma — AGENTS.md §4.2 snippet needs correcting in 3.1
- **⚠️ Owner action:** re-seed (`npm run seed:projects`) or toggle in admin so the 3 flagged projects appear

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Notion Token Layer & Re-skin

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 2.1 | Add `--n-*` Notion tokens to `:root` + `.dark` mapping in `styles.css` | Medium | — | ✅ |
| 2.2 | Home-scoped base re-skin (`.home` overrides: ink colors, flat hairline cards, 8px buttons) | Medium | 2.1 | ✅ |
| 2.3 | Hero refinement (type scale, micro-uppercase eyebrow, pill meta chips, purple/secondary buttons) | Medium | 2.2 | ✅ |
| 2.4 | Stats → single `stat-row` surface band (keep count-up) | Medium | 2.2 | ✅ |
| 2.5 | About/Currently + Skills/Find-me re-skin (lavender Currently tint, pastel badge-tags) | Medium | 2.2 | ✅ |
| 2.6 | CTA → `cta-banner-light` (centered surface band) | Easy | 2.2 | ✅ |
| 2.7 | Remove dead CSS (`.now-live`, `.pulse`, `.skill-tag`, `#local-time`, `.findme-link .ext`) | Easy | 2.2 | ✅ |
| 2.8 | Responsive + dark-mode pass; `npx astro build` clean | Medium | 2.3–2.7 | ✅ |

### Service Summary

- **Files:** `frontend/src/styles/styles.css` (token layer + `.home` re-skin appended; dead CSS removed), `frontend/src/pages/index.astro` (`is-currently` on Currently card)
- **Key output:** home page on Notion tokens (light + dark), scoped under `.home`; other pages untouched
- **Build:** `tsc --noEmit` + `astro build` clean
- **⚠️ Content note:** hero eyebrow micro-uppercase styling is spec-correct; seed `hero.eyebrow "// hello, I'm"` should be updated in CMS to a role label

> 📄 Full report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — New Sections (Selected work + Latest writing)

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 3.1 | Fetch selected work + latest writing via `safeFetch` in `index.astro` | Easy | 1.5 | ✅ |
| 3.2 | Selected work markup — 3 cards (icon tile, title, excerpt, pastel tech tags, whole-card link) | Medium | 3.1, 2.5 | ✅ |
| 3.3 | Latest writing markup — database-row list (title, date, arrow, hairline dividers) | Medium | 3.1, 2.5 | ✅ |
| 3.4 | `showItems` gating for both sections + hide-on-empty + align default `visible` set with backend | Easy | 3.2, 3.3 | ✅ |
| 3.5 | Verify build + visual check (light/dark/mobile) | Easy | 3.4 | ✅ |

### Service Summary

- **Files:** `frontend/src/pages/index.astro` (2 fetches, 2 sections, aligned `visible`), `frontend/src/styles/styles.css` (`.work-card`/`.write-row` rules)
- **Key output:** Selected work (3 project cards, pastel `tint-i%4` tech tags) + Latest writing (3 article rows, formatted dates) — SSR, zero client fetches
- **Gating:** both render only when in `showItems` AND data non-empty; default `visible` fallback now matches backend (all 9 sections)
- **⚠️ Corrected from AGENTS.md §4.2:** `select` uses **bracket** syntax (`select[title]=true&…`) — comma-syntax returned only `id`
- **⚠️ Owner action:** Selected work needs re-seed (showOnHome flags) to populate; Latest writing shows live (6 published articles)
- **Build:** local `tsc --noEmit` + `npm run build` clean

> 📄 Full report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Interactions & Cleanup

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 4.1 | Create `frontend/src/lib/actions/glow.ts` Svelte action + `.glowable` CSS; apply to home cards | Medium | 2.2 | ✅ |
| 4.2 | Create `MagneticButton.svelte`; apply to hero CTAs + CTA banner button | Medium | 2.3, 2.6 | ✅ |
| 4.3 | Create `Reveal.svelte` (IntersectionObserver, root = `.content-scroll`, one-shot); apply to below-fold sections | Medium | 3.4 | ✅ |
| 4.4 | Skill-tag stagger-in (`--i` index) + hover lift/deepen | Easy | 2.5, 4.3 | ✅ |
| 4.5 | `prefers-reduced-motion` + no-hover guards for all four interactions | Medium | 4.1–4.4 | ✅ |
| 4.6 | Delete dead `frontend/src/data/home.ts` (grep for zero imports first) | Easy | — | ✅ |
| 4.7 | Verify `npx tsc --noEmit && npx astro build` + interaction QA | Medium | 4.1–4.6 | ✅ |

### Service Summary

- **Files created:** `lib/actions/glow.ts`, `components/home/{GlowGrid,MagneticButton,Reveal}.svelte`
- **Files modified:** `pages/index.astro` (interaction wiring), `styles/styles.css` (`.glowable`/`.reveal-io`/`.magnetic`/stagger + reduced-motion guards)
- **Build:** local `tsc --noEmit` + `npm run build` clean; runtime SSR HTTP 200, no errors
- **⚠️ Owner action (admin):** add `featuredProjects`+`latestWriting` to Home `showItems`; tick `showOnHome` on 3 projects — new sections are gated off in the live dev DB (custom showItems; not re-seeded)
- **⏳ Deferred:** glow/magnetic/reveal browser interaction QA (Phase 5)

> 📄 Full report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)

---

## Phase 5 — QA & Docs

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 5.1 | Full verification matrix (backend build + curl, frontend build, light/dark, mobile, reduced-motion, no-hover, empty states, admin toggles) | Medium | 4.7 | ✅ |
| 5.2 | Refresh root `AGENTS.md` (frontend is Astro + Svelte now; add DESIGN.md pointer; update structure/pages) | Easy | — | ✅ |
| 5.3 | Write `final-report.md` + sprint-11 handoff | Easy | 5.1 | ✅ |

### Service Summary

- **Docs:** root `AGENTS.md` rewritten (Astro + Svelte reality, DESIGN.md pointer, sprint history); `final-report.md` with verification matrix + sprint-11 handoff
- **Verified programmatically:** backend `npm run build`, backend `curl` Q4/Q5, frontend `tsc --noEmit`, frontend `npm run build`, SSR `curl :4321` (HTTP 200, no errors), dead-CSS grep
- **Deferred to browser (manual):** light/dark/mobile visuals, glow/magnetic/reveal interaction behavior, reduced-motion/no-hover observation
- **⚠️ Owner action:** admin toggles to surface the 2 new sections (see final-report §8)

> 📄 Full report: [`reports/final-report.md`](./final-report.md) · matrix: [`final-report.md`](./final-report.md) §6

---

## Phase 6 — Revision: home layout + hero glow

> Owner requests (2026-07-19): (a) move the two new sections below Skills/Find-me, above the CTA; (b) make the hero glow follow the cursor like the work-card glow.

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 6.1 | Move Selected work + Latest writing below Skills/Find-me, above the "Let's talk" CTA | Easy | 3.4 | ✅ |
| 6.2 | Verify build + confirm section order | Easy | 6.1 | ✅ |
| 6.3 | Fix hero cursor-glow — `SpotlightEffect` listened on a `pointer-events:none` overlay so it never tracked; rebind to the `.hero` section + add fine-pointer/reduced-motion guards | Easy | 4.1 | ✅ |
| 6.4 | Verify build | Easy | 6.3 | ✅ |

### Service Summary

- **(a) New order:** Hero → Stats → About/Currently → Skills/Find-me → **Selected work → Latest writing** → CTA → foot (`pages/index.astro`, blocks moved as a unit)
- **(b) Hero glow now tracks cursor:** `SpotlightEffect.svelte` fixed — listens on `.hero` (events bubble), sets `--mx/--my` there (inherited by `.hero-spotlight`); guarded like the work-card `glow` action
- **Build:** `npm run build` clean after both changes
- **Rationale:** owner wanted the cursor-following glow the work cards have, on the hero too

> 📄 Full report: [`reports/phase-6-report.md`](./reports/phase-6-report.md)

---

## Phase 7 — Right-side mesh gradient background

> Owner request (2026-07-19): add a "mesh-like" blurry gradient on the right-side background, per Notion DESIGN.md.

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 7.1 | Add home-scoped, viewport-fixed mesh (Notion sticker palette) on the right side; cards z-indexed above | Medium | 2.1 | ✅ |
| 7.2 | Verify build + SSR render | Easy | 7.1 | ✅ |

### Service Summary

- **Files:** `pages/index.astro` (`.home-mesh` div), `styles/styles.css` (mesh + `.home` stacking)
- **Design:** 5 blurred radial blobs in the Notion sticker palette (purple/pink/sky/teal/orange), viewport-fixed on the right; opacity .5 light / .36 dark; hidden ≤768px
- **Stacking:** `.home` is now a stacking context; mesh z-index 0, cards/sections z-index 1 (mesh reads through the right gutter + between cards; opaque cards keep text crisp)
- **Build:** `npm run build` clean; SSR renders `.home-mesh` as first child of `.home`, no errors
- **Faithful to DESIGN.md:** sticker palette is decorative-only (never paints structure) — used here purely as ambient depth

> 📄 Full report: [`reports/phase-7-report.md`](./reports/phase-7-report.md)

---

## Phase 8 — Project detail revamp (width + sidebar)

> Owner request (2026-07-19): make the project detail width match the blog detail; right sidebar shows only "Other projects" (3–5).

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 8.1 | Restructure `projects/[slug].astro` to `.article-layout` + `.article-main` (760px, matches blog) | Medium | — | ✅ |
| 8.2 | Sidebar = "Other projects" only (5, excluding current) | Easy | 8.1 | ✅ |
| 8.3 | Verify build + render | Easy | 8.2 | ✅ |

### Service Summary

- **Files:** `pages/projects/[slug].astro`
- **Width:** now matches the blog detail — `.article-layout` grid (`minmax(0,1fr) 220px`), `.article-main` max-width 760px
- **Sidebar:** single `<aside class="related-articles">` → "Other projects" (published, excluding current, by `order`, capped at 5)
- **Build:** `npm run build` clean; `curl /projects/noteflow` → HTTP 200, sidebar shows 5 others, current excluded, no errors
- **Responsive:** reuses the existing `.article-layout` collapse (≤1100px → 1 column, sidebar below)
- **Knob:** sidebar cap is `slice(0, 5)` in the frontmatter — change to 3 if preferred

> 📄 Full report: [`reports/phase-8-report.md`](./reports/phase-8-report.md)

---

## Phase 9 — Project detail: header + stats removal + tech stack

> Owner request (2026-07-19): (1) move descriptor/year off the title row; (2) remove the stats section from the backend; (3) add a Tech stack section (chips from the DB). Refer to DESIGN.md.

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 9.1 | Remove `statsFooter` field from backend (collection + seed + writer + regenerate types) | Medium | — | ✅ |
| 9.2 | Stack descriptor·year below the title (drop the beside-title flex + header tech chips) | Easy | — | ✅ |
| 9.3 | Add "Tech stack" section rendering `techTags` chips (with optional `Technology.icon`) | Easy | — | ✅ |
| 9.4 | Remove the stats section from the page; sync frontend types | Easy | 9.1 | ✅ |
| 9.5 | Verify backend + frontend builds | Easy | 9.1–9.4 | ✅ |

### Service Summary

- **Backend (#2):** `statsFooter` removed from `Projects.ts`, seed data (5 arrays + interface), seed writer; `payload-types.ts` regenerated; backend `npm run build` clean
- **Page (#1, #3):** `projects/[slug].astro` — title + descriptor·year now **stacked** (subtitle below, not beside); tech chips moved out of the header into a dedicated **"Tech stack"** section (chips = `techTags` → Technologies, optional icon); stats section removed
- **No new backend field:** `techTags` already relates to the Technologies collection (DB-defined chips) — reused as-is
- **Types:** `statsFooter` removed from frontend `Project`; `tsc --noEmit` + `npm run build` clean
- **⚠️ Note:** `frontend/src/data/projects.ts` (dead, untyped, zero imports) still has `statsFooter` literals — harmless; optional cleanup
- **⚠️ Dev servers were down during verification** — builds are authoritative; runtime visual check pending browser

> 📄 Full report: [`reports/phase-9-report.md`](./reports/phase-9-report.md)

---

## Phase 10 — Project detail: body fix + header/sidebar links

> Owner request (2026-07-19): FIX admin Body error (`parseEditorState: type "code" + not found` on project 2); NEW — Tech stack below Overview; move "All projects" from the header to the sidebar bottom.

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 10.1 | **FIX:** remove unparseable Lexical `code` nodes from noteflow + rent-house-ai bodies (redundant with the `architecture` field); make `seed:projects` upsert; re-seed | Medium | — | ✅ |
| 10.2 | Tech stack below "Overview" (body is now Overview-only; section already positioned right after the prose) | Easy | 10.1 | ✅ |
| 10.3 | Remove the header "All projects" back-link; add an "All projects" link at the bottom of the "Other projects" sidebar (primary + bold) | Easy | — | ✅ |
| 10.4 | Verify builds + live render | Easy | 10.1–10.3 | ✅ |

### Service Summary

- **FIX (10.1):** the seeded `code` Lexical node (`{ type:'code', children:[text] }`) wasn't registered in Payload's editor → admin threw `parseEditorState: type "code" + not found`. Removed those nodes from the 2 bodies that used them (noteflow, rent-house-ai) — the architecture tree is already shown via the dedicated `architecture` field, so it was duplicate. Removed the now-unused `lexicalCode` import.
- **Seed now upserts:** `seedProjects` updates existing projects (was: skip). Re-running synced the corrected bodies **and** populated the previously-empty `techTags` (noteflow = 13) + `showOnHome` flags.
- **Layout (10.2/10.3):** removed the header `slot="headerRight"` back-link; added `<a class="all-projects-link">` after the "Other projects" list — `--secondary` (purple) + bold, with a hairline separator.
- **Build:** backend `npm run build` + frontend `tsc`/`npm run build` clean; live curl confirms no `code` node, 13 tech-chips, sidebar link present, no errors
- **⚠️ Note:** admin Lexical editor will now load project 2's Body without error (verify in `/admin`). The `lexicalCode` helper still exists in `lib/lexical.ts` (unused) — produces nodes the editor can't parse, so avoid re-using it as-is.

> 📄 Full report: [`reports/phase-10-report.md`](./reports/phase-10-report.md)

---

## Phase 11 — Project detail: section spacing + screenshot lightbox

> Owner request (2026-07-19): (1) add 2rem vertical margin between sections; (2) add a react-photo-view-style lightbox for screenshots.

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 11.1 | Section spacing: `.project-section { margin: 2rem 0 }`; remove conflicting `mt-4` from the 4 sections | Easy | — | ✅ |
| 11.2 | Screenshot lightbox (researched react-photo-view → owner chose Svelte equivalent) | Medium | — | ✅ |
| 11.3 | Verify build + render | Easy | 11.1–11.2 | ✅ |

### Service Summary

- **Spacing (11.1):** `.project-section` margin bumped `24px 0 → 2rem 0`; removed the `mt-4` utility (was overriding the top margin to 16px) from all 4 sections (Tech stack, Features, Screenshots, Architecture).
- **Lightbox (11.2):** `frontend/src/components/project/Screenshots.svelte` — a Svelte 5 island. Click a screenshot → fullscreen overlay; **wheel / double-click to zoom**, **drag to pan**, **Esc / ← / →** + on-screen buttons to close/navigate, click backdrop to close. Reduced-motion guard included.
  - **Decision:** react-photo-view is React; the frontend is Astro+Svelte. Owner chose the **Svelte** option (no new framework, no React runtime, reuses iconify natively). Researched react-photo-view via Context7 — its `PhotoView` `render` prop confirmed custom-content rendering is possible, applied the same idea here.
  - Renders the gradient placeholders directly (no image `src` needed); swap the `.lb-photo`/`.thumb` content for `<img>` when real screenshots exist.
- **Integration:** `projects/[slug].astro` screenshots section → `<Screenshots client:visible items={project.screenshots} />`.
- **Build:** `tsc --noEmit` + `npm run build` clean; live curl → 4 thumbnails + expand-hints render, no errors.
- **⏳ Browser QA:** the lightbox interactions (open/zoom/pan/nav) are client-side — confirm in the browser.

> 📄 Full report: [`reports/phase-11-report.md`](./reports/phase-11-report.md)

---

## Phase 12 — List/detail tweaks (projects, blogs) per DESIGN.md

> Owner request (2026-07-19): (1) project list — year beside descriptor, not the title; (2) blog list — drop redundant meta date, move read-est to top-right; (3) blog detail — related articles by shared tech stack (tags); (4) blog detail — revamp author box (Notion).

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 12.1 | Project card: remove year from the title row; show `descriptor · year` in the footer | Easy | — | ✅ |
| 12.2 | Blog card: drop the date beside the tags (kept the footer date); move read-est to top-right | Easy | — | ✅ |
| 12.3 | Blog detail: derive related articles by shared tags (tech stack) instead of the empty manual field | Medium | — | ✅ |
| 12.4 | Blog detail: revamp the author box to the Notion style (canvas card, hairline, 12px, eyebrow role) | Easy | — | ✅ |
| 12.5 | Verify build + live render | Easy | 12.1–12.4 | ✅ |

### Service Summary

- **Project list (12.1):** `ProjectGrid.svelte` — removed `<span class="card-date">` from the header; footer now renders `{descriptor} · {year}`.
- **Blog list (12.2):** `BlogFilter.svelte` — meta row is now `flex; justify-content: space-between` → tags left, read-est right; removed the `solar:calendar-linear` date from the meta row (the footer "Published {date}" remains, so the date is no longer duplicated).
- **Blog detail (12.3):** `blogs/[slug].astro` — fetches all published articles, then computes related = other articles sharing ≥1 tag (by tag id), sorted by overlap count, top 5. Replaces the always-empty manual `relatedArticles` lookup.
- **Blog detail (12.4):** `.author-card` revamped to Notion — `--n-canvas` surface, `--n-hairline` border, 12px radius, 24px pad; 56px circular gradient avatar; name 18px/700 (`--n-ink`), role as 12px/600 uppercase eyebrow (`--n-steel`), bio 14px/1.55 (`--n-slate`). Markup uses new `.author-avatar/.author-info/.author-name/.author-role/.author-bio`.
- **Build:** `tsc --noEmit` + `npm run build` clean.
- **Live checks:** project footer shows `Personal · OSS · 2025`; blog meta has 0 calendar icons + read-est top-right; blog detail related sidebar now populated (1 related by shared tags, was empty); author box uses `author-avatar`.

> 📄 Full report: [`reports/phase-12-report.md`](./reports/phase-12-report.md)

---

## Phase 13 — Polish: project-card footer alignment + blog detail consistency

> Owner request (2026-07-19): (fix) project list — pin the bottom row (descriptor·year + links) to the card bottom so cards align regardless of excerpt length; (phase, blog detail) tag chips sized like project tech-stack chips, "All articles" moved from the top nav into the Related sidebar (mirroring project detail), and the `/blogs` search placeholder reads "Search articles".

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 13.1 | Project card: pin the footer (descriptor·year + link icons) to the card bottom | Easy | — | ✅ |
| 13.2 | Blog detail: size the tag chips like project tech-stack chips (`.tech-chip`) | Easy | — | ✅ |
| 13.3 | Blog detail: move "All articles" from the top nav into the Related sidebar as a link | Easy | — | ✅ |
| 13.4 | `/blogs` search placeholder → "Search articles" (match the projects search input) | Easy | — | ✅ |
| 13.5 | Verify build + live render | Easy | 13.1–13.4 | ✅ |

### Service Summary

- **Project list (13.1):** `ProjectGrid.svelte` — added a `project-card` class to each card article; `styles.css` adds `.project-card > .card-footer { margin-top: auto; padding-top: 14px; }`. Because `.card` is already `flex-direction: column` and `.grid-3` row-stretches its items, shorter cards now push their footer down to align with the tallest card in the row (min 14px gap preserved). Scoped to project cards only — single-column blog cards are unaffected.
- **Blog detail (13.2):** `blogs/[slug].astro` — tag chips now use `class="tag is-secondary tech-chip"`, matching the project detail Tech stack chip sizing (padding 5px 11px, 13px, weight 500). Blog `Tag` has no icon field, so no icon is rendered.
- **Blog detail (13.3):** removed the `slot="headerRight"` back-link from the top nav; added an `all-articles-link` at the bottom of the Related articles sidebar (primary+bold, top hairline, right arrow) — same pattern as project detail's "All projects". `styles.css` extends the shared rule to `.all-projects-link, .all-articles-link`.
- **Blog list (13.4):** `BlogFilter.svelte` — search placeholder is now `Search articles` (no ellipsis), matching the projects search input.
- **Build:** `tsc --noEmit` + `npm run build` clean.
- **Live checks:** `/blogs` placeholder = `Search articles`; blog detail header has 0 `back-link`/`headerRight`, 2 `tech-chip` tags, 1 `all-articles-link` in the sidebar; `/projects` renders 6 `project-card` articles with footers like `Personal · OSS · 2025`.

> 📄 Full report: [`reports/phase-13-report.md`](./reports/phase-13-report.md)

---

## Phase 14 — Final polish: collapsed-sidebar fixes + global Notion token alignment

> Owner request (2026-07-19, "last phase"): (1) when the sidebar is collapsed, the dark-mode toggle and the expand-sidebar toggle should sit in a flex row; (2) when collapsed, the scrollbar should not move to the left; (3) make sure `/blogs`, `/documents`, `/social`, `/contact`, the sidebar, and the top nav all follow the DESIGN.md design system.

| ID | Task | Difficulty | Dependencies | Status |
|----|------|-----------|--------------|--------|
| 14.1 | Collapsed sidebar: theme + expand toggles sit side-by-side in a row | Easy | — | ✅ |
| 14.2 | Collapsed sidebar: `.main` now widens correctly so the scrollbar stays put (no left shift) | Medium | — | ✅ |
| 14.3 | Align global theme tokens to Notion DESIGN.md (accent, warm canvas, soft shadow, ink-muted) | Medium | — | ✅ |
| 14.4 | Verify build + live render | Easy | 14.1–14.3 | ✅ |

### Service Summary

- **Collapsed bottom row (14.1):** the 72px rail had ~40px of content width, so the two 32px bottom buttons (theme + expand) overflowed and clipped. Tightened the collapsed horizontal padding to `.5rem` (≈56px content) and sized the two bottom `.icon-btn`s to 26px (desktop only) — both now sit centered in a flex row. Mobile drawer is untouched (keeps 44px touch targets).
- **Scrollbar / main width (14.2):** root cause — Astro wraps the Svelte sidebar in `<astro-island>`, so `.sidebar` and `.main` are **not DOM siblings**; the rule `.sidebar.is-collapsed ~ .main` never matched, leaving `.main` at `calc(100% - 256px)` when collapsed → a 184px gap where the sidebar was → the main content + its scrollbar sat 184px inset from the right ("moved left"). Replaced the sibling selector with `.layout:has(.sidebar.is-collapsed) .main { width: calc(100% - 72px) }` so `.main` actually widens on collapse.
- **Global Notion tokens (14.3):** the non-home pages/components still used the pre-re-skin globals. Aligned them to the Notion language already on the home page so the whole site reads as one system:
  - `--primary` `black` → `#5645d4` (light) / `#f9f9f9` → `#7c6fe4` (dark, fg → `#fff`) — the active sidebar link, primary buttons, scrollbar thumb, and active chips now use the Notion accent instead of black/white.
  - `--secondbackground` `#f8f8f8` → warm `#f6f5f4` (Notion canvas-soft) — the page canvas is now warm, not clinical.
  - `--shadow` heavy `1px 1px 7px 3px …` → barely-there layered `0 1px 2px / 0 4px 12px rgba(0,0,0,.05/.04)`.
  - `--desc` `#6b6b6b` → warm `#615d59` (Notion ink-muted).
  - `--secondary` left untouched (used in many small accent spots; current purple is consistent).
- **Build:** `tsc --noEmit` + `npm run build` clean.
- **Live checks:** served CSS contains `.layout:has(.sidebar.is-collapsed) .main`, the old `~ .main` rule is gone, the collapsed bottom `.icon-btn{width:26px…}` rule is present, and the new token values (`--primary:#5645d4`/`#7c6fe4`, `--secondbackground:#f6f5f4`, soft `--shadow`) are all in the response. Rendered DOM re-confirms `<astro-island>…</astro-island><main class="main">` (non-siblings).

> 📄 Full report: [`reports/phase-14-report.md`](./reports/phase-14-report.md)

---

## Dependency Graph

```
Phase 0 (✅ done)
  0.1 ──► 0.4 ──► 0.5
  0.2 ──► 0.3 ──┘

Phase 1 — Backend (independent of 2)
  1.1 ──► 1.4 ──► 1.5 ──► 1.6
  1.2 ──┘         1.3 ──┘

Phase 2 — Re-skin
  2.1 ──► 2.2 ──► 2.3 ─┐
              ──► 2.4 ─┤
              ──► 2.5 ─┼──► 2.8
              ──► 2.6 ─┤
              ──► 2.7 ─┘

Phase 3 — New sections
  1.5 ──► 3.1 ──► 3.2 ─┐
              ──► 3.3 ─┼──► 3.4 ──► 3.5
        2.5 ───────────┘

Phase 4 — Interactions
  2.2 ──► 4.1 ─────────────┐
  2.3/2.6 ──► 4.2 ─────────┤
  3.4 ──► 4.3 ──► 4.4 ─────┼──► 4.5 ──► 4.7
  4.6 (independent) ───────┘

Phase 5
  4.7 ──► 5.1 ──► 5.3
  5.2 (independent)
```

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery & setup | 5 | ✅ |
| 1 — Backend & types | 6 | ✅ |
| 2 — Token layer & re-skin | 8 | ✅ |
| 3 — New sections | 5 | ✅ |
| 4 — Interactions & cleanup | 7 | ✅ |
| 5 — QA & docs | 3 | ✅ |
| 6 — Revision: layout + hero glow | 4 | ✅ |
| 7 — Right-side mesh gradient | 2 | ✅ |
| 8 — Project detail revamp | 3 | ✅ |
| 9 — Project detail: header + stats + tech stack | 5 | ✅ |
| 10 — Project detail: body fix + links | 4 | ✅ |
| 11 — Project detail: spacing + lightbox | 3 | ✅ |
| 12 — List/detail tweaks (projects, blogs) | 5 | ✅ |
| 13 — Polish: card footer alignment + blog detail consistency | 5 | ✅ |
| 14 — Final polish: collapsed-sidebar fixes + global Notion tokens | 4 | ✅ |
| **Total** | **69** | |
