# Phase 9 Report — Project detail: header + stats removal + tech stack

> Completed: 2026-07-19 · Trigger: owner request (3 changes on the project detail page).

---

## 1. Changes

### (1) Descriptor / year no longer beside the title
`projects/[slug].astro` header: replaced the `.detail-meta` flex row (title + subtitle
side-by-side) with stacked block elements — title on top, `descriptor · year` below.
Also removed the tech chips that were in the header (they move to the Tech stack section).

### (2) Stats section removed from the backend
The `statsFooter` array field (`{value, label}[]`) is gone:
- `backend/src/collections/Projects.ts` — field definition removed
- `backend/src/seed/data/projects.ts` — `SeedProject.statsFooter?` + all 5 seed arrays
- `backend/src/seed/phases/projects.ts` — writer mapping removed
- `backend/src/payload-types.ts` — regenerated (`npm run generate:types`); `statsFooter` gone from `Project` + `ProjectsSelect`
- `frontend/src/lib/api-types.ts` — `Project.statsFooter` removed
- `projects/[slug].astro` — stats card section removed

(SQLite needs no migration; the column is orphaned and harmless.)

### (3) Tech stack section added
New `.project-section` after the intro prose, before Features:
```astro
{project.techTags.length > 0 && (
  <section class="project-section mt-4">
    <h3>Tech stack</h3>
    <div class="flex flex-wrap gap-1">
      {project.techTags.map((t) => (
        <span class="tag is-secondary tech-chip">
          {t.icon && <iconify-icon icon={t.icon} width="14" height="14"></iconify-icon>}
          {t.name}
        </span>
      ))}
    </div>
  </section>
)}
```
- **No new backend field** — `techTags` is already a relationship to the
  `technologies` collection (i.e. chips "defined inside the db"). The `Technology`
  type carries an `icon` field, so each chip renders its icon if the owner sets one
  in `/admin` (the seed defines tech by name only — forward-compatible).
- Added `.tech-chip` CSS (slightly larger chip, icon in `--secondary`).

## 2. Test Results

| Check | Result |
|-------|--------|
| backend `npm run build` | ✅ clean (after field removal) |
| `npm run generate:types` | ✅ `statsFooter` gone, no spurious diffs |
| frontend `tsc --noEmit` | ✅ exit 0 |
| frontend `npm run build` | ✅ Complete! 902 ms |
| `statsFooter` in live code | ✅ none (only in dead `data/projects.ts` mock) |
| Tech stack section | ✅ present (`<h3>Tech stack</h3>` + `.tech-chip`) |
| Title/subtitle stacked | ✅ `.detail-meta` removed; `.detail-title` + `.detail-subtitle` as separate blocks |

> Dev servers were down during this phase, so no runtime curl. Builds are
> authoritative; visual check (stacked subtitle, chip styling) pending a browser.

## 3. Notes

- `frontend/src/data/*.ts` (projects, articles, …) are **dead mock files** (zero
  imports — same as the `home.ts` removed in Phase 4.6). They're untyped, so the
  lingering `statsFooter` literals don't break the build. Optional cleanup.
- The blog detail still uses `.detail-meta` (title + subtitle side-by-side);
  unchanged — owner's complaint was project-specific.
