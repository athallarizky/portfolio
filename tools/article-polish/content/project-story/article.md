# Why Single Prompts Fail at Technical Storytelling (And How Multi-Agent Pipelines Fix It)

## The Monolithic Prompt Trap

Most attempts to generate technical content with AI follow the same disappointing pattern:

You paste a GitHub link or a few files into ChatGPT or Claude and say: *"Write an engaging, insightful blog post about this project in my voice."*

What comes out is almost always unreadable:

- It starts with *"In today’s fast-paced digital world..."*
- It fills paragraphs with empty buzzwords (*game-changer, seamless, robust, cutting-edge*).
- It completely misses the subtle engineering trade-offs that actually make the project interesting (like why you chose SQLite over Postgres, or how a single cache invalidation bug consumed an entire weekend).

Why does this happen? Because writing an authentic technical story demands two completely opposing cognitive modes: **cold, analytical code comprehension** and **warm, stylistic human storytelling**.

When you force a single prompt to do both simultaneously, the model compromises on both. It skims the code superficially and falls back on average, robotic prose.

## The Multi-Agent Division of Labor

To solve this, I built `project-story`: an automated storytelling pipeline built on a multi-agent graph in TypeScript.

Instead of asking one generalist model to do everything, `project-story` divides the work among four specialized agents under a central supervisor:

```
                  ┌────────────────┐
                  │   Supervisor   │
                  └──┬───────────┬─┘
                     │           │
          ┌──────────▼──┐     ┌──▼────────────┐
          │ Researcher  │     │ Style Analyzer│
          └──────────┬──┘     └──┬────────────┘
                     │           │
                     └─────┬─────┘
                           ▼
                    ┌──────────────┐
                    │    Writer    │
                    └──────────────┘
```

1. **The Researcher:**
   This agent has one job: understand the codebase factually. It clones the repo, inspects dependency manifests (`package.json`, `go.mod`), walks the directory tree, and reads key architecture files. It does not write any prose. It outputs a structured, factual technical dossier: problem statement, architecture flow, core dependencies, and tricky edge cases.
2. **The Style Analyzer:**
   This agent never looks at the code. Instead, it reads the author’s writing guidelines (`SKILL.md`) and a sample of previous high-performing articles. It extracts voice rules: sentence length variance, preferred analogies, taboo buzzwords, and technical depth boundaries.
3. **The Writer:**
   The writer receives the factual dossier from the Researcher and the voice constraints from the Style Analyzer. It doesn't have to guess how the code works (the facts are already verified), and it doesn't have to guess what tone to take (the voice rules are explicit). Its entire focus is crafting an engaging narrative.
4. **The Supervisor:**
   Coordinates state transitions across the graph, ensuring every agent finishes its deliverable before handing off to the next stage.

## Why Separation of Concerns Wins in AI

Splitting the workflow into dedicated agent roles yields several major advantages over monolithic prompting:

- **Zero Hallucination of Technical Facts:** Because the Researcher compiles facts first into a structured state object, the Writer cannot invent non-existent APIs or libraries. Every technical claim is grounded in the codebase inspection.
- **True Voice Consistency:** By decoupling style extraction from code comprehension, you can swap styles instantly. The exact same research dossier can be rendered as a punchy senior-engineer blog post, a concise Twitter/X technical thread, or an internal architecture RFC.
- **Debuggability:** If the resulting article is too superficial, you know the Researcher didn't extract enough context. If the tone feels stiff, you know the Style Analyzer missed the voice guidelines. You can inspect and tweak intermediate artifacts without blowing up the whole workflow.

## Lessons Learned

Building `project-story` taught me a fundamental lesson about autonomous agents: **specialization beats generalization every single time**.

In human engineering teams, we don't ask the same person to simultaneously be the deep systems architect, the brand voice copywriter, and the project manager in a single breath. We assign clear roles with well-defined inputs and outputs.

When working with LLMs, the same rule applies. Don't write 5-page prompts that ask one model to wear ten hats. Build a graph of focused, modular agents that do one thing exceptionally well — and let them collaborate.
