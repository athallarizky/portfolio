# Guardian

> Personal · OSS · 2026

A read-only IOC watchdog that sweeps every repo I own (every branch) on a 30-minute cadence — deliberately living outside those repos so no write-token can disable it. Findings raise GitHub issues and Telegram alerts with real repo names.

**Tech:** github, cloudflare, tools
**Source:** https://github.com/athallarizky/guardian

## Overview

## Overview

Guardian is the monitoring layer built in response to a real supply-chain campaign (October 2026) that planted dormant execution hooks and disguised payloads into my repositories via **git history rewrites** — lookalike commits carrying the original messages, dates, and authors over different trees. It answers one structural insight: **anything stored inside a victim repo can be neutralized by the same credential that infected it.** Branch protection, workflows, revert scripts — all editable in-repo. So the watcher lives outside the blast radius, and its PAT is read-only.

## Architecture & Flow

```
guardian-sweep.yml (guardian repo, public = free Actions minutes)
  • cron ×4/hour (:02 :17 :32 :47 — redundant slots; GitHub drops
    scheduled runs under load) + workflow_dispatch
  • lists repos via fine-grained read-only PAT, scans every branch
  • findings → GitHub issue + Telegram alert
  • issue dedup: comments on an open IOC issue <90 min old

malware-guard.yml (per-repo, private repos without ruleset plans)
  • on push: scan tree → verdict != clean → force-revert the branch
    to the pre-push SHA via the ephemeral GITHUB_TOKEN (nothing stealable)

rulesets (public repos): required_signatures + non_fast_forward + deletion
guardian-dispatcher (Cloudflare Worker): external heartbeat
guardian-webhook (Cloudflare Worker): HMAC-verified webhook → scan → revert
```

**Finding → issue → Telegram, end to end:** when a sweep detects an artifact, it opens a GitHub issue on the guardian repo with the finding class and affected refs — repo names masked as `R-<8hex>` (sha256(name+salt), resolved locally via a derived map since the salt never leaves the machine) — and posts a Telegram message to a private group via bot API with the **real** repo names and artifact paths. Duplicate findings within 90 minutes become comments on the open issue instead of new spam.

**Two-stage detection keeps API usage sane:** stage 1 selects candidates from the tree API (path + size, one call per branch) — presence policies for `.vscode/*` and `public/fonts/*`, executable surfaces, name-matched fake-font patterns at any size (a 29KB `.orc` payload once sailed over a naive 10KB gate); stage 2 fetches and arbitrates content with two-condition markers. **Every fetch failure is a SCAN-ERROR, never a clean verdict** — a throttled run once reported 134 infected refs as clean by failing silently; that class of silence is designed out.

**The scheduler that silently stopped:** after the campaign, GitHub's Actions scheduler began dropping the repo's native cron (suspected account abuse-flag; `workflow_dispatch` still worked). The fix is `guardian-dispatcher` — a Cloudflare Worker on a */20 cron that checks the last sweep run via the **public** API (no token) and dispatches only when stale (>45 min), making it idempotent with the native cron: whichever fires first wins, no duplicate sweeps. `guardian-webhook` closes the push path: repo webhooks → HMAC verify → IOC scan → force-revert + Telegram, living outside all repos with a Contents-RW token that deliberately has **no workflow scope**.

## Platform Constraints Learned (the hard way)

- Branch rulesets: public repos on any plan; private repos need Pro/Team — failures reported, not fatal (the in-repo guard covers the gap)
- Server-side path blocking (`file_path_restriction`): org repos on paid plans only — the compensating control is detection speed (≤ ~1h)
- REST Contents-API commits are unsigned — any workflow committing via API must live in a repo without `required_signatures` (why guardian's own ruleset omits it)
- The force-revert step's `if:` must include `always()` — the scan step exits 1 on detection, and GitHub skips dependent steps on red

## The Layers Today

| Layer | Where | Protects |
|---|---|---|
| guardian-sweep (hourly IOC sweep) | guardian repo, read-only PAT | all repos, all branches |
| malware-guard (push scan + force-revert) | per-repo workflow / rulesets | the push path |
| guardian-dispatcher | Cloudflare Worker | the schedule itself |
| guardian-webhook | Cloudflare Worker | out-of-band push tamper guard |


## Architecture

    guardian/  (github.com/athallarizky/guardian)
    ├── .github/workflows/
    │   └── guardian-sweep.yml      # cron ×4/h + dispatch: list repos → scan branches
    │                                #   → issue (R-masked names) + Telegram (real names)
    ├── guard/
    │   ├── malware-guard.yml       # per-repo template: push scan → force-revert
    │   └── guardian-sweep.yml      # sweep template (live copy in guardian repo)
    ├── scripts/                    # protect-repos / deploy-guard / guardian-map /
    │                               #   ruleset-lift / onboard-repo
    └── AGENTS.md                   # alert-triage runbook
    
    guardian-dispatcher/  (Cloudflare Worker — cron */20, staleness gate 45 min)
    guardian-webhook/     (Cloudflare Worker — HMAC webhook guard → revert + TG)
    …

*(Full technical body in project.json.)*
