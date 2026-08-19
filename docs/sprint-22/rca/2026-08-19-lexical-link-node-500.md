# RCA — Article detail page 500s on any Lexical body containing a link

> **Date:** 2026-08-19 · **Severity:** High (prod-facing crash, latent) · **Component:** `frontend/src/lib/render-lexical.ts`
> **Status:** ✅ Resolved

## 1. Summary
The first article containing a Markdown link (`[AI-Guided Learning Playbook](/projects/ai-guided-learning)`) crashed
both detail pages (`/blogs/[slug]`, `/projects/[slug]`) with a 500. **Actual root cause:** `renderNode()` mapped
paragraph/heading children directly through `renderText()`, assuming every child is a text node — a `link` node has
no `.text`, so `escapeHtml(undefined)` threw `Cannot read properties of undefined (reading 'replace')`.

## 2. Impact
- Any article/project body containing a link (inline non-text node) → detail page 500 in **both** light/dark, any device.
- Latent since sprint-3/6 (renderer born): blogs had zero articles with links until sprint-22, so it never fired.
- Discovered during local verification — **never reached prod** (article not yet applied).

## 3. Symptoms (observed)

| Signal | Value |
|---|---|
| `/blogs`, `/projects` (list) | 200 — lists don't render bodies |
| `/blogs/how-to-learn-new-things-in-ai-era` | 500 |
| `/projects/ai-guided-learning` | 500 |
| Dev log | `TypeError: Cannot read properties of undefined (reading 'replace')` at `renderText` ← `renderNode:31` |

## 4. Timeline

| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | curl status codes for list vs detail pages | lists 200, details 500 → body rendering suspect | narrowed |
| 2 | read `astro dev logs` stack trace | `renderText` receives non-text child | **the cause** |
| 3 | inspect imported Lexical JSON in DB | valid `link` node (`fields.url`, text children) — data fine, renderer wrong | confirmed |

## 5. Root cause
`render-lexical.ts` `case 'paragraph'` / `case 'heading'`: `node.children.map(renderText)`. Lexical paragraphs can hold
inline element nodes (`link`, `upload`, …). The type layer (`api-types.ts`) encoded the same wrong assumption —
`paragraph.children: LexicalText[]` — so TypeScript *confirmed* the bug instead of catching it. There was no
`case 'link'` at all; unknown node types fell to `default: return ''` silently.

## 6. The fix
```diff
 function renderNode(node: LexicalNode): string {
   switch (node.type) {
+    case 'text':
+      return renderText(node);
     case 'paragraph':
-      return `<p>${node.children.map(renderText).join('')}</p>`;
+      return `<p>${node.children.map(renderNode).join('')}</p>`;
     case 'heading': {
       const tag = node.tag;
-      return `<${tag}>${node.children.map(renderText).join('')}</${tag}>`;
+      return `<${tag}>${node.children.map(renderNode).join('')}</${tag}>`;
     }
+    case 'link': {
+      const url = node.fields?.url ?? '';
+      const newTab = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
+      return `<a href="${escapeHtml(url)}"${newTab}>${node.children.map(renderNode).join('')}</a>`;
+    }
```
Plus `api-types.ts`: `paragraph`/`heading` children widened to `LexicalNode[]`, `link` node type and `LexicalText`
added to the union.

## 7. Verification

| Check | Before | After |
|---|---|---|
| `/blogs/[slug]` status | 500 | **200** |
| `/projects/[slug]` status | 500 | **200** |
| Cross-link rendered | — | `<a href="/projects/ai-guided-learning">` present in HTML |
| `tsc --noEmit` | pass (bug typed as legal) | pass |
| `npm run build` / backend `npm test` | — | clean / 68 pass |

## 8. Why it was hard to find (contributing factors)
- The **types encoded the bug** (`children: LexicalText[]`) — no compile-time signal, `tsc` green throughout.
- Every prior article came from the **seed** (no links) → "works on all existing content" masked it.
- List pages render fine → the crash only appears on detail routes with linked bodies.

## 9. Lessons & action items
- [x] Renderer now recurses (`renderNode`) for inline content; unknown types still degrade silently — acceptable for now.
- [ ] Consider a fallback `console.warn` on unknown node types instead of silent `''` (backlog).
- [ ] SKILLS.md for article-polish should mention links are safe post-fix (backlog, with the Markdown-body note).

## 10. References
- `frontend/src/lib/render-lexical.ts:28-45` (post-fix)
- `frontend/src/lib/api-types.ts:176-184`
- `docs/sprint-22/final-report.md` §renderer fix
