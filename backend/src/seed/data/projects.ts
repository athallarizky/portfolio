import { lexicalHeading, lexicalParagraph, lexicalBody } from '../lib/lexical'
import type { LexicalNode } from '../lib/lexical'

export interface SeedProject {
  title: string
  slug: string
  year: number
  excerpt: string
  descriptor: string
  bannerColor: string
  bannerIcon: string
  techNames: string[]
  links: { label: string; icon: string; url: string }[]
  features: { icon: string; heading: string; description: string }[]
  screenshots?: { bannerColor: string; icon: string }[]
  architecture?: string
  order: number
  showOnHome?: boolean
}

export const PROJECTS: SeedProject[] = [
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
    architecture: `noteflow/\n├── app/           # React + Vite + Tauri\n│   ├── src/\n│   └── src-tauri/\n├── server/        # tRPC + Express + AI\n│   ├── routerTrpc/\n│   └── aiServer/\n├── shared/        # types & helpers\n└── prisma/        # schema & migrations`,
    order: 1,
    showOnHome: true,
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
    architecture: `rent-house-ai/\n├── scraper/       # Go — concurrent listing fetcher\n├── embeddings/    # Python/FastAPI — chunk + embed\n├── gateway/       # Node.js — public API\n├── redis/         # cache layer\n└── postgres/      # pgvector store`,
    order: 2,
    showOnHome: true,
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
    architecture: `devplatform/\n├── cmd/           # CLI entry points\n├── internal/\n│   ├── scaffold/  # service templates\n│   ├── secrets/   # encryption + injection\n│   └── compose/   # docker-compose generator\n└── templates/     # project scaffolds`,
    order: 3,
    showOnHome: true,
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
    order: 6,
  },
]

export const PROJECT_BODIES: Record<string, LexicalNode[]> = {
  'noteflow': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('NoteFlow is a self-hosted note-taking app I built to scratch my own itch — I wanted something fast for capturing fleeting ideas, with the kind of AI search that actually understands what I meant three months later. It runs entirely on your own infrastructure, so your notes never leave your machine unless you want them to.'),
    lexicalParagraph('The web frontend is a React + Vite + Tailwind app. The backend is tRPC over Express, with Prisma on Postgres. The desktop build ships via Tauri so the whole thing fits in a ~15MB binary. Semantic search uses a pluggable provider pattern (OpenAI, Ollama, local embeddings) backed by an HNSW index.'),
    lexicalParagraph('The codebase is a Bun-managed monorepo with three workspaces: app (React frontend + Tauri shell), server (tRPC + Express + AI providers), and shared (types, schemas, helpers). The AI layer uses a factory pattern so new providers are ~one file.'),
  ],
  'rent-house-ai': [
    lexicalHeading('Overview', 'h2'),
    lexicalParagraph('Rent-House-AI is a rental listing aggregation and semantic search pipeline. It scrapes listings from four platforms concurrently, embeds the listings into a vector store, and exposes a natural-language search API — all running across five services in three languages.'),
    lexicalParagraph('The scraper (Go) runs on a cron schedule, pulling new listings and diffing against previous runs to detect changes. Listings flow through a Python/FastAPI embedding service (text-embedding-3-small), then into a pgvector-backed Postgres store. A Node.js gateway exposes the public search API with Redis caching for hot queries.'),
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
