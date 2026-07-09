# Phase 2 Report — Frontend Endpoint & Page

> Completed: 2026-07-09

---

## 1. How to Run

```bash
cd frontend && npm run dev      # http://localhost:4321

# Test the same-origin proxy endpoint:
curl -X POST http://localhost:4321/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","message":"Hi"}'

# View the page:
open http://localhost:4321/contact
```

---

## 2. Service Architecture

| File | Role |
|------|------|
| `frontend/src/pages/api/contact.ts` | **Astro server endpoint.** Receives browser POST (same-origin `/api/contact`), validates, proxies server-side to Payload `${API}/contact-messages`, returns JSON. Backend URL never reaches the browser |
| `frontend/src/pages/contact.astro` | **Contact page.** `.grid-2`: left card = form (name/email/message), right card = alt-contact links (email + GitHub). Inline `<script is:inline>` handles client-side validation + `fetch('/api/contact')` + success/error states |

**Why same-origin server endpoint (not client-direct):** matches the existing architecture where every display page fetches server-side in the Astro frontmatter. The browser POSTs to its own origin (`/api/contact`), so no CORS is involved and the backend URL (`localhost:3000`) stays server-side.

---

## 3. Endpoint behavior (`api/contact.ts`)

| Scenario | Status | Body |
|----------|--------|------|
| Valid submission | **201** | `{"ok":true,"id":<n>}` |
| Missing field(s) | **400** | `{"error":"Missing required fields: name, email, message"}` |
| Malformed JSON | **400** | `{"error":"Invalid JSON body"}` |
| Payload rejects | **502** | `{"error":"Backend rejected the submission"}` |
| Backend unreachable | **503** | `{"error":"Unable to reach the backend"}` |

---

## 4. Test Results

| Check | Command | Result |
|-------|---------|--------|
| Proxy POST | `curl -X POST :4321/api/contact -d '{...}'` | ✅ **201** `{"ok":true,"id":2}` |
| Missing fields | `-d '{"name":"No Email"}'` | ✅ **400** clear error |
| Invalid JSON | `-d 'not json'` | ✅ **400** |
| Page renders | `GET :4321/contact` | ✅ **200** |
| Backend persistence | (record `id:2` created via proxy) | ✅ confirmed |

---

## 5. Client-side validation (`contact.astro` inline script)

- **Empty fields** → error state, no submit.
- **Email format** → `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` regex; invalid → error state.
- **Submit button** → disabled + label flips to "Sending…" during request; restored after.
- **Success** → green status, form reset.
- **Error** (non-ok response or network throw) → red status with `data.error` or fallback message.

---

## 6. Key Decisions

| Decision | Reason |
|----------|--------|
| `<script is:inline>` (not a Svelte island) | The script is a small IIFE with no reactive state — `is:inline` ships it verbatim with zero hydration cost. Matches the codebase's minimal-JS ethos |
| Status codes 502/503 split | 502 = backend responded non-ok; 503 = fetch threw (backend down). Lets a future caller distinguish the two |
| `contact-submit` class on button + `.btn-label` span | Lets the script toggle the label text without clobbering the icon's outerHTML |
| Form fields carry `autocomplete` attrs | Native browser autofill (`name`/`email`) — free UX win, no code cost |

---

## 7. Reference Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/api/contact.ts` | New server endpoint (proxy) |
| `frontend/src/pages/contact.astro` | New page (form + alt-contact card + inline script) |
| `frontend/src/pages/social.astro` | Template copied (BaseLayout usage) |
| `frontend/src/layouts/BaseLayout.astro` | Shell + props contract |
