# Phase 1 Report — Documents & Categories

> Completed: 2026-07-07
> Part of: Sprint-2 (Headless CMS Backend)

---

## 1. What was built

Finalized the DocumentCategories and Documents collections with the fields matching sprint-1's legacy `documents.js` registry. Built an idempotent seed script (`npm run seed`) that uses Payload's Local API to create categories and upload documents programmatically.

- Switched `Documents.updated` from `date` to `text` (legacy data uses display strings like "Jul 2026")
- 3 document categories: Pinned (order 1), Research (order 2), Other (order 3)
- 6 document records seeded, including a real file upload (`ai-workflow-template.md`, 14KB)
- 5 placeholder PDFs created for missing files (résumé, CV, cover letter, case study, references)

---

## 2. Files

| File | Purpose |
|---|---|
| `backend/src/collections/DocumentCategories.ts` | label, slug, icon, hint, order — public read |
| `backend/src/collections/Documents.ts` | title, category (rel), excerpt, updated (text), upload:true |
| `backend/src/seed.ts` | Idempotent seed: categories → documents with file uploads |
| `frontend/assets/documents/atha-tharizky-resume.pdf` | Placeholder PDF (538 B) |
| `frontend/assets/documents/atha-tharizky-cv.pdf` | Placeholder PDF (543 B) |
| `frontend/assets/documents/atha-tharizky-cover-letter.pdf` | Placeholder PDF (544 B) |
| `frontend/assets/documents/rent-house-ai-case-study.pdf` | Placeholder PDF (542 B) |
| `frontend/assets/documents/atha-tharizky-references.pdf` | Placeholder PDF (542 B) |

---

## 3. Seeded content

**Categories:**
| Slug | Label | Icon | Order |
|---|---|---|---|
| pinned | Pinned | solar:pin-bold-duotone | 1 |
| research | Research | solar:book-2-outline | 2 |
| other | Other | solar:folder-2-outline | 3 |

**Documents:**
| Title | Category | File | Size |
|---|---|---|---|
| Résumé | Pinned | PDF | 538 B |
| CV — Detailed | Pinned | PDF | 543 B |
| Cover Letter Template | Pinned | PDF | 544 B |
| AI Workflow Template | Research | MD | 14,280 B |
| Case Study — Rent-House-AI | Research | PDF | 542 B |
| References | Other | PDF | 542 B |

---

## 4. Key decisions

| Decision | Why |
|---|---|
| `updated` as `text`, not `date` | Legacy data uses display strings ("Jul 2026"), not ISO dates |
| Buffer-based upload in seed | `File` API doesn't work with tsx/Node local API; raw Buffer + mimetype works |
| Idempotent seed (checks before create) | Safe to re-run; skips existing records |
| Graceful skip on missing files | Dev environment — not all PDFs exist yet; seed doesn't fail |

---

## 5. Verification

- `GET /api/document-categories?sort=order` → 3 categories, ordered
- `GET /api/documents?depth=1` → 6 documents, category populated with full object
- `GET /api/documents/file/ai-workflow-template.md` → 200, returns file
- `npm run seed` → idempotent (re-run produces all "already exists" skips)
