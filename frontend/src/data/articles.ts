function t(text: string, format = 0) {
  return { type: 'text' as const, text, format, detail: 0, mode: 'normal', style: '', textStyle: '' };
}

function p(...children: ReturnType<typeof t>[]) {
  return { type: 'paragraph' as const, children, direction: 'ltr', format: '', indent: 0, version: 1 };
}

function h(tag: 'h2' | 'h3', ...children: ReturnType<typeof t>[]) {
  return { type: 'heading' as const, tag, children, direction: 'ltr', format: '', indent: 0, version: 1 };
}

function code(language: string, textContent: string) {
  const lines = textContent.split('\n');
  const children = lines.map((line, i) => t(line + (i < lines.length - 1 ? '\n' : '')));
  return { type: 'code' as const, language, children, direction: 'ltr', format: '', indent: 0, version: 1 };
}

function blockquote(...contents: ReturnType<typeof p>[]) {
  return { type: 'quote' as const, children: contents, direction: 'ltr', format: '', indent: 0, version: 1 };
}

type LexicalBody = { root: { type: 'root'; children: any[]; direction: 'ltr'; format: ''; indent: number; version: number } };

const bannerAI: string = 'linear-gradient(135deg,#9936e6 0%,#5b21b6 50%,#1e1b4b 100%)';
const bannerRAG: string = 'linear-gradient(135deg,#ffc65c 0%,#f97316 100%)';
const bannerTRPC: string = 'linear-gradient(135deg,#3b82f6,#1e3a8a)';
const bannerGo: string = 'linear-gradient(135deg,#22c55e,#15803d)';
const bannerPG: string = 'linear-gradient(135deg,#64748b,#0f172a)';
const bannerTest: string = 'linear-gradient(135deg,#ec4899,#831843)';

const articleBody1: LexicalBody = {
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: [
      p(t("After running multiple software projects through AI agents, I've landed on a sprint pattern that actually works. Here's the full playbook — from phase 0 discovery to production.")),
      h('h2', t('The Core Insight')),
      p(t("The problem isn't the model's ability — it's context. An AI agent with a 10-line prompt will flail for 40 minutes. The same agent with a 400-line AGENTS.md file and a phased workflow will ship correct code in 10% of the time.")),
      h('h2', t('Phase 0: Discovery')),
      p(t("Before writing any code, spend time exploring. Read existing docs. Run the tools. Study real output. Ask clarifying questions. The goal is to understand what already exists and what needs building.")),
      h('h2', t('Sprint Planning')),
      p(t('Every sprint gets five planning documents:')),
      p(t('● tasks.md — breakdown with difficulty, dependencies, and status')),
      p(t('● architecture.md — tech decisions with pros and cons for each')),
      p(t('● data-design.md — schemas, pipelines, and data quirks')),
      p(t('● ux-flow.md — wireframes and interaction flows if UI is involved')),
      p(t('● AGENTS.md — a self-contained guide another LLM can follow blind')),
      h('h2', t('Phase Reports')),
      p(t("After each phase: build, test, write a report, update tasks.md. This creates an audit trail. When something breaks, you have a paper trail of what was built, why, and how it was verified.")),
    ],
  },
};

const articleBody2: LexicalBody = {
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: [
      p(t("Everyone reaches for LangChain on day one. Here's why a 200-line HNSW index, a chunker, and a single prompt usually beats the framework soup — and where the frameworks actually start to earn their keep.")),
      h('h2', t('The Minimal Stack')),
      p(t("You need exactly three things for a working RAG system: a chunker, an embedding model, and a vector store. Everything else — orchestration, prompt templates, chain composition — is scaffolding. Most projects don't need it.")),
      code('go', '// 200-line HNSW index in Go\ntype Index struct {\n  vectors map[int][]float32\n  graph   map[int][]int\n}\n\nfunc (idx *Index) Search(query []float32, k int) []int {\n  // HNSW search implementation\n}'),
      h('h2', t('When LangChain Earns Its Keep')),
      p(t("Frameworks become valuable when you need multi-step reasoning with tool use — function calling, structured output parsing, memory management. At that point, the orchestration complexity justifies the abstraction.")),
      p(t("But for single-hop retrieval? A hundred lines in your language of choice is cleaner, faster, and easier to debug.")),
    ],
  },
};

const articleBody3: LexicalBody = {
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: [
      p(t('End-to-end types without codegen, no schema duplication, and your frontend just knows. After a year with tRPC, here is where it shines and where it starts to bite back at scale.')),
      h('h2', t('The Good Parts')),
      p(t("Type safety across the network boundary. Define a procedure once — the frontend gets the input type, the output type, and the error shape automatically. No OpenAPI spec. No codegen step. It's the fastest iteration loop I have experienced.")),
      h('h2', t('The Pain Points')),
      p(t("At scale, tRPC's simplicity becomes its limitation. Client-server coupling tightens. Middleware patterns get awkward. And if you need to expose your API to third parties, you are back to writing an OpenAPI spec by hand.")),
    ],
  },
};

const articleBody4: LexicalBody = {
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: [
      p(t('Good CLIs feel like magic: instant startup, helpful errors, sensible defaults, and zero config. A field guide to building them in Go with Cobra — including the error UX most people get wrong.')),
      h('h2', t('Startup Time Is Everything')),
      p(t("If your CLI takes more than 50ms to print a help message, you have already failed. Users type 'cli --help' and hit enter before thinking. The tool should be done before their finger leaves the key.")),
      h('h2', t('Error Messages Are UX')),
      p(t("Don't print stack traces. Print what went wrong in plain language, what the user can do about it, and maybe a suggestion. 'Connection refused' is useless. 'Could not reach the API at api.example.com — check your network or VPN connection' is actionable.")),
      code('go', 'cmd := &cobra.Command{\n  Use:   "scaffold",\n  Short: "Create a new service from a template",\n  RunE: func(cmd *cobra.Command, args []string) error {\n    if len(args) < 1 {\n      return fmt.Errorf("service name required")\n    }\n    return scaffold(args[0])\n  },\n}'),
    ],
  },
};

const articleBody5: LexicalBody = {
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: [
      p(t('pgvector handles more than people give it credit for. Before you reach for Pinecone or Qdrant, check whether your collection even needs a dedicated vector store — most do not, until they very much do.')),
      h('h2', t('pgvector: Good Enough for 95%')),
      p(t("With HNSW indexing and ivfflat support, Postgres can handle up to ~1M vectors at sub-100ms latency. For most projects, that's more than enough. You get ACID guarantees, joins with your existing data, and zero operational overhead from a new service.")),
      h('h2', t('The Breaking Points')),
      p(t("Dedicated vector DBs pull ahead when you need: sub-10ms latency at scale, billion-vector collections, GPU-accelerated indexing, or specialized quantization. If you are not at that scale yet, pgvector is the pragmatic choice.")),
    ],
  },
};

const articleBody6: LexicalBody = {
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: [
      p(t("You do not need 90% coverage on a weekend project. But you do need a handful of tests that catch the scary stuff — the kind of bugs that corrupt data or silently fail in production.")),
      h('h2', t('The 20% That Catches 80%')),
      p(t('Test the boundaries: API contracts, data transformations, auth flows, and anything that touches money. Skip unit tests on trivial getters, CSS class toggles, and configuration parsing. Those break loudly enough on their own.')),
    ],
  },
};


export const articles = {
  docs: [
    {
      id: 1, title: 'Running a Software Project With an AI Agent: PRD to Prod',
      slug: 'running-a-software-project-with-an-ai-agent',
      excerpt: "The sprint pattern I use to hand real software work off to an LLM — phase 0 discovery, planning docs, phase reports, and the AGENTS.md file that makes delegation actually work.",
      tags: [{ id: 1, name: 'AI', slug: 'ai' }, { id: 2, name: 'Workflow', slug: 'workflow' }],
      author: { id: 1, name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents.' },
      publishedAt: '2026-07-07', readMinutes: 8, body: articleBody1, bannerColor: bannerAI, bannerIcon: 'solar:rocket-bold',
      relatedArticles: [2, 4], status: 'published' as const, seo: null,
    },
    {
      id: 2, title: 'Stop Building RAG From Scratch',
      slug: 'stop-building-rag-from-scratch',
      excerpt: "Everyone reaches for LangChain on day one. Here's why a 200-line HNSW index, a chunker, and a single prompt usually beats the framework soup.",
      tags: [{ id: 3, name: 'RAG', slug: 'rag' }, { id: 4, name: 'Go', slug: 'go' }],
      author: { id: 1, name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents.' },
      publishedAt: '2026-06-22', readMinutes: 12, body: articleBody2, bannerColor: bannerRAG, bannerIcon: 'solar:graph-up-linear',
      relatedArticles: [1, 5], status: 'published' as const, seo: null,
    },
    {
      id: 3, title: "tRPC Is the API Layer I Didn't Know I Needed",
      slug: 'trpc-is-the-api-layer',
      excerpt: 'End-to-end types without codegen, no schema duplication, and your frontend just knows.',
      tags: [{ id: 5, name: 'TypeScript', slug: 'typescript' }, { id: 6, name: 'tRPC', slug: 'trpc' }],
      author: { id: 1, name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents.' },
      publishedAt: '2026-05-18', readMinutes: 6, body: articleBody3, bannerColor: bannerTRPC, bannerIcon: 'solar:bolt-linear',
      relatedArticles: [4, 6], status: 'published' as const, seo: null,
    },
    {
      id: 4, title: 'Designing CLI Tools People Actually Want to Use',
      slug: 'designing-cli-tools',
      excerpt: 'Good CLIs feel like magic: instant startup, helpful errors, sensible defaults, and zero config.',
      tags: [{ id: 4, name: 'Go', slug: 'go' }, { id: 7, name: 'DX', slug: 'dx' }],
      author: { id: 1, name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents.' },
      publishedAt: '2026-04-30', readMinutes: 10, body: articleBody4, bannerColor: bannerGo, bannerIcon: 'solar:server-line-duotone',
      relatedArticles: [2, 6], status: 'published' as const, seo: null,
    },
    {
      id: 5, title: 'From Postgres to Vector DB: When to Stop',
      slug: 'from-postgres-to-vector-db',
      excerpt: 'pgvector handles more than people give it credit for. Before you reach for Pinecone or Qdrant, check whether your collection even needs a dedicated vector store.',
      tags: [{ id: 8, name: 'Postgres', slug: 'postgres' }, { id: 1, name: 'AI', slug: 'ai' }],
      author: { id: 1, name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents.' },
      publishedAt: '2026-03-14', readMinutes: 7, body: articleBody5, bannerColor: bannerPG, bannerIcon: 'solar:cpu-line-duotone',
      relatedArticles: [2, 1], status: 'published' as const, seo: null,
    },
    {
      id: 6, title: 'A Pragmatic Test Pyramid for Side Projects',
      slug: 'pragmatic-test-pyramid',
      excerpt: "You don't need 90% coverage on a weekend project. But you do need a handful of tests that catch the scary stuff.",
      tags: [{ id: 9, name: 'Testing', slug: 'testing' }, { id: 7, name: 'DX', slug: 'dx' }],
      author: { id: 1, name: 'Atha Tharizky', initials: 'AT', role: 'Full-Stack Engineer · Backend · AI tooling', bio: 'I write about backend systems, developer experience, and running software projects with AI agents.' },
      publishedAt: '2026-02-09', readMinutes: 5, body: articleBody6, bannerColor: bannerTest, bannerIcon: 'solar:album-line-duotone',
      relatedArticles: [4, 3], status: 'published' as const, seo: null,
    },
  ],
  totalDocs: 6, limit: 10, totalPages: 1, page: 1, hasPrevPage: false, hasNextPage: false,
};
