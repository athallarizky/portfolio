# Task Breakdown — Sprint 5: Contact Form

> Status: ✅ Complete | Created: 2026-07-09 · Completed: 2026-07-10
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery & Exploration

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 0.1  | Read sprint-4 final-report, sprint-5 AGENTS.md, root GUIDE.md               | Easy       | —            | ✅     |
| 0.2  | Boot backend; confirm existing display pages fetch server-side in frontmatter | Easy       | 0.1          | ✅     |
| 0.3  | Study collection convention (`Projects.ts`) + `payload.config.ts` registration | Easy       | 0.1          | ✅     |
| 0.4  | Confirm `Nav` global (`Nav.ts`) + `seed.ts` hrefs; flag stale `.html`-suffix active-nav bug | Easy       | 0.1          | ✅     |
| 0.5  | Audit `.search` input CSS + form tokens (`--secondary`,`--border`,`--radius`,`--input`) in `styles.css` | Easy       | 0.1          | ✅     |
| 0.6  | Confirm Astro server-endpoint pattern (no extra config under `output:'server'`) | Easy       | 0.1          | ✅     |
| 0.7  | Write `reports/phase-0-report.md`                                           | Easy       | 0.2-0.6      | ✅     |

### Service Summary
- **Runtime:** Node.js / PayloadCMS dev server (`:3000`), Astro dev server (`:4321`)
- **Files:** `backend/.env`, `backend/src/payload.config.ts`, `backend/src/collections/Projects.ts`, `backend/src/globals/Nav.ts`, `backend/src/seed.ts`, `frontend/astro.config.mjs`, `frontend/src/styles/styles.css`
- **Key output:** confirmed conventions + `.html`-href active-nav bug + server-fetch architecture decision

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Backend (ContactMessages Collection)

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 1.1  | Create `backend/src/collections/ContactMessages.ts` (name/email/message; `read:()=>false`, `create:()=>true`) | Easy       | 0.7          | ✅     |
| 1.2  | Import + register `ContactMessages` in `payload.config.ts` collections array | Easy       | 1.1          | ✅     |
| 1.3  | Restart backend; verify `GET /api/contact-messages` is gated (not public)   | Easy       | 1.2          | ✅     |
| 1.4  | Verify `POST /api/contact-messages` via curl returns 201 and persists       | Easy       | 1.3          | ✅     |
| 1.5  | Write `reports/phase-1-report.md`                                           | Easy       | 1.4          | ✅     |

### Service Summary
- **Runtime:** PayloadCMS dev server (`:3000`)
- **Files:** `backend/src/collections/ContactMessages.ts`, `backend/src/payload.config.ts`
- **Key output:** `POST /api/contact-messages` → 201; reads admin-only

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Frontend Endpoint & Page

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 2.1  | Create `frontend/src/pages/api/contact.ts` endpoint: parse body, `fetch` POST to `${API}/contact-messages`, return JSON status | Medium     | 1.5          | ✅     |
| 2.2  | Verify `curl -X POST :4321/api/contact` proxies to Payload → 201            | Easy       | 2.1          | ✅     |
| 2.3  | Create `frontend/src/pages/contact.astro` from `social.astro` template (BaseLayout) | Easy       | 2.1          | ✅     |
| 2.4  | Build contact form markup (name/email/message inputs + submit btn + `#form-status`) | Medium     | 2.3          | ✅     |
| 2.5  | Add inline `<script>` handler: validation + `fetch` POST to `/api/contact` (same-origin) + success/error states | Medium     | 2.2, 2.4     | ✅     |
| 2.6  | Add right-column alt-contact card (email + GitHub links) in `.grid-2`       | Easy       | 2.3          | ✅     |
| 2.7  | Write `reports/phase-2-report.md`                                           | Easy       | 2.5, 2.6     | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`), SSR + server endpoint
- **Files:** `frontend/src/pages/api/contact.ts`, `frontend/src/pages/contact.astro`
- **Key output:** same-origin `/api/contact` proxy + `/contact` page renders form + alt-contact card

> 📄 Full report: [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Styling (.form-* + .contact-alt-*)

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 3.1  | Add `.form-group`, `.form-label`, `.form-input`, `.form-textarea` to `styles.css` | Easy       | 2.7          | ✅     |
| 3.2  | Add `.form-status` + `.form-status-success` / `.form-status-error` states   | Easy       | 3.1          | ✅     |
| 3.3  | Add `.contact-alt` + `.contact-alt-item` (hover → `--hover`) styles         | Easy       | 3.1          | ✅     |
| 3.4  | Verify form renders correctly in light + dark mode                          | Easy       | 3.1-3.3      | ✅     |
| 3.5  | Write `reports/phase-3-report.md`                                           | Easy       | 3.4          | ✅     |

### Service Summary
- **Runtime:** Astro dev server (`:4321`)
- **Files:** `frontend/src/styles/styles.css`
- **Key output:** form + status states styled with design tokens; both themes correct

> 📄 Full report: [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Navigation & Home CTA

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 4.1  | Update `seed.ts` `menuItems`: fix `.html`→clean paths + add Contact entry (`/contact`, `solar:letter-outline`, order 6) | Medium     | 3.5          | ✅     |
| 4.2  | Rename "Contact" connectLink → "Email" in `seed.ts` to avoid clash          | Easy       | 4.1          | ✅     |
| 4.3  | Re-run `npm run seed`; verify Contact in sidebar + active-nav highlight on `/contact` | Easy       | 4.2          | ✅     |
| 4.4  | Add home CTA card to `index.astro` ("Let's talk" → `/contact`)              | Easy       | 4.3          | ✅     |
| 4.5  | Write `reports/phase-4-report.md`                                           | Easy       | 4.4          | ✅     |

### Service Summary
- **Runtime:** PayloadCMS seed + Astro dev server
- **Files:** `backend/src/seed.ts`, `frontend/src/pages/index.astro`
- **Key output:** Contact in nav (active highlight works); home CTA links to `/contact`

> 📄 Full report: [`reports/phase-4-report.md`](./reports/phase-4-report.md)

---

## Phase 5 — Verify & Finalize

| ID   | Task                                                                        | Difficulty | Dependencies | Status |
|------|-----------------------------------------------------------------------------|------------|--------------|--------|
| 5.1  | E2E: submit form on `/contact`, confirm 201 via `/api/contact` + success state + reset | Medium     | 4.5          | ✅     |
| 5.2  | Test error state (backend down) + client-side validation (empty, bad email) | Easy       | 5.1          | ✅     |
| 5.3  | Mobile responsive check (`.grid-2` collapses to single column)              | Easy       | 5.1          | ✅     |
| 5.4  | `npx astro build` succeeds; zero regressions on existing pages              | Easy       | 5.1          | ✅     |
| 5.5  | Update `tasks.md` statuses; write `final-report.md`                         | Easy       | 5.1-5.4      | ✅     |

### Service Summary
- **Runtime:** Astro build + dev server
- **Files:** `docs/sprint-5/tasks.md`, `docs/sprint-5/final-report.md`
- **Key output:** feature verified end-to-end; sprint finalized

> 📄 Full report: [`final-report.md`](./final-report.md)

---

## Dependency Graph

```
0.1 ─┬─► 0.2 ─┐
     ├─► 0.3 ─┤
     ├─► 0.4 ─┼─► 0.7 ─► 1.1 ─► 1.2 ─► 1.3 ─► 1.4 ─► 1.5
     ├─► 0.5 ─┤                                          │
     └─► 0.6 ─┘                                          ▼
       1.5 ─► 2.1 ─► 2.2 ─┐                              │
                          ├─► 2.5 ─┐                     │
              2.3 ─► 2.4 ─┘        ├─► 2.7 ─► 3.1 ─► 3.2 ─► 3.3 ─► 3.4 ─► 3.5
              2.3 ─► 2.6 ──────────┘                                        │
                                                                          ▼
                                          4.1 ─► 4.2 ─► 4.3 ─► 4.4 ─► 4.5
                                                              │
                                                              ▼
                                          5.1 ─► 5.2 ─► 5.3 ─► 5.4 ─► 5.5
```

---

## Summary

| Phase                        | Tasks | Difficulty Mix | Status |
|------------------------------|-------|----------------|--------|
| 0 — Discovery                | 7     | 7 Easy         | ✅      |
| 1 — Backend                  | 5     | 5 Easy         | ✅      |
| 2 — Frontend Endpoint & Page | 7     | 4 E, 3 M       | ✅      |
| 3 — Styling                  | 5     | 5 Easy         | ✅      |
| 4 — Navigation & Home CTA    | 5     | 4 E, 1 M       | ✅      |
| 5 — Verify & Finalize        | 5     | 4 E, 1 M       | ✅      |
| **Total**                    | **34**| **5 Medium, 29 Easy** | ✅ |
