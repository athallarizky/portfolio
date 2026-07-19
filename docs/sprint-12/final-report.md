# Sprint-12 Final Report — Kill deploy OOM (build-on-runner)

> Status: ✅ Delivered | 2026-07-19
> Audience: sprint-13 context. Read this + [`../../AGENTS.md`](../../AGENTS.md) §8 (Deploy) before starting the next sprint.
> Companion: [`plan.md`](./plan.md) · [`tasks.md`](./tasks.md) · [`resources/architecture.md`](./resources/architecture.md)

---

## 1. Sprint goal & outcome

**Goal:** make deploys reliable and OOM-proof on a 2 GB VPS.

**Outcome:** ✅ Delivered. The build moved off the VPS entirely — the GitHub
Actions runner compiles, rsyncs artifacts, and the VPS only restarts. The 2 GB
box never compiles, so **OOM is impossible** and deploys are fast. A successful
end-to-end dispatch confirmed it; the site is live and the Payload DB/uploads are intact.

This was triggered by a real incident (sprint-11 RCA: build OOM → orphan stacking →
VPS lockout). Sprint-12 eliminates the root cause instead of patching around it.

## 2. Final structure (what changed)

```
portfolio/
├── .github/workflows/deploy.yml     ← REWRITTEN: 8-step build-on-runner + rsync
├── scripts/
│   ├── deploy.sh                    ← SIMPLIFIED: VPS-side restart helper (no compile)
│   └── setup-vps.sh                 ← + step 2: 2 GB swap (OOM protection)
├── docs/sprint-12/
│   ├── plan.md                      ← decision B recorded, open questions resolved
│   ├── tasks.md                     ← all Phase 2/3 tasks ✅
│   ├── final-report.md              ← (this file)
│   ├── resources/
│   │   └── architecture.md          ← concepts + 3-option comparison + B design
│   └── reports/
│       └── phase-2-report.md        ← deploy phase report
└── AGENTS.md                        ← + §8 Deploy section (root user, /root/portfolio, flow)
```

**Unchanged (deliberately):** `backend/next.config.mjs`, `ecosystem.config.cjs`
(PM2 entries stay `next start` + `dist/server/entry.mjs`).

## 3. Key deliverables

| Item | Notes |
|------|-------|
| Build-on-runner workflow | Runner builds BE+FE → rsync → SSH restart. 8 steps. |
| OOM eliminated | No `next build`/`astro build` on the VPS; RAM flat during deploy |
| 2 GB swap | Active on VPS (4 GB effective), baked into `setup-vps.sh` |
| rsync safety rail | `.env`, `payload.db`, `documents/` (uploads) protected from `--delete` |
| Learning resource | `architecture.md` — concepts + A/B/C options with flowcharts + pros/cons |

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|
| **Option B** (build-on-runner) over A (bridge) / C (bridge+stop) | Only option that eliminates OOM + downtime + scales; user wanted to learn the CI/CD pattern |
| Backend: full `.next/` + `npm ci --omit=dev` (not Next standalone) | PayloadCMS 3 + standalone has dynamic-import/SQLite gotchas; `next start` entry unchanged |
| Frontend: `npm ci --omit=dev` on VPS | Lighter transfer; native deps resolved correctly on the box |
| No build-time secrets on the runner | `payload.config.ts` has build-time defaults for every env var |
| Keep `ecosystem.config.cjs` unchanged | Zero risk to the running app's process config |

## 5. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 — Bridge (swap + orphan-kill) | 5 | ↩️ fallback — only swap (1.1) applied; rest documented as rollback path |
| 2 — Build-on-runner | 6 | ✅ delivered + verified by dispatch |
| 3 — Docs & hardening | 4 | ✅ swap in setup-vps.sh, AGENTS.md deploy section, recovery pointer, reports |

> 📄 Phase detail: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

## 6. Verification

| Check | Result |
|-------|--------|
| Workflow dispatch completes | ✅ |
| Runner builds BE+FE | ✅ |
| rsync transfers artifacts | ✅ |
| VPS `documents/` uploads intact (exclude held) | ✅ |
| VPS RAM flat during deploy, no `next build` process | ✅ |
| `pm2 list` online, uptime growing | ✅ |
| `https://athallarizky.com` → 200 | ✅ |
| `/admin` → 200/302 (not 502) | ✅ |

## 7. How to run (deploy)

```bash
# 1. Commit + push (GitHub runs the REMOTE workflow file)
git add .github/workflows/deploy.yml scripts/deploy.sh docs/ && git commit && git push origin main

# 2. GitHub → Actions → "Deploy to VPS" → Run workflow (branch: main)
#    Watch step 6 (Sync backend): must NOT show "deleting documents/"
```

## 8. Sprint-13 handoff

**State handed over:** deploys are reliable and OOM-proof. The VPS is healthy
(swap active, both PM2 services online, site 200, `/admin` loads, Payload data intact).

**Nothing blocking.** Optional future items (not required, no pressure):
- Keep-last-good artifact rollback (symlink swap on the VPS) — nice for instant revert.
- Frontend `node_modules` could eventually be bundled, but `npm ci --omit=dev` is fine.
- A `workflow_dispatch` input to choose branch, if you ever deploy non-`main`.
- A periodic `curl` healthcheck / status page.

**Concepts a future session should know** (all in [`resources/architecture.md`](./resources/architecture.md)):
build-on-runner, rsync excludes protect VPS-only files, Payload stores uploads at the
collection slug (`documents/`), PM2 is per-user (root).

**One standing caution:** the rsync `--exclude` list in `deploy.yml` step 6 protects
`.env`, `payload.db`, and `documents/`. Do not remove those excludes or add
`--delete-excluded` — that's the one line between a clean deploy and data loss.
