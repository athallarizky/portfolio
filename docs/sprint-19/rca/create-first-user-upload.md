# RCA: Admin create-first-user breaks with upload field on Users collection

> Date: 2026-07-24 · Sprint-19 · Severity: Medium
> Related: `backend/src/collections/Users.ts`

---

## What happened

Adding an `avatar` upload field to the `Users` collection caused the `/admin/create-first-user` page to error with a 500 Internal Server Error. The upload field's "choose from list" widget tried to load the Media list view, but the request was rejected with `UnauthorizedError: Unauthorized, you must be logged in to make this request.`

## Root cause

The `/create-first-user` flow runs **before any admin user exists**. The Users collection has `access: { admin: ({ req: { user } }) => Boolean(user) }`, meaning only logged-in users can access admin endpoints. But the upload field's list-view component makes an internal request to `GET /api/media` to populate the "choose existing" dropdown — and that request is unauthenticated (no user yet).

Payload's admin panel does not bypass auth for upload-field list requests during the create-first-user flow.

## Resolution

Removed the `avatar` upload field from the `Users` collection. Profile photos are handled by:
- **Author** collection — for blog post author cards
- **SiteConfig** global — for homepage hero avatar

The `Users` collection remains auth-only (`email` + `name`), which is the correct Payload convention: Users = login credentials, not content display.

## Prevention

- Never add upload/relationship fields to auth collections that reference other collections, unless those collections have `read: () => true` and the upload field doesn't trigger list-view requests during auth flows.
- Keep auth collections minimal — credentials only, no display content.
