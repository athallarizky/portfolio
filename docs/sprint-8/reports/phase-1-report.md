# Phase 1 Report — Backup hooks

> Completed: 2026-07-14

---

## 1. What was done

- All `npm run seed*` commands now create a timestamped `.bak` of `payload.db` before writing
- Added `npm run seed:dry` — prints all data from seed files without touching the database
- `payload.db-*` already gitignored in `backend/.gitignore` — no changes needed

## 2. Scripts

| Script | Backup? | Writes DB? |
|--------|---------|-----------|
| `seed` | ✅ `.bak` | ✅ |
| `seed:articles` | ✅ `.bak` | ✅ |
| `seed:projects` | ✅ `.bak` | ✅ |
| `seed:documents` | ✅ `.bak` | ✅ |
| `seed:social` | ✅ `.bak` | ✅ |
| `seed:all` | ✅ `.bak` | ✅ |
| `seed:dry` | ❌ no | ❌ no |

## 3. Verification

- `npm run seed:dry` prints all 6 articles, 6 projects, 6 documents, 7 social profiles, 3 globals
- No `.bak` file created by dry run
- Build passes
