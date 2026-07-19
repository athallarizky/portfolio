# Phase 3 Report — Deploy workflow: repo-not-found diagnostics

> Completed: 2026-07-19 · Trigger: owner report of failed manual dispatch (`❌ Repo not found at ~/portfolio`, run `29673461866`).

---

## 1. Symptom

Manual dispatch of **Deploy to VPS** fails in ~3s at the SSH step:

```
❌ Repo not found at ~/portfolio
   Run on VPS first: bash scripts/setup-vps.sh
Error: Process completed with exit code 1.
```

The check `if [ ! -d ~/portfolio ]` is true for the user the workflow SSHes in as, so the
workflow bails before doing any work.

## 2. Evidence (from GitHub Actions run history)

`gh run list --workflow="Deploy to VPS"` shows **every recorded run has failed** — both
the legacy `push`-triggered runs (pre-sprint-11) and the current `workflow_dispatch` run.
Combined with the sprint-9 RCA (the site *was* reachable at `https://athallarizky.com`),
this means:

- The VPS was brought up by running `scripts/setup-vps.sh` **manually on the VPS**, not by
  this workflow.
- This deploy workflow has **never succeeded**.
- Therefore the "repo not found" is almost certainly a **`VPS_USER` / path mismatch**: the
  workflow SSHes in as a user whose `$HOME` does not contain `~/portfolio` (the repo was
  cloned under a different user during manual provisioning), or the VPS was reset.

## 3. Why not auto-clone?

A naive "clone-if-missing" self-heal does **not** work here:

- The repo is **private** (`gh repo view` → `visibility: PRIVATE`), so a VPS clone needs a
  deploy key / token that may not be present for the workflow's SSH user.
- More decisively, `backend/.env` (which holds `PAYLOAD_SECRET` etc.) is **gitignored**. A
  fresh clone has no `.env`, so `scripts/deploy.sh` would immediately fail at its `.env`
  check (`❌ backend/.env not found`). The only real recovery is re-provisioning via
  `setup-vps.sh`, which regenerates `.env`.

So the workflow cannot meaningfully self-heal a missing repo — the correct behaviour is to
**fail fast with a precise diagnosis**.

## 4. The fix

Rewrote the inline SSH script in `.github/workflows/deploy.yml`. On a missing repo it now
prints:

- `whoami` + `$HOME` + the resolved `REPO_DIR` (so the SSH user / home is unambiguous).
- `ls -la $HOME` (see at a glance whether the repo is there).
- A **probe** of `/root/portfolio` and `/home/*/portfolio` — if the repo exists under a
  different user, it is reported with a "→ VPS_USER/path mismatch" hint.
- Presence of `node` / `pm2` / `nginx` (distinguishes "provisioned VPS, wrong user" from
  "fresh / reset VPS").
- A 2-cause fix matrix:
  1. **Wrong SSH user** → update the `VPS_USER` GitHub secret to the user that owns
     `~/portfolio`.
  2. **VPS reset / repo deleted** (gitignored `.env` gone too) → re-provision on the VPS:
     `bash scripts/setup-vps.sh`.

The successful-deploy path (`git fetch` → `reset --hard` → `rm -rf docs/` → `deploy.sh`)
is unchanged.

## 5. Test Results

| Check | Result |
|-------|--------|
| YAML parses (GitHub semantics) | ✅ valid (PyYAML maps unquoted `on:` → boolean; GitHub parses it correctly) |
| trigger still `workflow_dispatch` | ✅ |
| action + secrets (`VPS_HOST/USER/KEY`) | ✅ unchanged |
| inline script `bash -n` | ✅ syntax valid |
| actual end-to-end run | ⏳ not runnable from here — requires dispatching the workflow against the live VPS |

## 6. Next step (owner action)

Dispatch **Deploy to VPS** again. The new output will name the SSH user, show `$HOME`'s
contents, and report whether the repo exists elsewhere — which identifies the cause:

- If the probe finds the repo under another user → fix the `VPS_USER` secret (or re-provision
  as the workflow's user).
- If nothing is found and `node`/`pm2`/`nginx` are MISSING → the VPS was reset; run
  `bash scripts/setup-vps.sh` on the VPS, then re-dispatch.

## 7. Notes

- This is a diagnostics/UX fix, not a behavioural cure: the underlying issue is VPS state
  (user/path or reset), which only a VPS-side action resolves. The workflow now tells you
  exactly which one.
- Consider (future) switching the deploy model from "build on VPS" to "build on runner,
  rsync to VPS" to remove the VPS-side git-credentials / repo-state dependency entirely —
  out of scope for this phase.
