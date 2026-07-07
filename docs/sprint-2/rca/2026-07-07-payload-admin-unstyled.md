# RCA — PayloadCMS 3.85 Admin Renders Unstyled

> **Date:** 2026-07-07 · **Severity:** Medium (blocks all admin work, not a prod outage)
> **Component:** `backend/` (PayloadCMS 3.85.2 on Next.js 16.2.10)
> **Status:** ✅ Resolved
> **Style note:** No RCA template exists in `docs/ai-workflow-template.md` yet; this
> follows that doc's reporting style (findings-first, tables, code) with a standard
> postmortem structure.

---

## 1. Summary

The Payload admin panel at `http://localhost:3000/admin` rendered as **raw,
unstyled HTML** (default serif font, plain stacked text, no theme/layout) despite
the admin CSS file loading successfully (HTTP 200, `text/css`, ~330 KB). The root
cause was a **single wrong CSS import** in `src/app/(payload)/layout.tsx`:

```diff
- import '@payloadcms/ui/styles.css'   // partial bundle — component rules only
+ import '@payloadcms/next/css'        // full bundle — includes :root theme tokens
```

The wrong bundle contains the component CSS but **not** the `:root` custom-property
definitions (`--theme-elevation-100`, `--base`, `--font-body`, …). Every component
rule references those variables, so with the definitions absent every `var(…)`
resolved to empty → no colors, no spacing, no font → unstyled.

---

## 2. Impact

- All Payload admin UI work blocked for ~several cycles of debugging.
- No data loss, no prod impact (dev-only). The REST API (`/api/*`) and DB were
  unaffected and worked throughout.

---

## 3. Symptoms (observed)

| Signal | Value |
|---|---|
| `/admin` HTTP status | 200 (page loads) |
| Admin CSS request | `GET /_next/static/css/app/(payload)/layout.css` → **200, `text/css`, ~331 KB** |
| Rendered output | Raw HTML — serif font, stacked text, no theme; nav (Dashboard/Users/Documents) visible as plain text |
| Server log errors | None (no module/compile errors) |
| Browser console | (not captured early — see Lesson 1) |

**Key tell** (missed for too long): *"CSS file loads 200 with correct content-type
and size, yet zero styles apply."* That pattern points at a **CSS-variable
definition gap**, not a load/bundler failure.

---

## 4. Timeline

| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | `payload generate:importmap` (importMap.js was empty `{}`) | Fixed `CollectionCards` "not found in importMap" | **Real fix** — but unrelated to CSS |
| 2 | Uncomment `import '@payloadcms/ui/styles.css'` in layout.tsx | Imported the *partial* bundle | **Wrong source** — this is the bug |
| 3 | Add `turbopack.root` (stray home-dir `package-lock.json` mis-inferred workspace root) | Removed a real warning | Red herring re: styles |
| 4 | Switch dev to `next dev --webpack` + clear `.next` | Removed Turbopack HMR `ChunkLoadError` | Red herring re: styles |
| 5 | **Research** GitHub template + issues + context7 | Found canonical 3.85.2 layout uses `@payloadcms/next/css` | **Found root cause** |
| 6 | Change import → `@payloadcms/next/css` | CSS grew to 383 KB, gained 141 `--theme-elevation-100` refs, 6 `:root` blocks | **Fixed** |

Steps 1–4 were necessary-or-real but did not address the styling symptom. The
actual cause was found only at step 5, after the user correctly insisted on
reading the real docs/issues instead of continuing to guess.

---

## 5. Root cause (file-level proof)

Two CSS bundles ship in `node_modules`; they are **not** aliases:

| Bundle | Resolves to | Size | `:root` blocks | `html{font-family}` | Theme tokens |
|---|---|---|---|---|---|
| `@payloadcms/ui/styles.css` *(wrong)* | `@payloadcms/ui/dist/styles.css` | 253,638 B | 1 | absent | none |
| `@payloadcms/next/css` *(correct)* | `@payloadcms/next/dist/prod/styles.css` | 306,090 B | 5 | present | present |

The ~52 KB difference is exactly the missing block: the `:root` custom-property
definitions and the `html`/element base rules. Payload's component CSS is written
as `background: var(--theme-elevation-100)` etc.; without the definitions those
collapse to the initial/empty value.

### How the wrong import got in

The `backend/` was **hand-written** (not scaffolded with `create-payload-app`).
The `(payload)/layout.tsx` was taken from a **context7 snippet that reflects an
older Payload 3.x template**, where the line read:

```tsx
// import '@payloadcms/ui/styles.css'   // "uncomment if @payloadcms/ui → /dist"
```

The current **3.85.2 canonical** template (`templates/blank/src/app/(payload)/layout.tsx`
on the `v3.85.2` tag) is unconditional and uses a different package:

```tsx
import '@payloadcms/next/css'
```

Uncommenting the legacy line produced a *valid-looking* import of the wrong file.

---

## 6. The fix

`backend/src/app/(payload)/layout.tsx`, line 3:

```diff
- import '@payloadcms/ui/styles.css'
+ import '@payloadcms/next/css'
```

No other files needed changing — the rest of the hand-written layout matched the
canonical 3.85.2 scaffold (`RootLayout`, `handleServerFunctions`, `importMap`,
`custom.scss`, import order).

---

## 7. Verification

Rebuilt CSS now contains the previously-missing definitions:

| Metric | Before | After |
|---|---|---|
| `layout.css` size | 331 KB | **383 KB** |
| `:root` blocks | 1 | **6** |
| `--theme-elevation-100` references | 0 | **141** |
| `html{ … }` base rules | 0 | **5** |

Admin rendered fully styled after a hard refresh.

---

## 8. Why it was hard to find (contributing factors)

1. **Misleading green checkmarks.** "CSS loads 200 / correct CT / 330 KB" reads as
   "styles are fine" — so attention went to bundling (Turbopack) and JS hydration.
2. **Hand-written scaffold.** Copying generated boilerplate from doc snippets
   (which can be version-stale) instead of generating it left a latent wrong import.
3. **Two near-identical export paths.** `@payloadcms/ui/styles.css` vs
   `@payloadcms/next/css` differ by one segment and both *exist* — easy to grab the
   wrong one with no error.
4. **Real adjacent bugs masked it.** The empty `importMap.js` and the Turbopack
   HMR `ChunkLoadError` were genuine errors worth fixing, so each "fix something,
   retest, still broken" cycle felt productive while circling the actual cause.

---

## 9. Lessons & action items

- [ ] **L1 — Capture the browser console first.** The fastest signal for
      "renders but unstyled" is DevTools → Console/Network. Request it before
      server-side guessing.
- [ ] **L2 — Diff hand-written scaffold against the canonical template.** When
      copying generated files, fetch the exact file from the framework's repo at
      the installed version tag (e.g. `github.com/payloadcms/payload/blob/v3.85.2/...`).
      Better: use the official scaffolder (`create-payload-app`) to generate them.
- [ ] **L3 — Recognize the "CSS loads but doesn't apply" signature.** It almost
      always means missing CSS-variable definitions (wrong/partial bundle) or a
      lost `@layer` cascade — not a bundler problem.
- [ ] **L4 — Escalate to primary sources sooner.** Reading GitHub issues + the
      canonical template resolved this in one pass after several guess-cycles.
- [ ] **Cleanup:** the `next dev --webpack` switch and `turbopack.root` config,
      added while chasing red herrings, are **unnecessary** now. Optionally revert
      `dev` to `next dev` (Next 16 default) and drop the `turbopack.root` block —
      only after confirming the admin stays styled.

---

## 10. References

- Canonical scaffold: [`templates/blank/src/app/(payload)/layout.tsx` @ `v3.85.2`](https://github.com/payloadcms/payload/blob/v3.85.2/templates/blank/src/app/%28payload%29/layout.tsx) — uses `import '@payloadcms/next/css'`
- Payload docs — [Customizing CSS & SCSS](https://payloadcms.com/docs/admin/customizing-css), [Installation (supported Next versions)](https://payloadcms.com/docs/getting-started/installation)
- GitHub — [#12553 (`@payloadcms/next/css` is the compiled entry)](https://github.com/payloadcms/payload/issues/12553), [#8702 (unstyled admin = wrong CSS source)](https://github.com/payloadcms/payload/issues/8702), [#8878 (`@layer payload-default` cascade)](https://github.com/payloadcms/payload/issues/8878)
