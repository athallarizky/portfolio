# article-polish

Polish a Markdown draft into a portfolio **article** entry — AI-assisted. Reads a raw `.md`,
smooths the prose, and outputs a single `article.json` ready to paste into the admin dashboard.

## Invoke (manual)

In Claude Code, point at this procedure and give an input path:

> *follow `tools/article-polish/SKILLS.md`, input: path/to/my-article.md*

Claude reads `SKILLS.md`, polishes the draft, and writes:

```
tools/article-polish/
├── content/<slug>/
│   ├── draft/input.md          # your raw draft (untouched)
│   ├── polished/article.md     # AI-polished Markdown (review)
│   └── formatted/article.json  # v2 archive row — copy into admin
└── collection/<date>-<slug>.zip   # importable zip (full mode only)
```

`content/` and `collection/` are **gitignored** — this tool is for local use only.
Only `SKILLS.md`, `README.md`, and `samples/.gitkeep` are tracked.

## Style reference

Drop published article Markdown files into `samples/` (e.g. `sample-1.md`, `sample-2.md`).
The AI reads them for writing style guidance — sentence length, tone, heading structure.
`samples/` contents are gitignored; the folder is kept via `.gitkeep`.

## How to apply

1. Open the admin at `/admin/collections/articles`
2. Click **"＋ Create new from JSON"** above the list
3. Paste the contents of `content/<slug>/formatted/article.json`
4. Click **Preview** → **Apply**

Or, via CLI (needs backend running):

```bash
cd backend && npm run wrap:articles -- ../tools/article-polish/content/<slug>/formatted/article.json \
  -- --out ../tools/article-polish/collection/<date>-<slug>.zip
npm run import -- ../tools/article-polish/collection/<date>-<slug>.zip
```

Re-running on an existing article **updates it in place** (reuses UUID) and **preserves manual
polish** — banner, images, SEO, related articles are never touched.

## Requirements

- Backend running for the dry-run import: `cd backend && npm run dev`
- The author name must match an existing `authors` record
- Tags must be existing `tags` slugs

See `SKILLS.md` for the full procedure. Design: `docs/sprint-21/plan.md`.
