# How to Control Android Devices with AI Agents (Without Root)

## Moving Beyond the Browser

Most autonomous AI agents today live inside a clean web browser sandbox or a desktop terminal. But the vast majority of our daily transactions — groceries, ride-hailing, e-wallets, and instant messaging — happen inside native mobile apps.

Automating native mobile apps with AI sounds daunting, but it boils down to an elegant two-component architecture:

1. **The LLM Orchestrator (The Brain & Eyes):** An agentic loop (like Claude Code or Hermes) that observes screen state, plans actions, handles unexpected banners, and coordinates task sequences.
2. **The Accessibility Service (The Hands):** The physical executor that taps coordinates, swipes, types text, and reads screen element trees.

Recently, I built `indmrt-agent` to automate native retail apps like Klik Indomaret and Alfagift. The journey revealed fascinating technical lessons about modern Android security, multimodal vision token economics, and the reality of mobile agent safety.

## The Android 14+ Input Injection Wall

If you have automated Android apps in the past using ADB (`adb shell input tap`), Appium, or uiautomator2, you might assume controlling a phone is trivial.

On modern Android versions (tested up to Android 16 on HyperOS), **shell-based input injection is completely blocked** for third-party apps. The OS throws a strict security exception: `INJECT_EVENTS requires system permissions`.

The only viable, non-root mechanism remaining is an **Accessibility Service** with gesture dispatch privileges (`canPerformGestures="true"`). By routing gestures through `AccessibilityService.dispatchGesture()`, actions pass through `AccessibilityManagerService` rather than the locked-down `InputManagerService`.

By running a tiny JavaScript HTTP daemon inside **AutoJs6** on the device, any local agent (running in Termux or on a development machine) can command the phone over a lightweight REST API on port `9318`.

## How to "Teach" an On-Device Agent

Getting an AI model to navigate an unfamiliar mobile app requires a structured discovery protocol:

1. **Calibrate Window Bounds:** Every device has different screen ratios, resolutions, and split-screen layouts. Before doing anything, have the agent define the active app window area so all subsequent coordinates are mapped to valid bounds.
2. **Inspect Before You Look (Zero-Token Discovery):** Before jumping straight into vision models, query the Accessibility node tree. The service can inspect element labels, resource IDs, and bounding boxes directly. Finding a "Search" button via node inspection costs **zero tokens** and executes in single-digit milliseconds.
3. **Targeted Partial Vision:** Multimodal vision models (like Claude or GPT-4o) are essential for debugging custom canvas views or promotional popups where accessibility nodes are obfuscated. However, vision API pricing scales with **image pixel dimensions**, not text density. Sending full-resolution screenshots drains your budget fast. Instead, instruct the agent to capture partial vertical slices (e.g., top 250px for the search bar). Slicing the image drastically cuts cost while preserving visual clarity.
4. **Persist Workflows to Structured JSON:** Once the agent successfully navigates a multi-step sequence (e.g., dismissing the promotional popup, entering a product name, adding to cart), save that interaction graph into structured JSON. Routine paths can be replayed deterministically without continuous trial-and-error reasoning loops.

## The Double-Edged Sword: Security & Guardrails

Granting an AI agent accessibility permissions gives it god-mode over your device screen. It can tap buttons, read stored session tokens, and interact with anything on display.

If left unconstrained, an autonomous loop experiencing a hallucination could trigger unwanted orders or wander into sensitive banking applications. Operational boundaries are mandatory:

- **Never Automate Sensitive Actions:** Restrict the agent's scope strictly to discovery and cart addition. Sensitive phases — checkout, payment pin entry, and biometric prompts — must always remain in human hands.
- **Bind to Localhost:** Prevent open-network access. Ensure local agent daemons bind exclusively to `127.0.0.1` or mandate pre-shared authentication tokens to avoid rogue requests across local Wi-Fi.

Mobile AI agents represent a massive leap in personal automation. By combining accessibility gestures with thoughtful token economics, we can build agents that live directly on our devices — fast, affordable, and safe.
