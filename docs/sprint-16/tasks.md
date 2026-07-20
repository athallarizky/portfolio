# Task Breakdown — Repo → Portfolio Project

> Status: 🟡 Planning | Created: 2026-07-20
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery & Design Lock

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 0.1 | Pin the technology name→slug map (24 entries) from the DB; confirm derivation rule | Easy | — | ⬜ |
| 0.2 | Confirm the import priming approach (resolver from DB for absent relation targets) | Easy | — | ⬜ |
| 0.3 | Write `resources/design.md` (v2 row shape, skill flow, wrap CLI contract, priming spec) | Medium | 0.1, 0.2 | ⬜ |

> 📄 Full report: [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Import: partial-archive resolver priming

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 1.1 | Extract `primeResolver(payload, resolver, present)` — populate resolver from DB for `RELATION_TARGETS` not in `present` | Medium | 0.2 | ✅ |
| 1.2 | Call it in `importFromArchive` after computing `present` (before the upsert loop) | Easy | 1.1 | ✅ |
| 1.3 | Unit test: a projects-only archive resolves `techTags` against primed technologies (fake payload); full-archive path unaffected | Medium | 1.1 | ✅ |

---

## Phase 2 — Wrap helper CLI

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 2.1 | `cli/wrap-projects.ts`: read a JSON file (single row or array) → assign uuid if missing → write zip (manifest v2 + `collections/projects.json`); supports `--out <path>` | Medium | 0.3 | ✅ |
| 2.2 | `npm run wrap:projects -- <file.json> [-- --out <path>]` script | Easy | 2.1 | ✅ |
| 2.3 | `.gitignore`: `tools/repo-to-project/content/`, `tools/repo-to-project/collection/`, `backend/portfolio-projects-*.zip` | Easy | — | ✅ |

---

## Phase 3 — Tool folder + Claude skill

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 3.1 | `tools/repo-to-project/SKILLS.md` — canonical procedure (manually referenced): read repo (README, manifests, git, file tree) → emit v2 row + human `.md` sheet | Hard | 0.3, 2.2 | ✅ |
| 3.2 | Embed the technology name→slug map (24) + unmatched-tech reporting in SKILLS.md | Medium | 0.1, 3.1 | ✅ |
| 3.3 | SKILLS.md flow: write `content/<slug>/{project.json,project.md}` → `wrap:projects --out collection/<YYYY-MM-DD-HH-MM>-<slug>.zip` → `import -- --dry-run` | Medium | 3.1, 2.2 | ✅ |
| 3.4 | `tools/repo-to-project/README.md` — what it is + how to invoke (manual reference + repo path) | Easy | 3.1 | ✅ |
| 3.5 | Idempotency: resolve existing uuid (content/ or DB); omit cosmetic fields so update preserves them; collision-safe `collection/` filename | Medium | 3.1 | ✅ |

---

## Phase 4 — Verify + Docs

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|-----------|--------------|--------|
| 4.1 | `tsc --noEmit` clean; `npm test` green; `npm run build` | Easy | 1–3 | ✅ |
| 4.2 | E2E on a real local repo → generated row → wrap → dry-run import → project + `techTags` resolve; then real import on a DB copy | Medium | 3, 1 | ✅ |
| 4.3 | Update `AGENTS.md` (§5 skill + wrap command); write `final-report.md` + phase reports | Medium | 4.1, 4.2 | ✅ |

---

## Dependency Graph

```
Phase 0 ─────────────────────────────┐
  0.1 ─► 3.2                          │
  0.2 ─► 1.1 ─► 1.2 ─► 1.3            │
  0.3 ─► 2.1 ─► 2.2 ─► 3.3            │
  0.3,2.2 ─► 3.1 ─► 3.4               │
                 └► 3.5               │
Phase 4 (verify + docs) ──────────────┘
  4.1 ─► 4.2 ─► 4.3
```

## Summary

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 0 — Discovery & design | 3 | 1.5h | ✅ |
| 1 — Import priming | 3 | 2h | ✅ |
| 2 — Wrap helper CLI | 3 | 1.5h | ✅ |
| 3 — Tool folder + Claude skill | 5 | 3.5h | ✅ |
| 4 — Verify + docs | 3 | 2h | ✅ |
| **Total** | **17** | **~10.5h** | ✅ |
