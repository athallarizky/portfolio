# Translating Abstract Grafana Logs into Human Language with AI

## The Triage Bottleneck

In fast-moving engineering teams like Kitabisa, bug reports inevitably surface at the worst possible moments — right when developers are heads-down shipping critical features or deep in incident remediation.

When an issue arrives, Product Managers or Operations teammates naturally want to assess the situation immediately: *Is this widespread? What broke? Does it affect transactions?*

They open Grafana, click through dashboards, and hit a wall.

The logs are abstract, saturated with technical metrics, ANSI escape codes, and obscure stack traces. Unless you are intimately familiar with the microservices codebase, looking at raw Loki streams feels like trying to read Matrix code. As a result, bug tickets sit idle in triage queues, waiting for an available engineer just to answer the basic question: *what actually happened?*

## Why Not Translate Telemetry into Plain Human Language?

That recurring bottleneck sparked a simple question: **Why can't our tools translate technical logs into plain language so anyone — engineer or non-engineer — can understand what is failing?**

While Grafana now offers an official Model Context Protocol (MCP) server, integrating it across distributed internal environments comes with friction: provisioning administrative service account tokens, configuring strict ingress policies, and dealing with complex authentication flows.

Instead of over-engineering an enterprise proxy, I experimented with building a lightweight, tailored tool: **Grafana Analyzer**.

The objective was dead simple. A user should be able to type a natural question in their everyday voice:

> *"Can you check the logs for the payment service around 2 PM today? Was there an error, and please explain it for non-engineers."*

...and receive an instant, plain-English diagnosis.

## What Happens Behind the Scenes

Behind that conversational interface, a lightweight four-stage pipeline coordinates the discovery and explanation:

1. **Zero-Friction Authentication (Playwright):** Instead of generating long-lived API keys, the tool opens the user's local Chromium or Brave browser profile using Playwright. It piggybacks on the existing GitHub OAuth login, captures the valid session cookie, and caches it locally for 12 hours.
2. **Natural Intent Parsing:** The agent translates the user's natural language request (e.g., "around 2 PM in payment service") into precise Loki API query parameters: target environment (`stg`/`prod`), Kubernetes namespace, search keywords, and exact epoch millisecond boundaries in the local timezone (UTC+7).
3. **Sanitization & Normalization:** Raw log streams returned by Loki are cleaned up: ANSI color escape sequences are stripped, noisy repetitive metadata is removed, and the payload is capped to the most recent relevant 500 lines so it fits comfortably within the LLM's context budget.
4. **LLM Translation:** The normalized stream is fed into Claude with a clear instruction: diagnose the root cause, ignore operational noise, and explain the problem in plain terms.

Instead of staring at a wall of cryptic JSON and timeouts, the non-engineer immediately sees:

> *"At 14:05, the payment service experienced a database connection pool timeout when connecting to the primary replica. It did not drop customer balances, but 12 checkout attempts failed to receive confirmation from the upstream bank gateway."*

## The Real-World Impact

Building this bridge created outsized leverage for team operations:

- **Self-Serve Incident Scoping:** PMs and ops leads no longer have to wait for an engineer to become free just to triage a ticket. They can self-serve log inspection and evaluate whether an issue is an isolated blip or a critical outage.
- **Zero-to-Fix Handoffs:** When an engineer finally becomes available, they don't have to start tracing from scratch. The initial investigation is already synthesized, complete with timestamps, service namespaces, and suspected failure points.
- **Accessibility Over Complexity:** Observability data shouldn't be locked behind specialized query languages. When telemetry is accessible in human language, the entire organization moves faster.

Sometimes the most valuable AI tools aren't massive autonomous agents trying to write code from scratch. They are small, pragmatic bridges that take existing, intimidating technical systems and make them understandable to everyone.
