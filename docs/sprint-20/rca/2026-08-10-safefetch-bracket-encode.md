# RCA — safeFetch silently returns empty docs for unencoded bracket queries

> **Date:** 2026-08-10 · **Severity:** Med · **Component:** frontend `safeFetch`
> **Status:** ✅ Resolved

## 1. Summary
`safeFetch()` di SSR Node.js tidak URL-encode bracket `[]` di query params. Payload menerima request sebagai string literal, gagal parse filter, return 400 — tapi `safeFetch` menangkapnya sebagai error fallback ke `{ docs: [] }`. Akibat: homepage sepi ("Selected work", "Latest writing" tidak ada project/artikel), tapi tanpa error terlihat.

## 2. Impact
- "Selected work" section kosong (0 project) padahal ada 2 project dengan `showOnHome=true`
- "Latest writing" section kosong (0 artikel) padahal API return data
- Tidak terdeteksi di development karena curl testing pakai shell (shell meng-handle bracket tanpa encode)

## 3. Symptoms
| Signal | Value |
|--------|-------|
| Homepage renders | 200 OK, semua section terlihat |
| Selected work | section ada tapi 0 work-card |
| API query via curl | 200 OK, returns 2 projects |
| API query via `fetch()` | 400 Bad Request |

## 4. Timeline
| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | Cek `showOnHome=true` di database | 2 project ada | red herring |
| 2 | Cek API filter via curl | 200 OK, 2 results | red herring |
| 3 | Cek apakah work-card render di HTML | muncul tapi kosong | the clue |
| 4 | Cek URL encode: `fetch()` vs `curl` | curl OK, fetch 400 | **the cause** |

## 5. Root cause
`fetch()` di Node.js mengirim bracket `[]` mentah di URL query string. RFC 3986 menyatakan bracket harus di-encode. `curl` (shell) secara implisit menangani ini, tapi `fetch()` Node tidak.

```diff
- const res = await fetch(`${API}${path}`);
+ const encoded = path.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
+ const res = await fetch(`${API}${encoded}`);
```

## 6. The fix
`frontend/src/lib/api.ts:15` — tambahkan URL-encode bracket di setiap `safeFetch` call.

## 7. Verification
| Metric | Before | After |
|--------|--------|-------|
| `fetch(/projects?where[showOnHome]...)` | 400 → empty docs | 200 → 2 projects |
| Homepage "Selected work" | 0 cards | 2 cards |
| `tsc --noEmit` | clean | clean |

## 8. Why it was hard to find
- `safeFetch` sengaja silent-fail — tidak ada error console
- `curl` testing selalu OK (shell encode bracket)
- Section render (heading/div terbentuk), hanya kontennya kosong
