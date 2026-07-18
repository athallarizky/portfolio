# Sprint-8 Plan — CI/CD, Seeder Control & Backup Strategy

> Status: 🟡 Planning | Created: 2026-07-14
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-7/final-report.md`](../sprint-7/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-7 split the seed file into modular per-domain files and added a deploy helper. Now we need to make deploying to the VPS frictionless with CI/CD, give the user full control over seeding (fresh start, no auto-seed on deploy), and add a backup safety net before any seed operation touches the database.

## 1. Sprint goal

Automate VPS deployment on push to main, remove auto-seeding from the deploy script, and add backup hooks so no seed operation can destroy production data without a rollback.

## 2. Scope

**In scope:**
- GitHub Action workflow that deploys on push to `main`
- Remove `npm run seed` from `deploy.sh` — seeding becomes manual
- Add pre-seed backup hook: `npm run seed` creates a timestamped `.bak` of `payload.db`
- Add `seed:dry` script — dumps everything to console without writing to DB
- Add backup directory to `.gitignore`
- Exclude `/docs` from VPS deployment
- Document backup + deploy strategy in AGENTS.md

**Out of scope:**
- Docker
- Infrastructure-as-code (Terraform, Ansible)
- Monitoring/alerting
- Staging environment

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| GitHub Action uses SSH deploy keys (not password) | Standard secure pattern for VPS access |
| Deploy action runs `git pull` then `deploy.sh` | deploy.sh already handles build + restart. CI just triggers it |
| Pre-seed backup is a script hook, not a separate GH Action | Simple `cp payload.db payload.db.$(date).bak` before `tsx seed.ts` — no infrastructure needed |
| `seed:dry` reads all data and logs what would be created/updated without touching the DB | Safe way to preview content changes before applying them |
| `deploy.sh` no longer seeds | User runs `npm run seed` manually when ready. First deploy needs it, updates don't |

## 4. Phasing

- **Phase 1 — Backup hooks:** Pre-seed backup, `seed:dry` preview, backup dir gitignored
- **Phase 2 — CI/CD:** GitHub Action workflow for deploy on push to main
- **Phase 3 — Deploy script cleanup:** Remove seed from deploy.sh, add first-deploy docs

## 5. Verification

1. `npm run seed` creates a `.bak` file before touching `payload.db`
2. `npm run seed:dry` prints what would be seeded without writing
3. Push to `main` triggers deploy → VPS restarts with new code
4. `deploy.sh` does NOT run seed
5. Backups survive `git clean` (gitignored)
