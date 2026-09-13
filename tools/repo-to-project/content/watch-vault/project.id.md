# Watch Vault

## Ringkasan Teknis

`watch-vault` adalah aplikasi katalog dan penjelajah film berkecepatan tinggi yang dibangun di atas **TanStack Start (server runtime Nitro)**, **React 19**, dan **TailwindCSS v4**. Aplikasi ini terintegrasi penuh dengan REST API TMDB untuk data metadata, graf pemeran, dan poster resolusi tinggi, serta dilengkapi fitur unggulan **AI Concierge** otonom yang bisa memanggil live tools TMDB alih-alih mengandalkan ingatan statis model AI.

## Arsitektur Teknis & Alur Kerja Agent

```
User Query ("Rekomendasikan film sci-fi 90-an mirip Blade Runner")
                    │
                    ▼
[ Server Route SSR TanStack Start ]
                    │
          ┌─────────▼────────────────────────┐
          │  Pi Agent Runtime (pi-ai)        │
          │  - Buffer riwayat percakapan     │
          │  - Rate-limit & filter konten    │
          └─────────┬────────────────────────┘
                    │ (Menentukan Tool Call: discover_movies / similar_titles)
                    ▼
         [ TMDB REST Client ] (Query API ter-cache)
                    │
                    ▼ (Respon JSON diteruskan sebagai tool_result)
          ┌──────────────────────────────────┐
          │  Token Streaming Engine (SSE)    │
          └─────────┬────────────────────────┘
                    │ Delta token mengalir
                    ▼
[ Client UI (React 19 + TanStack Query) ] ──▶ Render link langsung ke /movies/:id
```

1. **Fondasi Full-Stack SSR:** Berjalan di atas **TanStack Start** dan Vite 8. Seluruh request ke API TMDB dan eksekusi AI dieksekusi via server functions, menjaga API key tetap aman di sisi server.
2. **Sinkronisasi State & URL:** Filter kategori, pengurutan, dan kata kunci pencarian tersinkronisasi dua arah dengan query parameter URL. Untuk infinite scroll di halaman Discover, **TanStack Query** secara otomatis melakukan prefetch data halaman berikutnya sebelum scroll pengguna menyentuh dasar layar.
3. **AI Concierge Berbasis Tool Calling:** Dibangun menggunakan `@earendil-works/pi-coding-agent` dan `@earendil-works/pi-ai`:
   - Daripada menjawab asal-asalan dari ingatan bobot model, AI concierge dibekali katalog tools TMDB yang ketat (`search_tmdb`, `discover_titles`, `get_details`, `get_similar`).
   - Agent menganalisis prompt user, memanggil API TMDB yang relevan di background, membaca respon JSON yang akurat, lalu melakukan streaming teks rekomendasi yang menyertakan link rute internal ke halaman detail film terkait.
   - Menghapus halusinasi tahun rilis, sutradara, maupun daftar aktor secara tuntas.
4. **Persistensi Lokal di Sisi Client:** Fitur watchlist dan rating bintang pengguna disimpan langsung di local storage dengan pembaruan UI yang optimistik (langsung ter-update tanpa nunggu delay jaringan).
5. **Rate Limiting & Keamanan Edge:** Dilengkapi proteksi sliding-window IP rate limiting dan sanitasi prompt pada endpoint concierge untuk mencegah pembengkakan kuota token dan penyalahgunaan bot.
