# Phase 4 Report — Globals & Social

> Completed: 2026-07-07
> Part of: Sprint-2 (Headless CMS Backend)

---

## 1. What was built

Created three Payload Globals (singleton documents) for site-wide configuration and a SocialProfiles collection. All data mirrors the legacy `index.html` and `social.html` content.

- `site-config` — site identity (name, initials, role, bio, status, timezone, location)
- `home` — homepage data (hero, stats, about paragraphs, currently items, skills)
- `nav` — navigation structure (menu items + connect links with icons and ordering)
- `social-profiles` — 7 social platform entries (platform, icon, handle, url, showOnHome, order)

---

## 2. Files

| File | Purpose |
|---|---|
| `backend/src/globals/SiteConfig.ts` | name, initials, role, bioShort, status, timezone, location |
| `backend/src/globals/Home.ts` | hero{}, stats[], about[], currently[], skills[] |
| `backend/src/globals/Nav.ts` | menuItems[], connectLinks[] |
| `backend/src/collections/SocialProfiles.ts` | platform, icon, handle, url, showOnHome, order |

---

## 3. Seeded content

**SiteConfig:** Atha Tharizky · Full-Stack Engineer · Open to side-projects · UTC+7

**Home:**
- Hero: "// hello, I'm" + "Atha Tharizky"
- 4 stats: 6+ years, 24 projects, 3 languages, ∞ coffee
- 2 about paragraphs
- 3 currently items (AI tooling, agentic workflows, local time)
- 12 skills (TypeScript → OpenAI/RAG)

**Nav:**
- 5 menu items: Home, Projects, Blogs, Documents, Socials
- 3 connect links: GitHub, LinkedIn, Contact (email)

**Social Profiles (7):**
| Platform | Handle | showOnHome |
|---|---|---|
| GitHub | @athatharizky | yes |
| LinkedIn | in/athatharizky | yes |
| X | @athatharizky | no |
| Threads | @athatharizky | no |
| Instagram | @athatharizky | no |
| Facebook | /athatharizky | no |
| YouTube | @athatharizky | no |

---

## 4. Bug — Globals returning 403

Globals initially returned 403 Forbidden on public `GET` requests. Payload Globals default to admin-only access — the `access: { read: () => true }` property must be explicitly set, unlike collections where it's inherited from the collection config.

**Fix:** Added `access: { read: () => true }` to all three globals.

---

## 5. Key decisions

| Decision | Why |
|---|---|
| Globals over collections for site-wide data | Singleton pattern — one `site-config`, not a list |
| `showOnHome` flag on social profiles | Controls which profiles appear on the Home page vs full Socials page |
| `order` field on nav items and social profiles | FE can sort without hardcoding order |
| Array fields for Home content (skills, stats, etc.) | Flexible — add/remove items in admin without schema changes |

---

## 6. Verification

- `GET /api/globals/site-config` → `{ name: "Atha Tharizky", role: "Full-Stack Engineer" }`
- `GET /api/globals/home` → 4 stats, 2 about, 3 currently, 12 skills
- `GET /api/globals/nav` → 5 menu items, 3 connect links
- `GET /api/social-profiles?sort=order` → 7 profiles, ordered
- `GET /api/social-profiles?where[showOnHome][equals]=true` → 2 profiles (GitHub, LinkedIn)
- `npm run seed` → idempotent
