# Sprint 24 — Final Report: Bilingual Content Layer (Payload + Pipeline)

> Status: ✅ Delivered | 2026-09-13
> Audience: sprint-25 context. Read this + [`AGENTS.md`](../../AGENTS.md) before starting sprint-25.

---

## 1. Sprint goal & outcome

**Goal:** Articles and projects can be authored bilingually (EN + optional ID) through the
existing git → publish pipeline, with imports that never clobber the other locale — frontend untouched.

**Delivered in full.** Payload localization (EN canonical + ID overlay) on Articles/Projects;
data-sync archive v3 with per-locale overlays and a proven non-clobber import; bilingual publish
pipeline (`*.id.json` siblings); both content tools emit optional translations; a hand-written
prod migration + runbook; the first real bilingual article.

## 2. Final structure

```
backend/src/
├── payload.config.ts            + localization (en default, id, fallback)
├── collections/Articles.ts      + localized: title, excerpt, body, seo.metaTitle/MetaDescription
├── collections/Projects.ts      + localized: … + features (whole array)
├── migrations/                  (new) 20260913_172000_localization_en_id.ts — prod migration
└── data-sync/
    ├── locales.ts               (new) overlay model: split/validate/version-rule
    ├── locales.test.ts          (new) 33 tests incl. write-shape proofs on a mock payload
    ├── keys.ts                  + DEFAULT_LOCALE / OVERLAY_LOCALES / LOCALIZED_FIELDS
    ├── types.ts                 v3 manifest (v1/v2/v3 importable) + report.localeOverlays
    ├── manifest.ts              buildManifest({ schemaVersion? })
    ├── export.ts                locale:'all' read → EN flat + locales.id; md per locale
    ├── import.ts                explicit locale:'en' writes + per-locale overlay writes
    ├── single.ts                attachOverlaySibling (identity-checked)
    └── cli/wrap-publish.ts      + wrap-articles/wrap-projects: sibling attach + 2/3 emit rule
tools/
├── article-polish/SKILLS.md     step 3b: optional Indonesian translation
├── repo-to-project/SKILLS.md    step 3b: same
└── article-polish/content/setup-repo-with-agent-skills/article.id.{md,json}  ← first real translation
```

## 3. Key deliverables

| Item | Count | Notes |
|------|-------|-------|
| Localized collections | 2 | articles, projects (11 field paths total) |
| Unit tests | 98 | 33 new, all passing (was 65) |
| Archive schema | v1/v2/v3 | v1/v2 import unchanged; v3 = v2 + `locales.<code>` overlays |
| Emit rule | 2/3 | EN-only archives still stamp v2 — deployed prod importer keeps working |
| Prod migration | 1 file | verified on a copy: migrate → schema identical → v2 import restores content |
| Bilingual article | 1 | `setup-repo-with-agent-skills` (real translation, in git) |
| Bug fixes by-catch | 2 | import-CLI arg parsing (sprint-23 regression); .gitignore article.id.* whitelist trap |

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| EN values stay at the row top level; translations ride as `locales.id` | v2 code paths unchanged; additive; old readers see familiar data |
| Import = EN upsert (`locale:'en'`) + one targeted overlay write per locale | Payload per-locale writes are isolated → non-clobber needs no diffing (proven on mock + real DB) |
| Sibling-file authoring (`article.id.json` next to `article.json`) | git stays source of truth for BOTH locales; existing EN files untouched |
| Conditional manifest version (2 when EN-only) | EN-only publishes stay importable by the currently-deployed v2 importer |
| Hand-written migration (DDL diffed from real schemas) | no migration history exists; `migrate:create` would emit full-schema-from-empty |
| `payload migrate` (not dev-push) for prod | `next start` never pushes; migrate is non-interactive (piped-y past the dev-push-row prompt) |

## 5. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 0 — Discovery & spikes | 5 | ✅ |
| 1 — Payload localization | 6 | ✅ |
| 2 — Data-sync v3 | 6 | ✅ |
| 3 — Publish pipeline bilingual | 3 | ✅ |
| 4 — Content tools emit ID | 3 | ✅ |
| 5 — Wrap-up | 3 | ✅ |

> 📄 Full reports: [`reports/`](./reports/) (phase 0–4)

## 6. Verification

- Backend: `npm run build` clean; `npm test` **98/98** (twice consecutively — stable).
- Frontend: `tsc --noEmit` + `npm run build` clean (untouched, as scoped).
- Real-DB proofs: clobber-guard (old EN-only v2 zip imported over translations → all ID values
  survived); bilingual publish zip → `--replace-only` import → REST reads correct in both locales;
  overlay body md→Lexical conversion verified via `?locale=id&fallback-locale=none`.
- Full prod drill on a third DB: old-schema copy → `printf 'y\n' | npx payload migrate` → schema
  identical to pushed → v2 import restores content (0 errors).
- `refs:export` byte-identical; `/admin` + `/admin/data-sync` 200; `/api/data-import` still auth-gated.

## 7. How to run (the bilingual bits)

```bash
cd backend
npm run wrap:publish -- --articles        # auto-attaches any article.id.json (stamps v3 when bilingual)
npm run import -- <zip> -- --dry-run      # shows "locale overlays" plan line
npm run import -- <zip> -- --replace-only articles   # EN upsert + id overlay; other locales untouched
# REST check:
curl -s 'http://localhost:3000/api/articles?where[slug][equals]=setup-repo-with-agent-skills&depth=0&locale=id&fallback-locale=none'
```

## 8. Production migration runbook (OWNER-APPLIED — no agent VPS access)

> ⚠️ The migration **drops the old `title`/`excerpt`/`body` columns** — the pre-deploy export is
> the content carrier, not just a backup.

1. **Before deploy** (old code live): `/admin/data-sync` → **Download** content export (keep the zip).
2. Deploy the new backend (usual "Deploy to VPS" workflow).
3. On the VPS: `cd /root/portfolio/backend && printf 'y\n' | npx payload migrate`
   (prompts because the DB carries a dev-push row; piped-y answers it).
4. `/admin/data-sync` → import the step-1 zip (**Merge**) — content restored as EN.
5. Verify: site renders; `curl -s 'https://athallarizky.com/api/articles?limit=1' | jq '.docs[0].title'`.
   Rollback: pre-import `.bak` (auto) or any snapshot.

EN-only publishes work against prod **before** this migration too (v2 zips + old importer) —
the runbook is only needed to unlock bilingual content.

## 9. Sprint-25 handoff — Indonesian zone (frontend + SEO + translations)

1. **Routes**: `pages/id/blogs(.astro|/[slug])`, `pages/id/projects(…)` reusing existing page
   components. Detect translated items with `?locale=id&fallback-locale=none` (null ⇒ untranslated).
2. **Behavior** (locked decisions): untranslated `/id/<slug>` → **301 to the EN URL**; `/id` lists
   show **only translated items**; switcher on list header + detail title, only when the
   counterpart exists; sidebar untouched.
3. **Data**: `safeFetch` gains a locale option; `<html lang>` per page; JSON-LD `inLanguage`.
4. **SEO**: hreflang `en`↔`id` + `x-default`→EN on the 4 content routes; `@astrojs/sitemap`
   i18n config for alternates.
5. **Content**: translate the remaining 4 articles + 5 projects via the sprint-24 toolchain
   (`SKILLS.md` step 3b); publish per-collection.
6. **Gotchas learned**: REST `locale=all` returns flat values (use per-locale reads); sqlite
   writes are isolated per locale (safe for the two-process dev setup); the `_locales` tables
   are `articles_locales`/`projects_locales` + `projects_features._locale` (cleanup SQL if needed).
