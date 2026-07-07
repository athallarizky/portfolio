# Phase 7 Report — Document Categories (registry-driven)

> Completed: 2026-07-07

---

## 1. What was built

The Documents page moved from a **flat hardcoded grid** (Phase 6) to
**category-grouped sections rendered from a registry**. A new
`assets/documents.js` is now the single source of truth: it defines the
registered categories and the document list, and renders grouped sections into
`documents.html`.

Adding a document is now: drop the file in `assets/documents/` + add one entry
to `DOCUMENTS`. Adding/reordering a category is one entry in `CATEGORIES`.
Empty categories hide themselves.

---

## 2. How to run

No build step. Open `documents.html` directly — the categories render on load.

```bash
open documents.html
```

---

## 3. Data model (`assets/documents.js`)

- `CATEGORIES` — ordered list: `{ id, label, icon, hint }`
  - `pinned` → **Pinned** (`solar:pin-bold-duotone`)
  - `research` → **Research** (`solar:book-2-outline`)
  - `other` → **Other** (`solar:folder-2-outline`)
- `DOCUMENTS` — flat list: `{ title, category, file, size, updated, excerpt }`
- Renderer: for each category (in order), filter its docs, **skip if empty**,
  emit a `.doc-group` section. Card builder reuses the exact Phase-6
  `.doc-card` markup (icon tile, title, type tag from extension, excerpt,
  updated/size meta, download button). `download` attribute forces a download
  (important for `.md`, which would otherwise render inline).

---

## 4. Initial document placement

| Category | Documents |
|----------|-----------|
| Pinned   | Résumé, CV — Detailed, Cover Letter Template |
| Research | AI Workflow Template (real `.md`), Case Study — Rent-House-AI |
| Other    | References |

---

## 5. Files touched

| File                                       | Change                                                                  |
|--------------------------------------------|-------------------------------------------------------------------------|
| `assets/documents.js`                      | NEW — registry (`CATEGORIES` + `DOCUMENTS`) + grouped renderer          |
| `documents.html`                           | Hardcoded `.grid-2` cards → `<div id="documents-root">`; + script tag; subtitle tweak |
| `assets/styles.css`                        | + `.doc-group` / `.doc-group-head` / `-title` / `-count` / `-hint`      |
| `assets/documents/ai-workflow-template.md` | NEW — copy of the real file (working Research download)                 |
| `assets/documents/README.md`               | Rewritten: by-category list + source-of-truth note                     |
| `docs/sprint-1/tasks.md`                   | + Phase 7; summary totals → 30 / ~8h 15m                                |

---

## 6. Key decisions

| Decision | Reason |
|----------|--------|
| Data-driven registry over static HTML sections | "Registered categories" + trivial adding is the goal; static would mean copy-pasting card markup into sections each time |
| Registry lives in `assets/documents.js` (separate from `app.js`) | Keeps the shared `app.js` (theme/nav) clean; the registry is the doc data the user edits |
| Empty categories are hidden | Avoids awkward empty sections; shows a category only when it has docs |
| Copy the real `ai-workflow-template.md` into `assets/documents/` | User explicitly wanted ai-workflow under Research; gives one genuine working download |
| `download` attribute kept on every link | Without it, `.md` links render inline instead of downloading |
| Card markup unchanged from Phase 6 | Renderer emits identical HTML → existing `.doc-card` styling applies, no card CSS changes |

---

## 7. Done criteria

- [x] 3 category sections render from the registry (Pinned → Research → Other)
- [x] Empty categories hidden
- [x] Adding a document = one `DOCUMENTS` entry + dropped file
- [x] iconify icons render inside JS-built cards (custom-element auto-upgrade)
- [x] AI Workflow download works (real file copied)
- [x] `.doc-group` styles match the dashboard aesthetic; responsive + both themes
- [x] Active nav highlight + header page title unaffected
- [x] `tasks.md` Phase 7 added; this report written

---

## 8. Verification notes

- Confirmed `documents.html` no longer contains hardcoded `.doc-card` markup —
  cards are produced by the renderer into `#documents-root`.
- `ai-workflow-template.md` present in `assets/documents/` (real download).
- iconify custom elements auto-upgrade on innerHTML inject, so icons appear in
  the dynamically built cards. (Visually verified the rendered structure; if
  any icon ever fails to upgrade, calling `window.iconifyIcon`/re-fetch would
  be the fallback — not needed here.)

---

## 9. Follow-up (not in this phase)

- Drop the remaining real PDFs into `assets/documents/`
- Wire the header search box to filter documents across categories (currently decorative)
- Move the registry to a CMS/API if/when the site gains a backend
