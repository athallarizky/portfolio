# Phase 4 Report — Content Tools Emit ID

> Completed: 2026-09-13 · Follows [`phase-3-report.md`](./phase-3-report.md)

---

## 1. What was built

Both content tools gained an **optional Indonesian translation stage** (`SKILLS.md` step 3b):

| Tool | New outputs | Notes |
|---|---|---|
| `article-polish` | `content/<slug>/article.id.md` (review) + `article.id.json` (overlay sibling) | translate the **polished** EN article; `readMinutes` shared; seo optional |
| `repo-to-project` | `content/<slug>/project.id.md` + `project.id.json` | translate `title`/`excerpt`/`body` (+ optional `features`); `techTags`/`links`/`architecture` shared, never translated |

Overlay rules (enforced by the wrap tools from Phase 3): same `uuid`+`slug` as the EN row;
localized fields only; body as a Markdown string (Lexical JSON also accepted); re-runs
idempotent per locale (same uuid → in-place update, EN untouched).

Docs updated: both `SKILLS.md` (procedure + directory layouts) and both `README.md`s.

**Trap found & fixed:** `.gitignore` whitelisted only `article.json`/`article.md` under
`tools/article-polish/content/*/` — the new `article.id.*` files would have been **silently
ignored**, so bilingual publishes from CI (which reads the git checkout) would never see them.
Added the two whitelist lines.

## 2. Verification — one real translation through the full toolchain (task 4.3)

Article **`setup-repo-with-agent-skills`** translated (first bilingual article, kept as real
content — the owner commits it):

1. Authored `article.id.md` + `article.id.json` per the skill spec (uuid `660f60a0…` matching EN).
2. `npm run wrap:articles` → *"id translation attached from sibling .id.json"*.
3. Dry-run → `updated: {articles: 1}`, `locale overlays: {articles: 1}`, 0 errors.
4. Real import → clean; overlay written as the `id` locale only.
5. REST read-back:
   - `?locale=id&fallback-locale=none` → **"Setup Repo dengan Agent Skill"** + body converted
     md→Lexical (first heading "Masalahnya: repo yang asing") — proves the overlay body
     conversion on the real DB
   - `?locale=en` → English title untouched

## 3. Files touched

- `tools/article-polish/SKILLS.md`, `tools/repo-to-project/SKILLS.md` (step 3b + layouts)
- `tools/article-polish/README.md`, `tools/repo-to-project/README.md`
- `.gitignore` (article.id.* whitelist fix)
- `tools/article-polish/content/setup-repo-with-agent-skills/article.id.{md,json}` (first real translation)
