# Task Breakdown — Sprint-23 Content Publish Pipeline

> Status: ✅ Delivered locally — first prod dispatch pending owner | Created: 2026-08-19
>
> Status legend: ⬜ pending | 🔵 in_progress | ✅ completed | ❌ blocked

---

## Phase 0 — Discovery + design

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 0.1 | Read deploy workflow — confirm rsync scope (backend/frontend only, tools/ stale on VPS) | Easy | — | ✅ |
| 0.2 | Confirm data-sync endpoint auth model (`req.user` required) + `data-import` multipart contract | Easy | — | ✅ |
| 0.3 | Check backend deps available to a runner/VPS (adm-zip, archiver = prod; tsx absent) | Easy | — | ✅ |
| 0.4 | Design decisions with owner — scoped replace (A) over full 1:1 (B); runner-driven insert; no VPS execution | Easy | 0.1–0.3 | ✅ |

> 📄 [`reports/phase-0-report.md`](./reports/phase-0-report.md)

---

## Phase 1 — Content into git (source of truth)

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 1.1 | `.gitignore` refactor: track article.json + article.md + project.json/md (flat per-slug layout); keep draft/ + zips ignored | Easy | 0.4 | ✅ |
| 1.2 | `npm run refs:export` CLI → `tools/content/refs/{tags,technologies}.json` (4 tags, 6 technologies) | Medium | 0.4 | ✅ |
| 1.3 | Existing content tracked: sprint-22 article + 5 project entries (audited — all uuids/slugs unique) | Easy | 1.1 | ✅ |
| 1.4 | Owner review of what's now tracked | Easy | 1.3 | ⬜ at commit review |

### Service Summary

- Cleanup: deleted `dummy-test-article/` (no slug — would crash wrap:publish); local junk `test123` article deleted by the phase-2 scoped replace
- Publish rows REQUIRE a uuid (stable identity) — wrap:publish refuses rows without one

> 📄 [`reports/phase-1-report.md`](./reports/phase-1-report.md)

---

## Phase 2 — Engine: scoped replace + `wrap:publish` CLI

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 2.1 | `ImportOptions.replaceCollections` + `assertReplaceCollectionsPresent` + drift-pass scoping | Medium | 0.4 | ✅ |
| 2.2 | Wire flags: CLI `--replace-only <csv>` + endpoint form field `replaceOnly` | Easy | 2.1 | ✅ |
| 2.3 | `wrap:publish` CLI — `--articles` \| `--projects`: zip = ALL rows of that collection + refs manifest | Medium | 1.2 | ✅ |
| 2.4 | Tests: assertReplaceCollectionsPresent ×3 + validatePublishRows ×5 | Medium | 2.1, 2.3 | ✅ |
| 2.5 | Local verify: **76/76 tests**, deletion path proven (`test123` drift deleted; local now 1:1 with git), build clean | Easy | 2.4 | ✅ |

> 📄 [`reports/phase-2-report.md`](./reports/phase-2-report.md)

---

## Phase 3 — Workflows

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 3.1 | `scripts/publish-content.mjs` — login → multipart POST → ImportReport → exit≠0 on errors | Medium | 2.2 | ✅ |
| 3.2 | `publish.yml` (reusable) — checkout → node → npm ci → wrap:publish → publish-content.mjs | Medium | 2.3, 3.1 | ✅ |
| 3.3 | `publish-article.yml` + `publish-project.yml` — dispatch wrappers (dry-run checkbox, no slug) | Easy | 3.2 | ✅ |
| 3.4 | Docs: service account (`npm run publish:account`), secrets, usage contract | Easy | 3.2 | ✅ |

### Service Summary — E2E local (REST, exact runner path)

login ✓ → articles dry-run ✓ → articles REAL ✓ (backup + 0 errors) → projects dry-run ✓

> 📄 [`reports/phase-3-report.md`](./reports/phase-3-report.md)

---

## Phase 4 — Verify + docs

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 4.1 | Local E2E via REST (proves login/multipart/replaceOnly plumbing) | Medium | 3.3 | ✅ |
| 4.2 | YAML sanity ✓ · backend `npm test` 76/76 ✓ · backend build ✓ (frontend untouched this sprint) | Easy | 4.1 | ✅ |
| 4.3 | Phase reports + final-report + AGENTS.md sprint row + README pipeline section | Easy | 4.2 | ✅ |
| 4.4 | **Owner:** create prod service account + GitHub secrets → first dispatch (dry-run, then real — doubles as the sprint-22 content apply + slack-rag publish) | Easy | 3.4 | ✅ 2026-08-20 |

---

## Dependency Graph

```
Phase 0 (✅) ──┬──► Phase 1 (✅ git sources + refs)
               └──► Phase 2 (✅ scoped replace + wrap:publish)
                        │
                        ▼
                  Phase 3 (✅ workflows + runner script + E2E local)
                        │
                        ▼
                  Phase 4 (✅ docs) ──► 4.4 owner first dispatch ⬜
```

## Summary

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 0 — Discovery | 4 | 0.5h | ✅ |
| 1 — Content → git | 4 | 1h | ✅ |
| 2 — Engine + CLI | 5 | 2.5h | ✅ |
| 3 — Workflows | 4 | 2.5h | ✅ |
| 4 — Verify + docs | 4 | 1.5h | ✅ |
| 5 — English polish policy (addendum) | 4 | 0.5h | ✅ |
| **Total** | **25** | **~8.5h** | |

---

## Phase 5 — English polish policy (addendum, same session)

> Owner decision post-delivery: article output language becomes **English — professional but casual**.

| ID  | Task | Difficulty | Dependencies | Status |
|-----|------|------------|--------------|--------|
| 5.1 | SKILLS.md: language & tone policy (default English, professional-casual; translate non-EN drafts while polishing) | Easy | — | ✅ |
| 5.2 | Re-polish `how-to-learn-new-things-in-ai-era` in English (same uuid → update in place); 552 words, 3 min | Medium | 5.1 | ✅ |
| 5.3 | Refresh `samples/` style anchor with the English version | Easy | 5.2 | ✅ |
| 5.4 | wrap:publish → `import --replace-only articles` → `updated: {articles:1}`, 0 errors; API + page render verified | Easy | 5.2 | ✅ |

> Prod impact: none yet — the first owner dispatch will carry the English version (nothing BI ever landed on prod).
