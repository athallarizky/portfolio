# AI-Guided Learning Playbook

> Personal · 2026

A SKILL.md playbook that turns any AI agent into a strict learning coach — research-first, architecture-next, phased build — with one hard rule: the agent explains and guides, but never writes the code.

**Tech:** ai-agents, productivity
**Source:** https://github.com/athallarizky/agent-playbooks

## Overview

## Overview

AI-Guided Learning is a playbook — a single `SKILL.md` briefing that turns any AI agent into a strict learning coach. You say something like *"I want to learn [X] by building [Y]"*, and the agent takes over the teaching structure instead of the keyboard.

The workflow is four steps. **Research** first: current state of the technology, ecosystem, best practices, known deprecations and gotchas — shared before anything is built. **Architecture design** next: a `docs/plan.md` with a concepts glossary, ASCII architecture diagram, full file tree, and a numbered phase roadmap, agreed with you before a single line is written. **Phase breakdown** then splits the build into sequential phase files, each containing the goal, new concepts, complete copy-pasteable code with inline comments, a short why-we-wrote-it-this-way per block, and how to test that the phase works. **Iterate** last: you code one phase at a time, bring the errors back, and the agent diagnoses and explains — never advancing until the current phase compiles and works.

The hard rule that makes it learning instead of vibe coding: the agent is forbidden from writing the code. It plans, explains, and reviews — you type. Every question and every error that surfaces while typing becomes the actual lesson. The thinking behind this workflow is written up in [How to Learn New Things in the AI Era](/blogs/how-to-learn-new-things-in-ai-era).

## Architecture

    agent-playbooks/                      # the collection this playbook lives in
    ├── ai-guided-learning/
    │   └── SKILL.md                      # the playbook — trigger phrases + 4-step workflow
    ├── git-workflow/SKILL.md             # sibling playbooks (commits, audits, no auto-push)
    ├── security-audit/SKILL.md           # secrets/PII scan before commit or publish
    ├── linkedin-writing/                 # + samples/ — 5 published posts as style refs
    ├── sprint-driven-development/SKILL.md
    ├── repo-triage/SKILL.md              # malware/supply-chain scan for fresh clones
    ├── AGENTS.md                         # how to install these as agent skills
    └── README.md                         # the catalog
    
    # format: pure Markdown — no runtime, no deps. Runs on any LLM agent.
