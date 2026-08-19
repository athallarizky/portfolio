# Phase 2 Report — Project: ai-guided-learning playbook

> Completed: 2026-08-19

## 1. How to run (reproduce)

```bash
cd backend && npm run wrap:projects -- ../tools/repo-to-project/content/ai-guided-learning/project.json \
  -- --out ../tools/repo-to-project/collection/2026-08-19-00-00-ai-guided-learning.zip
npm run import -- ../tools/repo-to-project/collection/2026-08-19-00-00-ai-guided-learning.zip -- --dry-run
# (the sprint-22 combined zip in phase-3 supersedes this single-project zip)
```

## 2. What was produced

| Artifact | Content |
|---|---|
| `tools/repo-to-project/content/ai-guided-learning/project.json` | v2 row (uuid `9ea93585-…`) |
| `tools/repo-to-project/content/ai-guided-learning/project.md` | human-readable sheet |
| `…/collection/2026-08-19-00-00-ai-guided-learning.zip` | importable single-project zip |

## 3. Row details

- title: *AI-Guided Learning Playbook* · slug `ai-guided-learning` · year **2026** (repo first commit 2026-08-10)
- descriptor: `Personal` (no LICENSE ⇒ not OSS-marked)
- techTags: `ai-agents` (new — rides in the combined zip) + `productivity` (existing)
- links: Source → `https://github.com/athallarizky/agent-playbooks`
- body: 3-paragraph overview (what it is → the 4 steps → the hard rule) + back-link to the article
- architecture: ASCII tree of `agent-playbooks/` with the playbook highlighted
- cosmetic fields omitted (banner, features, screenshots, seo, order, showOnHome) — owner polishes in admin

## 4. Key decisions

| Decision | Reason |
|---|---|
| Slug = `ai-guided-learning`, not repo basename `agent-playbooks` | owner scoped the entry to the **playbook**, the shippable unit; matches the article cross-link |
| Entry framed as "the playbook within the collection" | repo README/SKILL.md give context; siblings listed in the architecture tree |
| techTags kept honest (no js/ts) | it's pure Markdown — `ai-agents` + `productivity` describe it; unmatched canonical slugs avoided |

## 5. Deviation from SKILLS.md

Slug derived from the playbook directory rather than the repo basename (step 0 default). Deliberate — documented here and in plan.md.
