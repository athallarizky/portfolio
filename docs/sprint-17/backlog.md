# Sprint-17 Backlog (pre-planning)

> Status: 📋 Backlog · Created: 2026-07-20
> Home for items the owner doesn't want to forget. Convert to `plan.md` / `tasks.md` when sprint-17 starts.
> Depends on: sprint-16 (`tools/repo-to-project/` repo→project tool) — items 3 & 4 consume its `.json`.

---

## 1. Timestamped data-sync filenames → `portfolio-<dd>-<mm>-<yyyy>-<hh>-<mm>`

**Why:** current filenames use ISO (`portfolio-data-2026-07-20T01-44-07-511Z.zip`) — hard to scan/track at
a glance. Owner wants a human-friendly date prefix so downloads are easy to identify chronologically.

**Proposed:** reformat the timestamp portion to `dd-mm-yyyy-HH-MM`, keeping the kind prefix so the three
zip types don't collide:
- `portfolio-data-20-07-2026-01-44.zip`
- `portfolio-snapshot-20-07-2026-01-44.zip`
- `portfolio-projects-20-07-2026-01-44.zip` (sprint-16 wrap helper)

**Touches:** `backend/src/data-sync/cli/{export,snapshot-restore,wrap-projects}.ts` (the `timestamp()`
helpers); possibly the admin download `Content-Disposition` filename (currently fixed `portfolio-data.zip`
— decide whether to timestamp it too).

**Open questions:**
- `dd-mm-yyyy` is **not sortable** in a file listing (vs ISO `yyyy-mm-dd`). Keep ISO for the on-disk name
  and only render `dd-mm-yyyy` in the UI? Or accept the sort tradeoff? → owner call.
- Local time vs UTC for the stamp? (current CLI uses UTC ISO.)

---

## 2. "Replace all" mode on data-sync (archive = single source of truth)

**Why (the real pain):** import is **upsert-merge** today → it never deletes. So local & prod **drift**:
local has records prod doesn't, and counts diverge (owner: "local punya lebih banyak data, prod sudah saya
update, dokumen hanya satu"). Merge keeps both sides' extras; there's no "make DB exactly match the archive".

**Proposed:** add a **replace-all** option (UI toggle on `/admin/data-sync` + CLI flag) where the uploaded
zip is the single source of truth: after upserting, **delete** records (in the collections present in the
archive) that aren't in the archive → DB == archive for those collections.

**Design questions to resolve in sprint-17:**
- **Scope:** only the collections **present in the archive** (so uploading a projects-only zip doesn't wipe
  articles). Only the 8 content collections (never `users` / `contact-messages`).
- **Relation safety:** deleting a record that others reference orphans them (e.g. replace-all `authors` →
  articles lose their author). Restrict replace-all to leaf collections? Require the full content set?
  Block if incoming refs exist? → needs a decision.
- **Media:** `documents` replace-all — delete the media files too, or just the records?
- **Safety:** destructive → double-confirm + pre-op `payload.db` backup (mirror snapshot-restore). Snapshot
  restore is already whole-DB replace-all (offline); this is **content-level, online**, same upload UI.
- Maybe model it as a per-collection checkbox set in the UI ("for these collections, treat the zip as
  source of truth") rather than one global destructive switch.

**Note:** this is "sync semantics" (DB → archive) vs current "merge semantics". The drift the owner hit is
exactly the gap between them.

---

## 3. CMS: insert/add a **project** from a JSON file

**Why:** sprint-16 generates `content/<slug>/project.json` (v2 row). Today it's imported via the data-sync
zip. The owner wants a direct in-admin path: upload/paste one project `.json` → create the record.

**Proposed:** a Payload admin affordance (custom view on `/admin/data-sync`, or a per-collection "Add from
JSON" action on `projects`) that accepts a single project `.json` (the sprint-16 format) and creates it
(reuses the import engine's upsert-by-uuid for one row — so it's idempotent / update-or-create).

**Open questions:**
- Surface: a card on `/admin/data-sync` ("Add one project from JSON"), or an action inside the `projects`
  collection list? → owner call.
- Reuse `importFromArchive` under the hood (wrap the single row into an in-memory archive) vs a dedicated
  `createOneFromJson` engine path.

---

## 4. CMS: insert/add an **article** from a JSON file

**Why:** same as 3, for articles.

**Proposed:** identical affordance for the `articles` collection. Input = a v2 article row `.json`
(`title, slug, excerpt, tags, author, relatedArticles, body(MD), …`).

**Open questions:**
- sprint-16's tool only generates **projects**. For articles, the `.json` is hand-authored (or extend the
  sprint-16 tool to also read a repo/blog folder → article json). Decide whether article-generation is
  sprint-17 scope or later.
- Relations (`author` required, `tags`) — resolve against existing records (the sprint-16 import-priming
  already covers this).

---

## Predecessor

- **Sprint-16** (`tools/repo-to-project/` + wrap helper + import priming) must land first — items 3 & 4
  consume its `.json` format, and item 1 reformats filenames the wrap helper also produces.
