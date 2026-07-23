# AI Workflow Template

> How to run a software project with an AI agent — from PRD to production.
> Use this as a starting point for any project.

---

## 1. The Workflow (Phases)

```
PRD / Idea
    │
    ▼
Phase 0 — Discovery & Exploration
    ├── Read existing docs, explore codebase
    ├── Ask clarifying questions (what's missing, what's ambiguous)
    ├── Check what exists vs what needs building
    └── Run any existing tools to study actual output/behavior
    │
    ▼
Sprint Planning (docs/sprint-N/)
    ├── plan.md           — Sprint goal, scope, decisions, phasing
    ├── tasks.md          — Task breakdown + difficulty + dependencies + status
    ├── final-report.md   — Final sprint summary + handoff
    ├── AGENTS.md         — Delegation guide (for handing off to another LLM)
    └── resources/
        ├── architecture.md   — Tech stack decisions with pros/cons
        ├── data-design.md    — Data models, schemas, API contracts
        ├── ux-flow.md        — Screen designs, user journey (if UI)
        └── api-contract.md   — REST/API endpoints, request/response shapes
    │
    ▼
Phase 1 → Phase 2 → ... → Phase N
    Each phase:
    ├── 1. Build the code
    ├── 2. Test it (run it, verify output)
    ├── 3. Write a phase report (reports/phase-N-report.md)
    ├── 4. Update tasks.md (mark completed + add findings)
    ├── 5. Ask for commit confirmation
    └── 6. Commit + push
    │
    ├── (when a gnarly bug burns >2 debug cycles) → write an RCA
    │   docs/sprint-N/rca/YYYY-MM-DD-<slug>.md
    │
    ▼
Retro / Ideas
    └── docs/ideas/future-enhancements.md — backlog for post-MVP
```

---

## 2. Phase 0 — Discovery & Exploration

**Goal:** Understand the problem, the existing codebase, and what needs building.

### What to Do

1. **Read the PRD** — understand the goal, components, dependencies
2. **Explore existing code** — check what's already built, what's missing
3. **Run existing tools** — clone repos, build binaries, test with real data
4. **Ask clarifying questions** — identify gaps, ambiguities, and decisions to make
5. **Study real output** — run scrapers/APIs to understand actual data shapes

### Questions to Ask

- Are there existing repos that need to be cloned? Where?
- What tech stack? Is it decided or needs discussion?
- What's the monorepo structure?
- What's the deployment target? Local? Cloud?
- What data does the system produce/consume?
- What's the MVP scope vs future enhancements?

### Deliverable

```
docs/sprint-N/reports/phase-0-report.md
```

Containing:
- Manual run instructions
- Test results with real data
- Data structure analysis
- Key findings (surprises, limitations)
- Decisions made

---

## 3. Sprint Planning — Document Templates

### `plan.md`

```markdown
# Sprint-N Plan — <Project Name>

> Status: 🟡 Planning | Created: YYYY-MM-DD
> Companion: [`tasks.md`](./tasks.md) · previous: [`../sprint-<N-1>/final-report.md`](../sprint-<N-1>/final-report.md) · root [`../../AGENTS.md`](../../AGENTS.md)

---

## Context

<What already exists, what the previous sprint delivered, what this sprint builds on.>

## 1. Sprint goal

<One sentence describing what this sprint delivers.>

## 2. Scope

**In scope:**
- ...

**Out of scope:**
- ...

## 3. Key decisions

| Decision | Rationale |
|----------|-----------|

## 4. Phasing

- **Phase 0 — Discovery:** ...
- **Phase 1 — ...:** ...
```

### `tasks.md`

```markdown
# Task Breakdown — <Project Name>

> Status: 🟡 Planning | Created: YYYY-MM-DD
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 1 — <Phase Name>

| ID   | Task                           | Difficulty | Dependencies | Status |
|------|--------------------------------|------------|-------------|--------|
| 1.1  | <Task description>             | Easy       | —           | ⬜     |
| 1.2  | <Task description>             | Medium     | 1.1         | ⬜     |
| 1.3  | <Task description>             | Hard       | 0.2, 1.2    | ⬜     |

### Service Summary

- **Runtime:** <Python/Node/Go>
- **Files:** `src/a.py`, `src/b.py`
- **Key output:** <what was produced>

> 📄 Full report: [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Dependency Graph

```
Phase 0  ─────────────────────────────────────┐
  0.1 ──► 0.3 ──► 0.5                         │
  0.2 ──► 0.4                                 │
                                               │
Phase 1 ───────────────────────────────────────┤
  0.2 ──► 1.1 ──► 1.2 ──► 1.5                │
```

## Summary

| Phase        | Tasks | Est. Hours | Status |
|-------------|-------|-----------|--------|
| 0 — Setup   | 6     | 1h        | ⬜     |
| 1 — Core    | 5     | 4h        | ⬜     |
| **Total**   | **11** | **5h**    |        |
```

**Rules:**
- Every task has an ID, difficulty (Easy/Medium/Hard), dependencies, and status
- Status emoji: ⬜ 🔵 ✅ ❌
- Only one `in_progress` at a time
- Mark completed when tested AND working
- Add a dependency graph showing the order
- After each phase completes, add a "Service Summary" with key facts

---

### `architecture.md`

```markdown
# Architecture — <Project Name>

## 1. Project Structure

```
project/
├── services/
│   ├── service-a/       # <Language> — <purpose>
│   └── service-b/       # <Language> — <purpose>
├── api/                 # Entry point
├── data/                # Shared data (gitignored)
└── docs/
```

## 2. Tech Stack Decisions

### Decision Matrix

| Service    | Language | Key Libraries     | Why                           |
|-----------|----------|-------------------|-------------------------------|
| service-a | Node.js  | Fastify, Fuse.js  | <reason>                      |
| service-b | Python   | pandas            | <reason>                      |

### Why NOT Alternatives

| Rejected       | Reason                                |
|---------------|---------------------------------------|
| Python for X  | Would need to port existing library   |

## 3. Service Boundaries

### Service-A
- **Input:** <what it receives>
- **Output:** <what it produces>
- **Does NOT:** <responsibilities it avoids>

## 4. Key Architectural Decisions

### Decision 1: <Title>
**Decision:** <What we chose>
**Reasoning:**
- <Point 1>
- <Point 2>
```

**Rules:**
- Always explain WHY, not just WHAT
- Include rejected alternatives with reasons
- Document service boundaries (what each service does NOT do)
- Keep it concise — this is for agents to understand context, not a novel

---

### `data-design.md`

```markdown
# Data Design — <Project Name>

## 1. Input Data Format

### Source: <API / scraper / CSV>
<description>

| Field      | Type   | Notes                |
|-----------|--------|----------------------|
| field_a   | string |                      |
| field_b   | int    |                      |

## 2. Data Pipeline

```
Raw Data → [Stage 1] → [Stage 2] → Output
```

### Stage 1 — <Name>
- **Input:** <what>
- **Processing:** <how>
- **Output:** <what>

## 3. Output Schema

```json
{
  "field": "value"
}
```

## 4. Storage Schema

### <Database / File> Schema

| Field      | Type   | Indexed | Notes    |
|-----------|--------|---------|----------|
| id         | str    | primary |          |
| embedding  | vector | HNSW    | 1024-dim |
```

**Rules:**
- Show the data at each pipeline stage
- Include actual schema definitions (not just descriptions)
- Note any quirks (duplicate keys, mixed casing, null handling)
- Document what gets embedded vs what goes to metadata

---

### `ux-flow.md` (UI Projects Only)

```markdown
# UX Flow — <Project Name>

## 1. Navigation

```
Home (/) → Search (/search) → Settings (/settings)
```

## 2. Screen 1 — <Screen Name>

```
<ASCII wireframe showing layout>
```

**Behavior:**
- <What happens when user clicks X>
- <What API calls are made>
- <Error/empty states>

## 3. Interaction Flow

```
1. User lands on Home
2. User types query → navigates to Search
3. Results populate → user filters
4. User clicks item → detail expands
```
```

**Rules:**
- ASCII wireframes are good enough — no Figma needed for agent understanding
- Describe behavior, not just layout
- Include all states: loading, empty, error, success
- Show the happy path AND edge cases

---

### `final-report.md`

```markdown
# Sprint N — Final Report

> Status: ✅ Delivered | YYYY-MM-DD
> Audience: sprint-(N+1) context. Read this + [`AGENTS.md`](../../AGENTS.md) before starting sprint-(N+1).

---

## 1. Sprint goal & outcome

<What we set out to build and what was delivered.>

## 2. Final structure

```
<directory tree of what was built>
```

## 3. <Key deliverables — endpoints, routes, components, etc.>

| Item | Count | Notes |
|------|-------|-------|

## 4. Key decisions

| Decision | Rationale |
|----------|-----------|

## 5. Phase summary

| Phase | Tasks | Status |
|-------|-------|--------|

> 📄 Full reports: [`reports/`](./reports/)

## 6. Verification

- <check>
- <check>

## 7. How to run

```bash
<commands>
```

## 8. Sprint-(N+1) handoff

<What the next sprint needs to know — integration points, unresolved items, data dependencies.>
```

### `AGENTS.md` (For Delegating to Another LLM)

This is the most critical document. It's a self-contained implementation guide.

```markdown
# AGENTS.md — <Sprint Name> Implementation Guide

> **For:** Any LLM agent implementing <project>.
> **Context:** <what was already built, what exists, what NOT to rebuild>

---

## 0. What Already Exists (Do NOT Rebuild)

```
<directory tree of existing code>
```

**Endpoints ready to use:**
- `POST /search` — <what it does>
- `GET /health` — <what it returns>

## 1. Tech Stack (EXACT — Do Not Change)

| Layer      | Technology          |
|-----------|---------------------|
| Frontend  | Astro + React       |
| Styling   | Tailwind CSS        |

## 2. File Structure to Create

```
<directory tree of files the agent must create>
```

## 3. Implementation Order

<numbered list of steps, each with brief code snippet if critical>

## 4. <Component Name>

Code snippet showing the exact pattern:

```typescript
function ComponentName({ props }: Props) {
  // implementation hint
}
```

## 5. API Contracts

```typescript
interface RequestType { ... }
interface ResponseType { ... }
```

## 6. Reference Files (Code You Can Copy From)

| Source        | What to Copy       |
|--------------|--------------------|
| path/to/file | pattern to reuse   |

## 7. Deviations from Reference (What to Do Differently)

| Reference    | This Project       | Why               |
|-------------|--------------------|-------------------|

## 8. Implementation Checklist

1. [ ] Task 1
2. [ ] Task 2

## 9. How to Run

```bash
cd service && npm run dev
```

## 10. Done Criteria

- [ ] <Checklist of what "done" looks like>
```

**Rules for AGENTS.md:**
- Include EXACT code snippets for critical logic
- List reference files the agent can copy-paste from
- Include a numbered checklist — agents follow checklists better than prose
- Mention what NOT to do (deviations from reference)
- Include "Done Criteria" so the agent can self-validate

---

### `reports/phase-N-report.md` (Per-Phase Report)

```markdown
# Phase N Report — <Phase Name>

> Completed: YYYY-MM-DD

---

## 1. How to Run

```bash
<exact commands to run this phase>
```

## 2. Service Architecture

```
<diagram showing component layout>
```

## 3. Test Results

| Metric | Value |
|--------|-------|
| ...    | ...   |

## 4. Key Decisions

| Decision | Reason |
|----------|--------|

## 5. Reference Files

| File | Purpose |
|------|---------|
| ...  | ...     |
```

### `rca/YYYY-MM-DD-<slug>.md` (Root Cause Analysis)

Write one **whenever a non-trivial bug burns more than ~2 debug cycles** (or
anything in prod breaks) — not for trivial fixes, but for the gnarly ones where
"what we thought was the cause wasn't." File under the **current sprint** at
`docs/sprint-N/rca/YYYY-MM-DD-<short-slug>.md`.

````markdown
# RCA — <one-line description>

> **Date:** YYYY-MM-DD · **Severity:** Low/Med/High · **Component:** <where>
> **Status:** ✅ Resolved

## 1. Summary
<2-3 sentences: what happened + the ACTUAL root cause, up top. No burying the lede.>

## 2. Impact
<who/what affected, data or prod impact, duration>

## 3. Symptoms (observed)
| Signal | Value |
|---|---|

## 4. Timeline
| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | <what we tried> | <result> | real fix / red herring / the cause |

## 5. Root cause
<The actual cause + evidence (file/line, sizes, logs). Be concrete.>

## 6. The fix
```diff
- <before>
+ <after>
```

## 7. Verification
| Metric | Before | After |
|---|---|---|

## 8. Why it was hard to find (contributing factors)
<misleading signals, red herrings, what masked the real cause>

## 9. Lessons & action items
- [ ] <preventive change / process tweak>

## 10. References
<doc URLs, issue links, file paths>
````

**Rules for RCA:**
- **Lead with the root cause** in the Summary — don't make the reader wait.
- **Tag every Timeline row** (*real fix* / *red herring* / *the cause*) — the red herrings are the most valuable part for future-you.
- **Capture the symptom signature** (e.g., "X loads 200 but doesn't apply") so the same class of bug is recognizable next time.
- Write it **the same day**, while the debug trail is fresh.
- File under `docs/sprint-N/rca/YYYY-MM-DD-<slug>.md`

> **Note:** `architecture.md`, `data-design.md`, `ux-flow.md`, and `api-contract.md`
> live inside `docs/sprint-N/resources/`. Only `plan.md`, `tasks.md`,
> `final-report.md`, and `AGENTS.md` sit at the sprint root.

---

## 4. Communication Patterns

### Do

- **Ask before committing** — "Confirm and I'll commit"
- **Ask before design decisions** — "Here's my recommendation, thoughts?"
- **Break down tasks before building** — "Let me split this into smaller tasks"
- **Test immediately after building** — run the code, show the output
- **Update docs after every phase** — report + tasks.md update
- **Document findings, not just results** — what surprised you, what failed
- **Write an RCA for gnarly bugs** — if a bug burns >~2 debug cycles (or breaks prod), file `docs/sprint-N/rca/YYYY-MM-DD-<slug>.md`; lead with the root cause and tag red herrings

### Don't

- Never commit without confirmation
- Never assume a library is available — check first
- Never skip the "study real output" step in Phase 0
- Never leave broken tasks marked as ✅
- Never skip writing the phase report
- **Never keep blind-guessing on a stuck bug** — after ~2 failed attempts, stop and read the actual docs/issues/canonical source, then write an RCA

---

## 5. Difficulty Levels

| Level  | Meaning                                          | Example                                    |
|--------|--------------------------------------------------|--------------------------------------------|
| Easy   | ≤30 min, no unknowns, mostly wiring             | "Add endpoint", "Create file structure"    |
| Medium | 1-2h, some design decisions, integration work   | "Build wrapper", "Normalize data"          |
| Hard   | 3h+, complex logic, multiple edge cases         | "Facility extraction", "SSE streaming"     |

---

## 6. Startup Checklist (New Project)

When starting a new project with this workflow:

1. [ ] Create the monorepo structure
2. [ ] Write the PRD or confirm existing one
3. [ ] Run Phase 0 — clone deps, test tools, study real output
4. [ ] Create `docs/sprint-1/` with all planning docs
5. [ ] Break tasks into phases with difficulty + dependencies
6. [ ] Start Phase 1 — build → test → report → commit
7. [ ] After each phase, update `tasks.md` and write `reports/phase-N-report.md`
8. [ ] When delegating, create `AGENTS.md` with checklist + code snippets
9. [ ] After sprint, write `docs/ideas/future-enhancements.md` for backlog

---

## 7. Complete Directory Structure

```
project/
├── docs/
│   ├── prd.md                           # Original requirements
│   ├── ideas/
│   │   └── future-enhancements.md       # Backlog for later
│   └── sprint-<N>/
│       ├── plan.md                     # Sprint goal, scope, decisions, phasing
│       ├── tasks.md                     # Task breakdown + status
│       ├── final-report.md              # Final sprint summary + handoff
│       ├── AGENTS.md                   # Delegation guide
│       ├── reports/
│       │   ├── phase-0-report.md        # Discovery findings
│       │   ├── phase-1-report.md        # Per-phase reports
│       │   └── ...
│       ├── resources/
│       │   ├── backlog.md              # Deferred items for next sprint
│       │   ├── architecture.md          # Tech decisions + structure
│       │   ├── data-design.md          # Schemas + pipelines
│       │   ├── ux-flow.md              # Screens + interaction (UI projects)
│       │   └── api-contract.md         # REST endpoints + shapes
│       └── rca/                         # Root-cause analyses
├── services/                            # Monorepo services
├── api/                                 # API layer
├── web/                                 # Frontend (if applicable)
├── data/                                # Runtime data (gitignored)
└── .gitignore
```

---
