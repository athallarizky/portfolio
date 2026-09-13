# Phase 2 Report — Data-sync v3 (Locale-Aware Archive + Non-Clobber Import)

> Completed: 2026-09-13 · Follows [`phase-1-report.md`](./phase-1-report.md)

---

## 1. What was built

| Piece | Change |
|---|---|
| `keys.ts` | `DEFAULT_LOCALE` / `OVERLAY_LOCALES` / `LOCALIZED_FIELDS` — single source of truth for the overlay model, in lockstep with the collection configs |
| `locales.ts` (new) | Pure overlay functions: `isLocaleMap`, `splitLocalizedRow` (locale:'all' doc → v3 row), `rowHasOverlay`, `archiveSchemaVersion`; array-item id stripping (env-local ids never leak) |
| `types.ts` | `SCHEMA_VERSION = 3`; importer accepts v1/v2/v3; `ImportReport.localeOverlays` |
| `manifest.ts` | `buildManifest({ schemaVersion? })` — writers decide |
| `export.ts` | Localized collections read with `locale: 'all'`, rows normalized to **EN flat + `locales.id` overlay**; body → Markdown per locale (EN top-level + overlay) |
| `import.ts` | Rows split (`locales` out of the EN payload); localized collections write the top level with **explicit `locale: 'en'`**; overlays applied as **one targeted update per locale carrying only the overlay's fields**; lazy editor-config init; dry-run counts planned overlays |
| `single.ts` | Emit rule: bilingual rows → manifest v3, EN-only → v2 (deployed-v2-importer compatible) |
| CLI + admin | `locale overlays` line in the import CLI output; `Locale overlays` badge in the admin import card |

**v3 row shape** (EN = v2-identical top level):

```jsonc
{ "uuid": "…", "slug": "shared-slug", "title": "EN", "body": "EN markdown",
  "locales": { "id": { "title": "ID", "body": "ID markdown", "seo": { "metaTitle": "…" } } } }
```

## 2. Verification

- **Unit tests**: 90/90 pass (`npm test`) — 25 new in `locales.test.ts` covering locale-map
  discrimination, row splitting (incl. overlay-only arrays, en-null field deletion, item-id
  stripping), emit-version rule (2 vs 3, incl. via `buildSingleCollectionArchive`), and — via
  `importFromArchive` on a mock payload — the write shapes:
  - bilingual row → one `update(locale:'en', data=EN row)` + one `update(locale:'id', data=overlay fields ONLY)`
  - **EN-only archive → zero locale-'id' writes** (the non-clobber guarantee, asserted)
  - dry-run → zero writes, overlays counted
  - create path → `create(locale:'en')` then overlay on the fresh id
- **Real-DB E2E** (the proof that matters):
  1. `npm run export` on the dev DB (seeded with probe translations) → manifest `schemaVersion: 3`,
     article/project rows carry correct `locales.id` (title, seo.metaTitle, features array),
     bodies exported as Markdown.
  2. **Clobber test**: imported the old EN-only v2 zip over it → all ID values survived intact
     (`{"en":"Setup Repo with Agent Skill","id":"Judul ID"}` etc.). EN-only publishes cannot
     destroy translations.
  3. Re-imported the v3 zip → clean, 0 errors.
- **Replace-only × locale** (task 2.4): drift deletion is uuid-based and untouched — only rows
  *absent from git* are deleted; surviving rows keep their other-locale values via the same
  per-locale write isolation proven above. Exercised end-to-end in Phase 3's dry-run.
- **Build**: `npm run build` clean (typechecks the migration, engine, admin client).
- **Admin**: `/admin/data-sync` 200; `/api/data-import` still auth-gated (401 unauthenticated).
- Probe translations were cleaned from the dev DB after testing (pristine EN state).

## 3. Key decisions

| Decision | Reason |
|---|---|
| EN stays at the top level; overlays additive | Every v2 code path (refs, self-refs, drift pass, wrap tools) keeps working; old tools reading new archives see familiar data |
| Explicit `locale: 'en'` on localized writes | Makes write-targeting provable rather than default-dependent |
| Overlay = separate targeted update per locale, fields present only | Payload never writes absent fields → the non-clobber guard needs no diffing |
| Conditional emit version (2/3) | An EN-only publish zip remains importable by the currently-deployed prod importer |
| Lazy editor-config init | Perf (non-body imports skip the expensive Lexical build) + enables mock-payload `importFromArchive` tests |
| Array-item ids stripped on export | DB-local ids must never cross environments (features rows carry them) |

## 4. Files touched

`locales.ts` + `locales.test.ts` (new), `keys.ts`, `types.ts`, `manifest.ts`, `export.ts`,
`import.ts`, `single.ts`, `cli/import.ts`, `admin/DataSyncClient.tsx`
