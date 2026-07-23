# RCA: Sharp not configured — image sizes return 500

> Date: 2026-07-24 · Sprint-19 · Severity: High
> Related: `backend/src/payload.config.ts`, `backend/src/collections/Media.ts`

---

## What happened

After creating the Media collection with `imageSizes: [thumbnail, card, hero]` and uploading an image, requesting sized variants (`/api/media/file/filename-400x300.png`) returned HTTP 500. The original file served correctly, but Payload did not generate resized versions.

## Root cause

The `sharp` image processing library was installed in `package.json` (`"sharp": "^0.34.0"`) but **not passed to the Payload config**. Payload requires `sharp` to be explicitly provided:

```ts
export default buildConfig({
  // ...
  sharp,  // ← missing
})
```

Without this, Payload silently skips image resizing. The seed log contained a warning that was overlooked:

```
[WARN] Image resizing is enabled for one or more collections, but sharp not installed.
Please install 'sharp' and pass into the config.
```

## Impact

- All image sizes returned 500 errors
- Frontend showed broken images for banners, avatars, and screenshots (which expected sized variants)
- Files uploaded before the fix remained without sizes — only `filename.ext`, no `filename-WxH.ext`

## Resolution

Added `import sharp from 'sharp'` and `sharp,` to `buildConfig({...})` in `payload.config.ts`. New uploads after the fix correctly generate all three sizes.

Files uploaded before the fix must be re-uploaded to get sized variants.

## Prevention

- Pay attention to Payload's startup warnings — `sharp not installed` is logged but easy to miss among other output
- Add a pre-flight check: after configuring `imageSizes`, upload a test image and verify sized URLs return 200
- Consider adding `sharp` to the Payload config template in AGENTS.md / GUIDE.md
