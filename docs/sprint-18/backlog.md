# Sprint-18 Backlog (pre-planning)

> Status: 📋 Backlog · Created: 2026-07-20
> Home for items deferred from sprint-17. Convert to `plan.md` / `tasks.md` when sprint-18 starts.
> Depends on: sprint-17 (insert-one + replace-all).

---

## 1. Article authoring skill (unblocks item 4 — insert article from JSON)

**Why:** sprint-17 skipped "insert article from JSON" because the owner wants article authoring to come
via a **new skill** (analogous to `tools/repo-to-project/`), not hand-authored JSON. Once that skill
emits a v2 article row, the insert-one path extends to articles trivially (mount the same component on
the `articles` collection; `/api/data-insert-one` is already collection-generic).

**Proposed:** a `tools/repo-to-article/` (or extend repo-to-project) skill that reads a source
(blog folder, markdown, repo) and emits a v2 article row (`title, slug, excerpt, tags, author, relatedArticles,
body(MD), …`). Reuses `wrap`/`insert-one`.

**Open questions:**
- Source shape: a single markdown file? A repo/blog folder? A Notion export?
- `author` is required on articles — the skill must resolve/assign one.
- Does `articles` need the same "preserves manual polish" idempotency treatment as projects?

---

## 2. Media cleanup on document replace-all delete

**Why:** sprint-17 replace-all deletes `documents` **records** absent from the archive, but the uploaded
files in `documents/` are not removed (Payload's delete may leave the file). Orphaned files are harmless
(unreferenced) but accumulate.

**Proposed:** a `cleanOrphanedMedia()` pass after a documents replace-all (or a standalone admin action)
that deletes files in `documents/` no longer referenced by any `documents` record.

---

## 3. Replace-all in prod — observe & iterate

**Why:** replace-all is the first destructive content-level op (online; snapshot-restore was offline).
Watch for: edge cases the e2e didn't cover (e.g. a referenced target that must be deleted anyway),
`documents` media behavior, performance on larger DBs.

**Proposed:** after the first real replace-all in prod, note any surprises here and decide follow-ups.
