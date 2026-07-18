# Sprint 7 — Final Report

> Status: ✅ Delivered | 2026-07-14
> Audience: sprint-8 context. Read this + [`../../AGENTS.md`](../../AGENTS.md) before starting sprint-8.

---

## 1. Sprint goal & outcome

Split the monolithic 433-line `seed.ts` into modular per-domain files with targeted npm scripts, fixed the default secret problem, and added a deploy helper — making content authoring frictionless and deployment predictable.

## 2. Final structure

```
backend/src/seed/
├── data/
│   ├── articles.ts          # TAGS, AUTHORS, ARTICLES, ARTICLE_BODIES
│   ├── documents.ts         # CATEGORIES, DOCUMENTS
│   ├── globals.ts           # SITE_CONFIG, HOME, NAV
│   ├── projects.ts          # PROJECTS, PROJECT_BODIES + SeedProject type
│   ├── social.ts            # SOCIAL_PROFILES
│   └── technologies.ts      # TECHNOLOGIES
├── lib/
│   ├── lexical.ts           # Lexical types + helpers (lexicalText, lexicalParagraph, etc.)
│   └── idempotent.ts        # findOrCreate helper
├── phases/
│   ├── documents.ts         # seedDocuments(payload)
│   ├── articles.ts          # seedArticles(payload)
│   ├── projects.ts          # seedProjects(payload)
│   └── social-globals.ts    # seedSocial, seedGlobals, seedSocialAndGlobals
├── articles.ts              # Targeted entry: npm run seed:articles
├── projects.ts              # Targeted entry: npm run seed:projects
├── documents.ts             # Targeted entry: npm run seed:documents
├── social.ts                # Targeted entry: npm run seed:social
└── seed.ts                  # Main orchestrator: npm run seed

scripts/
└── deploy.sh                # Build + seed + PM2 guide

backend/
├── .env.example             # Documented env vars
└── package.json             # New scripts: seed:articles, seed:projects, seed:documents, seed:social, seed:all
```

## 3. Scripts reference

| Script | Seeds | File edited to add content |
|--------|-------|---------------------------|
| `npm run seed:articles` | Tags, Authors, Articles | `seed/data/articles.ts` |
| `npm run seed:projects` | Technologies, Projects | `seed/data/projects.ts` |
| `npm run seed:documents` | Categories, Documents | `seed/data/documents.ts` |
| `npm run seed:social` | Social profiles, SiteConfig, Home, Nav | `seed/data/social.ts` + `seed/data/globals.ts` |
| `npm run seed` / `seed:all` | Everything | Any of the above |

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| Data and runner logic in separate files | Data is what you edit; runner is plumbing |
| Phase functions accept only `Payload` | Clean separation — no shared state between phases |
| `PAYLOAD_SECRET` keeps its dev fallback | Local dev should work without env setup. Deploy script validates it |
| `.env.example` uses placeholders | Explicit about what's needed without exposing real values |

## 5. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 — Split seed data | 8 | ✅ |
| 2 — Split seed runner | 6 | ✅ |
| 3 — Targeted scripts | 5 | ✅ |
| 4 — Security & deploy prep | 4 | ✅ |
| **Total** | **23** | ✅ |

> 📄 Full reports: [`reports/`](./reports/)

## 6. Verification

- `npm run seed` produces identical output to pre-refactor
- `npm run seed:articles` seeds only articles — other collections untouched
- Running any seed command twice produces no duplicate records
- `scripts/deploy.sh` validates `.env` and builds both services
- `npx astro build` succeeds against seeded backend

## 7. Sprint-8 handoff

- Git-based content workflow (Option B — markdown files with frontmatter)
- CI/CD pipeline (GitHub Actions)
- Actual VPS provisioning (nginx config, SSL, PM2)
- Markdown-to-Lexical converter
