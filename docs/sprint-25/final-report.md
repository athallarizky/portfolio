# Sprint 25 — Final Report: The Indonesian Zone (Frontend + SEO + Translations)

> Status: ✅ Delivered | 2026-09-13
> Audience: next sprint context. Read this + [`AGENTS.md`](../../AGENTS.md) first.

---

## 1. Sprint goal & outcome

**Goal:** An Indonesian reader can read the translated articles/projects at `/id/…`, switch
languages in place, and search engines see correct hreflang pairs — with the EN site
byte-identical.

**Delivered in full.** The `/id/` reading zone (list + detail for blogs and projects), the
static `EN|ID` switcher, hreflang + sitemap alternates, and translations for **all** content
(4/4 articles, 5/5 projects). UI chrome stays English everywhere, as locked.

## 2. Final structure

```
frontend/src/
├── lib/i18n.ts                  (new) locale model: query builder, localePath, isTranslated
├── lib/content.ts               (new) detail loaders — routes own redirects, components render
├── components/LangSwitcher.astro (new) static EN|ID pill
├── components/pages/            (new) BlogsPage, BlogDetailPage, ProjectsPage, ProjectDetailPage
│                                        — shared, locale-parameterized, pure presentation
├── layouts/BaseLayout.astro     + lang prop (<html lang>) + alternates (hreflang links)
├── pages/blogs(.astro|/[slug])  thin wrappers (locale="en") — behavior unchanged
├── pages/projects(…/[slug])     thin wrappers (locale="en")
├── pages/id/                    (new) blogs, blogs/[slug], projects, projects/[slug]
├── components/blog/BlogFilter.svelte      + base link prop
├── components/projects/ProjectGrid.svelte + base link prop
├── styles/styles.css            + .lang-switch / .lang-option
└── astro.config.mjs             sitemap serialize → xhtml:link alternates (4 static entries)

tools/*/content/<slug>/          + article.id.{md,json} ×4 · project.id.{md,json} ×5
```

## 3. Key deliverables

| Item | Count | Notes |
|------|-------|-------|
| `/id/` routes | 4 | list+detail × blogs/projects; untranslated detail → **301 to EN** |
| Shared page components | 4 | the 8 route files are ~5-line wrappers |
| Switcher placements | 4 page types | list header + detail title; hidden when no counterpart |
| hreflang coverage | 4 route types | en↔id + x-default→EN; absent on untranslated EN pages |
| Sitemap alternates | 4 entries | via `serialize` (trailing-slash URLs — `directory` format) |
| Translations | 9 items | 4/4 articles + 5/5 projects (`*.id.json`, git-tracked) |

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| Loaders in `lib/content.ts`, redirects in route files | **`Astro.redirect` is a silent no-op inside components** — found by verification, fixed by architecture, not patched around |
| `/id/` lists fetch with `locale=id&fallback-locale=none` + `isTranslated` filter | Zone stays pure: only translated items ever appear; untranslated detail 301s to EN |
| EN detail adds one tiny `depth=0` probe | Only decides switcher/hreflang visibility; the main fetch stays untouched (EN behavior byte-identical) |
| Sidebar "Related"/"Other projects" filter translated-only in the zone | No mixed-language sidebar, no links that bounce back via 301 |
| Static switcher (links, no JS island) | CSS-first motion rules; active state is server-rendered |
| Dates/labels stay `en-US`/English on `/id/` | Chrome is EN by locked decision — only localized *content* renders Indonesian |
| Sitemap alternates via `serialize` | Astro i18n routing config not needed for one subtree; zero side effects |

## 5. Verification

- `tsc --noEmit` + `npm run build` clean; backend untouched (sprint-24 state).
- Route battery (dev server): all 9 `/id/` details → **200** with Indonesian titles; an
  untranslated slug → **301 → EN**; nonexistent slug → 302 `/404` (pre-sprint behavior).
- `/id/blogs` renders 4/4 translated cards; `/id/projects` 5/5.
- `<html lang="id">` on zone pages; hreflang triple present on translated pages, absent on
  untranslated EN pages; switcher visible only where a counterpart exists.
- Bilingual publish drill: `wrap:publish` reported `id overlays: 4/4` + `5/5`; both imported
  with `--replace-only` cleanly (0 errors, overlays written, EN untouched).
- Production build: `/id/blogs/` + `/id/projects/` in sitemap with `xhtml:link` en/id/x-default.
- **Owner visual check still recommended:** light+dark, mobile drawer, switcher placement
  (markup reuses existing tokens; the only new visual element is the switcher pill).

## 6. How to run

```bash
cd backend && npm run dev        # :3000
cd frontend && npm run dev       # :4321 → /id/blogs, /id/projects
```

## 7. Production rollout (owner)

1. Commit + merge (both sprints' changes ship together: sprint-24 backend + sprint-25 frontend).
2. Follow the sprint-24 runbook (final-report §8): export-first → deploy → `printf 'y\n' | npx payload migrate` → re-import.
3. Publish bilingual content: Actions → **Publish Article** / **Publish Project** (zips now
   carry the `*.id.json` overlays; EN-only zips remain v2-compatible).
4. Post-deploy check: `curl -s https://athallarizky.com/id/blogs | grep 'lang="id"'`.

## 8. Handoff notes

- Detection primitive: `?locale=id&fallback-locale=none` → null title ⇒ untranslated
  (`lib/i18n.ts` `isTranslated`). REST `locale=all` is NOT usable (returns flat values).
- Adding a 3rd locale someday: extend `OVERLAY_LOCALES` (backend `keys.ts` + frontend
  `i18n.ts`), add routes/switcher — the archive v3 format already supports N overlays.
- `features` on projects is localized as a whole array (currently no content uses it);
  the ID detail page guards `project.features || []`.
- Detail pages' sidebars exclude untranslated items in the zone by design — if you ever
  want mixed sidebars, relax the `inZone` filter in `lib/content.ts`.
