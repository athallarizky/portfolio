# RAG: Mesin Pencari Kos

> Personal · 2026 — *Indonesian translation (review copy)*

Sistem AI + RAG end-to-end untuk mencari kos: mengklasifikasi query POI vs area, scraping listing berdasarkan kode pos, dan rekomendasi lewat semantic search plus LLM.

**Tech:** go, fastapi, docker, typescript, rag, chroma, openai *(shared — not translated)*
**Source:** https://github.com/athallarizky/rent-house-ai *(shared)*

## Overview

Baru-baru ini saya membangun sistem AI + RAG end-to-end untuk mencari kos. Alurnya ada empat langkah:

1. **Klasifikasi query: Point of Interest atau Area spesifik.** Ditangani Fuse.js, library fuzzy-search. Aplikasi butuh query yang valid sebelum scraping apa pun, jadi harus bisa membedakan keduanya: "Kos near Mall One Belpark" adalah POI — scrape langsung di sekitar titik itu; "Kos di Cilandak" adalah area — petakan ke kode pos. Query yang tidak masuk keduanya dilewati dari awal.

2. **Scrape listing untuk area tersebut** (Google Maps). Triknya sederhana: yang kamu butuhkan sebenarnya cuma kode pos. Area seperti Cilandak punya beberapa kode pos, dan untuk tiap kode pos kamu generate varian ejaannya — "Kos di [kode pos]", "Kosan di [kode pos]", "Kost di [kode pos]". Makin banyak query, makin banyak data — dan makin besar komputasi. POI bekerja dengan cara yang sama: API pihak ketiga menerjemahkan nama tempat menjadi koordinat, dan scraper mencari di sekitarnya.

3. **Normalisasi, lalu masuk vector DB (Chroma).** Data hasil scrape dibersihkan dan dideduplikasi, dipecah menjadi chunk, di-embed menjadi vector oleh embedding model, lalu disimpan. Ini bagian RAG-nya: retrieval berdasarkan makna, sehingga kamu bisa mencari dengan bahasa manusia alami alih-alih keyword persis.

4. **Membawa LLM untuk rekomendasi.** Hasil RAG saja sebenarnya cukup, tapi responsnya terasa statis — LLM membuatnya dinamis. Aplikasi mendukung mode chat "AI" dan "Normal", multi-provider dan multi-model lewat API key.

## Yang saya pelajari

- Embedding model punya ragamnya. Sebagian dilatih hanya dengan English — lebih akurat kalau kamu juga mencari dalam English — sementara yang lain multibahasa.
- Makin baik modelnya, makin baik hasilnya, dan makin berat komputasinya. Proyek ini mencoba dua: bge-m3 dan e5-small-embedding.
- Scraper ditulis dalam Go, yang goroutine-nya memungkinkannya menjalankan beberapa task sekaligus — tiga varian query ("kos", "kosan", "kost") untuk satu kode pos dieksekusi paralel, bukan berurutan.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
