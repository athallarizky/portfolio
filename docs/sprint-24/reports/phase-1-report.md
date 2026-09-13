# Phase 1 Report — Payload Localization (Real Schema)

> Completed: 2026-09-13 · Follows [`phase-0-report.md`](./phase-0-report.md)

---

## 1. What was done

1. **Config** (`src/payload.config.ts`): `localization` — `en` (default) + `id`, `fallback: true`.
2. **Localized fields**:
   - `Articles`: `title`, `excerpt`, `body`, `seo.metaTitle`, `seo.metaDescription`
   - `Projects`: `title`, `excerpt`, `body`, `features` (whole array), `seo.metaTitle`, `seo.metaDescription`
   - Slug, relations, dates, banners, status, order — shared, unchanged.
3. **Real dev DB migrated** via the proven drill: push (piped-y dev server) → v2 import
   (`portfolio-data-2026-09-13-17-09.zip`, exported pre-change) → content restored as EN. 0 errors.
4. **Prod migration file** `src/migrations/20260913_172000_localization_en_id.ts` (hand-written;
   DDL diffed from before/after schemas) — the repo's first migration file. Verified end-to-end on
   a third DB: `printf 'y\n' | npx payload migrate` → schema identical to the pushed one →
   v2 import restores content (drill = the prod runbook, proven).

## 2. Verification

| Check | Result |
|---|---|
| `GET /api/articles?limit=1` | EN title restored ✓ |
| `GET /api/projects?limit=1&locale=id` | EN via fallback ✓ |
| `GET /api/projects?limit=1&locale=id&fallback-locale=none` | `null` (untranslated detection) ✓ |
| `/admin` | 200 ✓ (locale switcher ships with the config — standard Payload 3 admin) |
| `npm run refs:export` | byte-identical, `git status tools/content/refs/` clean ✓ |
| `payload migrate:status` (test DB) | migration recorded, batch 1 ✓ |

## 3. Key decisions / notes

| Decision | Reason |
|---|---|
| Migration file is hand-written, not `migrate:create` | No migration history exists (schema always arrived via dev-push/snapshot); `migrate:create` would emit full-schema-from-empty, unapplicable to a populated DB |
| `projects_features._locale` added with `DEFAULT 'en'` | `NOT NULL` column addition on a possibly non-empty table (prod may have features data); existing rows semantically belong to EN. Only schema deviation from the pushed layout — cosmetic, documented |
| `payload migrate` prompts on DBs with a dev-push row (batch -1) | Prod runbook uses `printf 'y\n' \| npx payload migrate` (piped prompt works — same `prompts` lib as dev push) |
| Migration is destructive by design | Content re-import from the pre-deploy v2 export is part of the runbook (phase-0 report §5) |

## 4. Anomalies

- One transient `payloadInitError` running the import immediately after `migrate:status` on the
  same DB (sqlite file lock hand-off). Re-run succeeded — noted, not pursued; the runbook spaces
  the steps anyway.

## 5. Files touched

- `src/payload.config.ts` (+localization block)
- `src/collections/Articles.ts`, `src/collections/Projects.ts` (+`localized: true` per field)
- `src/migrations/20260913_172000_localization_en_id.ts` (new)
- `src/data-sync/cli/import.ts` (pre-existing arg-parse bug fix — see phase-0 report §3)
