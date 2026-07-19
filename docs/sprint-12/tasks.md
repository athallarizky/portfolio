# Task Breakdown — Sprint-12: Kill deploy OOM

> Status: 🟡 Design — Option **B chosen** (see [`resources/architecture.md`](./resources/architecture.md)); Phase 1.1 (swap) ✅ done. | Created: 2026-07-19
> Plan: [`plan.md`](./plan.md) · architecture: [`resources/architecture.md`](./resources/architecture.md) · trigger RCA: [`../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md`](../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md)
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked | ↩️ fallback

---

## Phase 1 — Bridge (swap + orphan-kill) — ↩️ FALLBACK, not pursued

> Goal: make the current on-VPS workflow safe. Swap is done; the rest is the **documented rollback path**
> in case Phase 2 ever needs reverting fast. See [`resources/architecture.md`](./resources/architecture.md) §3.

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 1.1 | VPS: add 2 GB swap (persistent) + `swappiness=10` (runbook: RCA §5.1) | Easy | — | ✅ |
| 1.2 | `scripts/deploy.sh`: kill orphan `next build` before building (`pkill -f 'next build' \|\| true`) | Easy | — | ↩️ fallback |
| 1.3 | (Optional) stop PM2 during build, restart after (frees ~350 MB; site down briefly) | Easy | 1.2 | ↩️ fallback |
| 1.4 | (Optional) cap Node heap via `NODE_OPTIONS=--max-old-space-size=1400` | Easy | 1.2 | ↩️ fallback |
| 1.5 | Verify: dispatch workflow → completes, `pm2 list` online, site 200 | Easy | 1.1–1.2 | ↩️ fallback |

> Swap (1.1) is the only Phase-1 task applied. 1.2–1.5 are **not** applied because we chose Phase 2;
> they remain the rollback recipe (architecture.md §9).

---

## Phase 2 — Build-on-runner + rsync (permanent fix) — 🔵 THE ACTIVE WORK

> Goal: the VPS never compiles. The GitHub runner builds; artifacts rsync to the VPS; VPS only
> `npm ci --omit=dev` + `pm2 restart`. Design: [`resources/architecture.md`](./resources/architecture.md) §7.

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 2.1 | Backend strategy decided: **full `.next/` + `npm ci --omit=dev`** (NOT standalone — Payload/SQLite safety). `next start` entry unchanged. | Medium | — | ✅ |
| 2.2 | Frontend strategy decided: **`npm ci --omit=dev`** (lighter than rsyncing node_modules; native deps resolved on VPS). | Medium | — | ✅ |
| 2.3 | Rewrite `.github/workflows/deploy.yml`: runner checkout → setup Node → build BE+FE → configure SSH key → rsync artifacts → SSH `deploy.sh`. | Hard | 2.1, 2.2 | ✅ |
| 2.4 | Simplify `scripts/deploy.sh` to a VPS-side restart helper: `npm ci --omit=dev` (BE+FE) + `pm2 restart`. No compile. `ecosystem.config.cjs` **unchanged**. | Medium | 2.3 | ✅ |
| 2.5 | rsync `--exclude` safety rail: never overwrite `backend/.env`, `backend/payload.db*`, `*.bak`, `node_modules` (architecture.md §7.5). | Easy | 2.3 | ✅ |
| 2.6 | Verify: dispatch → no `next build` on VPS, RAM flat, `pm2 list` online, `/admin` 200, Payload DB intact. | Easy | 2.3–2.5 | ⬜ |

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
| 1 — Bridge (swap + orphan-kill) | 5 | 5 E | ↩️ fallback (1.1 done) |
| 2 — Build-on-runner | 6 | 1 H, 2 M, 3 E | 🔵 in progress (2.1, 2.2 decided) |
| 3 — Docs & hardening | 4 | 4 E | ⬜ |
| **Total** | **15** | **1 H, 2 M, 12 E** | 🟡 |

## Notes for the implementing session

- **Read first:** [`resources/architecture.md`](./resources/architecture.md) — it has the concepts,
  the 3-option comparison, and the detailed B design (§7) including the **rsync excludes safety rail**
  (§7.4.1 / §7.5) that protects `.env` and `payload.db`.
- **Phase 2 is the work.** 2.1/2.2 are design-decided; implement 2.3 → 2.4 → 2.5 → 2.6.
- **Do not dispatch the workflow** until 2.3–2.5 are committed & pushed AND you've eyeballed the
  rsync excludes — a bad exclude can wipe the SQLite DB.
- **Gotcha to verify at 2.3:** whether `next build` on the runner needs a throwaway `PAYLOAD_SECRET`
  (architecture.md §7.4.4). Build env must NOT carry the real VPS secret.
