# Task Breakdown — Sprint-9: VPS Provisioning, Nginx & SSL

> Status: ✅ Complete | Created: 2026-07-18
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery

| ID   | Task                           | Difficulty | Dependencies | Status |
|------|--------------------------------|------------|--------------|--------|
| 0.1  | Explore backend deploy config  | Easy       | —            | ✅     |
| 0.2  | Explore frontend build config  | Easy       | —            | ✅     |
| 0.3  | Explore existing deploy scripts | Easy      | —            | ✅     |

---

## Phase 1 — VPS provisioning + nginx

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 1.1  | Create `scripts/setup-vps.sh`           | Medium     | 0.1-0.3      | ✅     |
| 1.2  | Create `scripts/nginx/portfolio.conf`   | Easy       | 0.1-0.3      | ✅     |

### Service Summary
- **Runtime:** Bash (provisioning), nginx (reverse proxy)
- **Files:** `scripts/setup-vps.sh`, `scripts/nginx/portfolio.conf`
- **Key output:** VPS provisioned with firewall, nginx, certbot, PM2, Node.js 22

> 📄 Report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — PM2 ecosystem + CI/CD

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 2.1  | Create `ecosystem.config.cjs`           | Easy       | —            | ✅     |
| 2.2  | Update `scripts/deploy.sh` (PM2 restart)| Easy       | 2.1          | ✅     |
| 2.3  | Update `.github/workflows/deploy.yml`   | Easy       | 2.1          | ✅     |
| 2.4  | Update `docs/sprint-8/AGENTS.md`        | Easy       | 2.1          | ✅     |

### Service Summary
- **Runtime:** PM2 (process manager)
- **Files:** `ecosystem.config.cjs`, `scripts/deploy.sh`, `.github/workflows/deploy.yml`, `docs/sprint-8/AGENTS.md`
- **Key output:** Both services managed by PM2 with auto-restart

> 📄 Report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Documentation & verification

| ID   | Task                                    | Difficulty | Dependencies | Status |
|------|-----------------------------------------|------------|--------------|--------|
| 3.1  | Fix pre-existing type errors            | Medium     | —            | ✅     |
| 3.2  | Write sprint docs (plan, tasks, reports)| Medium     | 1.1-2.4      | ✅     |
| 3.3  | Verify build (backend + frontend)       | Easy       | 3.1          | ✅     |

---

## Dependency Graph

```
0.1 ──┐
0.2 ──┼──► 1.1 ──► 2.2 ──► 2.3 ──► 3.2
0.3 ──┘   │
           └──► 1.2

2.1 ──► 2.2, 2.3, 2.4

3.1 ──► 3.3
```

## Summary

| Phase                     | Tasks | Difficulty Mix | Status |
|---------------------------|-------|----------------|--------|
| 0 — Discovery             | 3     | 3 E            | ✅     |
| 1 — VPS provisioning      | 2     | 1 M, 1 E       | ✅     |
| 2 — PM2 + CI/CD           | 4     | 4 E            | ✅     |
| 3 — Docs & verification   | 3     | 1 M, 2 E       | ✅     |
| **Total**                 | **12**| **9 E, 3 M**   | ✅     |
