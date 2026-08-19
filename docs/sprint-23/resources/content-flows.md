# Content Flows — Article & Project Pipelines

> Visual companion to the sprint-23 publish pipeline. Source of truth for behavior:
> [`../final-report.md`](../final-report.md) · root [`../../../AGENTS.md`](../../../AGENTS.md).

## Diagrams

| Flow | File | Story |
|---|---|---|
| Article | [`diagrams/article-flow.html`](diagrams/article-flow.html) | raw draft → `article-polish` (local agent) → PR/merge (git = source of truth) → **Publish Article** dispatch → runner wraps all articles + refs → HTTPS import → prod `articles` 1:1 with git |
| Project | [`diagrams/project-flow.html`](diagrams/project-flow.html) | local repo → `repo-to-project` (local agent) → PR/merge → **Publish Project** dispatch → runner wraps all projects + refs → HTTPS import → prod `projects` 1:1 with git |

Open the `.html` files in a browser — they are self-contained (inline SVG + CSS, Google Fonts link).

## Reading the lanes

Both flows share the same five actors — the lanes are the teaching point (*who runs what*):

1. **AUTHOR · LOCAL** — the human drops the input (raw draft / repo path)
2. **AI AGENT · LOCAL** — content generation happens on the laptop, never on the runner
3. **GITHUB** — PR review gate; after merge, git is the canonical source of truth (focal node)
4. **ACTIONS RUNNER** — manual dispatch only; packs git JSONs into the import zip, nothing smarter
5. **PROD · VPS** — receives one HTTPS call; the running Payload process converges its DB (upsert + drift-delete)

The purple handoff (runner → prod) is the only edge that touches production — scoped replace-all via `replaceOnly`.

## Diagram provenance

- Made with [diagram-design](https://github.com/cathrynlavery/diagram-design) v2.4 (installed at `~/development/tools/diagram-design`, symlinked into `~/.claude/skills/`)
- Brand onboarded from `frontend/src/styles/styles.css` → active profile `athallarizky-portfolio` (paper `#f6f5f4`, ink `#1f1e1c`, accent purple `#c35af7`, Inter)
- Type: swimlane · size `doc-inline` (960×600) · detail `balanced` · audience `engineer` · light variant
- Self-check: `python3 ~/development/tools/diagram-design/skills/diagram-design/scripts/self_check.py <file>` → OK

### Fidelity ledger (what was compressed)

- `refs:export` / refs-manifest refresh → annotation callout on the project diagram only
- Service-account login + dry-run checkbox → folded into the runner node sublabel + final-report §7
- Cosmetic-fields-survive contract → annotation callout on the article diagram only
- Local 1:1 sync path (same imports, run locally) → omitted; see final-report §6
