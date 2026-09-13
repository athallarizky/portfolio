# Sprint-24 Plan — Bilingual Content Layer (Payload + Pipeline)

> Status: ✅ Delivered | Created: 2026-09-13
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-23/final-report.md`](../sprint-23/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

The sprint-23 pipeline treats git as the source of truth: article/project JSONs under
`tools/*/content/` → `npm run wrap:publish` builds a full-set zip → GitHub Actions does a
scoped replace-all import over the REST API. Everything today is English-only.

The owner wants **bilingual content (EN + optional ID)** while the **UI stays English** —
an "Indonesian reading zone" at `/id/blogs` + `/id/projects`. That visible zone is
**sprint-25**. This sprint builds the data layer beneath it: Payload localization on
Articles/Projects, a locale-aware data-sync v3, and content tools that can emit optional
Indonesian translations — **without touching the frontend at all**.

### Why two sprints

Full scope (Payload + pipeline + tools + `/id/` frontend + SEO + translations) is larger
than any sprint in this repo. Split along the data/presentation seam — with one hard
constraint that decides where the seam sits:

> **Payload localization and pipeline v3 must ship together.** Between the moment fields
> become localized and the moment import is locale-aware, the actively-used publish flow
> would be in a broken half-state (imports could mis-write or clobber locale data).

Sprint-24 = the whole data layer, safe end-to-end. Sprint-25 = the visible zone, planned
fresh from sprint-24's handoff (preview in §5).

## 1. Sprint goal

Articles and projects can be authored bilingually (EN + optional ID) through the existing
git → publish pipeline, with imports that never clobber the other locale — frontend untouched.

## 2. Scope

**In scope:**
- Payload `localization` config: `en` (default) + `id`, `fallback: true`
- Localized fields on **Articles**: `title`, `excerpt`, `body`, `seo.metaTitle`, `seo.metaDescription`
- Localized fields on **Projects**: `title`, `excerpt`, `body`, `features` (whole array), `seo.metaTitle`, `seo.metaDescription`
- Data-sync archive **v3**: per-locale values in export; import upserts per-locale and never
  overwrites locale values absent from the archive; v2/v1 archives still import
- `wrap:publish` / `wrap:articles` / `wrap:projects` / `insert-one` read optional `<slug>.id.json`
  siblings and stamp them into the archive
- Content tools: article-polish + repo-to-project accept an optional ID draft → `*.id.json`
- Payload admin usable for translators (locale switcher is built into Payload 3)
- Unit tests for locale round-trip + non-clobber semantics

**Out of scope (sprint-25):**
- Any frontend change: `/id/` routes, language switcher, hreflang, sitemap alternates
- Translating the existing 5 articles + 5 projects (first batch is sprint-25)
- Localizing Tags / Technologies / Authors / Documents / SiteConfig / Home / Nav
  (tag & tech names are proper nouns; globals are UI chrome)

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| UI stays English; only Articles + Projects localized | Owner choice — content bilingual, chrome single-language; tags/tech are proper nouns |
| EN canonical + ID progressive (`fallback: true`) | Publishing never blocks on translation; REST returns EN where ID is missing |
| ID authored via git pipeline as sibling `*.id.json` files | Keeps the sprint-23 "git = source of truth" contract for **both** locales; existing EN JSONs stay untouched (additive — no rewrite of 5 articles + 5 projects) |
| Slug NOT localized | One identity per item; `/blogs/slug` ↔ `/id/blogs/slug` pair cleanly; uuid/merge semantics untouched |
| Import upsert = per-locale deep-merge; absent locale values are never written | Mirrors the "cosmetic fields survive" contract — admin-polished ID content is safe from EN-only publishes |
| Archive format v3 (locale-aware) | v2 has no locale dimension; a versioned bump keeps v1/v2 importable (precedent: sprint-15 uuid migration) |
| `status` stays per-document, not per-locale | Payload custom select field; an untranslated article simply has no ID values — no per-locale publish machinery |
| Snapshot untouched | Raw-DB zip already carries all locales by definition |

## 4. Phasing

- **Phase 0 — Discovery (spikes, on a COPY of `payload.db`):**
  enable `localization` → confirm existing data lands as `en` values (verify, don't assume);
  probe REST `?locale=id` and the disable-fallback param (`fallback-locale=none` — verify exact
  spelling) → nulls for untranslated fields; inspect how localized fields serialize through the
  **current** export; check the admin locale-switcher UX.
  Deliverable: `reports/phase-0-report.md` + locked v3 archive schema sketch.
- **Phase 1 — Payload localization:** `localization` in `payload.config.ts`; localized fields on
  the two collections; admin verification; `refs:export` sanity (output must be unchanged).
- **Phase 2 — Data-sync v3:** v3 archive types + version bump (v2/v1 back-compat); export emits
  both locales; import does per-locale deep-merge upsert with a non-clobber guard; scoped
  replace-all stays per-collection (drift deletion is by uuid — locale values of surviving rows
  are preserved); unit tests (round-trip, clobber-guard, v2 import, replace-only × locale).
- **Phase 3 — Publish pipeline bilingual:** `wrap-articles`/`wrap-projects`/`insert-one` read
  optional `*.id.json` siblings and validate them against the EN row (same uuid + slug);
  `wrap-publish` stamps bilingual rows into the full-set zip (same must-carry-uuid contract);
  end-to-end local dry-run.
- **Phase 4 — Content tools:** article-polish + repo-to-project SKILLS.md gain an optional
  translate stage (`draft.id.md` → polished → `article.id.json` / `project.id.json`); re-running
  stays idempotent per-locale (updates ID in place, preserves EN + manual polish).
- **Phase 5 — Wrap-up:** full verification (backend `npm run build && npm test`; frontend
  untouched but still builds), `final-report.md`, root `AGENTS.md` §5 conventions update,
  sprint-25 handoff notes.

## 5. Sprint-25 preview (the split — planned fresh after this sprint)

> **Indonesian zone: frontend + SEO + first translations.**

1. `pages/id/blogs(.astro|/[slug])` + `pages/id/projects(…)` — reuse existing page components;
   `safeFetch` with `?locale=id` + fallback-disabled param to detect translated items
2. Untranslated `/id/<slug>` → 301 to the EN URL; `/id` lists show **only translated items**
3. Language switcher on list header + detail title (only when the counterpart exists) —
   sidebar untouched, reuses existing pill/button vocabulary
4. SEO: hreflang `en` ↔ `id` + `x-default`→EN on the 4 content routes; sitemap alternates;
   `<html lang>` per page; JSON-LD `inLanguage`
5. First translation batch through the sprint-24 toolchain (progressive; fallback covers the rest)
