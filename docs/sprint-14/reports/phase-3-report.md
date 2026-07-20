# Phase 3 Report — Media bundling

> Completed: 2026-07-20
> Companion: [`phase-1-report.md`](./phase-1-report.md) · [`../resources/data-design.md`](../resources/data-design.md) §1

## 1. How to run
```bash
cd backend && npm run export   # now includes media/ entries
unzip -l portfolio-data-*.zip | grep media/
```

## 2. What changed
`export.ts` now resolves the `documents` upload directory (`resolveMediaDir` — Payload's `staticDir`, else `<cwd>/documents`) and, for each document row, reads `<mediaDir>/<filename>` and bundles it as `media/<filename>`. Missing files are warned + skipped (export never fails on one missing file).

## 3. Test results
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| Real export | **7 media files bundled** (5 PDFs + 2 MDs); zip 12,979 → **43,104 bytes** / **19 entries** |

Media entries match `documents.json` `filename` values (`atha-tharizky-resume-1.pdf`, `ai-workflow-template-6.md`, …). Upload auto-fields (`url`, `mimeType`, `filesize`, …) remain stripped; `filename` kept as the media ref.

## 4. Key decisions
- Media dir resolved from Payload's configured upload `staticDir` (via `payload.collections['documents'].upload.staticDir`) with a `<cwd>/documents` fallback — robust if the upload path is ever reconfigured.
- **Export side is now complete**: manifest + 8 collections (JSON, relations as natural keys) + 3 globals + Markdown bodies + media, in one `.zip`.

## 5. Reference files
`backend/src/data-sync/export.ts` (`resolveMediaDir` + media bundling)
