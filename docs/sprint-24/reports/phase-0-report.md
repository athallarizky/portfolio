# Phase 0 Report — Discovery & Spikes (Localization Behavior)

> Completed: 2026-09-13 · Spike DB: `backend/payload-spike.db` (copy of `payload.db`; real DB untouched until Phase 1)

---

## 1. How to Run (the spike drill, reproducible)

```bash
cd backend
cp payload.db payload-spike.db                                    # fresh copy of old-schema DB

# 1) Export v2 content BEFORE enabling localization (old config + old schema)
git stash push -- src/payload.config.ts src/collections/Articles.ts src/collections/Projects.ts
npm run export                                                     # → portfolio-data-<stamp>.zip
git stash pop

# 2) Push the localized schema (dev-server push; answer the data-loss prompt via stdin)
printf 'y\ny\n' | DATABASE_URL=file:./payload-spike.db npm run dev &
curl -s 'http://localhost:3003/api/articles?limit=1'               # triggers the push

# 3) Restore content as the default locale
DATABASE_URL=file:./payload-spike.db npm run import -- portfolio-data-<stamp>.zip
```

Local-API probes ran as throwaway `npx tsx` scripts (`payload.find/update` with
`locale`/`fallbackLocale`); REST probes via `curl` against the spike dev server.

## 2. Key Findings

| # | Question | Answer |
|---|----------|--------|
| 1 | Does enabling `localization` migrate existing data? | **NO.** The dev-server schema push DROPS the old `title`/`excerpt`/`body` columns (data-loss prompt, interactive `prompts` lib) and creates fresh locale tables. After push, localized fields read `null`. |
| 2 | Migration path | **Export-before → push → import-after**, using our own data-sync engine. The v2 zip imports cleanly (0 errors) post-push; values land as the default locale (`en`). **Proven on the spike DB.** |
| 3 | Non-interactive push | No `payload push` CLI in 3.85. `PAYLOAD_FORCE_DRIZZLE_PUSH` only skips the no-change check, not the prompt. **Piped stdin works**: `printf 'y\n' \| npm run dev`. For prod, a migration file (`npx payload migrate`) is the non-interactive route (runbook in §5). |
| 4 | REST locale behavior | `?locale=id` → falls back to EN (config `fallback: true`). `?locale=id&fallback-locale=none` → **`null`** for untranslated fields — the untranslated-detection primitive sprint-25 needs. (My first probe of this looked broken — a double-`?` in the URL; Payload behavior is correct.) |
| 5 | Local API read shapes | `locale: 'all'` → localized fields as `{ en, id }` objects (non-localized stay flat). `fallbackLocale: false` → `undefined` for untranslated. Exactly the export-v3 read primitive. |
| 6 | Non-clobber proof | `update({ locale: 'id', data })` adds only the `id` value; a subsequent `update({ locale: 'en', data })` **leaves the `id` value intact**. Per-locale writes are isolated at the Local API level — the core guarantee task 2.3 needs, already provided by Payload. |
| 7 | SQLite adapter × localization | Works on 3.85.2. Storage: scalar localized fields → `<coll>_locales` tables (`articles_locales`, `projects_locales`); localized arrays → `_locale` column on the array table (`projects_features._locale`). |
| 8 | Data reality | No project currently uses `features` (0 items across all 5) — the localized whole-array field has no live data yet; import/export of it will be exercised by unit tests + a synthetic row in Phase 2/4. |
| 9 | Admin translator UX | Standard Payload: with `localization` configured, the admin gains the built-in locale switcher + per-field translated-state indicators. No custom work needed (visually confirmed in Phase 1). |

## 3. Pre-existing bug found & fixed (spike by-catch)

`src/data-sync/cli/import.ts` — since sprint-23, a bare `npm run import -- <zip>` (with or without
`--dry-run`, i.e. **without** `--replace-only`) always printed usage and exited: with
`roIdx = -1`, `args[roIdx + 1]` aliases `args[0]` — the zip path itself — so the `find()` excluded
it. All real usages since sprint-23 went through `--replace-only` / the admin UI, which is why it
went unnoticed. Fixed by excluding the `--replace-only` value only when present. (Not RCA-worthy:
one debug cycle, trivial cause, no data impact — usage-refusal, not silent failure.)

## 4. v3 Archive Schema (locked for Phase 2)

- Rows keep the v2 shape at the top level (= **EN values**, default locale) — every existing
  code path keeps working.
- A row with translations adds a sibling overlay:
  `locales: { id: { title, excerpt, body, seo: { metaTitle, metaDescription }, features? } }`
  carrying **only localized fields that have ID values**.
- `locales` overlays are skipped (not written) on import when absent — combined with finding 6,
  the non-clobber guarantee needs no diffing: EN upsert writes locale `en`, overlay writes locale `id`.
- Manifest `schemaVersion: 3`; v1/v2 archives still import unchanged. **Emit rule**: exports and
  publish zips stamp `2` when no row carries an overlay (EN-only), `3` when any does — so EN-only
  publishes keep working against the currently-deployed prod importer during the transition.
- Localized-field list (single source of truth, `keys.ts`):
  `articles: [title, excerpt, body, seo.metaTitle, seo.metaDescription]`,
  `projects: [title, excerpt, body, features, seo.metaTitle, seo.metaDescription]`.
  Slug, relations, dates, banners, status, order — shared, never localized.

## 5. Production migration runbook (owner-applied; no agent VPS access)

1. **Before deploy** (old code running): download a content export — `/admin/data-sync` →
   Download (or `GET /api/data-export`). This is **mandatory**, not just a backup: step 3 drops
   the old columns and the content must be re-imported from this zip.
2. Deploy the new backend (usual build-on-runner workflow).
3. On the VPS (root): `cd /root/portfolio/backend && npx payload migrate` — applies the committed
   migration file non-interactively (generated + verified in Phase 1; drops old columns, creates
   locale tables).
4. Import the step-1 zip via `/admin/data-sync` (Merge) — content restored as EN.
5. Verify: site pages render; `curl -s '$API/api/articles?limit=1' | jq '.docs[0].title'`.

Rollback: `payload.db` is rsync-excluded and the pre-import backup (auto) + any snapshot restores.

## 6. Decisions made

| Decision | Reason |
|---|---|
| v3 overlay shape (EN flat + `locales.id`) | Zero churn to v2 paths; additive; wrap/insert-one just pass it through |
| Conditional schemaVersion 2/3 on emit | EN-only publishes stay compatible with the deployed prod importer |
| Prod migration via migration file, not dev-push | `next start` never pushes; `payload migrate` is non-interactive and auditable |
| Import CLI bug fixed in-phase | It blocks the migration drill itself (bare imports) |
