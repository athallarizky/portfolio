# Sprint-14 Plan — Data Sync, Backup & Bulk Import (backend/CMS)

> Status: 🟡 Planning | Created: 2026-07-20
> Companion: [`tasks.md`](./tasks.md) · [`resources/architecture.md`](./resources/architecture.md) · [`resources/data-design.md`](./resources/data-design.md) · [`resources/api-contract.md`](./resources/api-contract.md) · Phase 0 [`reports/phase-0-report.md`](./reports/phase-0-report.md) · previous [`../sprint-13/final-report.md`](../sprint-13/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

The portfolio runs two independent datasets — **local** (`backend/payload.db`) and **prod** (VPS) — with
no way to move content between them except hand-editing each record in the Payload admin (`/admin`) or
re-running the seed (which restores only the original demo content, never prod's live edits). The owner
needs to (1) **back up** data, (2) **sync** local ↔ prod, and (3) **bulk-author** projects & blogs.

Sprint-13 shipped the Notion system + SEO (build-verified). This sprint is **backend-only** and builds
on two primitives the seed already proves: `cp payload.db payload.db.<ts>.bak` (timestamped SQLite
backup in the `seed` npm scripts) and `payload.create({ data, file })` (the upload pattern in
`backend/src/seed/phases/documents.ts`). Phase 0 mapped the full data model — see
[`reports/phase-0-report.md`](./reports/phase-0-report.md).

## 1. Sprint goal

Ship a Payload-admin **"Data Sync & Backup"** tool (custom view + CLI) that exports the full content
set to a portable `.zip` (JSON + Markdown bodies + media), imports it back by upsert (sync + bulk
authoring), and separately snapshots the raw DB + uploads for whole-instance backup/restore.

## 2. Scope

**In scope:**
- Portable **content export/import** — 8 collections + 3 globals; relationships as natural keys; Lexical
  bodies as inline Markdown; `Documents` media bundled + re-uploaded.
- **DB snapshot** export/restore (zip `payload.db` + `backend/documents/`).
- Shared TS engine (`backend/src/data-sync/`) + CLI (`npm run export | import | snapshot | snapshot:restore`).
- Custom **admin view** (`/admin/data-sync`) with Download / Upload / Snapshot buttons + dry-run preview,
  over admin-only REST endpoints.
- Safety: admin-only endpoints, dry-run-by-default import, pre-import DB backup, manifest version guard.

**Out of scope:**
- Syncing `Users` (admin auth — security) or `ContactMessages` (transient, no natural key).
- Payload-internal tables (`payload-kv`, `-migrations`, `-locked-documents`, `-preferences`).
- Automatic/scheduled sync (cron) — manual button/CLI only.
- A second DB engine (stays SQLite; the JSON path is engine-agnostic, so a future Postgres swap isn't blocked).
- Frontend changes.

## 3. Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Archive format | `.zip` | Pure-JS libs (`archiver`, `adm-zip`), universal OS support. `.rar` needs native/licensed tooling. |
| Rich-text bodies | Inline Markdown in each collection's JSON | One self-contained file per collection, easy to bulk-edit; round-trips via the lexical package's built-in converters. |
| Surface | CLI engine + admin UI (both) | UI is the requested "download button"; CLI reuses the same engine and is essential for VPS-side ops/recovery. |
| Import semantics | Upsert-merge by natural key (create/update, never replace-all) | Non-destructive, idempotent re-runs. Replace-all is reserved for the explicit DB-snapshot restore. |
| Portability | Relationships stored as natural keys (slug/name/title/platform), not DB ids | Local and prod have different ids; natural keys let an archive port between them. |
| Verification | `node:test` units for pure modules + `tsc --noEmit` + `npm run build` + manual CLI round-trip | Project has no test runner (AGENTS.md §7); `node:test` is built-in and covers the deterministic logic. |

## 4. Phasing

- **Phase 0 — Discovery:** ✅ data model mapped → [`reports/phase-0-report.md`](./reports/phase-0-report.md). (0.1 confirms the installed lexical converter API + endpoint multipart shape before any code.)
- **Phase 1 — Export engine (core):** types + natural-key/relations map + manifest + zip helpers + export orchestration (collections + globals → JSON, relations → natural keys) + CLI `export`.
- **Phase 2 — Markdown bridge:** `converters.ts` (Lexical↔MD) wired into export for Article/Project bodies.
- **Phase 3 — Media bundling:** copy `backend/documents/` files into `media/` in the zip.
- **Phase 4 — Import engine:** dependency-ordered upsert + natural-key→id resolution + MD→Lexical + media re-upload + dry-run + pre-backup + CLI `import`.
- **Phase 5 — DB snapshot:** snapshot (zip `payload.db` + `documents/`) + restore (double-confirm).
- **Phase 6 — Admin UI + endpoints:** admin-only REST endpoints + custom `/admin/data-sync` view.
- **Phase 7 — Verify + docs:** end-to-end local↔fresh-DB parity; update `AGENTS.md` + final report.

## 5. Discovery findings (summary)

Full detail in [`reports/phase-0-report.md`](./reports/phase-0-report.md). Headlines:

- **DB:** single SQLite file `backend/payload.db`; one upload collection (`Documents`, files in `backend/documents/`).
- **Rich text:** `Articles.body` / `Projects.body` are Lexical JSON — `@payloadcms/richtext-lexical` ships MD↔Lexical converters, so no custom converter is needed.
- **Natural keys** exist for every content collection (slug for most; `name`→Authors; `title`→Documents; `platform`→SocialProfiles) → portable upsert is viable.
- **Relationships** need parent-before-child import (the seed already encodes the order).
- **Gaps:** no archive deps yet; no custom admin views yet — both greenfield.
