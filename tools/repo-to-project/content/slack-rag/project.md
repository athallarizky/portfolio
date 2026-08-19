# Slack RAG

> Personal · 2026

A cloneable RAG web app for searching and chatting over exported Slack channel data — upload exports, customize the AI agent, and ask questions with source citations.

**Tech:** fastapi, docker, react, rag, openai, tailwindcss, typescript
**Source:** https://github.com/athallarizky/slack-rag

## Overview

Slack RAG is a cloneable web app boilerplate for building RAG-powered search and chat over exported Slack channel data. Upload a raw Slack JSON export, customize the AI agent's behavior through a skills directory, and start chatting with the channel's history.

The backend is a Python/FastAPI service that ingests and cleans Slack exports, embeds them with sentence-transformers into a local vector store, and exposes semantic search plus a citation-backed chat API. The frontend is an Astro + React + Tailwind UI. The whole stack boots with a single `docker-compose up`.

AI behavior is intentionally pluggable: a `skills/` directory of markdown + code defines how the agent reasons, and the LLM provider (Anthropic or OpenAI) is configurable. Bilingual (EN/ID) search and chat are supported out of the box.

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

---

> **Unmatched tech (not in techTags):** Astro, chromadb, sentence-transformers, anthropic — add these as
> `technologies` in the admin, or map manually, if you want them on the project.
