# Mini Harness

> Personal · OSS · 2026

A minimal, zero-framework AI coding agent harness in ~180 lines of TypeScript — featuring an interactive REPL, streaming SSE, parallel tool execution, and self-correcting error handling.

**Tech:** typescript, tools
**Source:** https://github.com/athallarizky/mini-harness

## Overview

`mini-harness` is a cleanroom implementation of an autonomous terminal coding agent, built from scratch in ~180 lines of TypeScript using Bun and the official `@anthropic-ai/sdk`. By stripping away all framework bloat (no LangChain, no heavy orchestrators), it exposes the exact mechanics powering modern coding agents like Claude Code: a naked `while` loop, an in-memory message history, streaming SSE deltas, and self-correcting tools.

## Technical Architecture & Flow

The harness separates concerns into three focused modules:

```
user turn ──▶ history[] ──▶ ask() ──▶ [ Claude Model ]
                 ▲                           │ stream (SSE)
                 │                           ▼
         tool_result[] ◀── runTool() ◀── tool_use
                 │       (Promise.all)
                 └──────── loop until stop_reason !== "tool_use"
```

1. **`src/llm.ts` (The Translator):** Houses the SDK client and the system prompt SOP. Exposes a single `ask()` streaming entry point configured with `max_tokens: 8192` (critical to prevent generation truncation during large multi-file write payloads).
2. **`src/tools.ts` (The Hands):** Defines the tool catalog using strict JSON Schemas (`read_file`, `write_file`, `list_files`, `web_fetch`). The executor validates inputs prior to disk operations (preventing corrupted files like `undefined` names) and includes token-budget guards (`max_chars` truncation with `start_char` pagination). Crucially, failures return stringified `ERROR: ...` messages rather than throwing exceptions, allowing the model to inspect the error and self-correct in the subsequent turn.
3. **`src/index.ts` (The Brain):** Manages a dual-loop lifecycle:
   - **Outer Loop (REPL):** Built on Node `readline/promises`. Holds the single `MessageParam[]` history array that represents session memory. Commands like `/reset` wipe the array in-place, giving the agent instant amnesia without process restart.
   - **Inner Loop (Agent Turn):** Iterates up to `MAX_ITERATION = 10`. Pipes streaming tokens to `process.stdout.write` as deltas arrive. When the model stops with `tool_use`, it gathers all requested tool calls, executes them concurrently via `Promise.all()`, matches outputs to `tool_use_id`, appends a unified user result message, and loops.

## Architecture

```
mini-harness/
├── src/
│   ├── index.ts        # REPL shell + agent while-loop (Promise.all parallel tools)
│   ├── llm.ts          # Anthropic SDK client & streaming ask() entry point
│   └── tools.ts        # Tool definitions (JSON Schema) & stringified executor
├── bun.lock            # Lockfile (zero runtime deps beyond @anthropic-ai/sdk)
├── package.json        # Manifest
├── tsconfig.json       # Strict TS config for Bun
└── README.md
```
