# Phase 4 Report — Navigation & Home CTA

> Completed: 2026-07-09

---

## 1. How to Run

```bash
cd frontend && npm run dev      # http://localhost:4321
```

---

## 2. Changes

### 2.1 `backend/src/seed.ts` — Nav seed fixed (source)

The Nav global seed (`:399-415`) had two problems caught in Phase 0:
1. **Stale hrefs** — `projects.html`, `blogs.html`, etc. (and even path-less `projects`, `blogs` in the live DB) that don't match Astro's clean routes.
2. **No Contact entry.**
3. **Name clash** — a `mailto:` connectLink labeled "Contact" would collide with the new nav item.

Fixed to:
```js
menuItems: [
  { label: 'Home', href: '/', icon: 'solar:user-id-outline', order: 1 },
  { label: 'Projects', href: '/projects', icon: 'solar:widget-5-bold-duotone', order: 2 },
  { label: 'Blogs', href: '/blogs', icon: 'solar:document-text-outline', order: 3 },
  { label: 'Documents', href: '/documents', icon: 'solar:folder-bold-duotone', order: 4 },
  { label: 'Socials', href: '/social', icon: 'solar:users-group-rounded-bold-duotone', order: 5 },
  { label: 'Contact', href: '/contact', icon: 'solar:letter-outline', order: 6 },
],
connectLinks: [
  { label: 'GitHub', ... },
  { label: 'LinkedIn', ... },
  { label: 'Email', href: 'mailto:hello@example.com', icon: 'solar:letter-outline', order: 3 },
],
```

> **⚠️ Live global update — pending.** `npm run seed` crashes with a SQLite index-lock error (`payload_locked_documents_rels_order_idx already exists`) when the dev server is running, and Nav writes require admin auth. Per owner's choice, the **live Nav global is updated manually via the admin UI** (Globals → Nav). The `seed.ts` source is correct so future clean re-seeds will apply it. Until the admin edit is done, the sidebar won't show Contact and active-nav highlight stays broken on existing pages.

### 2.2 `frontend/src/pages/index.astro` — Home CTA + bugfix

- Added a **Contact CTA card** ("Let's talk" → `/contact`) before the home footer, styled with `.contact-cta`.
- **Fixed a latent merge artifact** (lines 126-129): stray `ame}`, a dangling `</div>`, and a duplicate `</BaseLayout>` after the real closing tag. Astro tolerated it but it was a latent bug. Removed.

### 2.3 `frontend/src/styles/styles.css` — `.contact-cta` styles

Centered card variant: 2rem padding, centered icon/title/subtitle, button below. Title 800 weight / 20px.

---

## 3. Test Results

| Check | Result |
|-------|--------|
| Home page renders | ✅ 200 |
| CTA card in HTML (`contact-cta` class + "Let's talk") | ✅ |
| Stray `ame}` markup removed | ✅ 0 occurrences |
| CSS brace balance | ✅ 310/310 |
| `seed.ts` source correct (clean paths + Contact) | ✅ |
| Live Nav global shows Contact + clean hrefs | ⏳ **pending owner's admin-UI edit** |

---

## 4. Key Decisions

| Decision | Reason |
|----------|--------|
| Fix `.html`/path-less hrefs → clean paths with leading `/` | `Sidebar.svelte:33-37` uses `activeNav.startsWith(href)`; `"/social".startsWith("social")` is `false` because the activeNav begins with `/`. Leading-slash clean paths are required for highlight to work |
| Owner edits Nav via admin UI (not seed/REST) | Seed crashes under SQLite lock; REST Nav write needs admin auth. Manual UI edit avoids sharing credentials and avoids the DB lock |
| CTA placed between Skills/Find-me grid and home footer | Highest-attention position on the page (bottom of content, before footer), consistent with the "closing CTA" pattern |

---

## 5. Reference Files

| File | Purpose |
|------|---------|
| `backend/src/seed.ts:399-415` | Nav seed (source fixed) |
| `frontend/src/pages/index.astro` | Home CTA + merge-artifact fix |
| `frontend/src/styles/styles.css` | `.contact-cta` styles |
| `frontend/src/components/shell/Sidebar.svelte:33-37` | `isActive()` — why clean hrefs matter |
