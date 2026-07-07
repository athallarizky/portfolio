# Phase 6 Report — Documents Page

> Completed: 2026-07-07

---

## 1. What was built

A fourth top-level page, **Documents** (`documents.html`), presenting a grid of
downloadable files (résumé, CV, cover-letter template, references, case study).
The "Documents" entry was added to the sidebar `Menu` on every page, and the
shared JS now resolves the correct page title + active highlight for it.

Stays true to the Blinko dashboard clone: same sidebar/header/content shell,
same card + tag + button tokens, new `.doc-card` style only.

---

## 2. How to run

No build step. Open the page directly:

```bash
open documents.html      # macOS
# or just double-click documents.html / serve the folder with any static server
```

Click any **Download** button — it uses the native `download` attribute to save
the file (and renames it to a clean filename).

---

## 3. Files touched

| File                          | Change                                                                |
|-------------------------------|-----------------------------------------------------------------------|
| `documents.html`              | NEW — page shell + 5 `.doc-card` cards in a `.grid-2`                 |
| `index.html`                  | + "Documents" nav link (multi-line format)                            |
| `projects.html`               | + "Documents" nav link                                                |
| `blogs.html`                  | + "Documents" nav link                                                |
| `article.html`                | + "Documents" nav link (detail page shares the menu)                  |
| `project.html`                | + "Documents" nav link (detail page shares the menu)                  |
| `assets/app.js`               | + `'documents.html': 'Documents'` in the `initPageTitle()` map        |
| `assets/styles.css`           | + `.doc-card` / `.doc-icon` / `.doc-info` / `.doc-meta` styles        |
| `assets/documents/README.md`  | NEW — scaffold documenting expected PDF filenames                     |

---

## 4. Key decisions

| Decision | Reason |
|----------|--------|
| Store downloads in `assets/documents/`, **not** top-level `docs/` | `docs/` already holds sprint planning markdown — colliding the two would confuse sprint docs with portfolio files |
| Downloads are real `<a download>` links to expected PDF paths | Native, progressive-enhancement-friendly; no JS needed. Wired now so dropping a real file "just works" |
| Placeholder PDFs are **not** generated | Site convention is realistic placeholder content replaced later; fake PDFs would be clutter the user deletes. Folder + README scaffold documents the contract instead |
| Reuse `.card` / `.tag` / `.btn-ghost` tokens, add only `.doc-card*` | Keeps the Blinko aesthetic consistent; minimal new CSS surface area |
| Menu icon `solar:folder-bold-duotone` | Distinct from Blogs' `solar:document-text-outline`; matches Projects' `bold-duotone` weight |

---

## 5. Done criteria

- [x] "Documents" appears in the sidebar Menu on all 6 pages (incl. `article.html` / `project.html` detail pages)
- [x] `documents.html` renders with 5 document cards in a responsive 2-col grid
- [x] Each card has icon, title, type tag, excerpt, updated/size meta, Download button
- [x] Download buttons use `download` attribute with clean filenames
- [x] Active nav highlight + header page-title resolve correctly on `documents.html`
- [x] Layout works on desktop + mobile (hamburger drawer), light + dark themes
- [x] `assets/documents/` scaffolded with README listing expected files
- [x] `tasks.md` Phase 6 added; this report written

---

## 6. Follow-up (not in this phase)

- Drop real PDFs into `assets/documents/` (see its README for filenames)
- Optionally: generate placeholder PDFs so demo downloads don't 404
- Future sprint: drive the card list from a JSON/CMS manifest instead of hardcoded HTML
