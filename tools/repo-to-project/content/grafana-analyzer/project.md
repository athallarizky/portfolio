# Grafana Analyzer

## Technical Overview

`grafana-tools` (branded as **Grafana Analyzer**) is an automated log interrogation and diagnostic utility built for internal engineering workflows at Kitabisa. During operational incidents and bug triage, log telemetry stored in Grafana and Loki is often dense, distributed across Kubernetes namespaces, and heavily obscured by stack traces or raw JSON payloads. Non-engineers (product managers, operations personnel, and customer support leads) are blocked from understanding the blast radius of reported issues, leaving triage queues idle until a developer becomes available to run manual trace queries.

While Grafana provides an official Model Context Protocol (MCP) server, it requires administrative API keys and complex network access rules. Grafana Analyzer solves this by combining headless browser session extraction with local Claude model pipelines, allowing users to query and diagnose logs in plain natural language.

## Architecture & Pipeline Flow

```
[ User Query / Terminal / Claude Code ]
  "Check errors in payment service around 2 PM and explain for non-engineers"
                   │
                   ▼
      [ Intent Parser (intent.js) ]
  (Claude Haiku extracts: env, namespace, search terms, epoch ms)
                   │
                   ▼
   [ Browser Auth Session (auth.js) ] ────▶ [ Local Cache (~/.grafana-tools/session.json) ]
  (Playwright grabs GitHub OAuth session)
                   │
                   ▼
       [ Loki Client (query.js) ]
  (POST /api/datasources/proxy/... with LogQL expr & range)
                   │
                   ▼
     [ Stream Normalizer (parser.js) ]
  (Strips ANSI, extracts timestamps, deduplicates & clamps to 500 lines)
                   │
                   ▼
     [ Diagnostic Engine (analyze.js) ]
  (Claude Sonnet analyzes root causes & streams plain-language verdict)
                   │
                   ▼
[ Streamed Output to Terminal / Non-Engineer Summary ]
```

1. **Natural Language Intent Extraction:** Incoming conversational prompts pass through `src/intent.js` using `claude-haiku-4-5`. It parses unstructured requests into strict JSON containing target environment (`stg` or `prod`), target Kubernetes namespace (`steril`, `payment`, `auth`), search tokens, and epoch millisecond ranges calculated against Asia/Jakarta time (UTC+7).
2. **Zero-Config OAuth Session Hijacking:** Rather than generating and managing long-lived Grafana service tokens, `src/auth.js` leverages Playwright to attach to the user's local Chromium or Brave profile. It captures the authenticated `grafana_session` cookie from GitHub OAuth and persists it to `~/.grafana-tools/session.json` with a 12-hour sliding expiry window.
3. **Targeted LogQL Range Queries:** The query module (`src/query.js`) formats the parameters into Grafana Loki proxy requests (`/api/datasources/proxy/<uid>/loki/api/v1/query_range`), executing LogQL expressions such as `{namespace="payment"} |= `timeout`` across specified epoch windows.
4. **Log Normalization & Context Budgeting:** Raw Loki responses contain noisy metadata, escape codes, and nested JSON. `src/parser.js` flattens the log streams, sanitizes ANSI styling, and caps the payload to the most recent 500 log lines to ensure token efficiency and prevent LLM context exhaustion.
5. **AI Root-Cause Diagnosis:** `src/analyze.js` invokes `claude-sonnet-4-6` with a targeted system prompt tailored for service reliability engineering. It streams an immediate diagnostic assessment explaining what failed (e.g. database connection pool saturation, payment gateway HTTP 502s) and suggests remediation steps.
6. **Dual Execution Runtime:** Works both as an interactive terminal REPL (`index.js`) and as an agent capability documented in `AGENTS.md` for seamless integration into Claude Code workflows.
