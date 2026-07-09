# RCA — Contact Messages collection missing from Payload admin sidebar

> **Date:** 2026-07-10 · **Severity:** Medium · **Component:** `backend/src/collections/ContactMessages.ts` (access control)
> **Status:** ✅ Resolved

## 1. Summary

After adding the `ContactMessages` collection, the **"Contact Messages" item never appeared in the Payload admin sidebar** — the collection was registered (the REST API returned `403`, not `404`), but the dashboard sidebar filtered it out. The root cause was the access-control function: `read: () => false` blocked **everyone**, including authenticated admins. Payload's admin UI hides any collection the current user lacks `read` access to, so the collection was invisible in the dashboard even though it existed and accepted submissions.

## 2. Impact

- Admin could not view submitted contact messages in the dashboard (the entire point of the collection).
- ~4 debug cycles spent before the real cause was found, including a full `.next` cache wipe and server restart (see Timeline).
- No data loss, no prod impact (dev only). The form kept working end-to-end throughout — 5 real/test submissions were persisted correctly.

## 3. Symptoms (observed)

| Signal | Value |
|---|---|
| `GET /api/contact-messages` (anonymous) | 403 |
| `GET /api/contact-messages` (authenticated admin) | **403** ← the tell that was missed |
| `contact-messages` in `/api/access` collection list | present |
| `contact-messages` in compiled admin bundle | present (3 files) |
| Admin sidebar groups visible | Access, Documents, Blog, Projects, Social, Site — **no "Content" group** |
| Collection admin config | `group: 'Content'` (correct) |

## 4. Timeline

| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | Assumed dev server (running since Jul 7) was stale; restarted `npm run dev` | API hot-reloaded (403), admin sidebar still empty | **red herring** |
| 2 | Verified collection in `/api/access` + compiled admin bundle | Confirmed collection registered & in bundle, but UI still hid it | narrowed scope, not the cause |
| 3 | Blamed Next.js webpack stale client bundle; killed server, wiped `.next/`, cold recompile | Bundle rebuilt fresh (3 files ref `contact-messages`); **sidebar still empty** | **red herring** (costly — full recompile) |
| 4 | Tested **authenticated** `GET` with admin token → still **403** | Revealed `read` blocked admins too, not just public | **the cause** |
| 5 | Changed `read: () => false` → `read: ({ req: { user } }) => Boolean(user)` | Authenticated GET → 200; "Content / Contact Messages" appeared in sidebar | **real fix** |

## 5. Root cause

The collection's access control denied reads unconditionally:

```ts
// backend/src/collections/ContactMessages.ts (original)
access: {
  read: () => false,    // blocks EVERYONE — public AND authenticated admins
  create: () => true,
}
```

In Payload, **access functions apply to the current requester**, including logged-in admins browsing `/admin`. A `read` function that returns `false` for all requesters means *no one* can read — and the admin UI's Nav component filters out collections the user can't `read`. So the collection was correctly registered and functional (create worked), but invisible in the dashboard.

**Evidence:** authenticated `GET /api/contact-messages` with a valid admin token returned `403` — proving the gate fired on admins, not just anonymous traffic.

## 6. The fix

```diff
  access: {
-   read: () => false,    // submissions never leak to the public API
+   read: ({ req: { user } }) => Boolean(user),  // admin-only; public cannot list submissions
    create: () => true,
  },
```

This mirrors the pattern already used in `backend/src/collections/Users.ts:15` (`admin: ({ req: { user } }) => Boolean(user)`).

## 7. Verification

| Metric | Before | After |
|---|---|---|
| Anonymous `GET /api/contact-messages` | 403 | 403 ✅ (public still blocked) |
| Authenticated `GET /api/contact-messages` | **403** | **200** ✅ |
| "Contact Messages" in admin sidebar | missing | visible ✅ |
| Messages viewable in dashboard | no | yes (5 docs) ✅ |
| Public create (`POST`) | 201 | 201 ✅ (unchanged) |

## 8. Why it was hard to find (contributing factors)

- **The 403 looked correct in isolation.** The plan's intent was "submissions never leak publicly," and a 403 on `GET` *seemed* to confirm that. The trap was not checking whether an **authenticated** request also got 403.
- **Two genuine red herrings masked the real cause.** The dev server genuinely *was* stale (started Jul 7, before the collection existed), and the Next.js webpack dev cache *did* serve a stale client bundle. Both were real issues worth fixing, and each "succeeded" in producing a fresh artifact — which made it easy to assume the next refresh would reveal the item. They consumed the bulk of the debug time.
- **The collection "worked."** `POST` returned 201 and real submissions persisted, so the feature appeared functional from the frontend. The failure was only visible from the admin UI perspective, which wasn't tested until later.
- **`/api/access` was misleading.** It reported the collection as present regardless of whether the *current user* could read it — so that check returned a green light.

## 9. Lessons & action items

- [ ] **Always test access control from both sides** — anonymous AND authenticated. A one-line curl with a bearer token would have caught this in Phase 1.
- [ ] **Add an access-control convention note to AGENTS.md** — "to gate public reads while keeping admin access, use `read: ({ req: { user } }) => Boolean(user)`, never `read: () => false`."
- [ ] **Add an admin-side smoke test to the phase checklist** — "log in and confirm new collections appear in the sidebar," not just "curl the endpoint returns the expected status."
- [ ] Update sprint-5 `final-report.md` Known Issues / phase-1 report to reflect the corrected access control.

## 10. References

- `backend/src/collections/ContactMessages.ts` — the fix (`:11`)
- `backend/src/collections/Users.ts:15` — the existing pattern reused
- `docs/sprint-5/reports/phase-1-report.md` — original (incorrect) access-control verification
- [Payload access control docs](https://payloadcms.com/docs/access-control/overview) — access functions receive `req.user`
