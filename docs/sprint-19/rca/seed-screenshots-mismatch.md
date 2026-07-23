# RCA: Seed failure — screenshots field type mismatch after schema change

> Date: 2026-07-24 · Sprint-19 · Severity: Medium
> Related: `backend/src/seed/data/projects.ts`, `backend/src/seed/phases/projects.ts`

---

## What happened

After changing the `screenshots` field on the Projects collection from an `array` of objects (`{bannerColor, icon, label}`) to an `upload` field with `hasMany: true`, running `npm run seed` failed with:

```
ValidationError: The following field is invalid: Screenshots
```

## Root cause

The seed data file (`seed/data/projects.ts`) still contained the old format:

```ts
screenshots: [
  { bannerColor: '...', icon: 'solar:widget-5-bold-duotone' },
  { bannerColor: '...', icon: 'solar:chat-round-dots-linear' },
  // ...
]
```

The `seed/phases/projects.ts` spread this directly into `payload.create()`:

```ts
const data = {
  // ...
  features: proj.features, screenshots: proj.screenshots,
}
```

But the new `upload hasMany` field expects an array of media IDs (numbers), not objects with `bannerColor`/`icon`.

## Resolution

1. Removed `screenshots` from `SeedProject` interface and all project data entries
2. Removed `screenshots: proj.screenshots` from the seed spread
3. Screenshots are now empty at seed time — populated manually via admin UI

## Prevention

- After changing a field type, grep the seed data directory for that field name
- Run seed immediately after schema changes to catch type mismatches early
- Consider adding seed data validation that checks field types against collection config, not just runtime errors
