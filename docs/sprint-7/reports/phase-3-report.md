# Phase 3 Report — Targeted seed scripts

> Completed: 2026-07-14

---

## 1. What was done

Created four targeted seed entry points and added npm scripts:

| Script | Runs | Entry point |
|--------|------|-------------|
| `npm run seed:articles` | Tags + Authors + Articles | `seed/articles.ts` |
| `npm run seed:projects` | Technologies + Projects | `seed/projects.ts` |
| `npm run seed:documents` | Categories + Documents | `seed/documents.ts` |
| `npm run seed:social` | Social profiles + Globals (site-config, home, nav) | `seed/social.ts` |
| `npm run seed:all` | Everything (same as `npm run seed`) | `seed.ts` |

Each targeted script initializes Payload, calls the phase function, and exits. All use the same idempotent logic — running `seed:articles` twice produces no duplicates.

## 2. How to use

```bash
# Add a new article:
# 1. Edit backend/src/seed/data/articles.ts — add to ARTICLES + ARTICLE_BODIES
# 2. npm run seed:articles
# 3. Restart backend

# Add a new project:
# 1. Edit backend/src/seed/data/projects.ts — add to PROJECTS + PROJECT_BODIES
# 2. npm run seed:projects
# 3. Restart backend
```

## 3. Verification

- `npm run seed:articles` seeds only articles — documents and projects untouched
- `npm run seed:projects` seeds only projects — articles and social untouched
- All scripts are idempotent on re-run
