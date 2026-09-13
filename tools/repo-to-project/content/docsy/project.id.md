# Docsy

## Ringkasan Teknis

`docsy` adalah sistem manajemen file tingkat enterprise yang dibangun dengan konsep monorepo berbasis container. Stack-nya mengawinkan backend **Laravel 11 REST API** dengan frontend **Vue 3 Composition API SPA**, diperkuat **PostgreSQL 16** untuk operasi pohon folder rekursif dan full-text search, serta **Redis 7** untuk cache-aside dan background queue. Semua service ini berjalan rapi di balik satu port melalui reverse proxy Nginx.

## Arsitektur Teknis & Alur Request

```
                    ┌────────────────────────────────────────────┐
                    │  Nginx Reverse Proxy (:8000)               │
                    │  ├─ /api/*  ──▶ PHP-FPM (Laravel 11 API)   │
                    │  └─ /*      ──▶ Static SPA (Vue 3 Build)   │
                    └──────┬──────────────────────┬──────────────┘
                           │                      │
                  ┌────────▼────────┐    ┌────────▼────────┐
                  │  PostgreSQL 16  │    │     Redis 7     │
                  │  - Recursive CTE│    │  - Cache-aside  │
                  │  - GIN tsvector │    │  - Queue worker │
                  └─────────────────┘    └─────────────────┘
```

1. **Pintu Masuk Terpadu (Nginx):** Satu container Alpine Nginx melayani asset statis build Vue 3 secara langsung, sekaligus mem-forward request `/api` ke PHP 8.3 FPM. Pola ini mematikan potensi masalah CORS browser secara total, baik di environment local maupun production.
2. **Hierarki Folder Rekursif (PostgreSQL Recursive CTE):** Folder bisa bersarang tanpa batas tanpa takut performa drop. Menggunakan `WITH RECURSIVE` SQL, seluruh jalur breadcrumb dari folder terdalam sampai root bisa ditarik hanya dalam satu query tunggal. Pemindahan folder juga diproteksi validasi SQL untuk mencegah circular-move (memindah folder ke dalam sub-folder miliknya sendiri) dengan respon HTTP 422.
3. **Mesin Pencarian Full-Text:** Pencarian file mengandalkan kolom kalkulasi `tsvector` bawaan PostgreSQL yang dipadukan dengan **GIN (Generalized Inverted Index)**. Hasilnya: fitur stemming kata, pencarian multi-kata berbasis operator AND (`&`), dan perangkingan relevansi berjalan instan tanpa perlu repot setup Elasticsearch.
4. **Antrean Async & Cache-Aside (Redis 7):** Statistik dashboard (jumlah file, pemakaian storage, rincian folder) menggunakan teknik cache-aside dengan TTL dan invalidasi berbasis event saat ada upload/delete. Tugas berat seperti generate thumbnail gambar dan pencatatan audit log dijalankan secara asinkron lewat Redis queue worker.
5. **Penyimpanan Streamed yang Aman:** Setiap file yang di-upload (maksimal 25MB dengan validasi MIME ketat) disimpan di private disk terisolasi dengan penamaan UUID acak. Proses download file langsung melempar chunk binary ke HTTP socket, menjaga pemakaian RAM server tetap flat dan ringan berapapun ukuran filenya.
