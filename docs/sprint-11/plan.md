# Sprint-11 Plan — Deploy Workflow to Manual Dispatch

> Status: 🔵 In Progress | Created: 2026-07-18
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-9/final-report.md`](../sprint-9/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-9 provisioned the VPS successfully. However, the GitHub Action deploy workflow still fails on every push to `main` because it triggers automatically and the VPS `~/portfolio` directory exists — but the auto-deploy pattern is unnecessary. We prefer manual control over when deploys happen.

Sprint-10 is currently in planning (separate track). Sprint-11 handles the deploy workflow fix.

## 1. Sprint goal

Switch GitHub Action deploy from auto-trigger (`push: [main]`) to manual trigger (`workflow_dispatch`), and document the new manual deploy workflow.

## 2. Scope

**In scope:**
- Change `.github/workflows/deploy.yml` trigger from `push: [main]` to `workflow_dispatch`
- Create sprint-11 documentation (plan, tasks, reports, final-report)
- Document manual deploy workflow for future reference

**Out of scope:**
- Sprint-10 work (separate sprint)
- Content/seed changes
- Infrastructure changes

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| `workflow_dispatch` instead of `push` | User prefers manual control; VPS is stable, no need for auto-deploy on every commit |
| Keep the deploy script intact | `deploy.sh` still works; just the trigger changes |
| Document manual deploy steps in sprint docs | Future agents/developers need to know how to trigger deploys |

## 4. Phasing

- **Phase 1 — Fix workflow:** Change trigger, verify YAML syntax
- **Phase 2 — Documentation:** Sprint docs + deploy instructions

## 5. Verification

1. Pushing to `main` does NOT trigger the deploy workflow
2. Manual dispatch via GitHub Actions tab works
3. `deploy.sh` behavior unchanged
4. Build passes
