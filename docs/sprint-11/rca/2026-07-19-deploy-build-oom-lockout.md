# RCA — Deploy build OOM → orphan stacking → VPS lockout

> **Date:** 2026-07-19 · **Severity:** High (deploy down + VPS temporarily unreachable) · **Component:** GitHub Actions deploy / VPS build
> **Status:** ⚠️ Mitigated by reboot (server back up); **permanent fix pending — sprint-12.**
> **Companion:** [`./2026-07-19-deploy-repo-not-found.md`](./2026-07-19-deploy-repo-not-found.md) (same deploy saga, earlier that day) · next: [`../../sprint-12/plan.md`](../../sprint-12/plan.md)

---

## 0. TL;DR

After the deploy workflow finally got past SSH auth + repo + secret (see the earlier RCA),
the **build step ran out of memory and locked us out of the VPS**. Two compounding causes:

| # | Cause | Effect |
|---|-------|--------|
| 1 | The VPS has **~2 GB RAM**; a Next.js 16 + PayloadCMS production build peaks above that | Build OOMs |
| 2 | `appleboy/ssh-action`'s `command_timeout` (30 s default) **disconnects the SSH session but does NOT kill the remote build process** | Each timed-out dispatch leaves an orphaned `next build`; multiple dispatches → orphan stacking → RAM exhaustion accelerates |
| 3 | **No swap** configured | No overflow room → OOM-killer fires immediately at the RAM ceiling |
| 4 | The **live app keeps running during the build** (~350 MB) | Less headroom for the build |

Outcome: `next build` peaked, RAM hit **96.8 % (1762 MB)**, the OOM-killer took down processes
(including, eventually, responsiveness/`sshd`), and the server became unreachable over SSH.
Recovery was a **hypervisor-level reboot** from the Tencent Lighthouse console (out-of-band).

The permanent fix — **build on the GitHub runner, rsync artifacts to the VPS** — is scoped as
**sprint-12** (see its [`plan.md`](../../sprint-12/plan.md)).

---

## 1. Background (for non-DevOps)

- **Building = compiling.** `npm run build` for the backend (Next.js + PayloadCMS) turns source
  into an optimized production bundle (`.next/`). This is CPU- and RAM-heavy — compiling the
  Payload admin panel + all routes can spike memory well over 1.5–2 GB.
- **OOM-killer.** When Linux runs out of RAM with no swap, the kernel picks a process to kill to
  stay alive. Under heavy pressure it can kill anything — including `sshd` — which is how a build
  ends up **locking you out of the box**.
- **Swap.** Disk space used as overflow RAM. Slower than RAM, but it prevents OOM-kills: the build
  spills its peak into swap instead of dying.
- **`command_timeout` ≠ killing the remote process.** `appleboy/ssh-action` has a timeout for how
  long the SSH command may run. When it fires, the **runner closes the SSH connection**, but the
  process it started on the VPS (`next build`) is **not reliably killed** — it can keep running as
  an *orphan*, reparented to init, still eating CPU/RAM. So every re-dispatch during debugging
  silently left another build running.
- **Why "no log output" looked like a hang.** `node`/`next` use **block buffering** when stdout
  isn't a TTY (the case over SSH action). So during a long build the GitHub Actions log looks
  frozen even though the build is progressing — output flushes only when buffers fill or the
  process exits.

---

## 2. Timeline (2026-07-19, same day as the repo-not-found RCA)

| # | Event | Result |
|---|-------|--------|
| 1 | PAYLOAD_SECRET fixed; dispatch again | Build starts: `npm install` ok, `next build` → "Creating an optimized production build…" |
| 2 | Build hit the **30 s `command_timeout`** default | `Run Command Timeout`. **Orphan #1** left running on VPS. |
| 3 | Raised `command_timeout` to `20m` (commit `a0edd91`), pushed | — |
| 4 | Dispatch again; build runs 10+ min, log appears frozen (buffered) | Build #2 now competing with orphan #1 |
| 5 | VPS monitoring: **CPU 94.8 %**, **MEM 96.8 % (1762 MB)** | Memory exhausted |
| 6 | OOM-killer fires; `sshd`/system becomes unresponsive | **SSH lockout** — "I can't access the server" |
| 7 | Tencent Lighthouse console: `one-click login` fails (OrcaTerm agent not installed) | Tried wrong login path |
| 8 | **Hypervisor reboot** from Lighthouse console (out-of-band) | Server back; `pm2 startup` resurrects app |

---

## 3. Root cause

**Primary — VPS too small for an on-VPS build.** The instance is ~2 GB RAM (monitoring: max
1762 MB ≈ 96.8 %). A Next.js 16 (Turbopack) + PayloadCMS production build needs more than that at
peak. There is **no swap**, so there is no overflow — the moment the build peaks, the OOM-killer
fires.

**Amplifier — orphaned builds from `command_timeout`.** When the SSH action timed out at 30 s, the
runner disconnected but the remote `next build` kept running. Each debugging dispatch stacked
another orphan, all fighting for the same 2 GB, so memory exhaustion happened much faster than a
single build would.

**Contributor — live app stays up during build.** `portfolio-backend` (247 MB) + `portfolio-frontend`
(107 MB) ≈ 350 MB of headroom is consumed by the running app while the build also needs RAM.

---

## 4. Recovery procedure (what worked)

The server was unreachable over SSH, so recovery had to be **out-of-band** (not via SSH):

1. **Reboot from the Tencent Lighthouse console** (the "Restart / 重启" button on the instance page;
   "Force Restart" if available). This is a hypervisor-level reset — works even when the guest OS
   is hung, and needs no login.
2. After reboot (~1 min), SSH became reachable again and PM2 auto-started the app (because
   `setup-vps.sh` had run `pm2 startup` + `pm2 save`).
3. Verified `pm2 list` shows `portfolio-backend`/`portfolio-frontend` online.

> The "one-click login" option in the Lighthouse console requires the **OrcaTerm agent** to be
> installed on the VM (it wasn't), and you can't install it while the box is unresponsive — so
> that path is useless during an outage. Use the **Reboot** button or **VNC login** instead.

---

## 5. Mitigations identified (to be applied in sprint-12)

Ordered by effort vs. payoff. These are **bridges**, not the real fix — see §6.

### 5.1 Add 2 GB swap (biggest single lever; do first)

```bash
# as root, on the VPS
fallocate -l 2G /swapfile           # allocate a 2 GB file (fallback: dd if=/dev/zero of=/swapfile bs=1M count=2048)
chmod 600 /swapfile                 # owner-only; required or mkswap refuses
mkswap /swapfile                    # format as swap
swapon /swapfile                    # enable now
echo '/swapfile none swap sw 0 0' >> /etc/fstab   # auto-load on every boot
sysctl vm.swappiness=10             # prefer RAM; only spill to swap under pressure (keeps the live app fast)
free -h                             # verify: Swap row shows ~2.0G
```
Gives an effective ~4 GB (RAM + swap) — enough for the build peak.

### 5.2 Kill orphan builds at the start of every deploy (prevents stacking)

Add near the top of the deploy script (before `deploy.sh`/build):
```bash
pkill -f 'next build' 2>/dev/null || true   # clear any orphaned build before starting a fresh one
```

### 5.3 (Optional) Free ~350 MB by stopping the app during build

```bash
pm2 stop all || true
# … build backend + frontend …
pm2 start ecosystem.config.cjs || pm2 restart all
```
Trade-off: the **site is down for the duration of the build** (a few minutes). Fine for a personal
portfolio. Only needed if swap alone is insufficient.

### 5.4 (Optional) Cap the Node heap so the build GCs harder

```bash
export NODE_OPTIONS="--max-old-space-size=1400"   # before `npm run build`
```
Set too low and the build itself crashes with "JavaScript heap out of memory" — needs tuning.

---

## 6. Permanent fix (sprint-12) — build on the runner, not the VPS

Move the build off the small VPS entirely:

- **GitHub runner** (≈7 GB RAM) runs `next build` + `astro build`.
- **rsync** the build artifacts (`.next/`, `dist/`) to the VPS over the existing SSH key.
- The VPS only does `pm2 restart` — **no compile, no npm install**, so RAM stays flat and deploys
  are fast and rollback-able.

This removes every cause in §3. Design details + phasing are in
[`../../sprint-12/plan.md`](../../sprint-12/plan.md).

---

## 7. Why this was hard to find

- **Silent orphans.** Nothing in the GitHub Actions log indicates that a timed-out build kept
  running on the VPS. The lockout seemed sudden.
- **"Stuck" vs. "building."** Block-buffered output made a 10-minute build look frozen, so it
  wasn't obvious whether to wait or to intervene.
- **Out-of-band access was non-obvious.** The instinct (one-click login) doesn't work during an
  outage; the working path (Reboot / VNC) is buried in the Lighthouse UI.
- **Monitoring showed the truth first.** The Lighthouse memory chart (96.8 %) diagnosed OOM faster
  than any SSH-side clue.

---

## 8. Lessons & action items (→ sprint-12)

- [ ] **Add 2 GB swap + `swappiness=10` to the VPS** (and document it as a provisioning step in `setup-vps.sh`).
- [ ] **Kill orphan builds at the start of the deploy script** so dispatches can never stack.
- [ ] **Migrate deploy to build-on-runner + rsync** (the permanent fix; eliminates on-VPS build).
- [ ] **Document the out-of-band recovery path** (Lighthouse Reboot / VNC, not one-click login) in the deploy/RCA docs.
- [ ] **Re-enable safe dispatching** only after one of the above lands — until then, **do not dispatch the workflow** (each run risks re-OOMing the box).

---

## 9. References

- Workflow: [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) (`command_timeout: 20m` — commit `a0edd91`)
- Deploy script: [`scripts/deploy.sh`](../../../scripts/deploy.sh) · provisioning: [`scripts/setup-vps.sh`](../../../scripts/setup-vps.sh)
- Prev RCA (same day): [`./2026-07-19-deploy-repo-not-found.md`](./2026-07-19-deploy-repo-not-found.md)
- Next sprint: [`../../sprint-12/plan.md`](../../sprint-12/plan.md)
