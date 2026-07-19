# Task Breakdown — Sprint-12: Kill deploy OOM

> Status: ⬜ Not started | Created: 2026-07-19
> Plan: [`plan.md`](./plan.md) · trigger RCA: [`../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md`](../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md)
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 1 — Bridge: stop the bleeding (swap + orphan-kill)

> Goal: make the **current** on-VPS workflow succeed again, today. Low effort, immediate relief.

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 1.1 | VPS: add 2 GB swap (persistent) + `swappiness=10` (runbook: RCA §5.1) | Easy | — | ⬜ |
| 1.2 | `scripts/deploy.sh`: kill orphan `next build` before building (`pkill -f 'next build' \|\| true`) | Easy | — | ⬜ |
| 1.3 | (Optional) stop PM2 during build, restart after (frees ~350 MB; site down briefly) | Easy | 1.2 | ⬜ |
| 1.4 | (Optional) cap Node heap via `NODE_OPTIONS=--max-old-space-size=1400` | Easy | 1.2 | ⬜ |
| 1.5 | Verify: dispatch workflow → completes, `pm2 list` online, site 200 | Easy | 1.1–1.2 | ⬜ |

> 📄 Report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Build-on-runner + rsync (permanent fix)

> Goal: the VPS never compiles. The GitHub runner builds; artifacts rsync to the VPS; VPS only `pm2 restart`.

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 2.1 | Backend: enable Next.js `output: 'standalone'` (or decide rsync + `npm ci --omit=dev`) | Medium | — | ⬜ |
| 2.2 | Frontend: decide rsync `node_modules` vs `npm ci --omit=dev` on VPS | Medium | — | ⬜ |
| 2.3 | Restructure `deploy.yml`: runner checkout → build backend + frontend → rsync artifacts → SSH `pm2 restart` | Hard | 2.1, 2.2 | ⬜ |
| 2.4 | Update `ecosystem.config.cjs` if backend runs from standalone | Medium | 2.1, 2.3 | ⬜ |
| 2.5 | Never overwrite VPS-only files (`.env`, `payload.db`) during rsync | Easy | 2.3 | ⬜ |
| 2.6 | Verify: no `next build` process on VPS during deploy; RAM flat; site serves new build | Easy | 2.3 | ⬜ |

> 📄 Report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Docs & hardening

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 3.1 | Bake swap provisioning into `scripts/setup-vps.sh` | Easy | 1.1 | ⬜ |
| 3.2 | Update `AGENTS.md` deploy section (deploy user = `root`, repo at `/root/portfolio`, build-on-runner flow) | Easy | 2.3 | ⬜ |
| 3.3 | Write out-of-band recovery runbook (Lighthouse Reboot / VNC; not one-click login) | Easy | — | ⬜ |
| 3.4 | Final report + tasks status update | Easy | 3.1–3.3 | ⬜ |

> 📄 Report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Dependency Graph

```
Phase 1 (bridge, unblocks deploys today)
  1.1 (swap) ──► 1.5
  1.2 (orphan-kill) ──► 1.3/1.4 (optional) ──► 1.5

Phase 2 (permanent)
  2.1 ──┐
  2.2 ──┼──► 2.3 ──► 2.4 ──► 2.6
        └──► 2.5 ─────────────► 2.6

Phase 3 (docs)
  1.1 ──► 3.1
  2.3 ──► 3.2
  (3.3 independent) ──► 3.4
```

## Summary

| Phase | Tasks | Difficulty mix | Status |
|-------|-------|----------------|--------|
| 1 — Bridge (swap + orphan-kill) | 5 | 5 E | ⬜ |
| 2 — Build-on-runner | 6 | 1 H, 3 M, 2 E | ⬜ |
| 3 — Docs & hardening | 4 | 4 E | ⬜ |
| **Total** | **15** | **1 H, 3 M, 11 E** | ⬜ |

## Notes for the next session

- **Read first:** [`plan.md`](./plan.md) §1 (context) + the trigger
  [`RCA`](../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md). The RCA has the exact swap
  commands (§5.1) and the out-of-band recovery steps (§4).
- **Do Phase 1 first** — it's quick and unblocks deploys immediately while Phase 2 is designed.
- **Do not dispatch the workflow** until at least Phase 1.1 + 1.2 are applied, or you risk re-OOMing
  the VPS (and another lockout).
- **Decisions to make up front** (plan §9): Next standalone vs `npm ci --omit=dev`; frontend
  node_modules strategy; rsync transport choice.
