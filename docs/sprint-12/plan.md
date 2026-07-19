# Sprint-12 Plan — Kill deploy OOM (swap bridge + build-on-runner)

> Status: ⬜ Not started | Created: 2026-07-19
> Trigger: [`../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md`](../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md)
> Companion: [`tasks.md`](./tasks.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## 1. Context (read first — this is why the sprint exists)

The "Deploy to VPS" GitHub Action now reaches the build step (after sprint-11 fixed SSH auth,
repo path, and the default `PAYLOAD_SECRET`). But the **build runs out of memory and locks us out
of the VPS**:

- The VPS is **~2 GB RAM** (Tencent Lighthouse). A Next.js 16 + PayloadCMS production build peaks
  above 2 GB.
- There is **no swap**, so the build hits the OOM-killer. Under pressure the kernel killed
  processes up to and including `sshd`, making the box unreachable until a hypervisor-level reboot.
- **Orphaned builds compounded it:** `appleboy/ssh-action`'s `command_timeout` disconnects the SSH
  session but does **not** kill the remote `next build`, so each timed-out dispatch left an orphan
  still eating RAM.

Full incident write-up: [`../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md`](../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md).

**Current deploy architecture (what we're changing):**
- GitHub Actions (`appleboy/ssh-action`) → SSH into VPS as `root` → `git fetch`/`reset` in
  `/root/portfolio` → `bash scripts/deploy.sh` → `npm install` + **build on the VPS** + `pm2 restart`.
- Secrets available: `VPS_HOST`, `VPS_USER` (= `root`), `VPS_SSH_KEY`.

## 2. Sprint goal

**Make deploys reliable and OOM-proof on a 2 GB VPS**, in two layers:
1. **Bridge (immediate):** add swap + kill orphan builds so the current on-VPS workflow can succeed
   again today.
2. **Permanent:** move the build to the GitHub runner and rsync artifacts to the VPS, so the VPS
   never compiles again.

## 3. Scope

**In scope:**
- VPS: add 2 GB swap (persistent) — documented + ideally baked into `setup-vps.sh`.
- `scripts/deploy.sh` / `.github/workflows/deploy.yml`: kill orphan builds before building; (optional) stop the app during the build; (optional) cap the Node heap.
- **New workflow design:** build backend + frontend on the GitHub runner, rsync artifacts, `pm2 restart` on VPS.
- Docs: this sprint's reports, deploy section of `AGENTS.md`, out-of-band recovery runbook.

**Out of scope:**
- App/code changes (no feature work).
- Changing hosting provider or resizing the VPS (considered an alternative, not in scope).
- Frontend SSR → static migration (the frontend is Astro SSR via `@astrojs/node`; it stays SSR).

## 4. Options considered

| Option | Effort | OOM risk gone? | Notes |
|--------|--------|----------------|-------|
| **A. Swap + orphan-kill (bridge)** | Low | Reduced (not eliminated) | Gets deploys green today; build still slow, still risky at the margin |
| **B. Build-on-runner + rsync** | Medium | **Yes (eliminated)** | VPS does no compile; fast, safe, rollback-able. **Recommended end state.** |
| C. Resize VPS (more RAM) | Low (provider UI) | Yes | Costs more; doesn't fix the orphan/orchestration issues |
| D. Keep building on VPS, just bigger timeout | None | No | Already tried — this is the failure mode |

**Recommendation:** do **A first** (unblock today), then **B** (proper). B is the deliverable that
"finishes" this sprint.

## 5. Phasing

- **Phase 1 — Bridge (swap + orphan-kill).** Apply the 2 GB swap on the VPS (runbook in the RCA §5.1);
  add `pkill -f 'next build'` at the top of the deploy path; verify a dispatch goes green. → deploys
  work again immediately.
- **Phase 2 — Build-on-runner.** Restructure `deploy.yml`: checkout → build backend + frontend on the
  runner → rsync artifacts → SSH `pm2 restart`. (Design notes in §6.)
- **Phase 3 — Docs & hardening.** Bake swap into `setup-vps.sh`; update `AGENTS.md` deploy section;
  write an out-of-band recovery runbook (Lighthouse Reboot / VNC); add a phase report.

See [`tasks.md`](./tasks.md) for the task breakdown.

## 6. Design notes for build-on-runner (Phase 2)

Goal: the VPS receives only **finished artifacts** and runs them — no `npm install`, no compile.

**Backend (Next.js + PayloadCMS):**
- Prefer **Next.js standalone output**: set `output: 'standalone'` in `backend/next.config.*` if not
  already. Standalone produces `.next/standalone/` (self-contained server + minimal deps) plus
  `.next/static/`.
- rsync to the VPS: `.next/standalone/`, `.next/static/`, and `public/`.
- Run on VPS via PM2: `node .next/standalone/server.js` (update `ecosystem.config.cjs` accordingly).
- If standalone is undesirable, alternative: rsync `.next/` + `package*.json` and run
  `npm ci --omit=dev` on the VPS (lighter than a build, but still some work + RAM).

**Frontend (Astro SSR, `@astrojs/node`):**
- Build on runner: `npm ci && PUBLIC_API_URL=… npx astro build` → `dist/`.
- Astro has no standalone mode, so the VPS still needs the runtime deps. Options:
  - rsync `dist/` + `package*.json`, run `npm ci --omit=dev` on the VPS (recommended), **or**
  - rsync `dist/` + the full `node_modules` (heavy, simplest).
- PM2 entry: `node dist/server/entry.mjs`.

**Transfer (runner → VPS):**
- rsync over SSH using the existing `VPS_SSH_KEY` (e.g. `appleboy/ssh-action` for the restart, and
  a plain `rsync -e "ssh …"` step — or `burnett/rsync-deployments` style action — for the file copy).
- Keep `backend/.env` and `payload.db` **on the VPS only** (they're gitignored; never overwrite them).

**Restart:**
- `pm2 reload ecosystem.config.cjs` (zero-downtime-ish) or `pm2 restart`.

**Rollback:**
- Keep the previous artifact dir on the VPS (e.g. deploy to `current/` with a symlink swap, or keep
  `previous/`). Out of scope to over-engineer; a simple "keep last good" is enough for v1.

## 7. Key files

- `.github/workflows/deploy.yml` — the workflow to restructure.
- `scripts/deploy.sh` — add orphan-kill (Phase 1); may be simplified/removed in Phase 2 (build moves to runner).
- `scripts/setup-vps.sh` — add swap provisioning (Phase 3).
- `backend/next.config.*` — possibly enable `output: 'standalone'` (Phase 2).
- `ecosystem.config.cjs` — adjust PM2 entry if backend runs from standalone (Phase 2).

## 8. Verification

- **Phase 1:** a workflow dispatch completes without OOM; `pm2 list` online; site serves latest code.
- **Phase 2:** the runner builds; rsync transfers; `pm2 restart`; site serves the new build; VPS RAM
  stays flat during deploy (no `next build` process on the VPS at all).
- **Both:** `curl https://athallarizky.com` returns 200; `/admin` loads.

## 9. Open questions / decisions for the session

- Backend: adopt Next **standalone** output (cleanest) or rsync + `npm ci --omit=dev`?
- Frontend: rsync `node_modules` (simple, heavy) or `npm ci --omit=dev` on VPS (lighter)?
- rsync transport: raw `rsync -e ssh` step vs a dedicated action (e.g. `burnett/rsync-deployments`)?
- Keep `scripts/deploy.sh` as a VPS-side restart-only helper, or fold everything into the workflow?

> ⚠️ Until Phase 1 lands, **do not dispatch the workflow** — each run risks re-OOMing the box (see the RCA).
