# Phase 12 Report — List/detail tweaks (projects, blogs) per DESIGN.md

> Completed: 2026-07-19 · Trigger: owner request.

---

## 1. Project list — year beside descriptor (12.1)

`ProjectGrid.svelte` card: the year was in the header next to the title
(`<span class="card-date">{year}</span>`). Removed it from the header and joined it to
the descriptor in the footer:
```svelte
<span class="text-xs text-desc">{[p.descriptor, p.year].filter(Boolean).join(' · ')}</span>
```
→ renders e.g. `Personal · OSS · 2025`. Title row now holds only the title.

## 2. Blog list — de-duplicate date, move read-est (12.2)

`BlogFilter.svelte`: the date appeared twice (meta row + footer "Published"). Removed
the meta-row date and restructured the meta row to a `space-between` flex so **tags sit
left, read-est sits top-right**:
```svelte
<div class="blog-card-meta">
  <div class="blog-card-tags">{#each tags ...}<span class="tag is-secondary">{name}</span>{/each}</div>
  {#if readMinutes}<span class="meta-item read-est"><Icon icon="solar:clock-circle-linear" .../> {readMinutes} min</span>{/if}
</div>
```
Footer keeps the single "Published {date}". CSS: `.blog-card-meta { ...; justify-content: space-between }` + `.blog-card-tags` + `.read-est { flex-shrink:0; white-space:nowrap }`.

## 3. Blog detail — related by shared tags (12.3)

The old logic used `article.relatedArticles` (a manual ID list that was always empty in
the seed/DB), so the sidebar was always empty. Now derives related from **tag overlap
(tech stack)**:
```ts
const all = await safeFetch('/articles?where[status][equals]=published&sort=-publishedAt&depth=1');
const article = all.docs.find(a => a.slug === slug);
const tagIds = new Set(article.tags.map(t => t.id));
const relatedArticles = all.docs
  .filter(a => a.slug !== slug)
  .map(a => ({ a, shared: a.tags.filter(t => tagIds.has(t.id)).length }))
  .filter(x => x.shared > 0)
  .sort((a, b) => b.shared - a.shared)
  .slice(0, 5).map(x => x.a);
```
Bonus: one fetch (all articles) instead of two; deterministic; degrades to empty if no
tag overlap.

## 4. Blog detail — author box revamp (12.4, Notion)

Old: muted-grey box, 16px radius, centered, 48px avatar. Revamped to the Notion language:
- Surface `--n-canvas` (white / dark-`--card`), `--n-hairline` border, **12px** radius
  (`rounded.lg`), 24px padding, top-aligned.
- **56px circular** gradient avatar (`rounded.full`).
- Name 18px/700 (`--n-ink`); role as a **12px/600 uppercase eyebrow** (`--n-steel`);
  bio 14px/1.55 (`--n-slate`).

New markup classes: `.author-card`, `.author-avatar`, `.author-info`, `.author-name`,
`.author-role`, `.author-bio` (replaces the generic `.avatar` usage).

## 5. Test Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ exit 0 |
| `npm run build` | ✅ Complete! |
| project card header `card-date` | ✅ 0 (year moved to footer) |
| project footer | ✅ `Personal · OSS · 2025` |
| blog meta calendar icons | ✅ 0 (date removed beside tags) |
| blog read-est (top-right) | ✅ 6 present |
| blog footer date | ✅ kept |
| blog detail related sidebar | ✅ populated (1 by shared tags — was always empty) |
| author box | ✅ `author-avatar` (Notion revamp) |
| runtime errors | ✅ none |

## 6. Notes

- Related-by-tags count depends on actual tag overlap in the content; with the current
  articles it yields 1 related for the tested article (correct, not a bug — add more
  shared tags in `/admin` to surface more).
- Author card uses global `--n-*` tokens (defined on `:root`/`.dark`), so it's
  Notion-styled on the (non-home) blog detail page too, including dark mode.
