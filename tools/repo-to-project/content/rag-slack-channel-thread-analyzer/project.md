# RAG: Slack Channel Thread Analyzer

> Personal · 2026

A RAG workflow over exported Slack channels that surfaces old threads similar to a new report — so recurring issues trace back to their root cause instead of being solved from scratch.

**Tech:** fastapi, docker, react, rag, openai, tailwindcss, typescript
**Source:** https://github.com/athallarizky/slack-rag

## Overview

At my company we have a #dev-bugs channel where the operations team files their reports. It's the channel that never goes quiet — every day, something new lands there.

One recurring challenge: some bugs turn out to be repeats. The issue was solved before — often by someone else — so unless you were there at the time, it's easy to miss that the same problem already has a known fix. Or you can tell the issue looks familiar, but finding the old, relevant thread — its root cause, its resolution — is a search of its own.

So I put a simple RAG workflow around it:

- export the channel's conversation data from Slack (JSON)
- normalize and clean the data
- turn it into a knowledge base for RAG

Now it's much easier to jump straight to the old threads most similar to a new report. The agent can even analyze and summarize past conversations on the spot, so tracing an issue no longer means starting from zero.

The use case isn't limited to bugs, either. Anything that lives in an exported channel can become a knowledge base — support channels, engineering discussions, whatever the team needs.

On the technical side, the provider setup is deliberately flexible: plug in an API key directly, or use a custom command that calls a CLI agent behind the scenes. Factory Droid, Claude Code, or any other provider all work.

## Architecture

```
slack-rag/
├── api/            # FastAPI — ingest, embed, search, chat
│   ├── chat/       # agent, retrieval, providers, history
│   ├── pipeline/   # clean, normalize, index, search
│   └── Dockerfile
├── web/            # Astro + React + Tailwind UI
├── skills/         # customizable AI agent skills (md + code)
├── data/           # Slack exports + vector store
├── docs/
└── docker-compose.yml
```
