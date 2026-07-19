# Architecture — Sprint-12: Deploy OOM-proofing

> Status: 🟡 Design (Option **B** chosen) | Created: 2026-07-19
> Companion: [`../plan.md`](../plan.md) · [`../tasks.md`](../tasks.md) · trigger RCA: [`../../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md`](../../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md)
>
> **Audience:** future-you (and any LLM/agent). Written as a case-study so the *concepts* — not just the
> chosen fix — are reusable. Options A & C are documented even though we ship B.

---

## 0. TL;DR

- The VPS (~2 GB RAM) was compiling the Next.js + PayloadCMS build **on itself**. The build peaks above
  2 GB → OOM-killer → lockout.
- **Swap (2 GB) is now active** → effective ~4 GB. That alone makes a single build safe.
- This sprint moves the **compile step to the GitHub runner** and ships only finished artifacts to the
  VPS. The VPS never compiles again → **OOM impossible**.
- Three approaches were considered: **A** (bridge), **B** (build-on-runner), **C** (bridge + stop app).
  **B is chosen.** All three are documented below with flowcharts, pros/cons, and "when to use".

---

## 1. Concepts (for non-DevOps) — the vocabulary you need

Read this once; the rest of the doc assumes it.

| Term | Plain meaning | Analogy |
|------|---------------|---------|
| **Build / compile** | Turning source (`.ts`, `.svelte`) into optimized production files (`.next/`, `dist/`). CPU- and RAM-heavy. | Cooking raw ingredients into a finished dish. |
| **RAM** | Fast working memory. Limited (2 GB here). | The kitchen counter — fast to work on, but small. |
| **Swap** | Disk space used as overflow RAM. Slower, but prevents crashes. | A folding table you open when the counter is full — slower to use, but nothing gets thrown out. |
| **OOM-killer** | When RAM **and** swap are full, Linux kills a process to survive. It doesn't pick carefully — it can kill `sshd` (your door in). | A bouncer ejecting people at random when the club is over capacity. |
| **Orphan process** | A process whose parent (the SSH session) died, but the process keeps running. Our `command_timeout` closed SSH but left `next build` alive. | A cook still working after the restaurant closed and the manager left. |
| **Stacking** | Each timed-out dispatch left another orphan build running. 2+ builds competing → RAM exhaustion accelerates. | Re-ordering the same meal 3× with the kitchen never told to stop. |
| **PM2** | Process manager that keeps the app running and restarts it on deploy/crash. Runs **per user** (root's PM2 ≠ another user's). | A shift manager who restarts workers and reboots them if they crash. |
| **Artifact** | The output of a build (`.next/`, `dist/`). Ready to run, no compiling needed. | The plated dish — just serve it. |
| **rsync** | Efficient file-sync tool over SSH. Only transfers diffs. | A courier that only ships what changed. |
| **Standalone output** | A build mode that bundles a minimal runtime so the app runs without a full `node_modules`. Next.js supports it; Astro's node adapter is already "standalone" by name. | A meal kit with everything included, no pantry needed. |

---

## 2. Current architecture (the thing we're changing)

```
 GitHub Actions                  VPS (~2 GB RAM, no swap until today)
 ─────────────                   ───────────────────────────────────
 click "Run workflow"
        │
        ▼  (appleboy/ssh-action, SSH as root)
 root@vps
        │
        ▼
 cd /root/portfolio
 git fetch + reset --hard origin/main      ◄── pull latest source
        │
        ▼
 bash scripts/deploy.sh
        │
   ┌────┴─────────┐
   ▼              ▼
 backend/        frontend/
 npm install     npm install
 next build ⚠️   astro build ⚠️        ◄── COMPILE HAPPENS HERE, ON THE VPS
   │              │                         build peaks > 2 GB → OOM-killer
   └────┬─────────┘
        ▼
 pm2 restart ecosystem.config.cjs           ◄── reload app
```

**Why it OOMs:** the two `⚠️` steps compile on a 2 GB box while the live app (~350 MB) is still
serving. Add orphan stacking and there's no headroom left.

**Swap already added this session** → effective ~4 GB. A single build now fits. But the build still
*runs on the VPS* — fragile as the project grows. Options A/C accept that; **B removes it entirely.**

---

## 3. Option A — Bridge (swap + orphan-kill) — *not chosen, kept as fallback*

> Minimal patch: keep building on the VPS, but make it safe with swap + killing orphans before each build.

### Concept

```
 Same flow as "current", PLUS:
 ────────────────────────────
 deploy.sh (top):
   pkill -f 'next build' || true     ◄── kill any orphaned build first (anti-stacking)
   export NODE_OPTIONS=--max-old-space-size=1400   (optional: cap Node heap)

 Environment:
   swap 2 GB active  →  ~4 GB effective  →  build (1.7 GB) fits comfortably
```

**Mental model:** before starting to cook, make sure no other cook is already in the kitchen. Then
cook on a bigger counter (swap).

### Pros / Cons

| ✅ Pros | ❌ Cons |
|--------|---------|
| ~15 min of work, 1 line of code | Build still runs on the 2 GB VPS (residual OOM risk ≠ 0) |
| Zero architecture change, easy rollback | Build is still slow (2–5 min/deploy) |
| Swap already does most of the work | Fragile if the project grows |

### When to use

A stable-sized personal site where you want the fastest possible fix and don't mind the build
running on the box. **With swap done, this is genuinely sufficient for the portfolio as it is today.**

---

## 4. Option B — Build-on-runner ⭐ CHOSEN

> Move the compile step to the GitHub runner (~7 GB RAM). The VPS only receives finished artifacts
> and runs `pm2 restart`. **The VPS never compiles → OOM is impossible.**

### Concept

```
 GitHub runner (≈ 7 GB RAM)                    VPS (~2 GB RAM)
 ────────────────────────                      ────────────────
 checkout code                                 (app keeps serving, idle)
 setup Node 22
 ┌─────────────────────────────────┐
 │ backend:  npm ci  →  next build │  ✅ compile here (plenty of RAM)
 │ frontend: npm ci  →  astro build│  ✅
 └────────────────┬────────────────┘
                  │  rsync over SSH (only what changed)
                  ▼
                                          receive artifacts (.next/, dist/, package*.json)
                                                  │
                                                  ▼
                                          npm ci --omit=dev   ◄── fast, NO compile, low RAM
                                                  │
                                                  ▼  (SSH: pm2 restart)
                                          pm2 restart          ◄── app updated; RAM stays FLAT
```

**Mental model:** cook in a big factory kitchen (GitHub), courier the plated dishes to the small
restaurant (VPS), which only reheats and serves. The small kitchen never overheats.

### Pros / Cons

| ✅ Pros | ❌ Cons |
|--------|---------|
| **OOM impossible** — VPS doesn't compile | Bigger change: workflow rewrite + rsync + excludes |
| Deploys get **fast** (rsync seconds vs build minutes) | More moving parts to debug if it breaks |
| VPS RAM stays flat during deploy | Frontend still needs `npm ci` on VPS (not 100% compile-free) |
| Scales — bigger projects stay safe | Requires care to never overwrite `.env` / `payload.db` |
| The "professional" CI/CD artifact pattern | — |

### When to use

When you want deploys that are reliable forever and you're willing to learn/maintain an artifact
pipeline. **This is what we ship in sprint-12.** See §7 for the detailed design.

---

## 5. Option C — Bridge + hardening (stop the app during build) — *not chosen*

> Same as A, but also stop PM2 during the build to free ~350 MB of headroom. The site is briefly down.

### Concept

```
 deploy.sh:
   pm2 stop all                     ◄── free ~350 MB (SITE GOES DOWN here)
   pkill -f 'next build' || true
   cd backend  && npm ci && next build
   cd frontend && npm ci && astro build
   pm2 start ecosystem.config.cjs   ◄── SITE BACK UP
```

**Mental model:** close the restaurant for a few minutes so the kitchen is 100% free to cook a big
batch, then reopen.

### Pros / Cons

| ✅ Pros | ❌ Cons |
|--------|---------|
| Maximum headroom (~2.3 GB free + 2 GB swap) | **Site down ~3 min every deploy** |
| OOM-proof without migrating | Visitors hitting the site mid-deploy see errors |
| Still simple to implement | Total deploy is a bit slower (stop + start) |

### When to use

A site where brief downtime per deploy is acceptable and you want max safety without migrating.
For a rarely-deployed personal portfolio, the downtime is tolerable — but B is strictly better here.

---

## 6. Decision matrix

| Criterion | A — Bridge | B — Runner ⭐ | C — Bridge + stop |
|-----------|:----------:|:------------:|:-----------------:|
| Effort | 🟢 low (~15 min) | 🔴 high (~1–2 h) | 🟡 medium (~30 min) |
| OOM risk | 🟡 small | 🟢 none | 🟢 none |
| Deploy downtime | 🟢 none | 🟢 none | 🔴 ~3 min |
| Maintenance complexity | 🟢 low | 🔴 higher | 🟢 low |
| Learning value | — | 🟢 high (CI/CD) | — |
| Scales with project growth | ❌ | ✅ | ⚠️ partly |

**Chosen: B.** Reasoning: the user explicitly wants to learn the artifact-pipeline pattern, and B is
the only option that eliminates OOM *and* downtime *and* scales. A/C remain documented as the
documented fallback if B ever needs to be rolled back in a hurry (swap + orphan-kill is a 1-line
patch you can apply to the current `deploy.sh` anytime).

---

## 7. Detailed design of B (the implementation reference)

### 7.1 What changes, file by file

| File | Change |
|------|--------|
| `.github/workflows/deploy.yml` | **Rewrite.** Runner builds BE+FE → rsync → SSH `pm2 restart`. No more on-VPS build. |
| `scripts/deploy.sh` | **Becomes a VPS-side restart helper:** `npm ci --omit=dev` (BE+FE) + `pm2 restart`. No compile. |
| `backend/next.config.mjs` | **No change needed** (see decision 7.2.1). |
| `ecosystem.config.cjs` | **No change.** Entries stay `next start` + `dist/server/entry.mjs`. |
| `.gitignore` | Ensure `.next/`, `dist/`, `node_modules/` stay ignored (artifacts are built on the runner, never committed). |

### 7.2 Design decisions (resolves plan.md §9)

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 7.2.1 | Backend: Next **standalone** vs full `.next/` + `npm ci --omit=dev`? | **Full `.next/` + `npm ci --omit=dev`** | PayloadCMS 3 + Next standalone has known dynamic-import / SQLite-path gotchas. Keeping `next start` unchanged = **zero risk to `ecosystem.config.cjs`**. `npm ci --omit=dev` is fast (~30 s) and low-RAM (no compile). |
| 7.2.2 | Frontend: rsync full `node_modules` vs `npm ci --omit=dev`? | **`npm ci --omit=dev`** | Lighter transfer; native deps (`sharp`-like) resolved correctly on VPS; conventional. |
| 7.2.3 | rsync transport | **Native `rsync -e ssh`** with the key written to the runner | No extra action dependency; full control over `--exclude`. |
| 7.2.4 | Fate of `scripts/deploy.sh` | **Keep as VPS-side restart helper** | Reused; the runner does the build, `deploy.sh` does `npm ci --omit=dev` + `pm2 restart`. |
| 7.2.5 | Keep `command_timeout: 20m`? | **Lower to ~5 m** | No build on VPS now; `npm ci` + restart is fast. |

### 7.3 The new workflow shape (target)

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup Node 22
      - build backend:   npm ci && npm run build            # → backend/.next/
      - build frontend:  npm ci && npm run build            # → frontend/dist/
      - configure SSH key on runner (write VPS_SSH_KEY, known_hosts)
      - rsync backend  → VPS:/root/portfolio/backend/       (exclude .env, payload.db, *.bak)
      - rsync frontend → VPS:/root/portfolio/frontend/      (exclude node_modules, dist will arrive fresh)
      - SSH: bash scripts/deploy.sh                          # npm ci --omit=dev + pm2 restart
```

### 7.4 Gotchas (the things that will bite if ignored)

1. **NEVER overwrite VPS-only files.** `backend/.env` (holds `PAYLOAD_SECRET`) and
   `backend/payload.db` (your SQLite database) are gitignored and live **only on the VPS**. rsync
   MUST exclude them: `--exclude '.env' --exclude 'payload.db*'`. A bad rsync here = lost DB.
2. **NEVER delete Payload uploads — VERIFIED dir is `documents/`.** The `Documents` collection uses
   `upload: true` with no `staticDir` override, so Payload stores uploaded files at the collection
   slug under the backend dir: **`backend/documents/`** (confirmed via `ls backend/` on the VPS — it
   contains real uploaded files). These exist **only on the VPS**, so `rsync --delete` would wipe
   them if not excluded. Excluded (anchored to backend root): `/documents` (+ `/media`, `/uploads`,
   `/tmp` as defensive extras in case a future Media collection appears).
3. **`public/` is separate from `.next/`.** Next's static assets in `backend/public/` must be rsynced
   too (or admin assets 404).
4. **`sharp` native binary.** Backend depends on `sharp` (native). `npm ci --omit=dev` on the VPS
   installs the correct Linux x64 binary — that's why we don't rsync `node_modules`.
5. **Build env vars — VERIFIED, none needed.** Inspecting `backend/src/payload.config.ts`,
   every env var has a build-time default: `PAYLOAD_SECRET` → `'dev-secret-change-me'`,
   `DATABASE_URL` → `'file:./payload.db'`, `PAYLOAD_PUBLIC_CORS` → localhost. So **`next build`
   succeeds on the runner with zero secrets** — the real `PAYLOAD_SECRET` + `payload.db` stay
   VPS-only. (The build may create a throwaway `payload.db` on the runner — excluded by §7.5.)
6. **`package-lock.json` must be rsynced** so `npm ci` (not `npm install`) works on the VPS.
7. **First-run cleanliness.** The VPS currently has a full `node_modules` from the old on-VPS build.
   `npm ci --omit=dev` will prune dev deps — harmless, but expect a one-time diff.

### 7.5 rsync excludes (the safety rail)

```bash
# backend  (upload dir is `documents/` — the Documents collection slug; VERIFIED on the VPS)
rsync -az --delete \
  --exclude '.env' \
  --exclude 'payload.db' \
  --exclude 'payload.db.*' \
  --exclude '*.bak' \
  --exclude 'node_modules' \
  --exclude '.next/cache' \
  --exclude '/documents' \
  --exclude '/media' \
  --exclude '/uploads' \
  --exclude '/tmp' \
  backend/  root@$VPS:/root/portfolio/backend/

# frontend
rsync -az --delete \
  --exclude 'node_modules' \
  frontend/ root@$VPS:/root/portfolio/frontend/
```

> `--delete` keeps the VPS tidy (removes files that no longer exist in the new build) — but it is
> also why the excludes are critical. **Re-read §7.4.1 before changing these.**

---

## 8. Verification plan

| Check | Expected |
|-------|----------|
| Runner build step | `next build` + `astro build` succeed on the runner |
| rsync step | Transfers `.next/`, `dist/`, `package*.json`; **does not** touch `.env`/`payload.db` |
| VPS during deploy | `top`/`free -h` shows RAM **flat**; **no `next build` process** on the VPS |
| `pm2 list` after | Both services online, uptime growing, restart count not climbing |
| `curl -I https://athallarizky.com` | 200 |
| `curl -I https://athallarizky.com/admin` | 200/302 (not 502) |
| Payload data intact | `/admin` shows existing projects/articles (DB not wiped) |

---

## 9. Rollback plan

If B misbehaves, revert to the bridge (Option A) in minutes:

1. Revert `.github/workflows/deploy.yml` to the previous on-VPS-build version (`git revert`).
2. Swap is already active, so the old flow is now safe (4 GB effective).
3. (Optional, belt-and-suspenders) add `pkill -f 'next build' || true` to the top of `deploy.sh`.

The VPS state is unchanged by B (same paths, same PM2 entries), so rollback needs **no VPS-side work**.

---

## 10. References

- Workflow: [`../../../.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml)
- Deploy script: [`../../../scripts/deploy.sh`](../../../scripts/deploy.sh)
- Provisioning: [`../../../scripts/setup-vps.sh`](../../../scripts/setup-vps.sh)
- PM2 config: [`../../../ecosystem.config.cjs`](../../../ecosystem.config.cjs)
- Incident RCA: [`../../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md`](../../sprint-11/rca/2026-07-19-deploy-build-oom-lockout.md)
