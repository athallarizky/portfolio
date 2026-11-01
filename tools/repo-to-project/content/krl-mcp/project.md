# krl-mcp

> Personal · OSS · 2026

A fully self-contained MCP server for Jakarta's KRL Commuter schedules — Go, zero infrastructure, the whole pinned data snapshot embedded in one ~15 MB binary via go:embed.

**Tech:** go, tools
**Source:** https://github.com/athallarizky/krl-mcp

## Overview

`krl-mcp` is a Model Context Protocol server that lets any MCP host (Claude Code, Claude Desktop, Cursor) answer questions about Jakarta's KRL Commuter trains: departure boards, line catalogs, nearest-station lookups, and a direct-trip planner. It is deliberately zero-infrastructure — no database, no cache, no network, no Docker. The open-krl schedule snapshot (~5 MB of artifacts) is pinned in the repo and embedded into the executable at build time, so the entire deployment story is `go install` + `claude mcp add`, running from any working directory.

It is the MCP face of krl-schedule-service — my production system with a REST API, Postgres, Redis, and a trip planner. krl-mcp ports the same query logic over the same data contract into plain in-memory scans, proving the domain logic stands on its own.

## Architecture

```
krl-mcp/
├── asset.go              # go:embed — pinned boards/stations/GTFS snapshot in-binary
├── cmd/krl-mcp/main.go   # stdio entry point (JSON-RPC), cwd-independent
├── internal/server/      # MCP layer: 6 tools over go-sdk + e2e test (builds & spawns own binary)
├── internal/store/       # in-memory store: 4-tier station resolution, planner,
│                         #   stop→(trip,seq) index, service-day clock (h ≤ 47)
├── data/                 # pinned open-krl artifacts + manifest (CC-BY 4.0 / ODbL)
├── Makefile · NOTICE · LICENSE (MIT)
└── .github/workflows/    # CI (vet+test) + Release (5-platform binaries)
…
```

Full body (six tools table, technical flow, engineering notes) in `project.json`.
