# article-polish — polish a Markdown article into a portfolio entry

> **Manually invoked.** When the user says something like
> *"follow `tools/article-polish/SKILLS.md`, input: path/to/my-article.md"* — run this procedure end-to-end.
> You are generating a portfolio `articles` entry from a raw Markdown draft.

## What this produces

For the given input, write under `tools/article-polish/`:

| Path | Purpose |
|---|---|
| `content/<slug>/draft/<original>.md` | the raw, unmodified draft you started with (gitignored) |
| `content/<slug>/article.md` | AI-polished Markdown (for human review — the PR diff) |
| `content/<slug>/article.json` | **v2 archive row** — the import source the publish pipeline reads |
| `content/<slug>/article.id.md` | **optional** Indonesian translation of the polished article (review copy) |
| `content/<slug>/article.id.json` | **optional** ID overlay sibling — rides the EN row into bilingual publishes |

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
- **language & tone** — default: **English, professional but casual** — clear, direct,
  conversational; no corporate stiffness, no slang overload. If the raw draft is in another
  language, **translate while polishing** unless the owner says otherwise. Keep technical
  terms as-is.

---

## Procedure

> **First action:** if `<mode>` wasn't specified up front, ask the user — *content-only* vs *full*.

### Step 0 — Resolve identity + snapshot existing polish (idempotency)

1. `slug` ← slugify from the article title (draft H1 if present) or input filename: lowercase → `replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`.
2. Find an **existing** article with this slug, in this order:
   - `tools/article-polish/content/<slug>/article.json` (a prior run) → reuse its `uuid`; remember its cosmetic fields.
   - else, if the backend is reachable: `curl -s 'http://localhost:3000/api/articles?where[slug][equals]=<slug>&depth=0'` → if `totalDocs>0`, reuse `docs[0].uuid`.
   - else → mint a fresh `uuid` (`node -e 'console.log(crypto.randomUUID())'`).
3. **If an existing article was found → this run is an UPDATE.** You will **omit** the cosmetic fields so the import preserves the owner's manual polish.

### Step 1 — Read input + style reference

1. Read the user's Markdown file — the full content. Copy it to `content/<slug>/draft/`, preserving its original filename.
2. **Title rule:** if the draft opens with an H1 (`# …`), that heading **is the title** — carry it over
   verbatim (strip the leading `# `), don't re-author it, and don't repeat it inside the body. Only when
   there is no leading H1 does the AI author a title (or derive one from the filename — see *Edge cases*).
3. Read all Markdown files in `tools/article-polish/samples/` (`.md` files). These are the owner's published articles used as **style reference**.
4. From each sample article, analyze:
   - **Average sentence/paragraph length**
   - **Heading structure** — h2 vs h3 frequency, section depth
   - **Tone/mood** — formal vs conversational, use of "I"/"we"/"you"
   - **List usage** — bullet vs numbered, how items are introduced
   - **Code blocks** — how often, language annotations, inline vs block
   - **Paragraph breaks** — typical spacing between sections
5. Synthesize 3-5 clear "style rules" to pass to the AI.

### Step 2 — AI polish + Lexical conversion

Generate the polished article body in **Lexical rich text JSON** format. Prompt the AI with:

- The Markdown input
- The style rules extracted from samples
- The Lexical node specification below

Also ask the AI to generate: **excerpt** (1–2 sentences) and **tags** (as existing slugs). The **title**
comes from step 1's title rule (draft H1 verbatim) — the AI only authors one when the draft has no leading H1.

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

Write at the slug root (flat layout, same shape as repo-to-project):

**`content/<slug>/article.md`** — polished Markdown for human review:

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

*Generated by tools/article-polish. Import via the publish pipeline, or copy article.json into the admin dashboard.*
```

**`content/<slug>/article.json`** — the one file to import:

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

### Step 3b — Optional: Indonesian translation (`article.id.*`)

> Only when the owner asks for a translation (or a `draft/<original>.id.md` was given). The EN
> article (step 3) must exist first — the translation is an overlay on it, never standalone.

1. Translate the **polished** article (not the raw draft) into **Bahasa Indonesia**:
   natural, professional-casual — same voice as the EN piece, no stiff machine-translation feel.
   Structure maps 1:1 (same headings order/list shapes). **Keep technical terms, code, tool
   names, and proper nouns in English.** Title + excerpt + seo (if authored) translate too;
   `readMinutes` stays shared (never localized).
2. Write **`content/<slug>/article.id.md`** — the review copy, same header block as
   `article.md` (title/excerpt in ID).
3. Write **`content/<slug>/article.id.json`** — the overlay sibling. Identity keys are
   **required and must match the EN row** (validated at wrap time):

```jsonc
{
  "uuid": "<same as article.json>",
  "slug": "<slug>",
  "title": "Judul…",
  "excerpt": "Ringkasan 1–2 kalimat…",
  "body": "# Judul\n\nIsi dalam Markdown…"   // Markdown string (Lexical JSON also accepted)
  // "seo": { "metaTitle": "…", "metaDescription": "…" } — only when authored
}
```

**Allowed keys:** `uuid`, `slug`, `title`, `excerpt`, `body`, `seo.metaTitle`,
`seo.metaDescription` — anything else is refused by the wrap tools (typo guard).
`uuid`/`slug` are stripped when merging; the rest becomes the row's `locales.id`.

4. Re-runs are idempotent per locale: updating the translation rewrites the `.id.*` files
   with the same uuid; the EN files are untouched; imports write only the `id` locale
   (the `en` locale and admin-only polish are never clobbered).
5. Step 4's `wrap:articles` **auto-attaches** the sibling when it sits next to
   `article.json` — no extra flags. Same for `wrap:publish` in the CI pipeline.

### Step 4 — Wrap into the importable zip

> **full mode only.** In **content-only mode**, skip this and step 5.

```bash
cd backend && npm run wrap:articles -- ../tools/article-polish/content/<slug>/article.json \
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
- **content-only mode:** copy `content/<slug>/article.json` into the admin's "Insert article from JSON" panel at `/admin/collections/articles`

---

## Directory structure

```
tools/article-polish/
├── README.md
├── SKILLS.md
├── samples/                       # local-only Markdown style references
│   ├── .gitkeep                   # keeps folder in git (contents ignored)
│   └── *.md                       # your published articles for AI to study
├── content/<slug>/                # flat per-slug layout (git-tracked files marked ★)
│   ├── draft/<original>.md        # raw Markdown draft (untouched, gitignored)
│   ├── article.md              ★  # AI-polished Markdown (review / PR diff)
│   ├── article.json             ★  # v2 import row — the publish pipeline source
│   ├── article.id.md            ★  # optional Indonesian review copy (sprint-24)
│   └── article.id.json          ★  # optional ID overlay sibling (sprint-24)
└── collection/
    └── <YYYY-MM-DD-HH-MM>-<slug>.zip  # importable zip (full mode only, gitignored)
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
