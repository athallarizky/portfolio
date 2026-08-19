# Phase 1 Report — Content into git (source of truth)

> Completed: 2026-08-19

## 1. What changed

**`.gitignore`** — content rows are now tracked; drafts and zips stay ignored:

```
tools/repo-to-project/collection/          # zips = build artifacts
tools/article-polish/collection/
tools/collection/                          # wrap:publish output
tools/article-polish/content/**            # except:
!tools/article-polish/content/*/article.json   # ← tracked (import source)
!tools/article-polish/content/*/article.md      # ← tracked (review artifact)
```

`tools/repo-to-project/content/` fully un-ignored (`project.json` + `project.md` per entry).

## 2. New: refs manifest

`npm run refs:export` (`backend/src/data-sync/cli/refs-export.ts`) → `tools/content/refs/{tags,technologies}.json`
— canonical relation rows from the DB (uuid/name/slug/icon verbatim). Re-run after adding refs in admin.
Current state: **4 tags, 6 technologies**.

## 3. Now tracked in git

| Entry | Note |
|---|---|
| `article-polish/content/how-to-learn-new-things-in-ai-era/` | sprint-22 article (formatted + polished) |
| `repo-to-project/content/{ai-guided-learning,daily-work-log,orgs-repo-cloner,slack-rag,starred-collector}/` | 5 project entries — audited: all uuids/slugs unique (an earlier suspicion of a slack-rag/orgs-repo-cloner collision was a misread; the zip and file match) |

## 4. Cleanup during discovery

- Deleted `article-polish/content/dummy-test-article/` (sprint-21 test junk; its row had no slug — would have crashed `wrap:publish` and, worse, could have shipped to prod as a "dummy" article).
- Local junk article `test123` (sprint-21 residue) left in the DB **on purpose** — it became the deletion-path test victim in phase 2 (now gone via scoped replace).

## 5. Key decision

Publish rows **must carry a uuid** (stable identity) — `wrap:publish` refuses rows without one instead of minting fresh uuids per build, which would duplicate records on every publish.
