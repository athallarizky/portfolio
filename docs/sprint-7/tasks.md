# Task Breakdown — Sprint-7: Seed Refactor & Deploy Prep

> Status: 🟡 Planning | Created: 2026-07-14
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 1 — Split seed data

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 1.1  | Create `seed/data/` — extract `TECHNOLOGIES` → `seed/data/technologies.ts`  | Easy       | —            | ✅     |
| 1.2  | Extract `CATEGORIES` + `DOCUMENTS` → `seed/data/documents.ts`               | Easy       | —            | ✅     |
| 1.3  | Extract `TAGS` + `AUTHORS` + `ARTICLES` + `ARTICLE_BODIES` → `seed/data/articles.ts` | Medium     | —            | ✅     |
| 1.4  | Extract `PROJECTS` + `PROJECT_BODIES` → `seed/data/projects.ts`             | Medium     | —            | ✅     |
| 1.5  | Extract `SOCIAL_PROFILES` → `seed/data/social.ts`                           | Easy       | —            | ✅     |
| 1.6  | Extract globals data (site-config, home, nav) → `seed/data/globals.ts`      | Easy       | —            | ✅     |
| 1.7  | Move lexical helpers → `seed/lib/lexical.ts`                                | Easy       | —            | ✅     |
| 1.8  | Rewire `seed.ts` to import from split files; verify `npm run seed` unchanged | Medium     | 1.1-1.7      | ✅     |

### Service Summary
- **Runtime:** Node.js (`npx tsx src/seed.ts`)
- **Files:** `backend/src/seed/data/*.ts` (new), `backend/src/seed/lib/lexical.ts` (new), `backend/src/seed.ts` (modified)
- **Key output:** same `npm run seed` behavior; data now lives in domain-specific files

> 📄 Report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Split seed runner

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 2.1  | Create `seed/phases/` — extract Phase 1 runner → `seed/phases/documents.ts` | Easy       | 1.8          | ✅     |
| 2.2  | Extract Phase 2 runner → `seed/phases/articles.ts`  | Medium     | 1.8          | ✅     |
| 2.3  | Extract Phase 3 runner → `seed/phases/projects.ts`  | Medium     | 1.8          | ✅     |
| 2.4  | Extract Phase 4 runner → `seed/phases/social-globals.ts`   | Easy       | 1.8          | ✅     |
| 2.5  | Create shared idempotency helper: `findOrCreate(collection, where, data)`   | Medium     | 2.1-2.4      | ✅     |
| 2.6  | Rewire `seed.ts` to call phase functions; verify `npm run seed` unchanged   | Medium     | 2.1-2.5      | ✅     |

### Service Summary
- **Runtime:** Node.js (`npx tsx src/seed.ts`)
- **Files:** `backend/src/seed/phases/*.ts` (new), `backend/src/seed/lib/idempotent.ts` (new)
- **Key output:** seed.ts is now ~20 lines of orchestration; each phase is independently callable

> 📄 Report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Targeted seed scripts

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 3.1  | Create `seed/articles.ts` entry point — runs only articles phase            | Easy       | 2.2          | ⬜     |
| 3.2  | Create `seed/projects.ts` entry point — runs only projects phase            | Easy       | 2.3          | ⬜     |
| 3.3  | Create `seed/documents.ts` entry point — runs only documents phase          | Easy       | 2.1          | ⬜     |
| 3.4  | Create `seed/social.ts` entry point — runs social+globals phase             | Easy       | 2.4          | ⬜     |
| 3.5  | Add npm scripts: `seed:articles`, `seed:projects`, `seed:documents`, `seed:social`, `seed:globals`, `seed:all` → `package.json` | Easy       | 3.1-3.4      | ⬜     |

### Service Summary
- **Runtime:** Node.js
- **Files:** `backend/src/seed/*.ts` (new entry points), `backend/package.json` (modified)
- **Key output:** `npm run seed:articles` seeds only articles — no other collections touched

> 📄 Report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Security & deploy prep

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 4.1  | Remove `PAYLOAD_SECRET` default (`dev-secret-change-me`); fail fast if env var missing | Easy       | —            | ⬜     |
| 4.2  | Create `backend/.env.example` with documented vars (PAYLOAD_SECRET, DATABASE_URL, PAYLOAD_PUBLIC_CORS) | Easy       | 4.1          | ⬜     |
| 4.3  | Create `scripts/deploy.sh` — builds both, seeds, starts with PM2            | Medium     | 4.1, 3.5     | ⬜     |
| 4.4  | End-to-end verify: `npm run build` both services, `seed:all`, start, hit routes | Medium     | 4.1-4.3      | ⬜     |

### Service Summary
- **Runtime:** Bash + Node.js
- **Files:** `backend/src/payload.config.ts` (modified), `backend/.env.example` (new), `scripts/deploy.sh` (new)
- **Key output:** VPS-deployable; no hardcoded secrets; single-command deploy

> 📄 Report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)

---

## Dependency Graph

```
Phase 1 (data split) ───────────┐
  1.1 ──► 1.2 ──► ... ──► 1.8    │
                                  ├──► Phase 2 (runner split)
Phase 2 (runner split) ──────────┘      2.1 ──► ... ──► 2.6
                                                │
Phase 3 (targeted scripts) ◄───────────────────┘
  3.1 ──► ... ──► 3.5
        │
Phase 4 (security + deploy) ◄────┘
  4.1 ──► 4.2 ──► 4.3 ──► 4.4
```

## Summary

| Phase                        | Tasks | Difficulty Mix | Status |
|------------------------------|-------|----------------|--------|
| 1 — Split seed data          | 8     | 5 E, 3 M       | ⬜     |
| 2 — Split seed runner        | 6     | 2 E, 4 M       | ⬜     |
| 3 — Targeted scripts         | 5     | 5 E            | ⬜     |
| 4 — Security & deploy prep   | 4     | 2 E, 2 M       | ⬜     |
| **Total**                    | **23**| **14 E, 9 M**  | ⬜     |
   | ⬜     |
| **Total**                    | **23**| **14 E, 9 M**  | ⬜     |
