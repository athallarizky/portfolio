import type { Home } from '../lib/api-types';

export const home: Home = {
  hero: {
    eyebrow: "// hello, I'm",
    name: 'Atha Tharizky',
  },
  stats: [
    { value: '6', suffix: '+', label: 'Years building' },
    { value: '24', suffix: null, label: 'Projects shipped' },
    { value: '3', suffix: null, label: 'Languages · TS/Go/Py' },
    { value: '∞', suffix: null, label: 'Cups of coffee' },
  ],
  about: [
    {
      paragraph: "I'm a full-stack engineer who leans backend — the kind of person who reaches for Go before React, but can ship a polished UI when the job calls for it. Most of my time goes into AI tooling, CLI design, and internal developer platforms that make teams faster.",
    },
    {
      paragraph: "I care about how code gets into production, not just that it works. Solid testing, readable architecture, and tools that feel fast. My side projects are usually over-engineered experiments — I'm okay with that.",
    },
  ],
  currently: [
    {
      icon: 'solar:book-2-linear',
      text: 'Deepening my Go skills — concurrency patterns, zero-allocation hot paths, and building CLIs with Cobra',
    },
    {
      icon: 'solar:planet-3-linear',
      text: 'Exploring RAG and tool-using agents — how to pipe in documents, compose prompts, and let an LLM orchestrate work',
    },
  ],
  skills: [
    { name: 'TypeScript' },
    { name: 'Go' },
    { name: 'Python' },
    { name: 'React / Next.js' },
    { name: 'tRPC' },
    { name: 'Prisma' },
    { name: 'PostgreSQL' },
    { name: 'Redis' },
    { name: 'Docker' },
    { name: 'Tauri' },
  ],
};
