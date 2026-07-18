# Phase 1 Report — Split seed data

> Completed: 2026-07-14

---

## 1. How to Run

```bash
cd backend
npm run seed        # still works — re-exports from split files
```

## 2. What was done

Extracted all data arrays and Lexical helpers from `seed.ts` (433 lines) into domain-specific files under `backend/src/seed/`:

```
backend/src/seed/
├── data/
│   ├── articles.ts      # TAGS, AUTHORS, ARTICLES, ARTICLE_BODIES
│   ├── documents.ts     # CATEGORIES, DOCUMENTS
│   ├── globals.ts       # SITE_CONFIG, HOME, NAV
│   ├── projects.ts      # PROJECTS, PROJECT_BODIES + SeedProject interface
│   ├── social.ts        # SOCIAL_PROFILES
│   └── technologies.ts  # TECHNOLOGIES
├── lib/
│   ├── lexical.ts       # LexicalText, LexicalParagraph, LexicalHeading, LexicalCode, LexicalRoot types + helpers
│   └── idempotent.ts    # findOrCreate helper (Phase 2)
└── phases/              # (Phase 2)
```

`seed.ts` was rewritten as a 20-line orchestrator that imports from the split files and calls phase functions in order.

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Data files are separate from runner files (`data/` vs `phases/`) | Data is what you edit to add content. Runner logic is plumbing — rarely touched |
| Lexical helpers exported as typed functions with full TypeScript interfaces | Phase functions and data files both import them. Types prevent mismatches between phases |
| `SeedProject` interface added | Projects had the most complex shape; typing ensures no field drift between data and the runner |

## 4. Verification

- `npm run seed` produces identical console output to pre-refactor
- Re-running skips existing records (idempotent)
- Existing `payload.db` untouched — no data loss
