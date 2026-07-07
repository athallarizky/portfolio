# Phase 0 Report — Bootstrap

> Completed: 2026-07-07
> Part of: Sprint-2 (Headless CMS Backend)

---

## 1. What was built

Bootstrapped a working PayloadCMS 3 app (`backend/`) with SQLite, Next.js 16.2.10, and Lexical rich-text editor. Admin panel boots at `/admin`, REST API serves `/api/*`.

- Scaffolded `backend/` with `package.json` (payload, @payloadcms/db-sqlite, @payloadcms/richtext-lexical, next 16, react 19)
- `payload.config.ts` with CORS allowlist (`PAYLOAD_PUBLIC_CORS`), SQLite adapter, Lexical editor
- Three initial collections: `Users` (admin auth), `DocumentCategories`, `Documents`

---

## 2. RCA — Unstyled Admin Panel

The Payload admin rendered as raw unstyled HTML. Root cause: the hand-written `(payload)/layout.tsx` imported `@payloadcms/ui/styles.css` (a partial bundle with component rules but no `:root` theme tokens) instead of `@payloadcms/next/css` (the full bundle with 5 `:root` blocks and base `html` rules).

**Fix:** Changed the import to `@payloadcms/next/css`. CSS bundle grew from 331 KB to 383 KB with 141 `--theme-elevation-*` references and 6 `:root` blocks.

Full writeup: [`docs/sprint-2/rca/2026-07-07-payload-admin-unstyled.md`](../rca/2026-07-07-payload-admin-unstyled.md)

---

## 3. Files

| File | Purpose |
|---|---|
| `backend/package.json` | Dependencies + scripts (dev, build, generate:types) |
| `backend/payload.config.ts` | CORS, SQLite, Lexical, collection registry |
| `backend/.env` | `PAYLOAD_SECRET`, `DATABASE_URL=file:./payload.db`, `PAYLOAD_PUBLIC_CORS` |
| `backend/src/collections/Users.ts` | Admin auth collection (email/password) |
| `backend/src/collections/DocumentCategories.ts` | Ordered groups (label, slug, icon, hint, order) |
| `backend/src/collections/Documents.ts` | Upload-enabled (title, category, excerpt, updated) |
| `backend/src/app/(payload)/layout.tsx` | Admin layout — `@payloadcms/next/css` import |
| `docs/sprint-2/rca/2026-07-07-payload-admin-unstyled.md` | Root cause analysis |

---

## 4. How to run

```bash
cd backend
npm install
npm run dev          # http://localhost:3000 → /admin, /api
```

---

## 5. Verification

- `GET /admin` → 200, styled admin panel
- `GET /api/document-categories` → 200, empty `[]`
- `GET /api/documents` → 200, empty `[]`
- `npm run generate:types` → `payload-types.ts` generated
