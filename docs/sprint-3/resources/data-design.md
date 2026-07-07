# Data Design — Sprint 3: Astro + Svelte Frontend

## 1. Data Sources

### Sprint-3: Static Mock Data

Data sourced from `backend/src/seed.ts` — the same seed data that populates the PayloadCMS backend. Mock `.ts` files in `src/data/` mirror the API response shapes exactly.

### Sprint-4: REST API

Same data, fetched from `http://localhost:3000/api/`. The migration is a simple import swap — component props and interfaces don't change.

---

## 2. Data Pipeline

```
Sprint-3:
  backend/src/seed.ts → src/data/*.ts (manual copy)
                      → Astro pages import → render HTML

Sprint-4:
  PayloadCMS REST API → fetch() in Astro pages
                      → Same interfaces → render HTML
```

---

## 3. Response Shapes

### 3.1 Collection Envelope (PaginatedResponse)

All collection endpoints return this envelope. Mock data files for collections export this shape.

```ts
interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
}
```

### 3.2 Globals (Direct)

Globals return the object directly — no envelope, no pagination. Mock data files for globals export the object directly.

---

## 4. Core Interfaces

See `src/lib/api-types.ts` for full definitions. Key interfaces:

### DocumentCategory
```ts
interface DocumentCategory {
  id: number
  label: string           // "Pinned", "Research", "Other"
  slug: string            // "pinned", "research", "other"
  icon: string            // "solar:pin-bold-duotone"
  hint: string | null
  order: number
  updatedAt: string
  createdAt: string
}
```

### Document
```ts
interface Document {
  id: number
  title: string
  category: DocumentCategory | number   // populated at depth=1
  excerpt: string | null
  updated: string | null                // "Jul 2026"
  updatedAt: string
  createdAt: string
  url: string | null                    // "/documents/resume.pdf"
  thumbnailURL: string | null
  filename: string | null
  mimeType: string | null               // "application/pdf"
  filesize: number | null               // bytes
}
```

### Article
```ts
interface Article {
  id: number
  title: string
  slug: string
  excerpt: string | null
  tags: Tag[]
  author: Author
  publishedAt: string                   // ISO 8601
  readMinutes: number | null
  body: LexicalRoot                     // Lexical JSON
  bannerColor: string | null            // CSS gradient
  bannerIcon: string | null             // iconify icon
  relatedArticles: number[] | Article[] // IDs at depth=0, populated at depth=1
  status: 'draft' | 'published'
  seo: { metaTitle, metaDescription, ogImage } | null
}
```

### Project
```ts
interface Project {
  id: number
  title: string
  slug: string
  year: number
  excerpt: string | null
  descriptor: string | null             // "Personal · OSS"
  bannerColor: string | null
  bannerIcon: string | null
  techTags: Technology[]
  links: { label: string; url: string | null; icon: string | null }[]
  body: LexicalRoot
  status: 'draft' | 'published'
  order: number
  features: { icon: string | null; heading: string | null; description: string | null }[]
  screenshots: { label: string | null; bannerColor: string | null; icon: string | null }[]
  statsFooter: { value: string; label: string }[]
  architecture: string | null           // plaintext code block
  seo: { metaTitle, metaDescription, ogImage } | null
}
```

### SocialProfile
```ts
interface SocialProfile {
  id: number
  platform: string     // "GitHub", "LinkedIn"
  icon: string         // "simple-icons:github"
  handle: string       // "@athatharizky"
  url: string
  showOnHome: boolean
  order: number
}
```

### Home (Global)
```ts
interface Home {
  hero: { eyebrow: string | null; name: string | null }
  stats: { value: string; suffix: string | null; label: string }[]
  about: { paragraph: string }[]
  currently: { icon: string | null; text: string }[]
  skills: { name: string }[]
}
```

### Nav (Global)
```ts
interface Nav {
  menuItems: { label: string; href: string; icon: string | null; order: number }[]
  connectLinks: { label: string; href: string; icon: string | null; order: number }[]
}
```

### SiteConfig (Global)
```ts
interface SiteConfig {
  name: string           // "Atha Tharizky"
  initials: string       // "AT"
  role: string | null
  bioShort: string | null
  status: string | null  // "Open to side-projects"
  timezone: string | null
  location: string | null
}
```

---

## 5. Lexical Rich Text Format

The `body` field on Articles and Projects uses Payload's Lexical JSON.

```ts
interface LexicalRoot {
  root: {
    type: "root"
    children: LexicalNode[]
    direction: "ltr"
    format: ""
    indent: 0
    version: 1
  }
}

type LexicalNode =
  | { type: "paragraph"; children: LexicalText[]; ... }
  | { type: "heading"; tag: "h1"|"h2"|"h3"|"h4"|"h5"|"h6"; children: LexicalText[]; ... }
  | { type: "code"; language: string; children: LexicalText[]; ... }
  | { type: "quote"; children: LexicalNode[]; ... }
  | { type: "list"; listType: "bullet"|"number"; children: LexicalNode[]; ... }
  | { type: "listitem"; children: LexicalNode[]; ... }
  | { type: "upload"; value: { id: number }; ... }

interface LexicalText {
  type: "text"
  text: string
  format: number   // bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
  ... // detail, mode, style, textStyle
}
```

**Renderer** (`src/lib/render-lexical.ts`): Walks `root.children`, renders each node to HTML. Heading → `<h{n}>`, code → `<pre><code>`, quote → `<blockquote>`, list → `<ul>/<ol>`, text format bitmask → `<strong>/<em>/<del>/<u>/<code>`.

---

## 6. Mock Data Values

### Data Sizes

| Data File | Items | Shape |
|-----------|-------|-------|
| `nav.ts` | 5 menu + 3 connect | `Nav` global (direct) |
| `site-config.ts` | 1 | `SiteConfig` global (direct) |
| `home.ts` | 4 stats, 2 about, 2 currently, 10 skills | `Home` global (direct) |
| `projects.ts` | 6 | `PaginatedResponse<Project>` |
| `articles.ts` | 6 | `PaginatedResponse<Article>` |
| `document-categories.ts` | 3 | `PaginatedResponse<DocumentCategory>` |
| `documents.ts` | 6 | `PaginatedResponse<Document>` |
| `social-profiles.ts` | 7 | `PaginatedResponse<SocialProfile>` |
| `technologies.ts` | 24 | `PaginatedResponse<Technology>` |
| `tags.ts` | 9 | `PaginatedResponse<Tag>` |
| `authors.ts` | 1 | `PaginatedResponse<Author>` |

### Relationship Quirks

- `documents.ts` → documents reference categories by ID (`category: 1`); at `depth=1` in the API, category is populated inline. Mock data should populate inline for simplicity.
- `projects.ts` → populates `techTags` inline (matching `?depth=1` API response); sprint-4 will request `?depth=1`.
- `articles.ts` → populates `tags` and `author` inline; `relatedArticles` as simple IDs (the sidebar only needs slugs for links).
- Lexical body fields use a representative subset of node types — 2-3 paragraphs, a heading, a code block, a list — not the full verbose JSON trees from prod. This keeps mock data size manageable.

---

## 7. File Storage

Document files live in `public/documents/` (moved from `frontend-legacy/assets/documents/`). Mock data URLs reference these paths:

| File | URL |
|------|-----|
| atha-tharizky-resume.pdf | `/documents/atha-tharizky-resume.pdf` |
| atha-tharizky-cv.pdf | `/documents/atha-tharizky-cv.pdf` |
| atha-tharizky-cover-letter.pdf | `/documents/atha-tharizky-cover-letter.pdf` |
| ai-workflow-template.md | `/documents/ai-workflow-template.md` |
| rent-house-ai-case-study.pdf | `/documents/rent-house-ai-case-study.pdf` |
| atha-tharizky-references.pdf | `/documents/atha-tharizky-references.pdf` |
