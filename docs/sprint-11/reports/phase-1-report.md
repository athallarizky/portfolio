# Phase 1 Report — Fix Workflow Trigger

> Completed: 2026-07-18

---

## 1. Change

```diff
- on:
-   push:
-     branches: [main]
+ on:
+   workflow_dispatch:
```

## 2. How to trigger deploy now

1. GitHub repo → **Actions** tab
2. Pilih **"Deploy to VPS"** workflow
3. Klik **"Run workflow"** → pilih branch `main` → **"Run workflow"**

## 3. Verification

| Check | Result |
|-------|--------|
| YAML syntax valid | ✅ |
| Push to main does NOT trigger deploy | ✅ (workflow_dispatch only) |
| `deploy.sh` unchanged | ✅ |

## 4. Reference files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | Manual dispatch workflow |
