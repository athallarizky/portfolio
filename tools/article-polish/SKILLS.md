# article-polish — polish a Markdown article into a portfolio entry

> **Manually invoked.** When the user says something like
> *"follow `tools/article-polish/SKILLS.md`, input: path/to/my-article.md"* — run this procedure end-to-end.
> You are generating a portfolio `articles` entry from a raw Markdown draft.

## What this produces

For the given input, write under `tools/article-polish/`:

| Path | Purpose |
|---|---|
| `content/<slug>/draft/<original>.md` | the raw, unmodified draft you started with |
| `content/<slug>/polished/article.md` | AI-polished Markdown (for human review) |
| `content/<slug>/formatted/article.json` | **v2 archive row** — the one file to copy into the admin dashboard |

Plus, in **full mode**: `collection/<YYYY-MM-DD-HH-MM>-<slug>.zip` (importable via CLI).

All paths are relative to the **repo root** (`portfolio/`). Run backend CLI steps from `backend/`.

---

## Inputs

- `<input.md>` — path to a Markdown file (required). The raw draft to polish.
- `<mode>` — **ask the user first** (unless they already specified). Two modes:
  - **content-only** — write Markdown + JSON only. No backend, no zip, no dry-run.
  - **full** (default if unclear) — also wrap the importable zip (step 4) and dry-run import (step 5).

The user should also specify:
- **author name** (e.g. `"Athalla Rizky"`) — must match an existing `authors` record by name.
- **publishedAt** — ISO date. Default: today.
- **tags** — comma-separated tag names. If not specified, detect from content.

---

## Procedure

> **First action:** if `<mode>` wasn't specified up front, ask the user — *content-only* vs *full*.

### Step 0 — Resolve identity + snapshot existing polish (idempotency)

1. `slug` ← slugify from the article title or input filename: lowercase → `replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`.
2. Find an **existing** article with this slug, in this order:
   - `tools/article-polish/content/<slug>/formatted/article.json` (a prior run) → reuse its `uuid`; remember its cosmetic fields.
   - else, if the backend is reachable: `curl -s 'http://localhost:3000/api/articles?where[slug][equals]=<slug>&depth=0'` → if `totalDocs>0`, reuse `docs[0].uuid`.
   - else → mint a fresh `uuid` (`node -e 'console.log(crypto.randomUUID())'`).
3. **If an existing article was found → this run is an UPDATE.** You will **omit** the cosmetic fields so the import preserves the owner's manual polish.

### Step 1 — Read input + style reference

1. Read the user's Markdown file — the full content. Copy it to `content/<slug>/draft/`, preserving its original filename.
2. Read all Markdown files in `tools/article-polish/samples/` (`.md` files). These are the owner's published articles used as **style reference**.
3. From each sample article, analyze:
   - **Average sentence/paragraph length**
   - **Heading structure** — h2 vs h3 frequency, section depth
   - **Tone/mood** — formal vs conversational, use of "I"/"we"/"you"
   - **List usage** — bullet vs numbered, how items are introduced
   - **Code blocks** — how often, language annotations, inline vs block
   - **Paragraph breaks** — typical spacing between sections
4. Synthesize 3-5 clear "style rules" to pass to the AI.

### Step 2 — AI polish + Lexical conversion

Generate the polished article body in **Lexical rich text JSON** format. Prompt the AI with:

- The Markdown input
- The style rules extracted from samples
- The Lexical node specification below

Also ask the AI to generate: **title**, **excerpt** (1–2 sentences), and **tags** (as existing slugs).

**Lexical node specification:**

```
You must output valid PayloadCMS Lexical rich-text JSON. Every node MUST have
these exact fields:

ROOT:     type, children, direction ("ltr"), format (""), indent (0), version (1)
HEADING:  type, tag (h2/h3/h4), children, direction ("ltr"), format (""), indent (0), version (1)
PARAGRAPH:type, children, direction ("ltr"), format (""), indent (0), version (1)
TEXT:     type ("text"), text (string), format (bitmask), detail (0),
          mode ("normal"), style (""), textStyle (""), version (1)
LIST:     type, listType ("bullet"/"number"), children (listitems),
          direction ("ltr"), format (""), indent (0), version (1)
LISTITEM: type, children (paragraphs), direction ("ltr"), format (""), indent (0), version (1)
CODE:     type, language (e.g. "typescript"/"bash"/"python"), children,
          direction ("ltr"), format (""), indent (0), version (1)
QUOTE:    type, children (paragraphs), direction ("ltr"), format (""), indent (0), version (1)

Inline formatting bitmask on TEXT.format:
  Normal = 0, Bold = 1, Italic = 2, Bold+Italic = 3, Code = 16

Example structure:
{
  "root": {
    "type": "root",
    "children": [
      { "type": "heading", "tag": "h2",
        "children": [{ "type": "text", "text": "Section", "format": 0, "detail": 0, "mode": "normal", "style": "", "textStyle": "", "version": 1 }],
        "direction": "ltr", "format": "", "indent": 0, "version": 1 },
      { "type": "paragraph",
        "children": [{ "type": "text", "text": "Body text.", "format": 0, "detail": 0, "mode": "normal", "style": "", "textStyle": "", "version": 1 }],
        "direction": "ltr", "format": "", "indent": 0, "version": 1 }
    ],
    "direction": "ltr", "format": "", "indent": 0, "version": 1
  }
}

Output ONLY the JSON object — no markdown fences, no explanation.
```

### Step 3 — Write polished + formatted

Create `content/<slug>/polished/` and write:

**`article.md`** — polished Markdown for human review:

```markdown
# <Title>

> <publishedAt> · <readMinutes> min read

<excerpt>

**Tags:** <comma-joined names>
**Author:** <author name>

---

## Body (polished)

<AI-polished Markdown — convert each Lexical node back to Markdown.>

---

*Generated by tools/article-polish. Copy formatted/article.json into the admin dashboard.*
```

Create `content/<slug>/formatted/` and write:

**`article.json`** — the one file to import:

```jsonc
{
  "uuid": "<from step 0>",
  "title": "...",
  "slug": "<slug>",
  "excerpt": "...",
  "tags": ["<slug-1>", "<slug-2>"],
  "author": "<author name string>",
  "publishedAt": "<ISO date>",
  "readMinutes": <word count ÷ 200, rounded up>,
  "body": { /* Lexical JSON from step 2 */ },
  "status": "published"
}
```

**v2 article row schema — fill vs omit:**

| Field | Fill? | Source |
|-------|-------|--------|
| `uuid` | fill | step 0 |
| `title` | fill | user / AI |
| `slug` | fill | step 0 |
| `excerpt` | fill | AI |
| `tags` | fill (slugs) | AI / user |
| `author` | fill (name string) | user — resolve by `authors.name` |
| `publishedAt` | fill | user or today |
| `readMinutes` | fill | word count ÷ 200 |
| `body` | fill (Lexical JSON) | AI |
| `status` | fill `"published"` | default |
| `bannerColor`, `bannerIcon` | **OMIT** | owner polishes |
| `featuredImage` | **OMIT** | owner polishes |
| `seo` | **OMIT** | owner polishes |
| `relatedArticles` | **OMIT** | owner polishes |

### Step 4 — Wrap into the importable zip

> **full mode only.** In **content-only mode**, skip this and step 5.

```bash
cd backend && npm run wrap:articles -- ../tools/article-polish/content/<slug>/formatted/article.json \
  -- --out ../tools/article-polish/collection/<YYYY-MM-DD-HH-MM>-<slug>.zip
```

### Step 5 — Preview (dry-run import)

> **full mode only.** Needs the backend running (`cd backend && npm run dev`).

```bash
cd backend && npm run import -- ../tools/article-polish/collection/<…>-<slug>.zip -- --dry-run
```
Expect `created: { articles: 1 }` (new) or `updated: { articles: 1 }` (existing slug) and **0 errors**.

### Step 6 — Hand off

Tell the owner:
- what was generated (title, slug, readMinutes, tags) — **always**
- any **unresolved tags** — suggest adding them via admin
- **full mode:** dry-run result
- **content-only mode:** copy `content/<slug>/formatted/article.json` into the admin's "Insert article from JSON" panel at `/admin/collections/articles`

---

## Directory structure

```
tools/article-polish/
├── README.md
├── SKILLS.md
├── samples/                       # local-only Markdown style references
│   ├── .gitkeep                   # keeps folder in git (contents ignored)
│   └── *.md                       # your published articles for AI to study
├── content/<slug>/
│   ├── draft/<original>.md        # raw Markdown draft (untouched)
│   ├── polished/article.md        # AI-polished Markdown (for review)
│   └── formatted/article.json     # v2 row — copy into admin dashboard
└── collection/
    └── <YYYY-MM-DD-HH-MM>-<slug>.zip  # importable zip (full mode only)
```

## Merge semantics (idempotency)

- **Reuse the existing uuid** (step 0) → import upserts by uuid → **updates in place**.
- **Omit cosmetic fields** → manual polish preserved.
- `collection/` filenames are collision-safe → a re-run never overwrites a prior zip.
- `content/` and `collection/` are **gitignored** — only `SKILLS.md`, `README.md`, and `samples/.gitkeep` are tracked.

## Edge cases

- **No title** → derive from filename or ask.
- **Author not in DB** → import fails with `UnresolvedRelationError`. Verify the name first.
- **Tags not in DB** → won't resolve. Create them in admin first.
- **Backend not running** → skip DB lookup (step 0). Full mode dry-run still needs the backend.
- **Slug collision** → UPDATE of existing article. If different content, ask for a different slug.
