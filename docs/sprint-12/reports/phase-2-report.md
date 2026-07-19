# Phase 2 Report — Build-on-runner + rsync deploy

> Completed: 2026-07-19
> Sprint: [`../`](../) · architecture: [`../resources/architecture.md`](../resources/architecture.md) §7

---

## 1. What changed (summary)

The deploy no longer compiles on the VPS. The GitHub Actions runner builds the
backend (`next build`) and frontend (`astro build`) with ~7 GB RAM, **rsyncs**
the finished artifacts to the VPS, and the VPS only does `npm ci --omit=dev` +
`pm2 restart`. The 2 GB VPS never compiles → **OOM is impossible**.

## 2. The new deploy flow

```
 GitHub runner (≈7 GB RAM)                VPS (~2 GB RAM) — app stays up
 ──────────────────────                   ─────────────────────────────
 1. checkout
 2. setup Node 22 (+ npm cache)
 3. build backend   → .next/      ✅
 4. build frontend  → dist/       ✅
 5. write SSH key + known_hosts on runner
 6. rsync backend/  ───────────────────►  .next/ refreshed (excludes protect
 7. rsync frontend/ ───────────────────►   .env, payload.db, documents/)
 8. SSH: bash scripts/deploy.sh ────────►  npm ci --omit=dev + pm2 restart
```

## 3. How to run

```bash
# After committing + pushing the workflow + deploy.sh changes:
# GitHub → Actions → "Deploy to VPS" → Run workflow (branch: main)
```

The workflow file: [`../../../.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml)
VPS-side helper: [`../../../scripts/deploy.sh`](../../../scripts/deploy.sh)

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| Backend: full `.next/` + `npm ci --omit=dev` (not standalone) | PayloadCMS 3 + Next standalone has dynamic-import/SQLite gotchas; `next start` entry unchanged → zero `ecosystem.config.cjs` risk |
| Frontend: `npm ci --omit=dev` on VPS | Lighter transfer; `sharp`-like native deps resolved correctly on the box |
| Native `rsync -e ssh` (key written to runner) | No extra action dependency; full control over excludes |
| No build-time secrets on the runner | `payload.config.ts` gives every env var a build-time default — `next build` succeeds with zero secrets |
| `deploy.sh` → VPS-side restart helper only | Runner builds; `deploy.sh` installs runtime deps + restarts PM2 |

## 5. rsync safety rail (the part that can cause data loss if wrong)

`rsync --delete` tidies the VPS, but **excluded paths are protected from deletion**
(plain `--delete` does not touch excluded files). Excludes (anchored to backend root):

| Exclude | Protects |
|---------|----------|
| `.env` | `PAYLOAD_SECRET` + other secrets (VPS-only) |
| `payload.db`, `payload.db.*` | the SQLite database |
| `*.bak` | DB backups |
| `node_modules` | reinstalled by `npm ci --omit=dev` |
| `.next/cache` | build cache (regenerated) |
| **`/documents`** | **Payload upload dir** (the `Documents` collection slug — VERIFIED via `ls backend/` on the VPS) |
| `/media`, `/uploads`, `/tmp` | defensive (in case a future Media collection appears) |

> **Verified before first dispatch:** `ls /root/portfolio/backend/` showed the
> upload dir is named `documents/` (the collection slug), **not** `media/`. The
> exclude was added before dispatch — without it, `--delete` would have wiped all
> uploaded documents.

## 6. Verification (post-dispatch)

| Check | Expected | Result |
|-------|----------|--------|
| Workflow dispatch | completes end-to-end | ✅ success |
| Runner build steps | `next build` + `astro build` on runner | ✅ |
| rsync transfer | syncs `.next/`, `dist/`, `package*.json` | ✅ |
| VPS `documents/` intact | upload dir not deleted | ✅ (exclude held) |
| VPS RAM during deploy | flat, no `next build` process | ✅ |
| `pm2 list` | both services online, uptime growing | ✅ |
| `https://athallarizky.com` | 200 | ✅ |
| `/admin` | 200/302 (not 502) | ✅ |

## 7. Reference files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | the build-on-runner workflow (8 steps) |
| `scripts/deploy.sh` | VPS-side restart helper (no compile) |
| `scripts/setup-vps.sh` | provisioning — now bakes in swap (Phase 3.1) |
| `ecosystem.config.cjs` | PM2 entries — **unchanged** (`next start` + `dist/server/entry.mjs`) |
| `resources/architecture.md` | concepts, 3-option comparison, B design, gotchas |

## 8. Rollback

`git revert` the workflow commit → the old on-VPS build flow returns; swap is
already active so it runs safely at 4 GB effective. No VPS-side work needed.
