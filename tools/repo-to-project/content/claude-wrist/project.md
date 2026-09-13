# Claude Wrist (cw)

## Technical Overview

`claude-wrist` (`cw`) is an edge-engineering bridge that turns a smartwatch (**Huawei Watch Fit 4 Pro**) into a physical remote control for an autonomous coding agent. When running long agentic workflows in **Claude Code** inside **Termux on Android**, dangerous tool calls (bash executions, file modifications) require human approval. Rather than keeping a terminal open, approvals and terminal tails are piped directly to the user's wrist.

## Technical Flow & Relay Architecture

```
[ Huawei Watch Fit 4 Pro ]
      │  Bluetooth LE (P2P Packets)
      ▼
[ Android Bridge APK ] (Kotlin + Huawei Wear Engine)
      │  HTTP Long-Poll (localhost:8742)
      ▼
[ cw-hub ] (Zero-dep Node.js Server in Termux)
   ├── Hooks Listener (receives tool_approval events from Claude CLI)
   └── tmux Controller (sends keystrokes 'y' / 'n' to attached session)
      ▼
[ Claude Code TUI ] (Running in tmux session)
```

1. **Core Principle (Zero Added Latency / No Extra LLMs):** The watch does not run an LLM, nor does the bridge query external APIs. The watch functions strictly as a hardware I/O peripheral for an existing local Claude Code session.
2. **`cw-hub` (The Local Coordinator):** A zero-dependency Node.js HTTP server running on `localhost:8742` inside the phone’s Termux environment:
   - **Approval Hooks:** Hooks into Claude Code lifecycle events (`pre-tool-call`). When a tool requires permission, Claude CLI executes a hook script that POSTs approval metadata (tool name, target file, command diff) to `cw-hub`.
   - **tmux Integration:** Communicates with the background `tmux` process via Unix commands (`tmux send-keys -t claude:0 ...`), injecting approvals without needing direct TUI interaction.
3. **Android Relay Bridge (Kotlin):** A native Android service utilizing the **Huawei Wear Engine SDK**:
   - Maintains a low-power persistent long-poll connection to `cw-hub` on `localhost:8742`.
   - Encodes approval payloads into compact binary packets transmitted over Bluetooth LE to the paired smartwatch.
   - Translates wrist taps (Approve / Deny) back into HTTP responses to `cw-hub`.
4. **Watch UI (HarmonyOS / Lite Wearable):** Lightweight wearable interface displaying tool details, proposed commands, and two tactile buttons (Approve / Reject), plus a live stream of the terminal's last 5 log lines.
