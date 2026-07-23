# Sprint-19 Backlog (pre-planning)

> Status: 📋 Backlog · Created: 2026-07-23
> Home for deferred + open items. Convert to `plan.md` / `tasks.md` when sprint-19 starts.
> Depends on: sprint-18 (replace-all prod verified).

---

## 1. Article authoring skill (from sprint-17 / sprint-18)

> Priority: high. Unblocks insert-article-from-JSON (sprint-17 item #4).

**Why:** sprint-17 built insert-one project from JSON. Articles were skipped because the owner
wants a skill (like `tools/repo-to-project/`) that reads a source and emits a v2 article row.
Once done, insert-article is trivial — mount the same component on `articles` collection;
`/api/data-insert-one` is already collection-generic.

**Proposed:** `tools/repo-to-article/` skill that reads a source (markdown file, blog folder,
Notion export) and emits `title, slug, excerpt, tags, author, relatedArticles, body(MD)`.

**Open questions:**
- Source shape: single markdown file? folder? Notion export?
- `author` is required — skill must resolve/assign one.
- Does `articles` need same "preserves manual polish" idempotency as projects?

---

## 2. Uncommitted changes — repo-to-project SKILLS.md

> Priority: low. Clean up from sprint-18.

**What:** `tools/repo-to-project/SKILLS.md` has a local diff adding content-only vs full mode.
Should be committed or reverted.

---

## 3. Tech debt — og:image, image optimization, Svelte shell (from sprint-13 / sprint-15)

> Priority: low. Deferred since sprint-13.

- Per-page `og:image` generation (currently placeholder)
- Image optimization pipeline
- Svelte 4→5 migration for remaining legacy components
