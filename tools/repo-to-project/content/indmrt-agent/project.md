# Indmrt Agent

## Technical Overview

`indmrt-agent` is an on-device Android automation bridge that allows autonomous AI agents to interact with native mobile applications (originally built to automate shopping workflows in **Klik Indomaret** and **Alfagift**). Modern operating systems starting from Android 14+ (tested up to Android 16 on HyperOS) strictly block shell-level input injection (`adb shell input tap`, `uiautomator2`, and Appium) with `INJECT_EVENTS` security exceptions. This project bypasses that restriction by hosting a lightweight JavaScript HTTP daemon inside **AutoJs6**, exposing Android's native **AccessibilityService** gestures over an internal REST API on port `9318`.

## Architecture & Execution Flow

```
[ LLM Orchestrator ] (Claude Code / Hermes-termux)
         │
         │ Decides action via JSON schema / Tool call
         ▼
[ Local HTTP Client ] (client.py or curl)
         │
         │ GET /launch?pkg=... | /find?q=... | /tap?x=..&y=..
         ▼
[ AutoJs6 agent_server.js ] (Listening on :9318 on-device)
         │
         │ Translates requests into AccessibilityService calls
         │ Uses dispatchGesture() (bypasses INJECT_EVENTS)
         ▼
[ Android AccessibilityService ]
         ├── Element Inspection (/find: text, id, desc bounds traversal)
         ├── Gesture Dispatcher (stroke paths, click center x/y, swipe ms)
         └── Window Bounds Evaluator (handles split-screen & resolutions)
         ▼
[ Target App ] (Klik Indomaret / Alfagift)
```

1. **Two-Component Division of Labor:**
   - **The Brain (LLM Orchestrator):** Runs locally in Termux or on host machines (tested with Claude Code harness and Hermes-termux). It observes state, decides next steps (e.g. dismissing promotional popups, navigating to product categories), and sequences actions.
   - **The Hands (AccessibilityService):** Runs as an Android system service granted to AutoJs6. It translates HTTP calls into low-level gesture strokes and UI node queries.
2. **Bypassing the INJECT_EVENTS Lockdown:** Unlike shell-based injection which fails on Android 14+ without root/system privileges, gestures dispatched via `AccessibilityService.dispatchGesture()` route through `AccessibilityManagerService`. This allows non-root automation on modern Android releases.
3. **Token-Efficient Element Discovery:**
   - **Zero-Token Inspection (Accessibility Tree):** Rather than blindly sending multi-megabyte screenshots to multimodal models, the agent first queries `/find?q=<label>` to recursively search UI nodes by text, view ID, or content-description. It returns exact screen bounds (`[left, top, right, bottom]`) at zero LLM cost.
   - **Targeted Partial Vision:** When dynamic elements or custom obfuscated views lack accessibility nodes, the orchestrator crops partial vertical slices (e.g. top 250px for the search bar) instead of full-screen captures. Since multimodal API costs scale with image pixel dimensions rather than text density, partial crops drastically reduce operational token costs.
4. **Structured Workflow Recording:** Element coordinates and interaction sequences are recorded into structured JSON templates, allowing the system to replay routine shopping flows deterministically without continuous trial-and-error looping.
5. **Security Isolation & Guardrails:** Granting accessibility permissions gives automated agents full control over screen taps and keystrokes. The project implements strict operational guardrails: sensitive flows (checkout, payment gateways, and authentication screens) are isolated from autonomous loops, and the HTTP server binds strictly to localhost to prevent local network hijacking.
