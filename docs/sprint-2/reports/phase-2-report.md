# Phase 2 Report — Blog

> Completed: 2026-07-07
> Part of: Sprint-2 (Headless CMS Backend)

---

## 1. What was built

Created the Blog content model: Tags (taxonomy), Authors, and Articles collections. Articles use Lexical rich-text for the body field, with relationships to Tags and Authors. Seeded all content from the legacy `blogs.html` and `article.html` with actual multi-block Lexical content.

- `Tags` collection — 9 tags matching legacy blog filter categories
- `Authors` collection — 1 author (Atha Tharizky)
- `Articles` collection — 6 articles with Lexical rich-text bodies (2–8 blocks each), tag relationships, author relationships, banner colors/icons, publish dates, read times

---

## 2. Files

| File | Purpose |
|---|---|
| `backend/src/collections/Tags.ts` | name, slug — public read, blog filter taxonomy |
| `backend/src/collections/Authors.ts` | name, initials, role, bio — public read |
| `backend/src/collections/Articles.ts` | title, slug, excerpt, tags[], author, publishedAt, readMinutes, Lexical body, bannerColor, bannerIcon, relatedArticles[], status, seo{} |

---

## 3. Seeded content

**Tags:** AI, Workflow, RAG, Go, TypeScript, tRPC, DX, Postgres, Testing

**Author:** Atha Tharizky (initials: AT, role: "Full-Stack Engineer · Backend · AI tooling")

**Articles (6):**

| Title | Tags | Date | Read | Body Blocks |
|---|---|---|---|---|
| Running a Software Project With an AI Agent: PRD to Prod | AI, Workflow | Jul 2026 | 8 min | 8 (h2 + paragraph) |
| Stop Building RAG From Scratch | RAG, Go | Jun 2026 | 12 min | 4 |
| tRPC Is the API Layer I Didn't Know I Needed | TypeScript, tRPC | May 2026 | 6 min | 6 |
| Designing CLI Tools People Actually Want to Use | Go, DX | Apr 2026 | 10 min | 4 |
| From Postgres to Vector DB: When to Stop | Postgres, AI | Mar 2026 | 7 min | 4 |
| A Pragmatic Test Pyramid for Side Projects | Testing, DX | Feb 2026 | 5 min | 4 |

---

## 4. Lexical body structure

Each article body is stored as structured Lexical JSON:

```json
{
  "root": {
    "type": "root",
    "children": [
      { "type": "heading", "tag": "h2", "children": [{ "type": "text", "text": "The Problem" }] },
      { "type": "paragraph", "children": [{ "type": "text", "text": "..." }] },
      ...
    ]
  }
}
```

The seed script's `ARTICLE_BODIES` map provides real content for each article slug. Future editing happens in the admin's Lexical WYSIWYG editor (`/admin/collections/articles`).

---

## 5. Key decisions

| Decision | Why |
|---|---|
| Lexical over markdown for body | Payload's default rich-text editor; structured JSON stores headings, code blocks, lists natively |
| Tags as separate taxonomy collection | Cleaner than text array — reusable across articles and filterable API-side |
| Banner as color + icon fields | Matches sprint-1's gradient banner + iconify icon pattern |

---

## 6. Verification

- `GET /api/tags` → 9 tags
- `GET /api/authors` → 1 author
- `GET /api/articles?depth=1&sort=-publishedAt` → 6 articles, tags + author populated
- `GET /api/articles/1?depth=0` → body contains `{ root: { children: [8 blocks] } }`
- `npm run seed` → idempotent
