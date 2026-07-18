# Phase 2 Report — Split seed runner

> Completed: 2026-07-14

---

## 1. What was done

Extracted phase runner logic from `seed.ts` into `seed/phases/`:

```
backend/src/seed/phases/
├── documents.ts      # seedDocuments(payload)
├── articles.ts       # seedArticles(payload) — tags + authors + articles
├── projects.ts       # seedProjects(payload) — technologies + projects
└── social-globals.ts # seedSocial(payload), seedGlobals(payload), seedSocialAndGlobals(payload)
```

Added `seed/lib/idempotent.ts` — a reusable `findOrCreate()` helper.

Each phase function accepts only a `Payload` instance. Data is imported from `seed/data/*.ts`. No phase depends on any other phase's output — they remain independently callable.

## 2. Key decisions

| Decision | Rationale |
|----------|-----------|
| Phase functions export individually, not as a single object | `seed.ts` imports and calls them explicitly. Targeted scripts import only their phase |
| `social-globals.ts` bundles `seedSocial` and `seedGlobals` together but also exports them separately | Social profiles are collection records; globals are singletons. Both are "Phase 4" but separable |
| `findOrCreate` typed as `(payload, collection, where, data) => Promise<number>` | Returns the ID whether newly created or found existing. Clean signature for relationship resolution |

## 3. Verification

- `npm run seed` produces identical output to Phase 1
- Re-running is idempotent across all phases
