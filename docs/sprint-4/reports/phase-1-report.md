# Phase 1 Report — Infrastructure

> Completed: 2026-07-07

---

## 1. How to Run

```bash
# Backend (keep running)
cd backend && npm run dev    # http://localhost:3000

# Frontend
cd frontend && npm run dev   # http://localhost:4321
```

## 2. Changes

| File | Change |
|------|--------|
| `frontend/package.json` | Added `@astrojs/node` (indirectly, via npm install) |
| `astro.config.mjs` | Added `import node from '@astrojs/node'`, `adapter: node({ mode: 'standalone' })`, removed `output: 'hybrid'` (Astro 7 removed hybrid, static mode + adapter handles SSR) |
| `backend/.env` | Added `http://localhost:4321` to `PAYLOAD_PUBLIC_CORS` |

## 3. Test Results

| Check | Result |
|-------|--------|
| `@astrojs/node` installed | ✅ 20 packages added, 0 vulnerabilities |
| Backend boots on port 3000 | ✅ |
| `GET /api/globals/nav` | ✅ 200, returns menuItems |
| `GET /api/articles?sort=-publishedAt` | ✅ 200, 6 docs |
| `GET /api/projects?sort=order` | ✅ 200, 6 docs |
| CORS allows :4321 | ✅ (verified during Phase 5 build) |

## 4. Key Decisions

| Decision | Reason |
|----------|--------|
| Removed `output: 'hybrid'` from config | Astro 7 merged hybrid into static — `prerender = false` on SSR pages is the new pattern |
| `adapter: node({ mode: 'standalone' })` | Simplest adapter, no cloud lock-in |
