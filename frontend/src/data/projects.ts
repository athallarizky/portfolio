function t(text: string, format = 0) {
  return { type: 'text' as const, text, format, detail: 0, mode: 'normal' as const, style: '', textStyle: '' };
}
function p(...children: ReturnType<typeof t>[]) {
  return { type: 'paragraph' as const, children, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 };
}
function h(tag: 'h2', ...children: ReturnType<typeof t>[]) {
  return { type: 'heading' as const, tag, children, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 };
}
function blockquote(...contents: ReturnType<typeof p>[]) {
  return { type: 'quote' as const, children: contents, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 };
}
type LexicalBody = { root: { type: 'root'; children: any[]; direction: 'ltr'; format: ''; indent: number; version: number } };

const tech = (name: string, icon?: string, id = 0) => ({ id, name, slug: name.toLowerCase().replace(/\s+/g, '-'), icon: icon || null });

const projBody1: LexicalBody = {
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [
    p(t('NoteFlow is an open-source, self-hosted note-taking application designed for developers and knowledge workers. It combines the speed of a local-first architecture with AI-powered features like semantic search and RAG-backed chat.')),
    h('h2', t('Why I Built It')),
    p(t("I wanted a note-taking tool that felt like a code editor — fast startup, keyboard-first navigation, plaintext under the hood. None of the existing options (Notion, Obsidian, Logseq) hit the sweet spot of self-hosted + AI-native + developer-friendly. So I built one.")),
    h('h2', t('Architecture Highlights')),
    p(t('The app splits across three layers: a Tauri desktop shell (Rust), a React frontend (Vite + MobX), and a tRPC backend (Express + Prisma). AI features run against a local HNSW vector index — no cloud dependency.')),
  ]},
};
const projBody2: LexicalBody = {
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [
    p(t('Rent-House-AI scrapes rental listings from multiple platforms, runs them through a RAG pipeline, and serves a semantic search API. Each listing gets its own embedding — users search in natural language and get ranked results.')),
    h('h2', t('Multi-Service Architecture')),
    p(t('Five services across three languages: a Go scraper for concurrent fetching, a Python/FastAPI embedding service, a Node.js gateway, Redis for caching, and Postgres with pgvector for storage. The system handles ~1000 listings per scrape cycle.')),
  ]},
};
const projBody3: LexicalBody = {
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [
    p(t('An internal CLI tool built for a dev platform team. It scaffolds new services from templates, manages environment secrets, and boots a full local development cluster — all in under 30 seconds.')),
    h('h2', t('Design Philosophy')),
    p(t('Zero config by default, override when needed. Every command prints a dry-run preview before executing. Errors include suggested fixes. The CLI was designed to be the fastest path from idea to running code for 40+ engineers.')),
  ]},
};
const projBody4: LexicalBody = {
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [
    p(t('A real-time polling widget designed for live streams and events. Viewers vote, results update in real-time via Server-Sent Events. Built for sub-100ms latency at hundreds of concurrent voters.')),
    h('h2', t('Technical Details')),
    p(t('Node.js backend with SSE fan-out. Redis Streams aggregate votes. Each poll supports multiple question types (single-choice, ranked, emoji reactions). Results are cached and broadcast to all connected clients via a single SSE channel.')),
  ]},
};
const projBody5: LexicalBody = {
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [
    p(t('A community wallpaper gallery with EXIF-aware uploads, lazy infinite scroll, and per-user collections. Built when I was learning React and cloud storage patterns.')),
    h('h2', t('What I Learned')),
    p(t('This was my first deep dive into React, client-side image processing, and S3 pre-signed uploads. The upload pipeline reads EXIF data to automatically tag images by camera model, lens, and location — making discovery surprisingly fun.')),
  ]},
};
const projBody6: LexicalBody = {
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [
    p(t('An experiment in running Go binaries at the edge via WebAssembly. A tiny HTTP handler compiled to WASM and deployed to Cloudflare Workers — measuring cold start, throughput, and the viability of Go-in-WASM for production workloads.')),
    h('h2', t('Results')),
    p(t('Cold start under 5ms. Throughput comparable to JavaScript workers for CPU-bound tasks, better for memory-heavy operations. The main limitation: WASM modules cap at ~1MB compiled — fine for micro-handlers, tight for anything with heavy dependencies.')),
  ]},
};

const projects = {
  docs: [
    {
      id: 1, title: 'NoteFlow', slug: 'noteflow', year: 2025,
      excerpt: 'A self-hosted, AI-assisted note-taking app with markdown, tags, semantic search, and a Tauri desktop build.',
      descriptor: 'Personal · OSS', bannerColor: 'linear-gradient(135deg,#9936e6,#5b21b6)', bannerIcon: 'solar:rocket-bold',
      techTags: [tech('Next.js', 'simple-icons:nextdotjs'), tech('tRPC', 'simple-icons:trpc'), tech('Prisma', 'simple-icons:prisma')],
      links: [{ label: 'Source', icon: 'mdi:github', url: '#' }, { label: 'Live Demo', icon: 'solar:link-circle-bold', url: '#' }],
      body: projBody1, status: 'published' as const, order: 1,
      features: [
        { icon: 'solar:bolt-linear', heading: 'Instant capture', description: 'Global hotkey opens a quick-note window; the note is saved before you finish your coffee sip.' },
        { icon: 'solar:database-linear', heading: 'Semantic search', description: "Natural-language queries over every note you've ever written, powered by a local HNSW index." },
        { icon: 'solar:chat-round-dots-linear', heading: 'AI chat with your notes', description: 'RAG-backed conversations that cite the source note for every claim.' },
        { icon: 'solar:tag-bold-duotone', heading: 'Tags & references', description: 'Wiki-style [[links]] between notes, plus nested tags for organization.' },
        { icon: 'solar:smartphone-linear', heading: 'Cross-platform', description: 'Web, macOS, Windows, Linux, and Android — all from one codebase via Tauri.' },
        { icon: 'solar:lock-keyhole-minimalistic-linear', heading: 'Self-hosted & private', description: 'Your data never leaves your server. Optional end-to-end encryption.' },
      ],
      screenshots: [
        { bannerColor: 'linear-gradient(135deg,#9936e6,#5b21b6)', icon: 'solar:widget-5-bold-duotone', label: null },
        { bannerColor: 'linear-gradient(135deg,#3b82f6,#1e3a8a)', icon: 'solar:chat-round-dots-linear', label: null },
        { bannerColor: 'linear-gradient(135deg,#22c55e,#15803d)', icon: 'solar:document-text-outline', label: null },
        { bannerColor: 'linear-gradient(135deg,#f97316,#831843)', icon: 'solar:magnifer-linear', label: null },
      ],
      statsFooter: [{ value: '480', label: 'GitHub stars' }, { value: '~12k', label: 'Lines of code' }, { value: '15MB', label: 'Desktop binary' }],
      architecture: 'noteflow/\n├── app/           # React + Vite + Tauri\n│   ├── src/\n│   └── src-tauri/\n├── server/        # tRPC + Express + AI\n│   ├── routerTrpc/\n│   └── aiServer/\n├── shared/        # types & helpers\n└── prisma/        # schema & migrations',
      seo: null,
    },
    {
      id: 2, title: 'Rent-House-AI', slug: 'rent-house-ai', year: 2025,
      excerpt: 'Listing scraper → RAG pipeline → semantic search across rental listings. Five services across Go, Node, and Python.',
      descriptor: 'Personal · AI', bannerColor: 'linear-gradient(135deg,#ffc65c,#f97316)', bannerIcon: 'solar:graph-up-linear',
      techTags: [tech('Go', 'simple-icons:go'), tech('FastAPI', 'simple-icons:fastapi'), tech('RAG')],
      links: [{ label: 'Source', icon: 'mdi:github', url: '#' }],
      body: projBody2, status: 'published' as const, order: 2,
      features: [
        { icon: 'solar:database-linear', heading: 'Listing scraper', description: 'Multi-source scraper (Go) that pulls rental listings from 4 platforms concurrently.' },
        { icon: 'solar:chat-round-dots-linear', heading: 'RAG pipeline', description: 'Embedding → vector store → semantic search, powered by FastAPI + pgvector.' },
        { icon: 'solar:bolt-linear', heading: 'Five services', description: 'Go scraper, Python embeddings, Node gateway, Redis cache, Postgres store.' },
      ],
      screenshots: [],
      statsFooter: [{ value: '5', label: 'Services' }, { value: '3', label: 'Languages' }, { value: '~20ms', label: 'Search latency' }],
      architecture: 'rent-house-ai/\n├── scraper/       # Go — concurrent listing fetcher\n├── embeddings/    # Python/FastAPI — chunk + embed\n├── gateway/       # Node.js — public API\n├── redis/         # cache layer\n└── postgres/      # pgvector store',
      seo: null,
    },
    {
      id: 3, title: 'DevPlatform CLI', slug: 'devplatform-cli', year: 2024,
      excerpt: 'Internal CLI that scaffolds services, manages secrets, and boots a full dev cluster locally in under 30s.',
      descriptor: 'Work · Internal tooling', bannerColor: 'linear-gradient(135deg,#22c55e,#15803d)', bannerIcon: 'solar:server-line-duotone',
      techTags: [tech('Go', 'simple-icons:go'), tech('Docker', 'simple-icons:docker'), tech('Cobra')],
      links: [{ label: 'Open', icon: 'solar:link-circle-bold', url: '#' }],
      body: projBody3, status: 'published' as const, order: 3,
      features: [
        { icon: 'solar:rocket-bold', heading: 'Service scaffolding', description: 'One command to scaffold a new service with the right structure, configs, and CI pipeline.' },
        { icon: 'solar:shield-keyhole-linear', heading: 'Secrets management', description: 'Pull secrets from vault, inject into local env, never write to disk.' },
        { icon: 'solar:laptop-linear', heading: 'Local cluster', description: 'Boot Postgres + Redis + API gateway in Docker Compose with one command.' },
      ],
      screenshots: [],
      statsFooter: [{ value: '40+', label: 'Engineers using it' }, { value: '<30s', label: 'Cluster boot time' }],
      architecture: null,
      seo: null,
    },
    {
      id: 4, title: 'Realtime Polls', slug: 'realtime-polls', year: 2024,
      excerpt: 'Real-time polling widget for live streams. SSE fan-out, Redis-stream aggregator, sub-100ms updates.',
      descriptor: 'Personal', bannerColor: 'linear-gradient(135deg,#3b82f6,#1e3a8a)', bannerIcon: 'solar:bolt-linear',
      techTags: [tech('Node.js', 'simple-icons:nodedotjs'), tech('SSE'), tech('Redis', 'simple-icons:redis')],
      links: [{ label: 'Source', icon: 'mdi:github', url: '#' }, { label: 'Live Demo', icon: 'solar:link-circle-bold', url: '#' }],
      body: projBody4, status: 'published' as const, order: 4,
      features: [
        { icon: 'solar:chart-line-duotone', heading: 'Real-time results', description: 'Sub-100ms update latency via SSE fan-out to all connected viewers.' },
        { icon: 'solar:widget-add-line-duotone', heading: 'Multiple question types', description: 'Single-choice, ranked, emoji reactions, and free-text polls.' },
      ],
      screenshots: [],
      statsFooter: [{ value: '<100ms', label: 'Update latency' }, { value: '500+', label: 'Concurrent voters' }],
      architecture: null,
      seo: null,
    },
    {
      id: 5, title: 'Wallpaper Hub', slug: 'wallpaper-hub', year: 2023,
      excerpt: 'Community wallpaper gallery with EXIF-aware uploads, lazy infinite scroll, and per-user collections.',
      descriptor: 'Personal · OSS', bannerColor: 'linear-gradient(135deg,#ec4899,#831843)', bannerIcon: 'solar:album-line-duotone',
      techTags: [tech('React', 'simple-icons:react'), tech('S3', 'simple-icons:amazons3'), tech('Postgres', 'simple-icons:postgresql')],
      links: [{ label: 'Source', icon: 'mdi:github', url: '#' }, { label: 'Live Demo', icon: 'solar:link-circle-bold', url: '#' }],
      body: projBody5, status: 'published' as const, order: 5,
      features: [
        { icon: 'solar:camera-linear', heading: 'EXIF-aware uploads', description: 'Automatically reads camera model, lens, aperture, and geolocation from uploaded photos.' },
        { icon: 'solar:list-check-linear', heading: 'Collections', description: 'Users create themed collections, share them, and browse community-curated sets.' },
      ],
      screenshots: [],
      statsFooter: [{ value: '200+', label: 'Wallpapers' }, { value: '50+', label: 'Contributors' }],
      architecture: null,
      seo: null,
    },
    {
      id: 6, title: 'Edge Tiny-Go Worker', slug: 'edge-tiny-go-worker', year: 2023,
      excerpt: 'Go compiled to WASM and deployed to Cloudflare Workers. A benchmark of cold start, throughput, and production viability.',
      descriptor: 'Experiment', bannerColor: 'linear-gradient(135deg,#64748b,#0f172a)', bannerIcon: 'solar:cpu-line-duotone',
      techTags: [tech('WASM', 'simple-icons:webassembly'), tech('Edge'), tech('Go', 'simple-icons:go')],
      links: [{ label: 'Source', icon: 'mdi:github', url: '#' }],
      body: projBody6, status: 'published' as const, order: 6,
      features: [
        { icon: 'solar:bolt-linear', heading: 'Cold start <5ms', description: 'WASM module initializes faster than equivalent JS — no JIT warmup needed.' },
        { icon: 'solar:server-line-duotone', heading: 'Edge deployment', description: 'Single Go binary compiled to WASM, deployed globally across 200+ PoPs.' },
      ],
      screenshots: [],
      statsFooter: [{ value: '<5ms', label: 'Cold start' }, { value: '~1MB', label: 'WASM binary' }],
      architecture: null,
      seo: null,
    },
  ],
  totalDocs: 6, limit: 10, totalPages: 1, page: 1, hasPrevPage: false, hasNextPage: false,
};

export { projects };
