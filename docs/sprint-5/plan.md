# Sprint-5 Plan — Contact Form

> Status: 🟡 Planning | Created: 2026-07-09
> Companion: [`tasks.md`](./tasks.md) · sprint-4: [`../sprint-4/final-report.md`](../sprint-4/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

Sprint-4 wired the Astro + Svelte frontend to the PayloadCMS REST API — all 7 routes fetch live data server-side via Astro frontmatter, the `[slug]` routes run SSR, and the build succeeds with zero mock-data imports. The portfolio now renders end-to-end, but it's read-only: there's no way for a visitor to reach out.

Sprint-5 closes that gap with a contact form. A new `ContactMessages` Payload collection accepts public submissions (admin-only read), a new Astro server endpoint (`/api/contact`) proxies the browser POST to Payload — matching the existing server-fetch architecture so the backend URL never reaches the client and no CORS is needed for the write. A new `/contact` page renders the form plus alternative contact methods, the sidebar gains a Contact entry, and the home page gets a CTA card. Everything reuses the existing Blinko-clone design system.

> **Deviation from `AGENTS.md`:** the sprint-5 AGENTS.md specifies a client-direct `fetch` to `:3000` in an inline `<script>`. After discovery showed every existing page fetches server-side (frontmatter → Payload), this plan uses a same-origin Astro server endpoint instead — consistent with the codebase architecture and avoiding client-side CORS exposure.

---

## 1. Sprint goal

Add a working, validated contact form to the portfolio: new backend collection + public create endpoint, same-origin Astro server endpoint that proxies submissions, new `/contact` page with success/error states, sidebar nav entry, and a home CTA — all styled with existing design tokens.

---

## 2. Scope

**In scope:**
- New `ContactMessages` Payload collection (name, email, message) — public create, admin-only read
- Register collection in `payload.config.ts` → exposes `POST /api/contact-messages`
- New `frontend/src/pages/api/contact.ts` endpoint — receives browser POST, proxies to Payload server-side, returns JSON
- New `frontend/src/pages/contact.astro` — form + alt-contact card in a `.grid-2`; inline `<script>` POSTs to `/api/contact` (same-origin)
- Validation + success/error states
- New `.form-*` and `.contact-alt-*` styles in `styles.css`
- Nav seed update: add Contact entry + fix stale `.html` hrefs → clean paths
- Home CTA card on `index.astro`

**Out of scope:**
- Email notification on submit (no hook) — candidate for a later sprint
- Spam protection / rate limiting / CAPTCHA
- Refactoring the repeated `const API` into a shared helper
- Production deployment / DB migration

---

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|
| Astro server endpoint (`/api/contact`) proxies POST to Payload | Matches the existing server-side fetch architecture (all display pages fetch in frontmatter). Same-origin for the browser → no CORS on the write, backend URL never exposed to client |
| `access: { read: () => false, create: () => true }` | Submissions must be writable by anyone but never leak publicly; admin UI uses a separate auth path so it still sees them |
| Inline form in `contact.astro` (no Svelte component) | The form needs only a small submit script — a Svelte island adds hydration cost for no benefit |
| Reuse `.search` input pattern + `--input`/`--border`/`--radius` tokens | Keeps form fields visually consistent with existing search box; no new visual language |
| Fix stale `.html` nav hrefs as part of this sprint | `seed.ts` still emits `index.html`, `projects.html`… which clash with Astro clean paths and break active-nav highlight. Touching nav anyway, so fix it here |
| `output: 'server'` — no `prerender` config on `contact.astro` | Astro is SSR-by-default; the contact page + endpoint are normal dynamic routes |

---

## 4. Phasing

- **Phase 0 — Discovery:** Verify backend boots, CORS convention, collection/Nav conventions, input CSS + tokens; confirm `.html`-href active-nav bug; confirm existing pages fetch server-side
- **Phase 1 — Backend:** Create `ContactMessages` collection, register it, verify `POST` returns 201 + read is gated
- **Phase 2 — Frontend endpoint & page:** Create `api/contact.ts` proxy endpoint; create `contact.astro` (form + script posting to `/api/contact` + alt-contact card)
- **Phase 3 — Styling:** Add `.form-*` and `.contact-alt-*` styles; verify light + dark
- **Phase 4 — Navigation & Home CTA:** Fix nav seed hrefs + add Contact entry; add home CTA card
- **Phase 5 — Verify & finalize:** E2E submit test, error/validation paths, mobile, build, docs

---

## 5. Verification

1. `curl -X POST http://localhost:3000/api/contact-messages -H "Content-Type: application/json" -d '{"name":"Test","email":"t@t.com","message":"Hi"}'` → 201 (direct backend check)
2. `curl http://localhost:3000/api/contact-messages` → not exposed publicly (admin-only)
3. `curl -X POST http://localhost:4321/api/contact -H "Content-Type: application/json" -d '{...}'` → proxies to Payload, returns 201/JSON (same-origin endpoint check)
4. `/contact` renders form + alt-contact card; sidebar shows Contact with active highlight
5. Form validates (empty fields + bad email) without submitting
6. Valid submit shows success state; form resets
7. Backend-down path shows error state
8. Light + dark mode both render correctly
9. `npx astro build` succeeds; existing pages unchanged
