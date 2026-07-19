# Phase 10 Report — Project detail: body fix + header/sidebar links

> Completed: 2026-07-19 · Trigger: owner request (admin Body error + 2 layout changes).

---

## 1. FIX — admin Body `parseEditorState: type "code" + not found`

**Symptom:** opening `/admin/collections/projects/2` → Body tab showed "Something went wrong:
parseEditorState: type 'code' + not found".

**Root cause:** the seed helper `lexicalCode()` produced a Lexical node
`{ type: 'code', children: [text], language }`, but Payload's RichText editor has **no
`code` node type registered** in the default features → on parse, Lexical throws
"type code + not found". Only **noteflow** and **rent-house-ai** bodies used it, and
that architecture tree was **already duplicated** in the projects' `architecture`
field (rendered separately as `<pre>`).

**Fix:**
- `backend/src/seed/data/projects.ts` — removed the `code` nodes (and the redundant
  "Architecture" heading) from both bodies; the descriptive architecture paragraph is
  kept and merged into the Overview flow. Removed the now-unused `lexicalCode` import.
- `backend/src/seed/phases/projects.ts` — changed `seedProjects` from **skip-if-exists**
  to **upsert** (update existing), so re-seeding syncs the corrected bodies.
- Stopped the backend (to avoid SQLite lock), ran `npm run seed:projects` → all 6
  projects updated; restarted backend (schema already matched → no prompt).

**Bonus:** the upsert also populated the previously-empty `techTags` (noteflow → 13
techs) and set `showOnHome` per seed.

**Verify:** project 2 body node types are now `['heading','paragraph','paragraph']`
(no `code`); admin will load it cleanly.

## 2. Tech stack below "Overview" (10.2)

The Tech stack section was already placed right after the prose (Phase 9). It only
*appeared* missing because (a) `techTags` was empty in the DB and (b) noteflow/rent-house-ai
bodies had an "Architecture" block before it. Both are now resolved — the body is
Overview-only and `techTags` is populated, so the section renders directly under
Overview. No markup move was needed.

## 3. Header → sidebar "All projects" link (10.3)

- Removed the `<a class="back-link" slot="headerRight">All projects</a>` from the
  project detail header.
- Added `<a class="all-projects-link" href="/projects">All projects →</a>` at the
  bottom of the "Other projects" `<aside>` (after the list).
- CSS `.all-projects-link`: `--secondary` (purple) + `font-weight: 700`, hairline
  top border, `align-self: flex-start`.

## 4. Test Results

| Check | Result |
|-------|--------|
| backend `npm run build` | ✅ clean |
| frontend `tsc --noEmit` | ✅ exit 0 |
| frontend `npm run build` | ✅ Complete! |
| `npm run seed:projects` | ✅ 6 projects updated (upsert) |
| project 2 body node types | ✅ `['heading','paragraph','paragraph']` — no `code` |
| noteflow `techTags` | ✅ 13 populated |
| header back-link removed | ✅ no `slot="headerRight"` |
| sidebar "All projects" link | ✅ present, `href="/projects"` |
| Tech stack renders | ✅ 13 tech-chips, below Overview |
| runtime errors | ✅ none |

> Confirm the admin Body tab loads project 2 without error in `/admin` (browser).

## 5. Notes

- `lexicalCode` still exists in `seed/lib/lexical.ts` (now unused) — it produces nodes
  Payload's editor can't parse, so don't re-use it as-is. A proper code-block would
  need the `CodeBlockFeature` enabled on the field + the correct node shape.
- `seed:projects` is now idempotent (upsert) — re-running always syncs projects to the
  seed data (will overwrite manual project edits; the script still backs up `payload.db`).
