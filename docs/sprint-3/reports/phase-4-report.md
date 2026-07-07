# Phase 4 Report — Static Pages

> Completed: 2026-07-07

---

## 1. How to Run

```bash
cd frontend && npm run dev    # http://localhost:4321
# Visit: /social, /documents, /projects, /projects/noteflow, etc.
```

---

## 2. What Was Done

| Task | File | Status |
|------|------|--------|
| Social page | `src/pages/social.astro` | ✅ |
| Documents page | `src/pages/documents.astro` | ✅ |
| Projects listing | `src/pages/projects.astro` | ✅ |
| Project detail | `src/pages/projects/[slug].astro` | ✅ |

Built: 10 pages (index + social + documents + projects + 6 project details)

---

## 3. Key Decisions

| Decision | Reason |
|----------|--------|
| Iconify CDN added to BaseLayout | Static Astro pages use `<iconify-icon>` web component; Svelte islands use `@iconify/svelte` npm. Both coexist. |
| `getStaticPaths()` for project detail | Generates 6 static pages at build time; `status === 'published'` filter |
| `set:html` for Lexical prose | Raw HTML rendering from `renderLexical()` into `.prose` div |
| File helpers inline in documents.astro | `fileExt()`, `fmtSize()` — small enough to keep colocated |

---

## 4. Reference Files

| File | Purpose |
|------|---------|
| `src/pages/social.astro` | `.grid-3` of profile cards |
| `src/pages/documents.astro` | Grouped `.doc-group` sections |
| `src/pages/projects.astro` | `.grid-3` of project cards |
| `src/pages/projects/[slug].astro` | Full detail with features, screenshots, stats, architecture |
