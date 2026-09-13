# Task Breakdown — Sprint-25: The Indonesian Zone

> Status: ✅ Delivered | Created: 2026-09-13
> Companion: [`plan.md`](./plan.md) · previous: [`../sprint-24/final-report.md`](../sprint-24/final-report.md)
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery

| ID  | Task                                                                                     | Difficulty | Dependencies | Status |
|-----|------------------------------------------------------------------------------------------|------------|--------------|--------|
| 0.1 | Read pages/layout/components; lock the shared-component + route-refactor design          | Easy       | —            | ✅      |

> 📄 Design locked in [`plan.md`](./plan.md) §3 (shared `.astro` page components, thin route
> wrappers, translated-probe strategy, static switcher, sitemap `serialize`).

---

## Phase 1 — Data Layer

| ID  | Task                                                                                     | Difficulty | Dependencies | Status |
|-----|------------------------------------------------------------------------------------------|------------|--------------|--------|
| 1.1 | `lib/i18n.ts`: locale query builder, `localePath`, translation helpers                   | Easy       | 0.1          | ✅      |
| 1.2 | Svelte cards (`BlogFilter`, `ProjectGrid`) gain a `base` link prop (default `''`)         | Easy       | 0.1          | ✅      |

---

## Phase 2 — `/id/` Routes

| ID  | Task                                                                                     | Difficulty | Dependencies | Status |
|-----|------------------------------------------------------------------------------------------|------------|--------------|--------|
| 2.1 | Refactor blogs list+detail into shared components (locale prop)                          | Medium     | 1.1          | ✅      |
| 2.2 | Refactor projects list+detail into shared components (locale prop)                       | Medium     | 1.1          | ✅      |
| 2.3 | `/id/` routes (4) + untranslated detail → 301 to EN + translated-only lists + empty states | Medium     | 2.1, 2.2     | ✅      |

---

## Phase 3 — Switcher

| ID  | Task                                                                                     | Difficulty | Dependencies | Status |
|-----|------------------------------------------------------------------------------------------|------------|--------------|--------|
| 3.1 | `LangSwitcher.astro` (static EN|ID pill) + CSS, placed on list header + detail title     | Easy       | 2.3          | ✅      |

---

## Phase 4 — SEO

| ID  | Task                                                                                     | Difficulty | Dependencies | Status |
|-----|------------------------------------------------------------------------------------------|------------|--------------|--------|
| 4.1 | BaseLayout: `lang` prop (`<html lang>`), `alternates` prop (hreflang links)              | Easy       | 2.3          | ✅      |
| 4.2 | Wire hreflang pairs (en↔id + x-default→EN) on the 4 content page types                   | Easy       | 4.1          | ✅      |
| 4.3 | Sitemap `serialize` → xhtml:link alternates on the 4 static entries                      | Easy       | 4.1          | ✅      |

---

## Phase 5 — Content Translations

| ID  | Task                                                                                     | Difficulty | Dependencies | Status |
|-----|------------------------------------------------------------------------------------------|------------|--------------|--------|
| 5.1 | Translate 4 remaining articles (`article.id.{md,json}` via SKILLS.md step 3b)            | Medium     | —            | ✅      |
| 5.2 | Translate 5 projects (`project.id.{md,json}`)                                            | Medium     | —            | ✅      |
| 5.3 | `wrap:publish` dry-runs + local import of the bilingual sets; route verification          | Medium     | 5.1, 5.2, 2.3 | ✅     |

---

## Phase 6 — Wrap-up

| ID  | Task                                                                                     | Difficulty | Dependencies | Status |
|-----|------------------------------------------------------------------------------------------|------------|--------------|--------|
| 6.1 | Full verification: frontend `tsc --noEmit` + build; backend untouched (tests still green)| Easy       | all          | ✅      |
| 6.2 | Route verification via dev server + curl (both locales, 301, hreflang)                   | Medium     | 2.3, 4.2     | ✅      |
| 6.3 | Docs: `final-report.md`, root `AGENTS.md` (§4 pages + §6 sprint row), prod publish notes  | Easy       | 6.2          | ✅      |

---

## Dependency Graph

```
0.1 ──► 1.1 ──► 2.1 ──┐
              └► 2.2 ──┼──► 2.3 ──► 3.1
        1.2 ──────────┘        │
                                ├──► 4.1 ──► 4.2
                                │        └─► 4.3
5.1 ──┐                         │
5.2 ──┴──► 5.3 ◄────────────────┘
all ──► 6.1 ──► 6.2 ──► 6.3
```

## Summary

| Phase                | Tasks | Est. Hours | Status |
|----------------------|-------|-----------|--------|
| 0 — Discovery        | 1     | 1h        | ✅      |
| 1 — Data layer       | 2     | 1h        | ✅      |
| 2 — /id/ routes      | 3     | 5h        | ✅      |
| 3 — Switcher         | 1     | 1h        | ✅      |
| 4 — SEO              | 3     | 2h        | ✅      |
| 5 — Translations     | 3     | 5h        | ✅      |
| 6 — Wrap-up          | 3     | 2h        | ✅      |
| **Total**            | **16**| **~17h**  |        |
