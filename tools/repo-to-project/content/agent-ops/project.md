# Agent Ops

## Technical Overview

`agent-ops` is a suite of focused, autonomous server-automation agents designed to manage and safeguard VPS infrastructure. Its flagship watchdog agent, `doctor`, operates on the **zero-tool diagnostic principle**: all metric extraction, classification, and alerting side effects are handled deterministically in TypeScript, while the LLM is invoked strictly as a read-only reasoning engine with zero execution privileges.

## Technical Flow & State Pipeline

```
[ Cron Trigger (Hourly) ]
           │
           ▼
[ Vitals Collector ] ──▶ CPU load, RAM MemAvailable, swap pressure, df disk, systemd units, HTTP ping
           │
           ▼
[ Classifier Engine ] ──▶ Evaluates thresholds, delta spikes, & flapping dampeners (config.ts)
           │
     ┌─────┴────────────────────────┐
     ▼ (Verdict: GREEN)             ▼ (Verdict: ANOMALY)
[ Fast Exit ] (0 tokens, $0)   [ LLM Diagnostician ] (Zero-tool prompt: root cause & risk analysis)
                                    │
                                    ▼
                               [ Fingerprint Hasher ] (SHA-256 metric dedup)
                                    │
                                    ▼
                               [ GitHub Issues API ] ──▶ Opens/Updates issue on failure
                                                         └── Auto-closes issue on recovery
```

1. **Deterministic Vitals Collection:** A lightweight TypeScript runner queries OS state directly via Node standard builtins and native system utilities: 1m/5m/15m load averages, memory margins (`/proc/meminfo`), swap activity, disk usage (`df`), systemd unit active states (`systemctl is-active`), and external HTTP endpoint health.
2. **Config-Driven Classification:** Rules in `config.ts` govern incident boundaries without touching code paths. Includes rate-of-change deltas and flapping dampening to prevent intermittent transient network blips from triggering false alarms.
3. **Zero-Tool LLM Diagnostic Layer:** The model (`glm-5-turbo` or Claude via Pi AI) holds **zero execution tools**, no shell permissions, and no database credentials. It receives a sanitized JSON snapshot of the anomaly and returns a structured diagnosis identifying the probable root cause, impact severity, and recommended human actions.
4. **Fingerprint Deduplication & Lifecycle Sync:** Generates a stable cryptographic fingerprint of the alert signature. If an issue remains unresolved across multiple cron runs, `doctor` updates the existing GitHub thread rather than spamming duplicate issues. When all metrics return to normal, it writes a recovery comment and automatically closes the issue.
5. **Isolated Testing Fixtures:** Features a comprehensive suite of offline JSON fixtures (e.g. `disk-90.json`, `ram-exhaustion.json`) allowing L0 classifier tests and mock diagnostic runs without touching live servers.
