# Task Breakdown — Sprint-24: Bilingual Content Layer

> Status: 🟡 Planning | Created: 2026-09-13
> Companion: [`plan.md`](./plan.md) · previous: [`../sprint-23/final-report.md`](../sprint-23/final-report.md)
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery & Spikes

> Run on a **copy** of `payload.db` — never the only DB.

| ID  | Task                                                                                                              | Difficulty | Dependencies | Status |
|-----|-------------------------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 0.1 | Copy `payload.db`; enable `localization` (en default, id, fallback) on the scratch copy; verify existing data lands as `en` values | Medium     | —            | ✅      |
| 0.2 | Probe REST locale behavior: `?locale=id` fallback shape + fallback-disable param (`fallback-locale=none` — verify exact spelling) → nulls for untranslated | Easy       | 0.1          | ✅      |
| 0.3 | Run the **current** data-sync export against localized fields; inspect the serialized shape (what breaks / what's dropped) | Medium     | 0.1          | ✅      |
| 0.4 | Check admin translator UX: locale switcher, per-field translated-state indicators                                    | Easy       | 0.1          | ✅      |
| 0.5 | Write `reports/phase-0-report.md` + locked v3 archive schema sketch                                                  | Easy       | 0.2, 0.3     | ✅      |

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)
>
> **Findings:** push drops old columns (no data migration) → export-before/push/import-after proven on the spike DB; `fallback-locale=none` → `null` (detection primitive works); `locale:'all'` → `{en,id}` objects; **per-locale writes never clobber** (Local API proof); by-catch: fixed a sprint-23 regression in the import CLI (bare `import -- <zip>` always refused).

---

## Phase 1 — Payload Localization (real schema)

| ID  | Task                                                                                                              | Difficulty | Dependencies | Status |
|-----|-------------------------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 1.1 | Add `localization` config to `payload.config.ts` (`en` default, `id`, `fallback: true`)                             | Easy       | 0.5          | ✅      |
| 1.2 | Articles: mark `title`, `excerpt`, `body`, `seo.metaTitle`, `seo.metaDescription` localized                          | Easy       | 1.1          | ✅      |
| 1.3 | Projects: mark `title`, `excerpt`, `body`, `features` (whole array), `seo.metaTitle`, `seo.metaDescription` localized | Easy       | 1.1          | ✅      |
| 1.4 | Migrate against a real DB copy; verify existing content reads identically as `en` (curl smoke: `/api/articles`, `/api/projects?locale=id`) | Medium     | 1.2, 1.3     | ✅      |
| 1.5 | `npm run refs:export` — output must be byte-identical (refs stay single-language)                                   | Easy       | 1.2          | ✅      |
| 1.6 | Generate the prod migration file (`npx payload migrate:create` vs the old-schema baseline) + verify it applies cleanly to a copy; commit for the VPS runbook | Medium     | 1.4          | ✅      |

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)
>
> **Findings:** real DB migrated via export→push→import (0 errors); migration file hand-written
> (repo has no migration history — `migrate:create` would emit full-schema-from-empty) and the
> full prod drill verified on a third DB; `_locale` on `projects_features` carries `DEFAULT 'en'`
> (data-preserving NOT NULL addition); `payload migrate` needs piped-y on DBs with a dev-push row.

---

## Phase 2 — Data-sync v3

| ID  | Task                                                                                                              | Difficulty | Dependencies | Status |
|-----|-------------------------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 2.1 | v3 archive types + `version.ts` bump; v3 reader with v1/v2 back-compat (precedent: sprint-15)                        | Medium     | 0.5          | ✅      |
| 2.2 | Export: emit per-locale values for localized fields (both locales when present)                                     | Medium     | 2.1          | ✅      |
| 2.3 | Import: per-locale deep-merge upsert + **non-clobber guard** — locale values absent from the archive are never written | Hard       | 2.1          | ✅      |
| 2.4 | Scoped replace-all × locale: drift deletion stays uuid-based; surviving rows keep their other-locale values          | Medium     | 2.3          | ✅      |
| 2.5 | Unit tests: both-locale round-trip, clobber-guard, v2 import, replace-only × locale                                 | Medium     | 2.2, 2.3, 2.4 | ✅     |
| 2.6 | Admin sanity: `/admin/data-sync` import card + `/api/data-import` still work end-to-end                             | Easy       | 2.3          | ✅      |

> 📄 Full report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)
>
> **Findings:** v3 = EN flat + `locales.id` overlay; 90/90 tests pass (25 new); real-DB E2E proved
> the clobber-guard (old EN-only v2 zip imported over translations → all ID values survived);
> EN-only emits still stamp v2 so the deployed prod importer keeps working; replace-only drift
> deletion stays uuid-based and locale-orthogonal.

---

## Phase 3 — Publish Pipeline Bilingual

| ID  | Task                                                                                                              | Difficulty | Dependencies | Status |
|-----|-------------------------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 3.1 | `wrap-articles` / `wrap-projects` / `insert-one`: read optional `<slug>.id.json` sibling; validate same uuid + slug as the EN row | Medium     | 2.1          | ✅      |
| 3.2 | `wrap-publish`: stamp bilingual rows into the full-set zip; refuse `*.id.json` rows lacking a stable uuid (same contract as EN) | Medium     | 3.1          | ✅      |
| 3.3 | End-to-end local dry-run: `wrap:publish --articles` / `--projects` → `import --dry-run`; verify per-locale plan output | Medium     | 3.2, 2.5     | ✅      |

> 📄 Full report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)
>
> **Findings:** `*.id.json` sibling contract implemented (identity-checked, localized-fields-only);
> EN-only publishes still emit v2; bilingual publish → v3 + overlay, real `--replace-only`
> import wrote the ID overlay with EN untouched (read back via REST in both locales). 98/98 tests.

---

## Phase 4 — Content Tools Emit ID

| ID  | Task                                                                                                              | Difficulty | Dependencies | Status |
|-----|-------------------------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 4.1 | `article-polish` SKILLS.md: optional translate stage (`draft.id.md` → polished → `article.id.json`); idempotent re-run per-locale | Medium     | 3.1          | ✅      |
| 4.2 | `repo-to-project` SKILLS.md: optional `project.id.json` generation; idempotent re-run per-locale                     | Medium     | 3.1          | ✅      |
| 4.3 | One manual test translation through the full toolchain (draft → `*.id.json` → zip → dry-run import → real import on dev DB) | Medium     | 4.1, 3.3     | ✅      |

> 📄 Full report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)
>
> **Findings:** both tools emit optional `*.id.{md,json}` overlays (SKILLS.md step 3b + READMEs);
> first real translation (setup-repo-with-agent-skills) verified through wrap → dry-run → import
> → REST read in both locales (md→Lexical overlay conversion proven on the real DB). By-catch:
> `.gitignore` would have silently ignored `article.id.*` — fixed before it bit the CI pipeline.

---

## Phase 5 — Wrap-up

| ID  | Task                                                                                                              | Difficulty | Dependencies | Status |
|-----|-------------------------------------------------------------------------------------------------------------------|------------|--------------|--------|
| 5.1 | Full verification: backend `npm run build && npm test`; frontend untouched but `tsc --noEmit && npm run build` clean | Easy       | all          | ✅      |
| 5.2 | Docs: `final-report.md` + root `AGENTS.md` §5 conventions (bilingual authoring, `*.id.json` contract)                | Easy       | 5.1          | ✅      |
| 5.3 | Sprint-25 handoff notes: REST locale probe results, `/id/` route plan, switcher + hreflang requirements              | Easy       | 5.2          | ✅      |

> 📄 Full report: [`final-report.md`](./final-report.md) · phases: [`reports/`](./reports/)
>
> **Findings:** backend build clean, 98/98 tests (stable across consecutive runs — one flaky
> tmpfile-collision fixed); frontend typecheck+build clean (untouched); final report + AGENTS.md
> §5 bilingual conventions + sprint-25 handoff written.

---

## Dependency Graph

```
Phase 0 (spikes, DB copy)
  0.1 ──► 0.2 ──┐
  0.1 ──► 0.3 ──┼──► 0.5
  0.1 ──► 0.4   │
                │
Phase 1         ▼
  0.5 ──► 1.1 ──► 1.2 ──► 1.4
              └──► 1.3 ──┘
  1.2 ──► 1.5
                │
Phase 2         ▼
  0.5 ──► 2.1 ──► 2.2 ──┐
          2.1 ──► 2.3 ──┼──► 2.5
          2.3 ──► 2.4 ──┘
          2.3 ──► 2.6
                │
Phase 3         ▼
  2.1 ──► 3.1 ──► 3.2 ──► 3.3 ◄── 2.5
                │
Phase 4         ▼
  3.1 ──► 4.1 ──┐
  3.1 ──► 4.2 ──┼──► 4.3 ◄── 3.3
                │
Phase 5         ▼
  all ──► 5.1 ──► 5.2 ──► 5.3
```

## Summary

| Phase                          | Tasks | Est. Hours | Status |
|--------------------------------|-------|-----------|--------|
| 0 — Discovery & spikes         | 5     | 3h        | ✅      |
| 1 — Payload localization       | 6     | 3h        | ✅      |
| 2 — Data-sync v3               | 6     | 8h        | ✅      |
| 3 — Publish pipeline bilingual | 3     | 4h        | ✅      |
| 4 — Content tools emit ID      | 3     | 4h        | ✅      |
| 5 — Wrap-up                    | 3     | 2h        | ✅      |
| **Total**                      | **26**| **~24h**  |        |
