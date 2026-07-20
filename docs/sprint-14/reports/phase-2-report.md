# Phase 2 Report — Markdown bridge

> Completed: 2026-07-20
> Companion: [`phase-1-report.md`](./phase-1-report.md) · [`../resources/api-contract.md`](../resources/api-contract.md) §4.2

## 1. How to run
```bash
cd backend && npm run export   # Article/Project bodies now emit as inline Markdown
```

## 2. What changed
- `converters.ts`: `getEditorConfig(payload)` builds + caches `editorConfigFactory.default({ config: payload.config })`; `lexicalToMd` / `mdToLexical` wrap the built-in converters.
- `export.ts`: `articles.body` and `projects.body` are converted to Markdown strings (`RICH_TEXT_BODY` map).

## 3. Test results
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| Real export | Article body = `"## The Cheap Version That Works\n\n…"`; Project body = `"## Overview\n\n…"` — both **Markdown strings** |
| Zip size | 13,662 → **12,979 bytes** (Markdown < Lexical JSON) |

## 4. Key decisions
- EditorConfig via `editorConfigFactory.default({ config: payload.config })`, **cached per process** (expensive to build; `payload.config` is constant per run).
- No *pure* converter unit test — building an editorConfig needs the sanitized Payload config (heavy). Correctness is verified by the real export (Markdown output) and will be **round-trip-validated in Phase 4** (export → import → parity, including a rendered blog body).

## 5. Reference files
`backend/src/data-sync/converters.ts`, `backend/src/data-sync/export.ts`
