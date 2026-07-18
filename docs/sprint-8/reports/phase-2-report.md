# Phase 2 Report — CI/CD (GitHub Actions)

> Completed: 2026-07-14

---

## 1. What was done

Created `.github/workflows/deploy.yml` — triggers on push to `main`.

**Flow:**
1. SSH into VPS
2. `git fetch origin main && git reset --hard origin/main`
3. `rm -rf docs/` — exclude planning artifacts from production
4. `bash scripts/deploy.sh` — builds both services, prints PM2 commands

## 2. Required secrets

Set in GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Tencent VPS IP address |
| `VPS_USER` | SSH username |
| `VPS_SSH_KEY` | Private SSH key for deploy access |

## 3. Verification

- Workflow YAML is valid (standard `appleboy/ssh-action` pattern)
- `rm -rf docs/` handles the taste preference to exclude `/docs` from VPS
- Deploy script does NOT run seed — user controls seeding manually
