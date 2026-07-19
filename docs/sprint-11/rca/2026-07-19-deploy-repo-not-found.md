# RCA — Deploy workflow: "Repo not found" → SSH auth → default secret

> **Date:** 2026-07-19 · **Severity:** High (blocked all deploys) · **Component:** GitHub Actions deploy + VPS SSH
> **Status:** ✅ Resolved — manual dispatch now succeeds end-to-end.
> **Companion:** [`../reports/phase-3-report.md`](../reports/phase-3-report.md) · prev RCA: [`../../sprint-9/rca/2026-07-18-vps-first-deploy.md`](../../sprint-9/rca/2026-07-18-vps-first-deploy.md)

---

## 0. TL;DR

The "Deploy to VPS" GitHub Action had **never succeeded** — not the old auto-trigger runs,
not the new manual dispatches. The headline error was `❌ Repo not found at ~/portfolio`,
but that was just the top layer. Fixing it unpeeled **four stacked problems**, one at a time:

| # | Symptom | Real cause | Fix |
|---|---------|-----------|-----|
| A | Re-dispatch still showed the *old* error message | The edited `deploy.yml` was local-only — not pushed. GitHub runs the workflow from **remote `main`**. | Commit & push the workflow file. |
| B | `Repo not found at ~/portfolio` | The repo lives at **`/root/portfolio`**, but the workflow SSH'd in as a **non-root user** whose home has no `portfolio` and can't read `/root`. | Set GitHub secret `VPS_USER` = `root`. |
| C | `ssh: unable to authenticate … no supported methods remain` | root's `/root/.ssh/authorized_keys` did not contain the workflow's public key. | Copy the non-root user's `authorized_keys` into root's. |
| D | `PAYLOAD_SECRET in backend/.env is still the default` | `backend/.env` (gitignored) still had the placeholder `your-secret-here`. | Generate a real secret with `openssl rand` and write it into `.env`. |

After all four, the workflow runs: **SSH as root → `git fetch`/`reset` → `deploy.sh` (build + `pm2 restart`) → ✅**.

---

## 1. Background (read this first if you're not a DevOps engineer)

**How a deploy works here:**
1. You click *Run workflow* in GitHub → a GitHub-hosted runner starts.
2. The runner uses [`appleboy/ssh-action`](https://github.com/appleboy/ssh-action) to **SSH into your VPS** using 3 GitHub secrets: `VPS_HOST` (IP), `VPS_USER` (username), `VPS_SSH_KEY` (a private SSH key).
3. Once logged in, it runs a small script: `cd ~/portfolio` → `git fetch` + `git reset --hard origin/main` → `bash scripts/deploy.sh`.
4. `deploy.sh` runs `npm install` + build for backend & frontend, then `pm2 restart` to reload the app.

**Key concepts used below:**

- **SSH key = a pair**: a *private* key (stays secret, here in the `VPS_SSH_KEY` secret) and a *public* key. To log in as user X, user X's `~/.ssh/authorized_keys` file must **contain the public key** that matches the private key being used. No match → "unable to authenticate".
- **`~` (tilde)** = the *current user's home directory*. For root, `~` = `/root`. For a user `bob`, `~` = `/home/bob`. So `~/portfolio` is a **different folder depending on who you log in as**. This was the heart of Problem B.
- **`/root` is locked down**: its permissions are `drwx------` (only root can enter). A non-root user literally cannot see inside `/root`, even just to check if a folder exists.
- **`.env` is gitignored**: secrets like `PAYLOAD_SECRET` must never be committed to git, so `.env` is created *manually on the server* from a template (`.env.example`). If it's missing or still has placeholder values, the app is either broken or insecure.
- **`PAYLOAD_SECRET`**: the string PayloadCMS uses to sign login sessions (JWTs). The default placeholder works enough to boot, but is insecure — so `deploy.sh` refuses to proceed if it's still the default.
- **PM2**: the process manager running the backend (:3000) and frontend (:4321). It runs **per user** — root's PM2 is separate from any other user's PM2. So the deploy must run as the *same* user that owns the running PM2 processes (here: root).

---

## 2. Problems & fixes (each topic, step by step)

### Problem A — Re-dispatch kept showing the OLD error

**Symptom:** I added better diagnostics to `deploy.yml`, you re-dispatched, but the output was still the old "Repo not found … run setup-vps.sh".

**Cause:** I had edited `.github/workflows/deploy.yml` **only on my local machine**. GitHub Actions does **not** read your local files — it runs the workflow file as it exists on the **remote `main` branch**. Until the edit is committed & pushed, dispatching keeps running the old version.

**Fix:** commit & push (it became commit `79b82ed`), then re-dispatch.

```bash
git add .github/workflows/deploy.yml docs/sprint-11/   # stage the workflow + docs
git commit -m "fix(deploy): add repo-not-found diagnostics …"   # record the change
git push origin main                                    # send it to GitHub — only NOW does the workflow see it
```

**Lesson:** after editing any `.github/workflows/*.yml`, you **must push** before a dispatch will use it.

---

### Problem B — `Repo not found at ~/portfolio` (the headline)

**Symptom:** the workflow SSH'd in, checked for `~/portfolio`, didn't find it, and aborted.

**Diagnosis output (after Problem A was fixed):**
```
==> Deploy target: user=***  HOME=/home/***  REPO_DIR=/home/***/portfolio
❌ DEPLOY ABORTED: git repo not found at /home/***/portfolio
   Contents of /home/***:   .bashrc  .ssh  .npmrc  … (no portfolio)
   Probing other common repo locations: (none found under /root or /home/*)
   node: /usr/bin/node   pm2: /usr/bin/pm2   nginx: /usr/sbin/nginx   ← tools ARE installed
```

**Cause:** the workflow was logging in as a **non-root user** (home `/home/***`). The repo was **not** in that user's home. The probe said "none found under /root" — but that was **misleading**: the probe *also* ran as the non-root user, and `/root` is permission-locked (`700`), so a non-root user **cannot see inside `/root`** even to test if the folder exists. The repo was actually sitting right there at `/root/portfolio`, invisible to the non-root user.

**How we confirmed:** you SSH'd in as **root** and ran:

```bash
pwd                  # /root           → you are root, so '~' = /root
ls                   # portfolio  snap  → the repo IS here, at /root/portfolio
ls /root/portfolio   # AGENTS.md backend frontend scripts … → it's the full project
pm2 list             # portfolio-backend & portfolio-frontend, both ONLINE, running as root
```

That told us three things at once: (1) the repo lives under **root**, (2) the live app is run by **root's PM2**, (3) the workflow's `VPS_USER` secret was pointing at the **wrong user**.

**Fix:** set the GitHub secret `VPS_USER` to `root`, so the workflow logs in as the same user that owns the repo and PM2.

```bash
# In GitHub: repo → Settings → Secrets and variables → Actions
# Edit VPS_USER  →  root
```

**Why root and not "move the repo to the other user":** the *entire* provisioning (clone, PM2, nginx, SSL) was done as root. Re-doing all that under another user is far more work and risk than just telling the workflow to log in as root. For a personal single-tenant VPS, a root deploy user is pragmatic.

**Lesson:** the deploy user **must match** the user that owns the repo + PM2. Document that user (see action items).

---

### Problem C — `ssh: unable to authenticate … no supported methods remain`

**Symptom:** after setting `VPS_USER=root`, the workflow now failed *earlier*, at the SSH handshake:
```
ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey], no supported methods remain
```

**Cause:** progress! The workflow was now *trying* to log in as root, but root's `/root/.ssh/authorized_keys` did **not** contain the workflow's public key. (Before, the same key worked for the non-root user, because *that* user's `authorized_keys` had it.) SSH key auth = "the public key matching my private key must be in the target user's `authorized_keys`." For root, it wasn't.

**Fix (run on the VPS as root):** copy the already-working public key from the non-root user into root's `authorized_keys`. This reuses the existing key — no need to regenerate it or change the `VPS_SSH_KEY` secret.

```bash
# Create root's .ssh directory if it doesn't exist, with safe permissions.
mkdir -p /root/.ssh        # -p = "create parent dirs, don't error if it already exists"
chmod 700 /root/.ssh       # owner-only rwx; sshd refuses .ssh that's group/world-writable

# Read the public key from the non-root user the workflow used to log in as,
# and write it into root's authorized_keys.
# (The glob /home/*/.ssh/authorized_keys matches the file; adjust if you know the exact username.)
cat /home/*/.ssh/authorized_keys > /root/.ssh/authorized_keys

chmod 600 /root/.ssh/authorized_keys   # owner-only rw; sshd IGNORES authorized_keys that are too open
wc -l  /root/.ssh/authorized_keys      # sanity check: should print >= 1 line
```

Also confirm sshd permits root logins (this VPS already had it, so no action was needed):

```bash
grep -i "^PermitRootLogin" /etc/ssh/sshd_config
# 'yes' or 'prohibit-password' both allow KEY-based root login ('prohibit-password' blocks password login = safer).
# This VPS returned: PermitRootLogin yes  → already fine.
# If it had been 'no', you would:
#   sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
#   sudo systemctl restart sshd
```

**Lesson:** when changing the deploy user, that user's `authorized_keys` must contain the workflow's public key. (`PermitRootLogin` must also allow it.)

---

### Problem D — `PAYLOAD_SECRET in backend/.env is still the default`

**Symptom:** SSH auth now worked, the repo was found, `git fetch`/`reset` ran… then `deploy.sh` aborted:
```
=== Build backend ===
❌ PAYLOAD_SECRET in backend/.env is still the default. Generate one with: openssl rand -base64 32
```

**Cause:** `/root/portfolio/backend/.env` existed (so the app could boot) but its `PAYLOAD_SECRET` was still the placeholder `your-secret-here` copied from `.env.example`. Most likely the very first provisioning created `.env` from the template, a later `setup-vps.sh` run saw `.env` already existed and **skipped** the secret-generation step (its own `if [ ! -f .env ]` guard), so the placeholder was never replaced. The app ran anyway (Payload boots with any non-empty secret), but `deploy.sh` deliberately refuses to ship an insecure default.

**Fix (run on the VPS as root):** generate a strong random secret and write it into `.env`.

```bash
cd /root/portfolio/backend                       # go to where .env lives

SECRET=$(openssl rand -base64 32)                # generate 32 random bytes, base64-encode → a strong secret string
                                                 # (stored in shell variable $SECRET for the next command)

# Replace the PAYLOAD_SECRET line in .env with the new value.
# Delimiter is '#' (not '/') because base64 output can contain '/' — using '/' would break sed.
sed -i "s#PAYLOAD_SECRET=.*#PAYLOAD_SECRET=$SECRET#" .env

grep PAYLOAD_SECRET .env                         # verify: should show a long random string, NOT 'your-secret-here'
cat .env                                         # eyeball the rest (DB, CORS, etc.) while you're here
```

**Side effect to expect:** changing `PAYLOAD_SECRET` invalidates old admin sessions (they were signed with the old secret). You'll need to **log in to `/admin` again** after the deploy. Normal and harmless for a personal site.

**Lesson:** `.env` is created once, by hand (or by `setup-vps.sh`), and lives only on the server. If provisioning is ever interrupted and re-run, double-check `PAYLOAD_SECRET` actually got set.

---

## 3. The full successful sequence (copy-paste reference for next time)

If a fresh VPS ever needs wiring up to this deploy workflow, here's the complete annotated set:

```bash
# ── On the VPS, logged in as root ──

# 1. Authorize the workflow's SSH key for root.
mkdir -p /root/.ssh && chmod 700 /root/.ssh
cat /home/*/.ssh/authorized_keys > /root/.ssh/authorized_keys   # reuse the key the workflow already uses
chmod 600 /root/.ssh/authorized_keys

# 2. Ensure sshd allows key-based root login (should print 'yes' or 'prohibit-password').
grep -i "^PermitRootLogin" /etc/ssh/sshd_config

# 3. Make sure the repo + .env are in place (if /root/portfolio is missing, see setup-vps.sh).
ls /root/portfolio
cd /root/portfolio/backend
SECRET=$(openssl rand -base64 32)
sed -i "s#PAYLOAD_SECRET=.*#PAYLOAD_SECRET=$SECRET#" .env
grep PAYLOAD_SECRET .env      # confirm it's a real secret now

# ── In GitHub → repo → Settings → Secrets and variables → Actions ──
# 4. VPS_HOST = <server IP>   VPS_USER = root   VPS_SSH_KEY = <private key matching the authorized_keys above>

# ── In GitHub → Actions → "Deploy to VPS" → Run workflow (branch: main) ──
# 5. The workflow now: SSH as root → git fetch/reset → deploy.sh (build + pm2 restart) → ✅
```

---

## 4. Verification

| Check | Before | After |
|-------|--------|-------|
| Workflow dispatch | Failed at "Repo not found" | ✅ Runs to completion |
| SSH auth as root | `unable to authenticate` | ✅ Key accepted |
| `git fetch`/`reset` on VPS | never reached | ✅ `05cdac2..79b82ed main` |
| `deploy.sh` build + `pm2 restart` | blocked at secret check | ✅ completes, services online |
| `pm2 list` | portfolio-backend/frontend online (root) | still online, restarted with latest code |

---

## 5. Why this was hard to find (contributing factors)

- **Permission-blind diagnostics:** the probe for `/root/portfolio` ran as a non-root user and silently returned "not found" because it couldn't traverse `/root`. The output was *technically correct but misleading*. (Action item below: improve the probe or at least hint at this.)
- **Secret value masking:** GitHub log masking replaced the username with `***`, hiding that the workflow user and the repo owner were different people-class entities.
- **Private repo + gitignored `.env`:** ruled out the obvious "just clone it" fix — a fresh clone would still lack `.env`, so it would just fail later. The only real recovery is provisioning, not a workflow tweak.
- **Partially-provisioned VPS:** `node`/`pm2`/`nginx` were installed (system-wide), which *looked* like provisioning had succeeded — but the repo clone + `.env` step had effectively been skipped for the deploy user. "Tools present" ≠ "app deployable."
- **`VPS_USER` was a silent assumption:** nothing in the workflow or docs stated which user the deploy must run as, so it was set to a non-root user by default.

---

## 6. Lessons & action items

- [ ] **Document the canonical deploy user.** Add to `AGENTS.md` / deploy docs: *"Deploys run as `root` on the VPS; the repo is at `/root/portfolio`; PM2 & nginx run as root."* So nobody re-trips the `VPS_USER` mismatch.
- [ ] **Improve the deploy probe** to surface the `/root` permission blind spot — e.g. if the SSH user is non-root and nothing is found, add a hint: *"repo may exist under another user (e.g. /root) that this user can't read — check VPS_USER."*
- [ ] **Provisioning checklist:** after `setup-vps.sh`, verify `grep PAYLOAD_SECRET backend/.env` is **not** the placeholder, so Problem D can't recur silently.
- [ ] (Future, bigger) Consider switching from **build-on-VPS** to **build-on-runner + rsync/scp** — removes the VPS-side git credentials, repo-state, and `.env`-on-server coupling entirely. Out of scope for this RCA.
- [x] **Push workflow edits before dispatching** (Problem A) — now a known gotcha for this repo.

---

## 7. References

- Workflow: [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) (commit `79b82ed` — diagnostics)
- Provisioning: [`scripts/setup-vps.sh`](../../../scripts/setup-vps.sh), deploy: [`scripts/deploy.sh`](../../../scripts/deploy.sh)
- Prev RCA (sprint-9): [`../../sprint-9/rca/2026-07-18-vps-first-deploy.md`](../../sprint-9/rca/2026-07-18-vps-first-deploy.md) (firewall, nginx SSL, `/_next` routing, sed delimiter)
