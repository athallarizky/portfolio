# AGENTS.md — Sprint 5: Contact Form

> **For:** Any LLM agent implementing the contact form feature.  
> **FIRST:** Read [`docs/GUIDE.md`](../../GUIDE.md) and follow its rules — phased workflow, per-phase reports, update tasks.md, ask before committing.

---

## 0. What Already Exists (Do NOT Rebuild)

```
backend/
├── src/
│   ├── payload.config.ts         ← collections: [..., ContactMessages] YOU ADD ONE
│   ├── collections/              ← 9 collections (YOU ADD ContactMessages.ts)
│   ├── globals/                  ← SiteConfig, Home, Nav (READ nav for sidebar)
│   └── seed.ts                   ← seed nav data (update menuItems)

frontend/src/
├── layouts/BaseLayout.astro      ← fetches nav from API, sidebar auto-picks up new link
├── components/                   ← no form components exist (YOU CREATE ContactForm.svelte)
├── styles/styles.css             ← .btn, .card, .search input patterns exist (YOU ADD .form-*)
└── pages/
    ├── index.astro               ← home page (add CTA card in footer area)
    └── contact.astro             ← YOU CREATE THIS
```

**Design system tokens** (from `styles.css`):
- Buttons: `.btn`, `.btn-primary`, `.btn-outline` 
- Cards: `.card`, `.card.is-hoverable`
- Input pattern (from `.search input`): transparent bg, no border, `color: var(--foreground)`, `font-size: 13px`, `font-family: inherit`
- Accent color: `--secondary` = `hsl(253,53%,59%)`
- Layout: `.grid-2`, already built-in responsive

---

## 1. Sprint Goal

Add a contact form to the portfolio — new PayloadCMS collection, `/contact` page, sidebar nav entry, and home page CTA. All styled with the existing design system.

---

## 2. Backend — New Collection

### 2.1 Create `backend/src/collections/ContactMessages.ts`

```ts
import type { CollectionConfig } from 'payload'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: () => false,    // admin only
    create: () => true,   // anyone can submit
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true },
  ],
}
```

### 2.2 Register in `payload.config.ts`

Add import and collection:
```ts
import { ContactMessages } from './collections/ContactMessages'
// in collections array:
collections: [..., ContactMessages],
```

### 2.3 Seed navbar entry

The sidebar nav comes from the `Nav` global in `backend/src/seed.ts` (lines ~398-417). The seed file still has sprint-1 `.html` URLs — fix them to clean paths **and** add the Contact entry:

```ts
await payload.updateGlobal({
  slug: 'nav',
  data: {
    menuItems: [
      { label: 'Home', href: '/', icon: 'solar:user-id-outline', order: 1 },
      { label: 'Projects', href: '/projects', icon: 'solar:widget-5-bold-duotone', order: 2 },
      { label: 'Blogs', href: '/blogs', icon: 'solar:document-text-outline', order: 3 },
      { label: 'Documents', href: '/documents', icon: 'solar:folder-bold-duotone', order: 4 },
      { label: 'Socials', href: '/social', icon: 'solar:users-group-rounded-bold-duotone', order: 5 },
      { label: 'Contact', href: '/contact', icon: 'solar:letter-outline', order: 6 },
    ],
    connectLinks: [
      { label: 'GitHub', href: 'https://github.com', icon: 'mdi:github', order: 1 },
      { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: 'mdi:linkedin', order: 2 },
      { label: 'Email', href: 'mailto:hello@example.com', icon: 'solar:letter-outline', order: 3 },
    ],
  },
})
```

This also renames the "Contact" connectLink to "Email" to avoid confusion with the new Contact nav item.

---

## 3. Frontend — New Page

### 3.1 Create `src/pages/contact.astro`

The page needs:
- A contact form with name, email, message fields
- Client-side form submission via `fetch()` to `http://localhost:3000/api/contact-messages`
- Validation (required fields, email format)
- Success/error states
- Matching the existing design system

**Template structure:**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Contact" pageTitle="Contact" activeNav="/contact">
  <div class="grid-2">
    <section class="card">
      <!-- form goes here -->
    </section>
    <section class="card">
      <!-- info / alternative contact methods -->
    </section>
  </div>
</BaseLayout>
```

### 3.2 Form component — inline in `contact.astro` (no separate Svelte component needed)

Keep it simple. The form submits via a `<script>` block in the Astro page. Use existing CSS patterns:

**Form fields — use existing `.search` input pattern for styling:**
```html
<form id="contact-form" class="contact-form">
  <div class="form-group">
    <label class="form-label">Name</label>
    <input type="text" name="name" class="form-input" required placeholder="Your name" />
  </div>
  <div class="form-group">
    <label class="form-label">Email</label>
    <input type="email" name="email" class="form-input" required placeholder="you@example.com" />
  </div>
  <div class="form-group">
    <label class="form-label">Message</label>
    <textarea name="message" class="form-input form-textarea" required rows="5" placeholder="What's on your mind?"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">
    <iconify-icon icon="solar:letter-outline" width="16" height="16"></iconify-icon>
    Send message
  </button>
  <div id="form-status" class="form-status" style="display:none;"></div>
</form>
```

### 3.3 Form submission script (inline in contact.astro)

```html
<script>
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.style.display = 'none';

    try {
      const res = await fetch('http://localhost:3000/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          message: form.message.value.trim(),
        }),
      });

      if (res.ok) {
        status.textContent = '✓ Message sent! I\'ll get back to you soon.';
        status.className = 'form-status form-status-success';
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      status.textContent = 'Something went wrong. Try emailing me directly.';
      status.className = 'form-status form-status-error';
    }

    status.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<iconify-icon icon="solar:letter-outline" width="16" height="16"></iconify-icon> Send message';
  });
</script>
```

### 3.4 Right column — contact info card

Next to the form, show alternative contact methods:

```html
<section class="card">
  <div class="card-header">
    <iconify-icon icon="solar:chat-round-dots-linear" width="18" height="18"></iconify-icon>
    <span class="card-title">Other ways to reach me</span>
  </div>
  <div class="contact-alt">
    <a class="contact-alt-item" href="mailto:hello@atha.dev">
      <iconify-icon icon="solar:letter-bold-duotone" width="20" height="20"></iconify-icon>
      <div>
        <span class="font-bold">Email</span>
        <span class="text-desc text-sm">hello@atha.dev</span>
      </div>
    </a>
    <a class="contact-alt-item" href="https://github.com/athallarizky" target="_blank" rel="noopener">
      <iconify-icon icon="simple-icons:github" width="20" height="20"></iconify-icon>
      <div>
        <span class="font-bold">GitHub</span>
        <span class="text-desc text-sm">@athallarizky</span>
      </div>
    </a>
  </div>
</section>
```

### 3.5 CSS additions to `styles.css`

Add these to `src/styles/styles.css`:

```css
/* ── Contact Form ── */
.contact-form { display: flex; flex-direction: column; gap: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 4px; }

.form-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--desc);
}

.form-input {
  background: var(--secondbackground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--foreground);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color .2s ease;
}

.form-input:focus { border-color: var(--secondary); }

.form-input::placeholder { color: var(--desc); }

.form-textarea { resize: vertical; min-height: 120px; }

.form-status {
  margin-top: .5rem;
  padding: 10px 14px;
  border-radius: var(--radius);
  font-size: 13px;
}

.form-status-success { background: color-mix(in srgb, #22c55e 15%, transparent); color: #22c55e; }
.form-status-error { background: color-mix(in srgb, #ef4444 15%, transparent); color: #ef4444; }

/* ── Contact Alt Links ── */
.contact-alt { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }

.contact-alt-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: var(--radius);
  text-decoration: none; color: var(--foreground);
  transition: background .2s ease;
}
.contact-alt-item:hover { background: var(--hover); }
```

---

## 4. Home Page CTA (Optional Polish)

Add a small CTA card at the bottom of `index.astro`, right before the footer:

```astro
<div class="card mt-4 text-center" style="padding:2rem;">
  <iconify-icon icon="solar:chat-round-dots-linear" width="32" height="32" style="color:var(--secondary);"></iconify-icon>
  <h3 style="margin:.75rem 0 .25rem; font-weight:800;">Let's talk</h3>
  <p class="text-desc text-sm" style="margin-bottom:1rem;">Have a project in mind or just want to say hi?</p>
  <a class="btn btn-primary" href="/contact">
    <iconify-icon icon="solar:letter-outline" width="16" height="16"></iconify-icon>
    Get in touch
  </a>
</div>
```

---

## 5. Implementation Order

1. **Phase 0 — Discovery:** Verify backend boots, review existing form/input CSS patterns, confirm Nav global structure
2. **Phase 1 — Backend:** Create `ContactMessages` collection, register in config, verify endpoint
3. **Phase 2 — Frontend page:** Create `contact.astro` with form + submission script + alt contact card
4. **Phase 3 — CSS:** Add `.form-*` and `.contact-alt-*` styles to `styles.css`
5. **Phase 4 — Navigation:** Add Contact entry to Nav global (via admin panel)
6. **Phase 5 — Home CTA:** Add contact CTA card to `index.astro`
7. **Phase 6 — Verify:** Test form submission, verify styling matches, light/dark mode, mobile responsive

---

## 6. Reference Files

| File | How to Use |
|------|-----------|
| `docs/GUIDE.md` | **READ FIRST** — workflow rules |
| `docs/sprint-4/final-report.md` | Sprint-4 context |
| `backend/src/payload.config.ts` | Where to register the new collection |
| `backend/src/collections/` | Pattern for creating collections |
| `frontend/src/styles/styles.css` | Design system — reuse `.btn`, `.card`, var tokens |
| `frontend/src/pages/social.astro` | Cleanest page template to copy |

---

## 7. How to Run

```bash
# Terminal 1: Backend
cd backend && npm run dev          # http://localhost:3000

# Terminal 2: Frontend  
cd frontend && npm run dev         # http://localhost:4321

# Verify contact endpoint:
curl -X POST http://localhost:3000/api/contact-messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello"}'
```

---

## 8. Done Criteria

- [ ] `ContactMessages` collection exists, `POST /api/contact-messages` returns 201
- [ ] `/contact` page renders with form + alt contact card
- [ ] Form validates required fields + email format
- [ ] Form submits successfully and shows success message
- [ ] Form shows error on failure (e.g., backend down)
- [ ] Success/error states styled with existing design tokens
- [ ] "Contact" appears in sidebar nav
- [ ] Sidebar active nav highlight works on `/contact`
- [ ] Home page CTA card links to `/contact`
- [ ] Light + dark mode both look correct
- [ ] Mobile responsive (`.grid-2` collapses to single column)
- [ ] `npx astro build` succeeds
- [ ] Zero regressions on existing pages
- [ ] Documentation complete: `tasks.md` updated, phase reports written, `final-report.md`
