# Phase 3 Report — Publish Pipeline Bilingual

> Completed: 2026-09-13 · Follows [`phase-2-report.md`](./phase-2-report.md)

---

## 1. What was built

**The `*.id.json` sibling contract** — a translation lives next to its source row, carrying the
same identity, containing localized fields only:

```
tools/article-polish/content/<slug>/article.json      ← EN row (unchanged, v2 shape)
tools/article-polish/content/<slug>/article.id.json   ← optional ID overlay
tools/repo-to-project/content/<slug>/project.json     ← EN row
tools/repo-to-project/content/<slug>/project.id.json  ← optional ID overlay
```

`article.id.json` shape (identity keys validated against the EN row, then stripped):

```jsonc
{ "uuid": "<same as EN>", "slug": "<same>",
  "title": "…", "excerpt": "…", "body": "# markdown…", "seo": { "metaTitle": "…" } }
```

| Piece | Change |
|---|---|
| `locales.ts` | `validateOverlayRow` — localized fields only (top-level + seo subfields); catches authoring typos before they ride into an archive |
| `single.ts` | `attachOverlaySibling` — loads `<base>.id.json`, checks uuid+natural-key identity, validates fields, merges as `row.locales.id`; wraps validation errors as `SingleArchiveError` (clean CLI messages) |
| `cli/wrap-publish.ts` | attaches siblings for every source row; manifest version via the 2/3 emit rule; output reports `id overlays: n/total [slugs]` |
| `cli/wrap-articles.ts` / `cli/wrap-projects.ts` | single-row inputs auto-attach their sibling |
| `insert-one` / admin "Add from JSON" | unchanged — rows with inline `locales` already flow through `buildSingleCollectionArchive` + `importFromArchive` |

## 2. Verification (real DB, real commands)

1. **EN-only publish** (`wrap:publish -- --articles`, no siblings): manifest **v2**, 4 rows, no
   overlays, dry-run clean → the deployed prod importer keeps working for EN-only publishes.
2. **Bilingual publish** (temp `article.id.json` with matching uuid+slug): `id overlays: 1/4`,
   manifest **v3**, row carries `locales.id` (title/excerpt/body-md); dry-run reports
   `locale overlays: {articles: 1}`.
3. **Real scoped-replace import** (`--replace-only articles`): 0 errors, overlay written,
   zero drift deleted (all 4 articles present in git).
   - `GET /api/articles?…locale=id` → **"Setup Repo dengan Agent Skill"** + Indonesian excerpt
   - `GET …locale=en` → English title untouched
   - This run also proves task 2.4 end-to-end: replace-only drift deletion is uuid-based and
     orthogonal to locales — surviving rows keep their translations.
4. Unit tests: 98/98 (8 new: overlay validation ×4, sibling attach ×4).
5. Temp sibling + dev-DB test values removed after verification (pristine state).

## 3. Notes

- A sibling whose uuid/slug doesn't match its EN row is **refused** at wrap time — a
  translation can never silently attach to the wrong record.
- `wrap:publish` refuses `*.id.json`-less rows nothing — ID stays optional per row
  (EN-canonical, progressive translation policy).
