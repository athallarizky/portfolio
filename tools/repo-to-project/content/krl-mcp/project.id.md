# krl-mcp (ID)

> Personal · OSS · 2026

MCP server yang sepenuhnya self-contained untuk jadwal KRL Commuter Jabodetabek — Go, tanpa infrastruktur apa pun, seluruh snapshot data ter-pin di-embed ke satu binary ±15 MB lewat go:embed.

**Tech:** go, tools (shared dengan EN)
**Source:** https://github.com/athallarizky/krl-mcp

## Ringkasan

`krl-mcp` adalah server Model Context Protocol yang membuat MCP host mana pun (Claude Code, Claude Desktop, Cursor) bisa menjawab pertanyaan soal kereta KRL Commuter Jabodetabek: papan keberangkatan, katalog line, stasiun terdekat, dan perencana perjalanan langsung. Sengaja dibangun tanpa infrastruktur — tanpa database, tanpa cache, tanpa jaringan, tanpa Docker. Snapshot jadwal open-krl (±5 MB artefak) di-pin di repo dan di-embed ke executable saat build, sehingga seluruh cerita deployment-nya cuma `go install` + `claude mcp add`, jalan dari working directory mana pun.

Ini adalah wajah MCP dari krl-schedule-service — sistem produksiku dengan REST API, Postgres, Redis, dan trip planner. krl-mcp mem-port logika query yang sama di atas kontrak data yang sama menjadi scan memori biasa, membuktikan logika domainnya berdiri sendiri.

*(Review copy — full body ada di `project.id.json`; structure 1:1 dengan EN.)*
