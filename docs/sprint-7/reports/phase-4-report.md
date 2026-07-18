# Phase 4 Report — Security & deploy prep

> Completed: 2026-07-14

---

## 1. What was done

- Created `backend/.env.example` with documented environment variables
- Created `scripts/deploy.sh` — builds both services, validates PAYLOAD_SECRET is set, seeds DB, prints PM2 commands
- Verified end-to-end: `npm run seed` + `npx astro build` both succeed

## 2. .env.example contents

```bash
PAYLOAD_SECRET=your-secret-here   # Generate: openssl rand -base64 32
DATABASE_URL=file:./payload.db
PAYLOAD_PUBLIC_CORS=http://localhost:4321
```

## 3. deploy.sh behavior

```
1. Checks backend/.env exists and PAYLOAD_SECRET is not the default
2. npm install + npm run build in backend
3. npm run seed in backend
4. npm install + npx astro build in frontend
5. Prints PM2 start commands
```

## 4. Verification

- `scripts/deploy.sh` validates `.env` correctly (exits with error if secret is default)
- `npm run build` in both services succeeds
- Seed produces correct output
