# Sprint-25 Plan — The Indonesian Zone (Frontend + SEO + Translations)

> Status: ✅ Delivered | Created: 2026-09-13
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-24/final-report.md`](../sprint-24/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-24 delivered the bilingual data layer: Payload localization (EN canonical + optional ID),
archive v3 with proven non-clobber imports, the `*.id.json` git authoring contract, and one real
bilingual article. The frontend was deliberately untouched.

This sprint surfaces it: the **`/id/` reading zone** (lists + details for blogs and projects),
the language switcher, hreflang/SEO, and the remaining content translations.

**Locked decisions** (from the sprint-24 planning discussion):
- **UI stays English everywhere** — nav, labels, buttons, dates, sidebar; only localized
  *content* (title/excerpt/body/seo/features) shows Indonesian on `/id/`
- URL: `/blogs` `/projects` = EN canonical (unchanged) · `/id/blogs` `/id/projects` = ID zone
- Untranslated `/id/<slug>` → **301 to the EN URL**; `/id` lists show **only translated items**
- Switcher on **list header + detail title**, only where a counterpart exists; sidebar untouched
- SEO: hreflang `en`↔`id` + `x-default`→EN; zero URL changes, zero 301s for existing pages

## 1. Sprint goal

An Indonesian reader can read the translated articles/projects at `/id/…`, switch languages
in place, and search engines see correct hreflang pairs — with the EN site byte-identical.

## 2. Scope

**In scope:**
- Shared page components (refactor: blogs/projects list+detail → locale-parameterized)
- `/id/` routes + untranslated-301 + translated-only lists
- `LangSwitcher` (static, no JS) on the 4 content page types
- BaseLayout: `lang` prop + `alternates` (hreflang) — Person JSON-LD untouched
- `@astrojs/sitemap` `serialize` → xhtml:link alternates on the 4 static entries
- Svelte card components: locale-aware link base
- Translations: remaining 4 articles + 5 projects via `*.id.json` (toolchain step 3b)

**Out of scope:**
- Any UI translation (chrome stays EN — locked)
- Astro i18n routing config (custom `/id/` subtree is simpler and zero-risk; revisit if a 3rd
  locale ever lands)
- Article JSON-LD / structured-data upgrades (none exists today; not a localization gap)
- Publishing to prod (owner: commit → merge → dispatch; runbook in sprint-24 report §8)

## 3. Key decisions

| Decision | Rationale |
|---|---|
| Shared `.astro` page components + thin route wrappers | 8 route files stay ~5 lines; zero duplication of ~100-line page bodies |
| Detail untranslated-check = tiny `?locale=id&fallback-locale=none&depth=0` probe (EN) / null-title check (ID) | One extra lightweight request; main fetch stays as-is on EN (byte-identical behavior) |
| Svelte cards take a `base` prop for links | Minimal, backward-compatible; links on `/id/` stay in-zone for translated items |
| Switcher is static links (no JS island) | CSS-only active state; matches CSS-first motion rules |
| Sitemap alternates via `serialize`, not Astro i18n config | Astro `i18n` routing config risks side effects; serialize injects exactly what we need |

## 4. Phasing

- **Phase 0 — Discovery:** read pages/layout/components (done — design above)
- **Phase 1 — Data layer:** `lib/i18n.ts` (locale query/path/translation helpers), Svelte `base` props
- **Phase 2 — Routes:** 4 shared components, 8 routes, untranslated 301s, translated-only lists, empty states
- **Phase 3 — Switcher:** `LangSwitcher.astro` + CSS + placement (list header + detail title)
- **Phase 4 — SEO:** BaseLayout `lang`/`alternates`, hreflang pairs, sitemap serialize
- **Phase 5 — Content:** translate 4 articles + 5 projects (`*.id.json`), wrap dry-run + local import
- **Phase 6 — Wrap-up:** tsc/build both apps, dev-server route verification (curl), docs, handoff
