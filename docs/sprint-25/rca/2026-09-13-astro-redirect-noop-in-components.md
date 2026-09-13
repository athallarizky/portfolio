# RCA — Astro.redirect() is a silent no-op inside a component

> **Date:** 2026-09-13 · **Severity:** Medium · **Component:** frontend routes (sprint-25 `/id/` zone)
> **Status:** ✅ Resolved

## 1. Summary

Calling `Astro.redirect()` in an **Astro component's** frontmatter (as opposed to a page's)
does nothing — the redirect is silently dropped and the page renders as 200. Root cause:
`Astro.redirect` only takes effect when returned from a top-level page/module context Astro
treats as a response handler; inside a component the returned `Response` is discarded during
rendering. Found when the `/id/<slug>` untranslated→EN 301s (and even the pre-existing
`/404` redirects, which the refactor had moved into components) returned 200.

## 2. Impact

Dev-only (caught before any deploy): untranslated `/id/` URLs rendered EN content at an `/id/`
URL (duplicate-content risk), and nonexistent slugs rendered instead of 404-ing. No prod
exposure — verified during sprint-25 phase-2 route battery.

## 3. Symptoms (observed)

| Signal | Value |
|---|---|
| `curl -I /id/blogs/workflow-sprint-driven-development` (untranslated, pre-translation) | `200`, no `Location` header — expected `301 → /blogs/…` |
| `curl -I /blogs/nonexistent` | `200` — expected `302 → /404` (worked pre-refactor when the call lived in the page) |
| Server log | clean — no error, no warning |

## 4. Timeline

| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | Re-run curl with `--max-redirs 0` to rule out a followed redirect | still 200, empty `redirect_url` | the cause is real |
| 2 | Suspect stale dev-server compile; re-curl with a cache-buster `?cb=` | unrelated switcher issue cleared, redirect still missing | red herring |
| 3 | Move the same `Astro.redirect()` call from the component into the route file | 301/302 fire correctly | the cause |

## 5. Root cause

`Astro.redirect()` is only honored where Astro treats the return value as the page response
(page/route frontmatter). In a component, the frontmatter `return` merely ends the component's
setup and the generated `Response` is discarded — **silently**. The refactor into shared
page components (`components/pages/*.astro`) had moved all redirect logic (404 + untranslated
301) out of route files into components.

Evidence: sprint-25 diff — `pages/blogs/[slug].astro` (pre-refactor, redirect worked) vs the
first `components/pages/BlogDetailPage.astro` (redirect present, never fired); behavior
flipped back the moment the call moved into `pages/id/blogs/[slug].astro`.

## 6. The fix

Architecture, not a patch:

- `src/lib/content.ts` — loaders (`loadArticleDetail` / `loadProjectDetail`) fetch + classify:
  `not-found` | `untranslated` | `ok`
- Route files own the decisions: `return Astro.redirect('/404')` /
  `return Astro.redirect(\`/blogs/${slug}\`, 301)`
- Components (`components/pages/*`) are pure presentation taking props

```diff
- // component frontmatter
- if (!article || !translated) return Astro.redirect(`/blogs/${slug}`, 301);
+ // route frontmatter
+ const data = await loadArticleDetail('id', Astro.params.slug);
+ if (data.status === 'untranslated') return Astro.redirect(`/blogs/${Astro.params.slug}`, 301);
```

## 7. Verification

| Check | Before | After |
|---|---|---|
| `/id/blogs/<untranslated>` | 200 | **301 → `/blogs/<slug>`** |
| `/blogs/nonexistent` | 200 | **302 → `/404`** (pre-sprint behavior restored) |
| All 9 translated `/id/` details | 200 | 200 |

## 8. Why it was hard to find (contributing factors)

- **Silent failure** — no log line, no error boundary; the page just renders.
- The refactor looked innocent: frontmatter logic "moved" verbatim into a file with the same
  `.astro` extension and the same imports.
- One earlier probe in the same battery had a *separate* stale-compile false signal
  (switcher appearing on an untranslated page), which briefly pointed at caching instead.

## 9. Lessons & action items

- [x] Rule captured in sprint-25 final-report §4 + AGENTS.md sprint-25 row:
  *routes own redirects; components render.*
- [ ] (optional follow-up) A tiny ESLint/CI grep rule that flags `Astro.redirect` in
  `src/components/**` would make this class of bug impossible to reintroduce.

## 10. References

- Astro docs — `Astro.redirect` (pages API)
- `frontend/src/lib/content.ts`, `frontend/src/pages/id/**`, `frontend/src/components/pages/**`
