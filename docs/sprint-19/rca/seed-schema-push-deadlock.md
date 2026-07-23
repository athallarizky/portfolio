# RCA: Schema push deadlock — seed fails before tables exist

> Date: 2026-07-24 · Sprint-19 · Severity: Medium
> Related: `backend/src/seed.ts`, Payload/Drizzle schema migration

---

## What happened

Running `npm run seed` with a fresh (deleted) `payload.db` failed immediately:

```
SQLITE_ERROR: no such table: document_categories
```

The seed script calls `payload.find()` before any tables have been created. Payload + Drizzle use **lazy schema push** — tables are created on the first API request, not at boot time. The seed script initializes Payload, then immediately queries — before any request has triggered the schema push.

## Root cause

`npx tsx src/seed.ts` runs Payload as a standalone script via the Local API. The Local API does not auto-push the schema on startup — only the Next.js dev server (handling HTTP requests) triggers schema push via Drizzle's migration system.

Sequence:
1. Delete `payload.db`
2. Run `npm run seed` → `npx tsx src/seed.ts`
3. `getPayload({ config })` initializes Payload but does NOT create tables
4. `payload.find({ collection: 'document-categories' })` → SQLITE_ERROR: no such table

## Resolution

Workaround: start the dev server first (`npm run dev`), hit any API endpoint to trigger schema push, kill the server, then run seed:

```bash
npm run dev &
sleep 3
curl http://localhost:3000/api/document-categories?limit=1
kill $!
npm run seed
```

Or more practically: keep the dev server running, run seed via `npx tsx src/seed.ts` separately against the same DB (two processes, same SQLite file). This works because schema is already pushed by the first process.

## Prevention

- Document this workflow clearly: "delete DB → start dev server → hit API → stop server → seed" or "keep dev server running → run seed in parallel"
- Consider adding a `npm run dev:seed` script that starts dev server, waits for ready, seeds, then stays running
- Alternatively: add explicit schema push call in seed script (`payload.db?.pushSchema?.()` if exposed by Drizzle/Payload)
