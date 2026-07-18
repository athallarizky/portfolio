# Sprint-7 Plan — Seed Refactor & Deploy Prep

> Status: 🟡 Planning | Created: 2026-07-14
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-6/final-report.md`](../sprint-6/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-6 delivered a polished frontend with feature flags, pagination, a11y fixes, and CMS-driven content. The backend seed file (`backend/src/seed.ts`) grew to 433 lines as content accumulated: 6 projects, 6 articles, 6 documents, 7 social profiles, 3 globals, plus their relationships and Lexical bodies — all in one monolithic file.

Adding a new article today means scrolling past 150 lines of unrelated project data to find the `ARTICLES` array, then past another 100 lines of `PROJECT_BODIES` to find `ARTICLE_BODIES`. The structure works but it's organizational debt. Sprint-7 splits the seed into manageable per-domain files, adds targeted seed commands, fixes the dev-secret-default problem, and prepares the repo for VPS deployment.

## 1. Sprint goal

Split `seed.ts` into modular per-domain seed files with targeted npm scripts, fix the default secret, and add a deploy helper — making content authoring frictionless and deployment predictable.

## 2. Scope

**In scope:**
- Split `seed.ts` data into `seed/data/*.ts` — one file per domain (articles, projects, documents, social, globals, technologies)
- Split the `seed()` runner into phase functions in `seed/phases/*.ts`
- Lexical helpers into `seed/lib/lexical.ts`
- Add targeted npm scripts: `seed:articles`, `seed:projects`, `seed:all`
- Fix `PAYLOAD_SECRET` — remove `dev-secret-change-me` fallback; read from env only; fail fast if missing
- Add `backend/.env.example` with documented vars
- Add `scripts/deploy.sh` — builds both services, seeds DB, starts with PM2
- Keep `seed.ts` as the main entry point that orchestrates the split modules (no breaking change to `npm run seed`)

**Out of scope:**
- CI/CD pipeline (GitHub Actions, etc.)
- Markdown-to-Lexical converter (Option B — candidate for sprint-8)
- Git-based content authoring (MVC — candidate for sprint-8)
- Actual VPS provisioning or nginx config
- Database migration (SQLite→Postgres)
- Image/media support in seed

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Data and runner logic go in separate files (`seed/data/` vs `seed/phases/`) | Data files are what you edit when adding content. Runner files are plumbing — rarely touched |
| Targeted scripts use the same idempotent logic | `seed:articles` runs only the articles phase, finding existing records by slug, skipping them. Safe to run repeatedly |
| `PAYLOAD_SECRET` enforced at startup, not seed time | Payload validates it on boot. Removed the `|| 'dev-secret-change-me'` fallback in `payload.config.ts` |
| Lexical helpers stay in TypeScript, not a runtime parser | We're not building a markdown converter yet. Keep the JS-based authoring for now |
| `seed.ts` stays as the orchestrator | `npm run seed` still works. All data files are imported and passed to the same phase functions |

## 4. Phasing

- **Phase 1 — Split seed data:** Extract data arrays into `seed/data/*.ts`, one file per domain. Lexical helpers into `seed/lib/lexical.ts`. Verify existing `npm run seed` still works.
- **Phase 2 — Split seed runner:** Extract phase functions into `seed/phases/*.ts`. Each function accepts a Payload instance and its domain data. Verify idempotency is preserved.
- **Phase 3 — Targeted scripts:** Add `seed:articles`, `seed:projects`, `seed:documents`, `seed:social`, `seed:globals` to `package.json`. Each runs only its phase.
- **Phase 4 — Security & deploy prep:** Remove default secret fallback. Add `.env.example`. Add `scripts/deploy.sh`. Verify build + start works end-to-end.

## 5. Verification

1. `npm run seed` from `backend/` produces identical output to pre-refactor
2. `npm run seed:articles` inserts only articles — other collections untouched
3. Running any seed command twice produces no duplicate records
4. `PAYLOAD_SECRET=test npx tsx src/seed.ts` runs; `npx tsx src/seed.ts` without the env var fails
5. `./scripts/deploy.sh` builds both services and starts them
6. `npx astro build` in frontend succeeds against the seeded backend
