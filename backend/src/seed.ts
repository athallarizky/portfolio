import { getPayload } from 'payload'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import config from './payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const legacyAssets = path.resolve(__dirname, '../../frontend/assets/documents')

// ───────────────────────────────────────────────────────────────────────────
// Phase 1: Documents & Categories
// ───────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Pinned', slug: 'pinned', icon: 'solar:pin-bold-duotone', hint: 'The essentials — résumé, CV, cover letter.', order: 1 },
  { label: 'Research', slug: 'research', icon: 'solar:book-2-outline', hint: 'Write-ups, templates, and notes I keep returning to.', order: 2 },
  { label: 'Other', slug: 'other', icon: 'solar:folder-2-outline', hint: 'Miscellaneous files and references.', order: 3 },
]

const DOCUMENTS = [
  { title: 'Résumé', category: 'pinned', file: 'atha-tharizky-resume.pdf', excerpt: 'One-page summary of my experience, roles, and the work I have shipped.', updated: 'Jul 2026' },
  { title: 'CV — Detailed', category: 'pinned', file: 'atha-tharizky-cv.pdf', excerpt: 'Full chronology: roles, talks, open-source contributions, and side projects.', updated: 'Jun 2026' },
  { title: 'Cover Letter Template', category: 'pinned', file: 'atha-tharizky-cover-letter.pdf', excerpt: 'A reusable template I tailor for each role I apply to.', updated: 'Apr 2026' },
  { title: 'AI Workflow Template', category: 'research', file: 'ai-workflow-template.md', excerpt: 'How I run a software project with an AI agent — PRD to production, phase by phase.', updated: 'Jul 2026' },
  { title: 'Case Study — Rent-House-AI', category: 'research', file: 'rent-house-ai-case-study.pdf', excerpt: 'Deep dive: listing scraper → RAG pipeline → semantic search across five services.', updated: 'May 2026' },
  { title: 'References', category: 'other', file: 'atha-tharizky-references.pdf', excerpt: 'Contact details for past collaborators and managers — available on request.', updated: 'Mar 2026' },
]

// ───────────────────────────────────────────────────────────────────────────
// Phase 2: Blog
// ───────────────────────────────────────────────────────────────────────────
const TAGS = ['AI', 'Workflow', 'RAG', 'Go', 'TypeScript', 'tRPC', 'DX', 'Postgres', 'Testing']

const AUTHORS = [
  { name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents. Follow along — new posts every other week.' },
]

const ARTICLES = [
  { title: 'Running a Software Project With an AI Agent: PRD to Prod', slug: 'running-a-software-project-with-an-ai-agent', excerpt: "The sprint pattern I use to hand real software work off to an LLM — phase 0 discovery, planning docs, phase reports, and the AGENTS.md file that makes delegation actually work.", tags: ['AI', 'Workflow'], author: 'Atha Tharizky', publishedAt: '2026-07-07', readMinutes: 8, bannerColor: 'linear-gradient(135deg,#9936e6 0%,#5b21b6 50%,#1e1b4b 100%)', bannerIcon: 'solar:rocket-bold' },
  { title: 'Stop Building RAG From Scratch', slug: 'stop-building-rag-from-scratch', excerpt: "Everyone reaches for LangChain on day one. Here's why a 200-line HNSW index, a chunker, and a single prompt usually beats the framework soup.", tags: ['RAG', 'Go'], author: 'Atha Tharizky', publishedAt: '2026-06-22', readMinutes: 12, bannerColor: 'linear-gradient(135deg,#ffc65c 0%,#f97316 100%)', bannerIcon: 'solar:graph-up-linear' },
  { title: "tRPC Is the API Layer I Didn't Know I Needed", slug: 'trpc-is-the-api-layer', excerpt: 'End-to-end types without codegen, no schema duplication, and your frontend just… knows.', tags: ['TypeScript', 'tRPC'], author: 'Atha Tharizky', publishedAt: '2026-05-18', readMinutes: 6, bannerColor: 'linear-gradient(135deg,#3b82f6,#1e3a8a)', bannerIcon: 'solar:bolt-linear' },
  { title: 'Designing CLI Tools People Actually Want to Use', slug: 'designing-cli-tools', excerpt: 'Good CLIs feel like magic: instant startup, helpful errors, sensible defaults, and zero config.', tags: ['Go', 'DX'], author: 'Atha Tharizky', publishedAt: '2026-04-30', readMinutes: 10, bannerColor: 'linear-gradient(135deg,#22c55e,#15803d)', bannerIcon: 'solar:server-line-duotone' },
  { title: 'From Postgres to Vector DB: When to Stop', slug: 'from-postgres-to-vector-db', excerpt: 'pgvector handles more than people give it credit for. Before you reach for Pinecone or Qdrant, check whether your collection even needs a dedicated vector store.', tags: ['Postgres', 'AI'], author: 'Atha Tharizky', publishedAt: '2026-03-14', readMinutes: 7, bannerColor: 'linear-gradient(135deg,#64748b,#0f172a)', bannerIcon: 'solar:cpu-line-duotone' },
  { title: 'A Pragmatic Test Pyramid for Side Projects', slug: 'pragmatic-test-pyramid', excerpt: 'You don\'t need 90% coverage on a weekend project. But you do need a handful of tests that catch the scary stuff.', tags: ['Testing', 'DX'], author: 'Atha Tharizky', publishedAt: '2026-02-09', readMinutes: 5, bannerColor: 'linear-gradient(135deg,#ec4899,#831843)', bannerIcon: 'solar:album-line-duotone' },
]

// ───────────────────────────────────────────────────────────────────────────
// Phase 3: Technologies & Projects
// ───────────────────────────────────────────────────────────────────────────
const TECHNOLOGIES = [
  'Next.js', 'tRPC', 'Prisma', 'Go', 'FastAPI', 'RAG', 'Docker', 'Cobra',
  'Node.js', 'SSE', 'Redis', 'React', 'S3', 'Postgres', 'WASM', 'Edge',
  'TypeScript', 'Vite', 'TailwindCSS', 'Express', 'Tauri', 'OpenAI', 'MobX', 'HNSW',
]

const PROJECTS = [
  {
    title: 'NoteFlow', slug: 'noteflow', year: 2025, excerpt: 'A self-hosted, AI-assisted note-taking app with markdown, tags, semantic search, and a Tauri desktop build.',
    descriptor: 'Personal · OSS', bannerColor: 'linear-gradient(135deg,#9936e6,#5b21b6)', bannerIcon: 'solar:rocket-bold',
    techNames: ['Next.js', 'tRPC', 'Prisma', 'TypeScript', 'React', 'Vite', 'TailwindCSS', 'Express', 'Tauri', 'Postgres', 'OpenAI', 'MobX', 'HNSW'],
    links: [{ label: 'Source', icon: 'mdi:github', url: '#' }, { label: 'Live Demo', icon: 'solar:link-circle-bold', url: '#' }],
    features: [
      { icon: 'solar:bolt-linear', heading: 'Instant capture', description: 'Global hotkey opens a quick-note window; the note is saved before you finish your coffee sip.' },
      { icon: 'solar:database-linear', heading: 'Semantic search', description: 'Natural-language queries over every note you\'ve ever written, powered by a local HNSW index.' },
      { icon: 'solar:chat-round-dots-linear', heading: 'AI chat with your notes', description: 'RAG-backed conversations that cite the source note for every claim.' },
      { icon: 'solar:tag-bold-duotone', heading: 'Tags & references', description: 'Wiki-style [[links]] between notes, plus nested tags for organization.' },
      { icon: 'solar:smartphone-linear', heading: 'Cross-platform', description: 'Web, macOS, Windows, Linux, and Android — all from one codebase via Tauri.' },
      { icon: 'solar:lock-keyhole-minimalistic-linear', heading: 'Self-hosted & private', description: 'Your data never leaves your server. Optional end-to-end encryption.' },
    ],
    screenshots: [
      { bannerColor: 'linear-gradient(135deg,#9936e6,#5b21b6)', icon: 'solar:widget-5-bold-duotone' },
      { bannerColor: 'linear-gradient(135deg,#3b82f6,#1e3a8a)', icon: 'solar:chat-round-dots-linear' },
      { bannerColor: 'linear-gradient(135deg,#22c55e,#15803d)', icon: 'solar:document-text-outline' },
      { bannerColor: 'linear-gradient(135deg,#f97316,#831843)', icon: 'solar:magnifer-linear' },
    ],
    statsFooter: [{ value: '480', label: 'GitHub stars' }, { value: '~12k', label: 'Lines of code' }, { value: '15MB', label: 'Desktop binary' }],
    architecture: `noteflow/\n├── app/           # React + Vite + Tauri\n│   ├── src/\n│   └── src-tauri/\n├── server/        # tRPC + Express + AI\n│   ├── routerTrpc/\n│   └── aiServer/\n├── shared/        # types & helpers\n└── prisma/        # schema & migrations`,
    order: 1,
  },
  {
    title: 'Rent-House-AI', slug: 'rent-house-ai', year: 2025, excerpt: 'Listing scraper → RAG pipeline → semantic search across rental listings. Five services across Go, Node, and Python.',
    descriptor: 'Personal · AI', bannerColor: 'linear-gradient(135deg,#ffc65c,#f97316)', bannerIcon: 'solar:graph-up-linear',
    techNames: ['Go', 'FastAPI', 'RAG', 'Node.js', 'Redis'],
    links: [{ label: 'Source', icon: 'mdi:github', url: '#' }],
    features: [
      { icon: 'solar:database-linear', heading: 'Listing scraper', description: 'Multi-source scraper (Go) that pulls rental listings from 4 platforms concurrently.' },
      { icon: 'solar:chat-round-dots-linear', heading: 'RAG pipeline', description: 'Embedding → vector store → semantic search, powered by FastAPI + pgvector.' },
      { icon: 'solar:bolt-linear', heading: 'Five services', description: 'Go scraper, Python embeddings, Node gateway, Redis cache, Postgres store.' },
    ],
    statsFooter: [{ value: '5', label: 'Services' }, { value: '3', label: 'Languages' }, { value: '~20ms', label: 'Search latency' }],
    architecture: `rent-house-ai/\n├── scraper/       # Go — concurrent listing fetcher\n├── embeddings/    # Python/FastAPI — chunk + embed\n├── gateway/       # Node.js — public API\n├── redis/         # cache layer\n└── postgres/      # pgvector store`,
    order: 2,
  },
  {
    title: 'DevPlatform CLI', slug: 'devplatform-cli', year: 2024, excerpt: 'Internal CLI that scaffolds services, manages secrets, and boots a full dev cluster locally in under 30s.',
    descriptor: 'Work · Internal tooling', bannerColor: 'linear-gradient(135deg,#22c55e,#15803d)', bannerIcon: 'solar:server-line-duotone',
    techNames: ['Go', 'Docker', 'Cobra'],
    links: [{ label: 'Open', icon: 'solar:link-circle-bold', url: '#' }],
    features: [
      { icon: 'solar:rocket-bold', heading: 'Service scaffolding', description: 'One command to scaffold a new service with the right structure, configs, and CI pipeline.' },
      { icon: 'solar:lock-keyhole-minimalistic-linear', heading: 'Secret management', description: 'Encrypt and inject secrets at dev time — never store plaintext in .env.' },
      { icon: 'solar:database-linear', heading: 'Local cluster', description: 'Boot Postgres + Redis + MinIO + the full service graph in <30s with docker-compose under the hood.' },
    ],
    statsFooter: [{ value: '<30s', label: 'Cluster boot' }, { value: '12', label: 'Services managed' }, { value: 'Go', label: 'Language' }],
    architecture: `devplatform/\n├── cmd/           # CLI entry points\n├── internal/\n│   ├── scaffold/  # service templates\n│   ├── secrets/   # encryption + injection\n│   └── compose/   # docker-compose generator\n└── templates/     # project scaffolds`,
    order: 3,
  },
  {
    title: 'Realtime Polls', slug: 'realtime-polls', year: 2024, excerpt: 'Real-time polling widget for live streams. SSE fan-out, Redis-stream aggregator, sub-100ms updates.',
    descriptor: 'Personal', bannerColor: 'linear-gradient(135deg,#3b82f6,#1e3a8a)', bannerIcon: 'solar:bolt-linear',
    techNames: ['Node.js', 'SSE', 'Redis'],
    links: [{ label: 'Source', icon: 'mdi:github', url: '#' }],
    features: [
      { icon: 'solar:bolt-linear', heading: 'Sub-100ms updates', description: 'SSE push with Redis pub/sub fan-out keeps every connected client in sync under 100ms.' },
      { icon: 'solar:graph-up-linear', heading: 'Aggregation', description: 'Redis Streams aggregate vote totals and fan results to every poll instance.' },
      { icon: 'solar:eye-linear', heading: 'Embeddable widget', description: 'Single <script> embed — works on any page with no framework dependency.' },
    ],
    statsFooter: [{ value: '<100ms', label: 'Update latency' }, { value: 'Node.js', label: 'Runtime' }],
    order: 4,
  },
  {
    title: 'Wallpaper Hub', slug: 'wallpaper-hub', year: 2023, excerpt: 'Community wallpaper gallery with EXIF-aware uploads, lazy infinite scroll, and per-user collections.',
    descriptor: 'Personal · OSS', bannerColor: 'linear-gradient(135deg,#ec4899,#831843)', bannerIcon: 'solar:album-line-duotone',
    techNames: ['React', 'S3', 'Postgres'],
    links: [{ label: 'Source', icon: 'mdi:github', url: '#' }],
    features: [
      { icon: 'solar:camera-linear', heading: 'EXIF-aware uploads', description: 'Strips location data by default, extracts color palette for search, preserves camera + lens info.' },
      { icon: 'solar:gallery-linear', heading: 'Infinite scroll', description: 'Intersection Observer-based lazy loading with CSS grid — no pagination clicks needed.' },
      { icon: 'solar:users-group-rounded-linear', heading: 'User collections', description: 'Per-user galleries with public/private toggle. Shareable collection links.' },
    ],
    order: 5,
  },
  {
    title: 'Edge Tiny-Go Worker', slug: 'edge-tiny-go-worker', year: 2023, excerpt: 'Image-resizing worker running on the edge (Cloudflare Workers). Cold-start under 5ms, ~zero allocations.',
    descriptor: 'Experiment', bannerColor: 'linear-gradient(135deg,#64748b,#0f172a)', bannerIcon: 'solar:cpu-line-duotone',
    techNames: ['Go', 'WASM', 'Edge'],
    links: [{ label: 'Source', icon: 'mdi:github', url: '#' }],
    features: [
      { icon: 'solar:cpu-line-duotone', heading: 'Cold-start under 5ms', description: 'Compiled to WASM with TinyGo — binary is under 200KB, cold-start under 5ms on Cloudflare.' },
      { icon: 'solar:gallery-linear', heading: 'Zero-alloc resize', description: 'Image processing pipeline with zero heap allocations — all buffers pre-allocated.' },
      { icon: 'solar:globe-linear', heading: 'Edge-native', description: 'Deployed to 200+ Cloudflare edge locations. Image is resized closest to the user.' },
    ],
    statsFooter: [{ value: '<5ms', label: 'Cold-start' }, { value: '<200KB', label: 'Binary size' }, { value: '200+', label: 'Edge nodes' }],
    order: 6,
  },
]

// ───────────────────────────────────────────────────────────────────────────
// Phase 4: Social & Globals
// ───────────────────────────────────────────────────────────────────────────
const SOCIAL_PROFILES = [
  { platform: 'GitHub', icon: 'simple-icons:github', handle: '@athatharizky', url: 'https://github.com', showOnHome: true, order: 1 },
  { platform: 'LinkedIn', icon: 'simple-icons:linkedin', handle: 'in/athatharizky', url: 'https://www.linkedin.com', showOnHome: true, order: 2 },
  { platform: 'X', icon: 'simple-icons:x', handle: '@athatharizky', url: 'https://x.com', showOnHome: false, order: 3 },
  { platform: 'Threads', icon: 'simple-icons:threads', handle: '@athatharizky', url: 'https://www.threads.net', showOnHome: false, order: 4 },
  { platform: 'Instagram', icon: 'simple-icons:instagram', handle: '@athatharizky', url: 'https://www.instagram.com', showOnHome: false, order: 5 },
  { platform: 'Facebook', icon: 'simple-icons:facebook', handle: '/athatharizky', url: 'https://www.facebook.com', showOnHome: false, order: 6 },
  { platform: 'YouTube', icon: 'simple-icons:youtube', handle: '@athatharizky', url: 'https://www.youtube.com', showOnHome: false, order: 7 },
]

// ───────────────────────────────────────────────────────────────────────────
// Seed runner
// ───────────────────────────────────────────────────────────────────────────

function lexicalText(text: string) {
  return { type: 'text' as const, text, format: 0, detail: 0, mode: 'normal' as const, style: '', textStyle: '' }
}

function lexicalParagraph(text: string) {
  return { type: 'paragraph' as const, children: [lexicalText(text)], direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }
}

function lexicalHeading(text: string, tag: 'h2' | 'h3') {
  return { type: 'heading' as const, tag, children: [lexicalText(text)], direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }
}

function lexicalCode(code: string) {
  return { type: 'code' as const, children: [lexicalText(code)], direction: 'ltr' as const, format: '' as const, indent: 0, version: 1, language: 'plaintext' }
}

function lexicalBody(children: ReturnType<typeof lexicalParagraph>[]) {
  return { root: { type: 'root' as const, children, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 } }
}

const PROJECT_BODIES: Record<string, ReturnType<typeof lexicalParagraph>[]> = {
  'noteflow': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('NoteFlow is a self-hosted note-taking app I built to scratch my own itch — I wanted something fast for capturing fleeting ideas, with the kind of AI search that actually understands what I meant three months later. It runs entirely on your own infrastructure, so your notes never leave your machine unless you want them to.'),
    lexicalParagraph('The web frontend is a React + Vite + Tailwind app. The backend is tRPC over Express, with Prisma on Postgres. The desktop build ships via Tauri so the whole thing fits in a ~15MB binary. Semantic search uses a pluggable provider pattern (OpenAI, Ollama, local embeddings) backed by an HNSW index.'),
    lexicalHeading('Architecture', 'h2'),
    lexicalParagraph('The codebase is a Bun-managed monorepo with three workspaces: app (React frontend + Tauri shell), server (tRPC + Express + AI providers), and shared (types, schemas, helpers). The AI layer uses a factory pattern so new providers are ~one file.'),
    lexicalCode('noteflow/\n├── app/           # React + Vite + Tauri\n│   ├── src/\n│   └── src-tauri/\n├── server/        # tRPC + Express + AI\n│   ├── routerTrpc/\n│   └── aiServer/\n├── shared/        # types & helpers\n└── prisma/        # schema & migrations'),
  ],
  'rent-house-ai': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('Rent-House-AI is a rental listing aggregation and semantic search pipeline. It scrapes listings from four platforms concurrently, embeds the listings into a vector store, and exposes a natural-language search API — all running across five services in three languages.'),
    lexicalParagraph('The scraper (Go) runs on a cron schedule, pulling new listings and diffing against previous runs to detect changes. Listings flow through a Python/FastAPI embedding service (text-embedding-3-small), then into a pgvector-backed Postgres store. A Node.js gateway exposes the public search API with Redis caching for hot queries.'),
    lexicalHeading('Architecture', 'h2'),
    lexicalCode('rent-house-ai/\n├── scraper/       # Go — concurrent listing fetcher\n├── embeddings/    # Python/FastAPI — chunk + embed\n├── gateway/       # Node.js — public API\n├── redis/         # cache layer\n└── postgres/      # pgvector store'),
  ],
  'devplatform-cli': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('DevPlatform CLI is an internal tool that standardizes how we scaffold, configure, and run services locally. One command can create a new Go or Node service with the right folder structure, CI pipeline, and Docker Compose wiring — no copy-paste.'),
    lexicalParagraph('It also handles secret management: secrets are encrypted at rest and injected at dev time, so .env files never contain plaintext credentials. The cluster boot command spins up Postgres, Redis, MinIO, and the full service graph in under 30 seconds using docker-compose under the hood.'),
  ],
  'realtime-polls': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('A real-time polling widget for live streams and presentations. Viewers vote in-browser; results update for everyone via SSE push with Redis pub/sub fan-out. The widget is a single <script> embed with zero framework dependency.'),
    lexicalParagraph('The architecture is intentionally simple: a Node.js server handles SSE connections, Redis publishes vote events to a channel, and stream consumers aggregate results. The aggregation pipeline runs in Redis Streams for durability, so restarts don\'t lose in-flight votes.'),
  ],
  'wallpaper-hub': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('A community wallpaper gallery with EXIF-aware uploads. Uploads are automatically stripped of location data (privacy-first), and dominant colors are extracted from each image for color-based search. Lazy infinite scroll replaces pagination — new images load as you scroll using Intersection Observer.'),
    lexicalParagraph('Built with React on the frontend, S3 for image storage with CloudFront CDN, and Postgres for metadata and user collections. Each user gets a public/private gallery with shareable collection links — no account required to browse.'),
  ],
  'edge-tiny-go-worker': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('An experiment in running Go on the edge. Compiled to WASM via TinyGo, this image-resizing worker runs on Cloudflare Workers with a cold-start under 5ms and a binary under 200KB. The image processing pipeline uses zero heap allocations — all buffers are pre-allocated at startup.'),
    lexicalParagraph('Deployed across 200+ Cloudflare edge locations, images are resized as close to the user as possible. The worker handles JPEG, PNG, and WebP with configurable quality and dimensions via URL query parameters. It\'s not production-grade (no auth, no rate limiting), but it proves the pattern works.'),
  ],
}

const ARTICLE_BODIES: Record<string, ReturnType<typeof lexicalParagraph>[]> = {
  'running-a-software-project-with-an-ai-agent': [
    lexicalHeading('The Problem', 'h2'),
    lexicalParagraph('The first time I tried to hand a real feature to an LLM, it went sideways in about fifteen minutes. The agent invented an import that didn\'t exist, "fixed" a test by deleting it, and confidently declared the task done. The problem wasn\'t the model — it was that I\'d given it a vague paragraph and hoped for the best.'),
    lexicalHeading('The Pattern', 'h2'),
    lexicalParagraph('After a year of running projects this way, I landed on a pattern that works. The single biggest shift is thinking in phases, not prompts. Each phase has a goal, a set of tasks with difficulties and dependencies, and a report at the end. The agent never moves to the next phase until the current one is verified working.'),
    lexicalHeading('The Four Files', 'h2'),
    lexicalParagraph('Inside each sprint folder I keep four documents: tasks.md (the source of truth with IDs, difficulties, and statuses), architecture.md (decision matrix with rejected alternatives), data-design.md (real schemas, not prose), and AGENTS.md (the handoff file for another LLM). These turn a flailing agent into a reliable contributor.'),
    lexicalHeading('What This Buys You', 'h2'),
    lexicalParagraph('On my last project this workflow produced five services across three languages, ~2,500 lines of documentation, and a working RAG pipeline — in a sprint I could actually follow. More importantly, when I came back two weeks later, I could pick up exactly where I left off because every decision was written down.'),
  ],
  'stop-building-rag-from-scratch': [
    lexicalHeading('Why Everyone Reaches for LangChain', 'h2'),
    lexicalParagraph("It's tempting. The docs make it look easy, the abstractions are comforting, and the marketing tells you you're doing it wrong without a framework. But most RAG use cases don't need 90% of what LangChain ships."),
    lexicalHeading('The 200-Line Alternative', 'h2'),
    lexicalParagraph('A simple HNSW index (from your vector DB of choice), a text chunker (about 30 lines), and a single prompt template handles the majority of retrieval workflows. You get better performance because there\'s no framework overhead, and you actually understand what every line of code does. The frameworks earn their keep when you hit multi-hop reasoning, tool use, or agent orchestration — but most projects never reach that point.'),
  ],
  'trpc-is-the-api-layer': [
    lexicalHeading('The Promise', 'h2'),
    lexicalParagraph('End-to-end types without codegen. No schema duplication. Your frontend just knows the shape of every procedure, its input, and its output. After a year with tRPC, this is where the promise holds up.'),
    lexicalHeading('Where It Bites Back', 'h2'),
    lexicalParagraph('At scale, the tight coupling between frontend and backend types becomes a coordination burden. Monorepo-wide type changes cascade, the router file grows unwieldy, and the middleware story is less mature than Express or Fastify equivalents. It also locks you into TypeScript on both sides — which is fine until you need a Go service that calls the same API.'),
    lexicalHeading('The Verdict', 'h2'),
    lexicalParagraph('For solo projects and small teams shipping fast, tRPC is the best API layer I\'ve used. For multi-language, multi-team architectures, consider a hybrid: tRPC for internal RPC, REST or gRPC for cross-team boundaries.'),
  ],
  'designing-cli-tools': [
    lexicalHeading('Good CLIs Feel Like Magic', 'h2'),
    lexicalParagraph('Instant startup. Helpful errors that tell you exactly what went wrong and how to fix it. Sensible defaults and zero config required. This isn\'t just nice to have — it\'s the difference between a CLI that gets adopted and one that gets abandoned after the first `--help` flags.'),
    lexicalHeading('Building in Go with Cobra', 'h2'),
    lexicalParagraph('Cobra gives you subcommands, flags, and help text for free. The real work is in the error UX: every error should show a before/after example, every flag should have a clear default, and `--dry-run` should be a first-class feature, not an afterthought.'),
  ],
  'from-postgres-to-vector-db': [
    lexicalHeading('pgvector Handles More Than You Think', 'h2'),
    lexicalParagraph('With pgvector, Postgres becomes a perfectly capable vector store. HNSW indexes, cosine distance, AND/OR filtering on metadata columns — all within the same database you already run. For collections under ~1M vectors, pgvector matches dedicated stores on recall and is within 2-3x on latency.'),
    lexicalHeading('When to Leave', 'h2'),
    lexicalParagraph('You need a dedicated vector store when: your collection crosses 10M+ vectors, you need sub-10ms p99 latency at scale, or you need features like disk-backed indexes or hybrid search (keyword + vector). Before that point, the operational simplicity of one database usually wins.'),
  ],
  'pragmatic-test-pyramid': [
    lexicalHeading('The Cheap Version That Works', 'h2'),
    lexicalParagraph("You don't need 90% coverage on a weekend project. But you do need a handful of tests that catch the scary stuff. Here's what I write first, every time."),
    lexicalHeading('The Three Tests', 'h2'),
    lexicalParagraph('1. One end-to-end test for the happy path. If this passes, the system is wired correctly. 2. Smoke tests for critical API endpoints — just check 200 and the shape, not the value. 3. Unit tests for pure logic: parsers, validators, calculations. Everything else follows from the bugs you actually hit.'),
  ],
}

async function seed() {
  const payload = await getPayload({ config })

  // ════ Phase 1: Documents & Categories ════════════════════════
  for (const cat of CATEGORIES) {
    const existing = await payload.find({ collection: 'document-categories', where: { slug: { equals: cat.slug } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    await payload.create({ collection: 'document-categories', data: cat })
    console.log(`✅ Category: ${cat.label}`)
  }
  const catLookup = await payload.find({ collection: 'document-categories', limit: 10 })
  const catMap = new Map(catLookup.docs.map((c) => [c.slug, c.id]))

  for (const doc of DOCUMENTS) {
    const categoryId = catMap.get(doc.category)
    if (!categoryId) { console.warn(`⚠️  "${doc.title}" — no category "${doc.category}"`); continue }
    const existing = await payload.find({ collection: 'documents', where: { title: { equals: doc.title } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    const filePath = path.join(legacyAssets, doc.file)
    if (!fs.existsSync(filePath)) { console.warn(`⚠️  "${doc.title}" — file not found`); continue }
    const fileBuffer = fs.readFileSync(filePath)
    await payload.create({
      collection: 'documents',
      data: { title: doc.title, category: categoryId, excerpt: doc.excerpt, updated: doc.updated },
      file: { data: fileBuffer, mimetype: doc.file.endsWith('.md') ? 'text/markdown' : 'application/pdf', name: doc.file, size: fileBuffer.length },
    })
    console.log(`✅ Document: ${doc.title}`)
  }

  // ════ Phase 2: Blog ══════════════════════════════════════════
  const tagMap = new Map<string, number>()
  for (const name of TAGS) {
    const existing = await payload.find({ collection: 'tags', where: { name: { equals: name } }, limit: 1 })
    if (existing.totalDocs > 0) { tagMap.set(name, existing.docs[0].id); continue }
    const created = await payload.create({ collection: 'tags', data: { name, slug: name.toLowerCase() } })
    tagMap.set(name, created.id)
    console.log(`✅ Tag: ${name}`)
  }

  const authorMap = new Map<string, number>()
  for (const a of AUTHORS) {
    const existing = await payload.find({ collection: 'authors', where: { name: { equals: a.name } }, limit: 1 })
    if (existing.totalDocs > 0) { authorMap.set(a.name, existing.docs[0].id); continue }
    const created = await payload.create({ collection: 'authors', data: a })
    authorMap.set(a.name, created.id)
    console.log(`✅ Author: ${a.name}`)
  }

  for (const art of ARTICLES) {
    const existing = await payload.find({ collection: 'articles', where: { slug: { equals: art.slug } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    const tagIds = art.tags.map((t) => tagMap.get(t)).filter((id): id is number => id !== undefined)
    const authorId = authorMap.get(art.author)
    const body = ARTICLE_BODIES[art.slug] ? lexicalBody(ARTICLE_BODIES[art.slug]) : lexicalBody([lexicalParagraph(art.excerpt)])
    await payload.create({
      collection: 'articles',
      data: { title: art.title, slug: art.slug, excerpt: art.excerpt, tags: tagIds, author: authorId, publishedAt: art.publishedAt, readMinutes: art.readMinutes, body, bannerColor: art.bannerColor, bannerIcon: art.bannerIcon },
    })
    console.log(`✅ Article: ${art.title}`)
  }

  // ════ Phase 3: Technologies & Projects ═══════════════════════
  const techMap = new Map<string, number>()
  for (const name of TECHNOLOGIES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const existing = await payload.find({ collection: 'technologies', where: { name: { equals: name } }, limit: 1 })
    if (existing.totalDocs > 0) { techMap.set(name, existing.docs[0].id); continue }
    const created = await payload.create({ collection: 'technologies', data: { name, slug } })
    techMap.set(name, created.id)
    console.log(`✅ Tech: ${name}`)
  }

  for (const proj of PROJECTS) {
    const existing = await payload.find({ collection: 'projects', where: { slug: { equals: proj.slug } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    const techIds = proj.techNames.map((t) => techMap.get(t)).filter((id): id is number => id !== undefined)
    const body = PROJECT_BODIES[proj.slug] ? lexicalBody(PROJECT_BODIES[proj.slug]) : lexicalBody([lexicalParagraph(proj.excerpt)])
    await payload.create({
      collection: 'projects',
      data: {
        title: proj.title, slug: proj.slug, year: proj.year, excerpt: proj.excerpt,
        descriptor: proj.descriptor, bannerColor: proj.bannerColor, bannerIcon: proj.bannerIcon,
        techTags: techIds, links: proj.links, body, status: 'published', order: proj.order,
        features: proj.features, screenshots: proj.screenshots, statsFooter: proj.statsFooter,
        architecture: proj.architecture,
      },
    })
    console.log(`✅ Project: ${proj.title}`)
  }

  // ════ Phase 4: Social & Globals ═════════════════════════════
  for (const s of SOCIAL_PROFILES) {
    const existing = await payload.find({ collection: 'social-profiles', where: { platform: { equals: s.platform } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    await payload.create({ collection: 'social-profiles', data: s })
    console.log(`✅ Social: ${s.platform}`)
  }

  // Globals
  await payload.updateGlobal({
    slug: 'site-config',
    data: { name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer', bioShort: "I'm a full-stack engineer who likes shipping calm, reliable products. Most of my work lives at the intersection of backend systems, developer experience, and AI tooling.", status: 'Open to side-projects', timezone: 'UTC+7', location: 'Remote · UTC+7' },
  })
  console.log('✅ Global: site-config')

  await payload.updateGlobal({
    slug: 'home',
    data: {
      hero: { eyebrow: '// hello, I\'m', name: 'Atha Tharizky' },
      stats: [
        { value: '6', suffix: '+', label: 'Years building' },
        { value: '24', suffix: '', label: 'Projects shipped' },
        { value: '3', suffix: '', label: 'Languages · TS/Go/Py' },
        { value: '∞', suffix: '', label: 'Cups of coffee' },
      ],
      about: [
        { paragraph: "I'm a full-stack engineer who likes shipping calm, reliable products. Most of my work lives at the intersection of backend systems, developer experience, and AI tooling." },
        { paragraph: 'Outside of code, I write notes about systems design, sprint workflows, and the occasional rant about over-engineered microservices.' },
      ],
      currently: [
        { icon: 'solar:bot-outline', text: 'Building internal AI tooling & dev platforms' },
        { icon: 'solar:magic-stick-2-line-duotone', text: 'Exploring agentic workflows & retrieval' },
        { icon: 'solar:clock-circle-linear', text: 'Local time {time}' },
      ],
      skills: [
        'TypeScript', 'React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL', 'Prisma', 'Docker', 'tRPC', 'TailwindCSS', 'OpenAI / RAG',
      ].map((name) => ({ name })),
    },
  })
  console.log('✅ Global: home')

  await payload.updateGlobal({
    slug: 'nav',
    data: {
      menuItems: [
        { label: 'Home', href: 'index.html', icon: 'solar:user-id-outline', order: 1 },
        { label: 'Projects', href: 'projects.html', icon: 'solar:widget-5-bold-duotone', order: 2 },
        { label: 'Blogs', href: 'blogs.html', icon: 'solar:document-text-outline', order: 3 },
        { label: 'Documents', href: 'documents.html', icon: 'solar:folder-bold-duotone', order: 4 },
        { label: 'Socials', href: 'social.html', icon: 'solar:users-group-rounded-bold-duotone', order: 5 },
      ],
      connectLinks: [
        { label: 'GitHub', href: 'https://github.com', icon: 'mdi:github', order: 1 },
        { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: 'mdi:linkedin', order: 2 },
        { label: 'Contact', href: 'mailto:hello@example.com', icon: 'solar:letter-outline', order: 3 },
      ],
    },
  })
  console.log('✅ Global: nav')

  console.log('\n🎉 Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
