# Phase 13 Report — Polish: project-card footer alignment + blog detail consistency

> Completed: 2026-07-19 · Trigger: owner request (1 fix + blog-detail phase).

---

## 1. Project list — pin footer to card bottom (13.1, fix)

The card's bottom row (`descriptor · year` + link icons) sat a little higher on cards
with a 1-line excerpt than on cards with a 2-line excerpt, so the footers in a grid row
didn't align. Fix: the card already is `display: flex; flex-direction: column`, and
`.grid-3` stretches items to the row height — so a single rule pins the footer down.

`ProjectGrid.svelte` — added a modifier class:
```svelte
<article class="card is-hoverable project-card">
```

`styles.css`:
```css
/* pin the project-card footer (descriptor·year + link icons) to the card bottom
   so cards in the same grid row align regardless of excerpt length */
.project-card > .card-footer { margin-top: auto; padding-top: 14px; }
```

`margin-top: auto` absorbs the leftover row space (pushing the footer to the bottom on
shorter cards); `padding-top: 14px` preserves a minimum gap on the tallest card (where
`auto` resolves to 0). Scoped to project cards only — the single-column blog cards are
unaffected.

## 2. Blog detail — tag chips sized like tech-stack chips (13.2)

`blogs/[slug].astro` — tag chips now carry the `.tech-chip` class used by the project
detail Tech stack section:
```astro
<span class="tag is-secondary tech-chip">{t.name}</span>
```
→ matches the project chip sizing (padding 5px 11px, 13px, weight 500, 6px gap). Blog
`Tag` has no `icon` field, so no icon is rendered.

## 3. Blog detail — "All articles" moved to the Related sidebar (13.3)

Mirrors what Phase 10 did for project detail. Removed the top-nav back-link:
```astro
<!-- removed -->
<a class="back-link" href="/blogs" slot="headerRight">…All articles</a>
```
and added a primary+bold "All articles" link at the bottom of the Related articles
sidebar (same pattern as project detail's "All projects"):
```astro
<a class="all-articles-link" href="/blogs">
  All articles
  <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14"></iconify-icon>
</a>
```

`styles.css` — the shared rule now covers both detail flavors:
```css
.all-projects-link,
.all-articles-link {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 4px;
  margin-top: 10px; padding-top: 10px;
  font-size: 13px; font-weight: 700; color: var(--secondary);
  border-top: 1px solid var(--border);
}
.all-projects-link:hover,
.all-articles-link:hover { text-decoration: underline; }
```

## 4. `/blogs` search placeholder (13.4)

`BlogFilter.svelte` — placeholder changed from `Search articles…` (ellipsis) to
`Search articles`, matching the projects search input (`Search projects`, no ellipsis).

## 5. Test Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ exit 0 |
| `npm run build` | ✅ Complete! |
| `/blogs` search placeholder | ✅ `Search articles` |
| blog detail header `back-link`/`headerRight` | ✅ 0 (removed) |
| blog detail `tech-chip` tags | ✅ present (2 on the tested article) |
| blog detail sidebar `all-articles-link` | ✅ 1 (moved from header) |
| `/projects` `project-card` count | ✅ 6 |
| project footers aligned (CSS) | ✅ `margin-top:auto` rule in place |
| runtime errors | ✅ none |

## 6. Notes

- Footer alignment is a CSS layout effect (cards stretch to the tallest in the row via
  `.grid-3`'s default `align-items: stretch`); the markup (`project-card` + `card-footer`
  on every card) is verified, and the rule is correct. Final pixel-level alignment is
  confirmed visually in the browser.
- The `.all-projects-link`/`.all-articles-link` rule is the single source of truth for
  the detail-sidebar "see all" link; both detail pages now use the same pattern.
