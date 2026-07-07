# API Contract — Portfolio Backend (PayloadCMS 3)

> Sprint-2 deliverable. Reference for the Astro + Svelte frontend rebuild (sprint-3).
> Base URL: `http://localhost:3000` (dev) · All endpoints are **public GET** unless noted.

---

## 1. Conventions

### Response envelope

Every collection endpoint returns a paginated envelope:

```json
{
  "docs": [ ... ],
  "totalDocs": 6,
  "limit": 10,
  "totalPages": 1,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevPage": null,
  "nextPage": null
}
```

Globals return the object directly (no envelope, no pagination).

### Relationships: `?depth=`

| `?depth=0` | Returns relationship IDs only (e.g. `"category": 2`) |
|---|---|
| `?depth=1` | Populates the related object inline (e.g. `"category": { "id": 2, "label": "Research", ... }`) |

Default for public API is `depth=1` on detail views, `depth=0` on lists (choose based on what the FE needs).

### Sorting: `?sort=`

| Syntax | Example |
|---|---|
| Ascending | `?sort=order` |
| Descending | `?sort=-publishedAt` |

### Filtering: `?where[field][operator]=value`

| Operator | Example |
|---|---|
| `equals` | `?where[status][equals]=published` |
| `in` | `?where[slug][in]=noteflow,rent-house-ai` |
| `exists` | `?where[ogImage][exists]=true` |
| `like` | `?where[title][like]=rag` |

### Pagination

`?limit=10&page=1` (default limit = 10)

### Upload files

Files are accessed at the `url` field returned in the document response:

```json
{ "url": "/api/documents/file/ai-workflow-template.md", "filename": "ai-workflow-template.md", "mimeType": "text/markdown", "filesize": 14280 }
```

Prefix with the base URL: `http://localhost:3000/api/documents/file/ai-workflow-template.md`.

---

## 2. Collections

### 2.1 Document Categories

```
GET /api/document-categories?sort=order
```

**Response** (`depth=0`):

```ts
interface DocumentCategory {
  id: number
  label: string           // "Pinned", "Research", "Other"
  slug: string            // "pinned", "research", "other"
  icon: string            // "solar:pin-bold-duotone"
  hint: string | null     // "The essentials — résumé, CV, cover letter."
  order: number           // 1, 2, 3
  updatedAt: string       // ISO 8601
  createdAt: string       // ISO 8601
}
```

**Seeded count:** 3

---

### 2.2 Documents

```
GET /api/documents?depth=1&sort=-updatedAt
```

**Response** (`depth=1`):

```ts
interface Document {
  id: number
  title: string
  category: DocumentCategory   // populated at depth=1
  excerpt: string | null
  updated: string | null       // display string, e.g. "Jul 2026"
  updatedAt: string            // ISO 8601
  createdAt: string            // ISO 8601
  url: string | null           // relative file URL, e.g. "/api/documents/file/resume.pdf"
  thumbnailURL: string | null
  filename: string | null
  mimeType: string | null      // "application/pdf", "text/markdown"
  filesize: number | null      // bytes
}
```

**Filter by category:** `?where[category][equals]=1`

**Seeded count:** 6

---

### 2.3 Tags

```
GET /api/tags?sort=name
```

```ts
interface Tag {
  id: number
  name: string     // "AI", "Go", "TypeScript"
  slug: string     // "ai", "go", "typescript"
}
```

**Seeded count:** 9

---

### 2.4 Authors

```
GET /api/authors
```

```ts
interface Author {
  id: number
  name: string
  initials: string   // "AT"
  role: string | null
  bio: string | null
}
```

**Seeded count:** 1

---

### 2.5 Articles

```
GET /api/articles?sort=-publishedAt&depth=1
```

**Response** (`depth=1`):

```ts
interface Article {
  id: number
  title: string
  slug: string                    // URL-safe, unique
  excerpt: string | null
  tags: Tag[]                     // populated at depth=1
  author: Author                  // populated at depth=1
  publishedAt: string             // ISO 8601
  readMinutes: number | null
  body: LexicalRoot               // Lexical rich-text JSON (see §3)
  bannerColor: string | null      // CSS gradient, e.g. "linear-gradient(135deg,#9936e6,#5b21b6)"
  bannerIcon: string | null       // iconify icon, e.g. "solar:rocket-bold"
  relatedArticles: number[] | Article[]  // IDs at depth=0, populated at depth=1
  status: 'draft' | 'published'
  seo: {
    metaTitle: string | null
    metaDescription: string | null
    ogImage: string | null
  } | null
}
```

**Single article by slug:** `GET /api/articles?where[slug][equals]=running-a-software-project-with-an-ai-agent&depth=1`

**Filter by tag:** `GET /api/articles?where[tags][in]=1&depth=1`

**Filter published only (public):** `GET /api/articles?where[status][equals]=published&sort=-publishedAt`

> Note: public `GET` is gated to `status=published`. Authenticated admin requests see all.

**Seeded count:** 6

---

### 2.6 Technologies

```
GET /api/technologies?sort=name
```

```ts
interface Technology {
  id: number
  name: string     // "React", "Go", "Docker"
  slug: string     // "react", "go", "docker"
  icon: string | null
}
```

**Seeded count:** 24

---

### 2.7 Projects

```
GET /api/projects?sort=order&depth=1
```

**Response** (`depth=1`):

```ts
interface Project {
  id: number
  title: string
  slug: string                    // URL-safe, unique
  year: number                    // 2025
  excerpt: string | null
  descriptor: string | null       // "Personal · OSS"
  bannerColor: string | null
  bannerIcon: string | null
  techTags: Technology[]          // populated at depth=1
  links: {
    label: string                 // "Source", "Live Demo"
    url: string | null
    icon: string | null           // "mdi:github"
    id?: string
  }[]
  body: LexicalRoot               // Lexical rich-text JSON
  status: 'draft' | 'published'
  order: number
  features: {
    icon: string | null
    heading: string | null
    description: string | null
    id?: string
  }[]
  screenshots: {
    label: string | null
    bannerColor: string | null
    icon: string | null
    id?: string
  }[]
  statsFooter: {
    value: string
    label: string
    id?: string
  }[]
  architecture: string | null     // plaintext code block
  seo: {
    metaTitle: string | null
    metaDescription: string | null
    ogImage: string | null
  } | null
}
```

**Single project:** Get the slug from the list, then find by ID or filter by slug.

**Seeded count:** 6

---

### 2.8 Social Profiles

```
GET /api/social-profiles?sort=order
```

```ts
interface SocialProfile {
  id: number
  platform: string         // "GitHub", "LinkedIn"
  icon: string             // "simple-icons:github"
  handle: string           // "@athatharizky"
  url: string              // "https://github.com"
  showOnHome: boolean      // true = show on Home page
  order: number
}
```

**Home page profiles:** `?where[showOnHome][equals]=true`

**Seeded count:** 7

---

## 3. Globals

Globals are singletons — no envelope, no pagination. Access directly by slug.

### 3.1 Site Config

```
GET /api/globals/site-config
```

```ts
interface SiteConfig {
  id: number
  name: string             // "Atha Tharizky"
  initials: string         // "AT"
  role: string | null
  bioShort: string | null
  status: string | null    // "Open to side-projects"
  timezone: string | null  // "UTC+7"
  location: string | null  // "Remote · UTC+7"
  globalType: "site-config"
}
```

### 3.2 Home

```
GET /api/globals/home
```

```ts
interface Home {
  id: number
  hero: {
    eyebrow: string | null    // "// hello, I'm"
    name: string | null
  }
  stats: {
    value: string             // "6"
    suffix: string | null     // "+"
    label: string             // "Years building"
  }[]
  about: {
    paragraph: string
  }[]
  currently: {
    icon: string | null
    text: string
  }[]
  skills: {
    name: string              // "TypeScript", "Go", "Python"
  }[]
  globalType: "home"
}
```

### 3.3 Nav

```
GET /api/globals/nav
```

```ts
interface Nav {
  id: number
  menuItems: {
    label: string           // "Home", "Projects"
    href: string            // "index.html", "projects.html"
    icon: string | null
    order: number
  }[]
  connectLinks: {
    label: string           // "GitHub", "LinkedIn"
    href: string            // URL or "mailto:..."
    icon: string | null
    order: number
  }[]
  globalType: "nav"
}
```

---

## 4. Lexical Rich Text Format

The `body` field on Articles and Projects uses Payload's Lexical JSON format.

```ts
// Top level
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
  | { type: "paragraph"; children: LexicalText[]; direction: "ltr"; format: ""; indent: number; version: 1 }
  | { type: "heading"; tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; children: LexicalText[]; direction: "ltr"; format: ""; indent: number; version: 1 }
  | { type: "code"; language: string; children: LexicalText[]; direction: "ltr"; format: ""; indent: number; version: 1 }
  | { type: "quote"; children: LexicalNode[]; direction: "ltr"; format: ""; indent: number; version: 1 }
  | { type: "list"; listType: "bullet" | "number"; children: LexicalNode[]; direction: "ltr"; format: ""; indent: number; version: 1 }
  | { type: "listitem"; children: LexicalNode[]; direction: "ltr"; format: ""; indent: number; version: 1 }
  | { type: "upload"; value: { id: number }; fields: null; relationTo: string; version: 2 }

interface LexicalText {
  type: "text"
  text: string
  format: number       // bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
  detail: number
  mode: "normal"
  style: string
  textStyle: string
}
```

**Rendering approach for Astro/Svelte FE:** Walk `root.children`, render each node type to its HTML equivalent. For headings, use `node.tag`. For code blocks, render `<pre><code>`. For text nodes, check `format` bitmask for bold/italic styling.

---

## 5. CORS

Allowed origins (configured in `.env` → `PAYLOAD_PUBLIC_CORS`):

```
http://localhost:8080
http://127.0.0.1:8080
```

Add the production FE origin when deploying.

---

## 6. Endpoint quick reference

| Endpoint | Type | Auth | Count |
|---|---|---|---|
| `GET /api/document-categories?sort=order` | Collection | Public | 3 |
| `GET /api/documents?depth=1` | Collection (upload) | Public | 6 |
| `GET /api/tags?sort=name` | Collection | Public | 9 |
| `GET /api/authors` | Collection | Public | 1 |
| `GET /api/articles?sort=-publishedAt&depth=1` | Collection | Public (published only) | 6 |
| `GET /api/technologies?sort=name` | Collection | Public | 24 |
| `GET /api/projects?sort=order&depth=1` | Collection | Public | 6 |
| `GET /api/social-profiles?sort=order` | Collection | Public | 7 |
| `GET /api/globals/site-config` | Global | Public | — |
| `GET /api/globals/home` | Global | Public | — |
| `GET /api/globals/nav` | Global | Public | — |
| `GET /api/documents/file/:filename` | File download | Public | — |
