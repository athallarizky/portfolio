# repo-to-portfolio — Generate portfolio entries & articles from local repos

> **Multi-Agent Skill** (Claude Code, Gemini CLI, Cursor, Codex, OpenCode, etc.)
> **Manually invoked.** When the user says something like:
> - *"Tolong buatkan project dari repo ini: /development/personal/my-project"*
> - *"Tolong buatkan artikel dari repo ini: /development/personal/my-project"*
> - *"follow `tools/repo-to-portfolio/SKILLS.md`, repo: /development/personal/my-project"*
>
> Run this procedure end-to-end. You are generating a portfolio `projects` entry and/or an `articles` entry with **automated EN/ID bilingual translations**.

---

## 1. Flow Determination

Check the user's intent from the prompt:
1. **Requesting a Project:** Execute **Section 3: Project Generation** (`tools/repo-to-project/`).
2. **Requesting an Article:** Execute **Section 4: Article Generation** (`tools/article-polish/`).
3. **Requesting Both (or ambiguous):** Execute Section 3 first, then Section 4. Cross-link them where relevant.

All backend CLI steps run from `backend/`. File paths are relative to repo root (`portfolio/`).

---

## 2. Indonesian Translation Rules ("Casual BI")

Both articles and projects require **bilingual support** (Sprint 24/25 contract):
- Canonical English: `*.json` (the import row) and `*.md` (review copy).
- Indonesian overlay: `*.id.json` (overlay sibling) and `*.id.md` (review copy).

### Style Guide for Bahasa Indonesia
* **Voice & Tone:** "Casual BI" (Bahasa Indonesia santai tapi berbobot teknis). Tulisan harus terdengar seperti obrolan atau tulisan blog santai dari seorang software engineer berpengalaman (relatable, engaging, to-the-point).
* **Hindari Bahasa Kaku / Terjemahan Mesin:** JANGAN gunakan bahasa birokratis seperti *"Adapun demikian"*, *"Kami telah melakukan implementasi terhadap"*, *"Berdasarkan hal tersebut dapat disimpulkan"*. Gunakan kalimat aktif dan luwes (misal: *"Masalahnya: ..."*, *"Kenapa harus begini?"*, *"Kuncinya sederhana: ..."*, *"Begitu dicoba, ternyata..."*).
* **Istilah Teknis Tetap Bahasa Inggris:** JANGAN terjemahkan istilah software engineering inti:
  * *ship, build, deploy, vibe coding, prompt, agent, tooling, workflow, stack, handler, payload, thread, caching, rate limit, dry-run, edge case, monorepo, muscle memory, deep dive, boilerplate, case study, CLI, SDK, REST API*.
* **Referensi Nada Bicara:**
  * Artikel: [`tools/article-polish/content/how-to-learn-new-things-in-ai-era/article.id.md`](tools/article-polish/content/how-to-learn-new-things-in-ai-era/article.id.md)
  * Project: [`tools/repo-to-project/content/daily-work-log/project.id.md`](tools/repo-to-project/content/daily-work-log/project.id.md)

---

## 3. Workflow A: Project Generation (`tools/repo-to-project`)

Follow the core architecture in [`tools/repo-to-project/SKILLS.md`](tools/repo-to-project/SKILLS.md):

### Step A0 — Identity & Idempotency
1. Derive `slug` from the repo directory name: lowercase, special chars to `-`, strip leading/trailing `-`.
2. Check existing `tools/repo-to-project/content/<slug>/project.json` or query backend `http://localhost:3000/api/projects?where[slug][equals]=<slug>&depth=0`.
   - If found: reuse its `uuid` (this run is an UPDATE).
   - If not found: mint fresh UUID (`node -e 'console.log(crypto.randomUUID())'`).

### Step A1 — Inspect the Repo
Read the target repository:
```bash
# Overview, thesis, and tagline
cat <repo>/README.md

# Manifests for technology detection
cat <repo>/package.json 2>/dev/null
cat <repo>/go.mod 2>/dev/null
cat <repo>/Cargo.toml 2>/dev/null
cat <repo>/pyproject.toml 2>/dev/null; cat <repo>/requirements.txt 2>/dev/null
ls <repo>/Dockerfile <repo>/docker-compose.yml 2>/dev/null

# Remote origin for source links
git -C <repo> remote get-url origin 2>/dev/null

# Year of first commit
git -C <repo> log --reverse --format=%ci 2>/dev/null | head -1

# File tree (depth-limited ASCII tree, top 2-3 levels)
git -C <repo> ls-files 2>/dev/null | head -60
```

### Step A2 — Map Technologies
Map dependencies to canonical portfolio tech slugs:
* `next-js`, `typescript`, `node-js`, `go`, `docker`, `fastapi`, `postgres`, `redis`, `tailwindcss`, `svelte`, `react`, `trpc`, `prisma`, `vite`, `express`, `tauri`, `openai`, `wasm`, `cobra`.
* Report any unmatched technologies in the final handoff.

### Step A3 — Write English Canonical Files
Under `tools/repo-to-project/content/<slug>/`:
* **`project.json`** (v2 row): Fill `uuid`, `title`, `slug`, `year`, `excerpt`, `descriptor` (e.g. `Personal · OSS`), `techTags`, `links`, `body` (Markdown), `architecture`, `status: "published"`.
  * **CRITICAL:** OMIT cosmetic fields (`bannerColor`, `bannerIcon`, `features`, `screenshots`, `seo`, `order`, `showOnHome`) so admin polish survives.
* **`project.md`**: Human-readable review copy.

### Step A4 — Write Indonesian Overlay Files
* **`project.id.json`**: JSON overlay with matching `uuid` & `slug`, plus `title`, `excerpt`, and `body` (Markdown string) translated in Casual BI.
* **`project.id.md`**: Human-readable Indonesian review copy.
* *Note:* Shared fields (`architecture`, `techTags`, `links`) remain shared and in English.

### Step A5 — Wrap and Dry-Run
```bash
cd backend && npm run wrap:projects -- ../tools/repo-to-project/content/<slug>/project.json \
  -- --out ../tools/repo-to-project/collection/$(date +%Y-%m-%d-%H-%M)-<slug>.zip

cd backend && npm run import -- ../tools/repo-to-project/collection/*-<slug>.zip -- --dry-run
```

---

## 4. Workflow B: Article Generation (`tools/article-polish`)

Follow the core architecture in [`tools/article-polish/SKILLS.md`](tools/article-polish/SKILLS.md):

### Step B0 — Identity & Idempotency
Derive `slug` from title/repo name. Reuse existing `uuid` if found in `tools/article-polish/content/<slug>/article.json`, otherwise mint a new UUID.

### Step B1 — Source Material & Technical Storytelling
* **If a raw draft (`.md`) is provided:**
  Save copy to `tools/article-polish/content/<slug>/draft/<filename>.md` and use it as source.
* **If NO draft is provided (Storytelling directly from Repo):**
  Study the repository deeply and author a high-signal, engaging engineering article reflecting the style in `tools/article-polish/samples/`:
  1. **Catchy & Clear Title:** Focus on the problem or architectural insight (e.g., `# Behind the Build: How I Built X to Solve Y`).
  2. **The Problem & Context:** Real-world pain point or limitation that prompted building this.
  3. **Architecture & Technical Decisions:** Why this stack? Interesting algorithms, data flow, or engineering trade-offs.
  4. **Key Learnings & Edge Cases:** Tricky bugs, what failed first, and practical takeaways for other engineers.
  Save this draft to `tools/article-polish/content/<slug>/draft/<slug>-draft.md`.

### Step B2 — Format Metadata & Lexical JSON
1. Metadata:
   - `author`: Default `"Athalla Rizky"` (must match `authors` collection).
   - `publishedAt`: Current ISO date (e.g. `YYYY-MM-DD`).
   - `readMinutes`: Word count ÷ 200, rounded up.
   - `tags`: Tag slugs matching existing tags in CMS (e.g. `ai`, `workflow`, `architecture`, `typescript`, `go`).
2. Convert body to PayloadCMS Lexical rich text JSON format (`root`, `heading`, `paragraph`, `text`, `list`, `listitem`, `code`, `quote`).

### Step B3 — Write English Canonical Files
Under `tools/article-polish/content/<slug>/`:
* **`article.json`** (v2 row): Fill `uuid`, `title`, `slug`, `excerpt`, `tags`, `author`, `publishedAt`, `readMinutes`, `body` (Lexical JSON), `status: "published"`.
  * **CRITICAL:** OMIT cosmetic fields (`bannerColor`, `bannerIcon`, `featuredImage`, `seo`, `relatedArticles`).
* **`article.md`**: Human-readable review copy.

### Step B4 — Write Indonesian Overlay Files
* **`article.id.json`**: JSON overlay with matching `uuid` & `slug`, plus `title`, `excerpt`, and `body` (Markdown string) translated in Casual BI.
* **`article.id.md`**: Human-readable review copy in Indonesian.
* *Note:* `tags`, `author`, and `readMinutes` remain shared.

### Step B5 — Wrap and Dry-Run
```bash
cd backend && npm run wrap:articles -- ../tools/article-polish/content/<slug>/article.json \
  -- --out ../tools/article-polish/collection/$(date +%Y-%m-%d-%H-%M)-<slug>.zip

cd backend && npm run import -- ../tools/article-polish/collection/*-<slug>.zip -- --dry-run
```

---

## 5. Handoff & Reporting

Report clearly to the user:
1. **Generated Files:** Relative paths of all generated files in `tools/`.
2. **Metadata Summary:** Title, slug, tech tags / tags detected, descriptor, and translation summary.
3. **Dry-Run Import Result:** Output status of `npm run import -- ... -- --dry-run` (e.g. `created: 1, 0 errors`).
4. **Publishing Instructions:** Remind the user:
   - To apply locally: re-run import command without `--dry-run`.
   - To publish to production: commit + push, then follow [`tools/publish-content/SKILLS.md`](tools/publish-content/SKILLS.md)
     (dispatches the Publish Article/Project workflows and verifies prod).
