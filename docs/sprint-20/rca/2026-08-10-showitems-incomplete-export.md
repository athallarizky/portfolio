# RCA — showItems incomplete: featuredProjects + latestWriting missing from production export

> **Date:** 2026-08-10 · **Severity:** Low · **Component:** backend data-sync / Payload admin
> **Status:** ✅ Resolved

## 1. Summary
Zip export dari production (`portfolio-data-2026-08-10-12-17.zip`) menyimpan 7 item di `home.showItems`: `hero, stats, about, currently, skills, findMe, contactCta`. Item `featuredProjects` dan `latestWriting` hilang — akibatnya section "Selected work" dan "Latest writing" tidak dirender setelah replace-all import ke local.

## 2. Impact
- Local (setelah import): "Selected work" dan "Latest writing" hidden
- Production (athallarizky.com): kemungkinan besar sama — section ini juga tidak muncul
- Tidak ada data loss — konten project/artikel tetap ada, hanya visibility toggle yang off

## 3. Symptoms
| Signal | Value |
|--------|-------|
| `home.showItems` di database | 7 item (hero→contactCta) |
| `featuredProjects` in showItems? | ❌ missing |
| Homepage "Selected work" section | tidak dirender |
| `safeFetch` untuk `showOnHome=true` | 200 OK, 2 projects |

## 4. Timeline
| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | Curiga `safeFetch` gagal filter | API 200 tapi fetch 400 (RCA terpisah) | red herring |
| 2 | Cek `visible.has('featuredProjects')` | false → section disembunyikan | **the clue** |
| 3 | Cek `showItems` di DB | 7 dari 9 yang diharapkan | **the cause** |

## 5. Root cause
Di Payload admin production, checkbox "Featured projects" dan "Latest writing" tidak pernah dicentang (atau pernah di-uncheck). Export zip hanya merekam state apa adanya — bukan bug di logic export.

## 6. The fix
Tambahkan `featuredProjects` + `latestWriting` ke `home_show_items`:

```sql
INSERT INTO home_show_items ("order", parent_id, value) VALUES (8, 1, 'featuredProjects');
INSERT INTO home_show_items ("order", parent_id, value) VALUES (9, 1, 'latestWriting');
```

## 7. Verification
| Metric | Before | After |
|--------|--------|-------|
| `showItems.length` | 7 | 9 |
| Homepage "Selected work" | hidden | 2 cards |
| `tsc --noEmit` | clean | clean |

## 8. Lessons & action items
- [ ] Centang `featuredProjects` dan `latestWriting` di admin Payload production
- [ ] Re-export zip baru dari production untuk backup 1:1
