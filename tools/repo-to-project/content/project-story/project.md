# Project Story

## Technical Overview

`project-story` is an automated technical writing pipeline that turns any public GitHub repository into a publication-ready blog article. Rather than relying on a single monolithic prompt, the system orchestrates a **directed multi-agent graph in TypeScript** where specialized agents independently handle codebase research, author persona modeling, and narrative synthesis.

## Multi-Agent Graph Architecture

```
CLI: npx tsx src/index.ts <git-url> --style personal
                       │
                       ▼
            [ Supervisor Orchestrator ]
           ┌───────────┴───────────┐
           ▼                       ▼
  [ Agent 1: Researcher ]  [ Agent 2: Style Analyzer ]
  - Shallow git clone      - Ingests SKILL.md & post samples
  - Parses package manifests- Extracts vocabulary & tone rules
  - Maps architectural tree
           │                       │
           └───────────┬───────────┘
                       ▼ (Merged Graph State)
             [ Agent 3: Writer ]
             - Drafts narrative based on factual dossier
             - Enforces tone boundaries & code snippets
                       │
                       ▼
            [ Output: article.md ]
```

1. **Shared Graph State Machine:** Built on a unified state contract in `src/state.ts` that tracks repository metadata, the factual research dossier, style guidelines, intermediate drafts, and supervisor approval flags.
2. **Agent 1 — Codebase Researcher:**
   - Clones target repositories with `--depth=1` to minimize bandwidth and disk overhead.
   - Systematically inspects dependency manifests (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`), directory structures, and entry points.
   - Generates a strictly factual technical report detailing project motivation, stack choices, key algorithms, and edge cases.
3. **Agent 2 — Style Analyzer:**
   - Operates in complete isolation from the codebase.
   - Reads user-defined markdown style guides (`SKILL.md`) and raw past writing samples from `writing-style/`.
   - Produces a structured persona contract: sentence variance rules, preferred technical depth, and blacklisted AI cliches.
4. **Agent 3 — Narrative Writer:**
   - Synthesizes the factual dossier with the persona contract.
   - Formats headers, conceptual diagrams, and code snippets without inventing fictional APIs or hallucinatory claims.
5. **Isolated Tool Layer:** Provides atomic, deterministic tools for git operations, sandboxed file system reads, and style parsing under `src/tools/`.
