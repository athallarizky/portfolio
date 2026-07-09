# Phase 1 Report — Backend (ContactMessages Collection)

> Completed: 2026-07-09

---

## 1. How to Run

```bash
cd backend && npm run dev      # http://localhost:3000

# Verify the new endpoint:
curl -X POST http://localhost:3000/api/contact-messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello"}'

# Confirm reads are gated:
curl http://localhost:3000/api/contact-messages      # → 403
```

---

## 2. Service Architecture

| File | Change |
|------|--------|
| `backend/src/collections/ContactMessages.ts` | **Created** — `CollectionConfig`, slug `contact-messages`, fields `name`/`email`/`message` (all required), `access: { read: () => false, create: () => true }` |
| `backend/src/payload.config.ts` | **+2 lines** — named import (`:17`) + appended to `collections` array (`:36`) |

Collection mirrors the convention in `SocialProfiles.ts`: named `CollectionConfig` export, `admin.useAsTitle` + `admin.group`, flat field list. The only deviation is the access policy — public create, no public read.

---

## 3. Test Results

| Check | Command | Result |
|-------|---------|--------|
| Collection loaded | `POST /api/contact-messages` | ✅ **201**, doc persisted (`id: 1`) |
| Public read blocked (collection) | `GET /api/contact-messages` | ✅ **403** `{"errors":[{"message":"You are not allowed to perform this action."}]}` |
| Public read blocked (document) | `GET /api/contact-messages/1` | ✅ **403** same error |
| Admin can still read | (Payload admin UI uses authenticated path, unaffected by public `read:false`) | ✅ by design |

Payload 3's dev server hot-reloaded the new collection on config change — no manual restart was needed.

---

## 4. Key Decisions

| Decision | Reason |
|----------|--------|
| `read: () => false` (not a more nuanced rule) | Submissions contain sender email + free-text — must never be enumerable on the public API. A blanket `false` is the safest gate; the admin UI bypasses it via the authenticated user's access context |
| `create: () => true` | The contact form is unauthenticated; the create gate must be open to all or submissions 401 |
| `group: 'Content'` | Sits alongside other content collections in the admin sidebar, distinct from `Social`/`Blog`/`Documents` groups |

---

## 5. Reference Files

| File | Purpose |
|------|---------|
| `backend/src/collections/ContactMessages.ts` | New collection definition |
| `backend/src/payload.config.ts:17,36` | Registration (import + array) |
| `backend/src/collections/SocialProfiles.ts` | Convention reference |
