import { lexicalHeading, lexicalParagraph, lexicalCode, lexicalBody } from '../lib/lexical'
import type { LexicalNode } from '../lib/lexical'

export const TAGS = ['AI', 'Workflow', 'RAG', 'Go', 'TypeScript', 'tRPC', 'DX', 'Postgres', 'Testing']

export const AUTHORS = [
  { name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents. Follow along — new posts every other week.' },
]

export const ARTICLES = [
  { title: 'Running a Software Project With an AI Agent: PRD to Prod', slug: 'running-a-software-project-with-an-ai-agent', excerpt: "The sprint pattern I use to hand real software work off to an LLM — phase 0 discovery, planning docs, phase reports, and the AGENTS.md file that makes delegation actually work.", tags: ['AI', 'Workflow'], author: 'Atha Tharizky', publishedAt: '2026-07-07', readMinutes: 8, bannerColor: 'linear-gradient(135deg,#9936e6 0%,#5b21b6 50%,#1e1b4b 100%)', bannerIcon: 'solar:rocket-bold' },
  { title: 'Stop Building RAG From Scratch', slug: 'stop-building-rag-from-scratch', excerpt: "Everyone reaches for LangChain on day one. Here's why a 200-line HNSW index, a chunker, and a single prompt usually beats the framework soup.", tags: ['RAG', 'Go'], author: 'Atha Tharizky', publishedAt: '2026-06-22', readMinutes: 12, bannerColor: 'linear-gradient(135deg,#ffc65c 0%,#f97316 100%)', bannerIcon: 'solar:graph-up-linear' },
  { title: "tRPC Is the API Layer I Didn't Know I Needed", slug: 'trpc-is-the-api-layer', excerpt: 'End-to-end types without codegen, no schema duplication, and your frontend just… knows.', tags: ['TypeScript', 'tRPC'], author: 'Atha Tharizky', publishedAt: '2026-05-18', readMinutes: 6, bannerColor: 'linear-gradient(135deg,#3b82f6,#1e3a8a)', bannerIcon: 'solar:bolt-linear' },
  { title: 'Designing CLI Tools People Actually Want to Use', slug: 'designing-cli-tools', excerpt: 'Good CLIs feel like magic: instant startup, helpful errors, sensible defaults, and zero config.', tags: ['Go', 'DX'], author: 'Atha Tharizky', publishedAt: '2026-04-30', readMinutes: 10, bannerColor: 'linear-gradient(135deg,#22c55e,#15803d)', bannerIcon: 'solar:server-line-duotone' },
  { title: 'From Postgres to Vector DB: When to Stop', slug: 'from-postgres-to-vector-db', excerpt: 'pgvector handles more than people give it credit for. Before you reach for Pinecone or Qdrant, check whether your collection even needs a dedicated vector store.', tags: ['Postgres', 'AI'], author: 'Atha Tharizky', publishedAt: '2026-03-14', readMinutes: 7, bannerColor: 'linear-gradient(135deg,#64748b,#0f172a)', bannerIcon: 'solar:cpu-line-duotone' },
  { title: 'A Pragmatic Test Pyramid for Side Projects', slug: 'pragmatic-test-pyramid', excerpt: 'You don\'t need 90% coverage on a weekend project. But you do need a handful of tests that catch the scary stuff.', tags: ['Testing', 'DX'], author: 'Atha Tharizky', publishedAt: '2026-02-09', readMinutes: 5, bannerColor: 'linear-gradient(135deg,#ec4899,#831843)', bannerIcon: 'solar:album-line-duotone' },
]

export const ARTICLE_BODIES: Record<string, LexicalNode[]> = {
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
