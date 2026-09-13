# RAG: Mesin Pencari Kos

> Personal · 2026 — *Indonesian translation (review copy)*

Sistem AI + RAG end-to-end untuk pencarian kos di Indonesia: klasifikasi query POI vs area, scraping data listing berbasis kode pos, serta rekomendasi kontekstual via semantic search dan LLM.

**Tech:** go, fastapi, docker, typescript, rag, chroma, openai *(shared — not translated)*
**Source:** https://github.com/athallarizky/rent-house-ai *(shared)*

## Overview

Saya baru saja membangun sistem AI + RAG end-to-end untuk mempermudah pencarian kos. Alur utamanya terbagi ke dalam empat tahap:

1. **Klasifikasi Query: Point of Interest (POI) vs Area Spesifik.** Tahap ini ditangani oleh Fuse.js untuk fuzzy matching. Sistem harus bisa membedakan kedua jenis input ini sebelum melakukan scraping: "Kos dekat Citos" adalah POI (scraping langsung radius koordinat sekitar titik tersebut); sedangkan "Kos di Cilandak" adalah Area (perlu dipetakan dulu ke daftar kode pos terkait). Input yang tidak valid langsung dieliminasi sejak awal.

2. **Scraping Listing Berdasarkan Area (Google Maps).** Kuncinya simpel: target utamanya adalah kode pos. Satu kecamatan seperti Cilandak punya beberapa kode pos, dan untuk tiap kode pos digenerate variasi ejaan lokalnya — "Kos di [kode pos]", "Kosan di [kode pos]", "Kost di [kode pos]". Makin banyak kombinasi query, datanya makin lengkap — meski butuh komputasi lebih besar. Untuk POI polanya serupa: API pihak ketiga menerjemahkan nama tempat jadi koordinat GPS, lalu scraper mengekstrak listing di sekitarnya.

3. **Normalisasi Data & Ingestion ke Vector DB (Chroma).** Data mentah hasil scraping dibersihkan, dideduplikasi, di-chunking, lalu diubah menjadi vector embeddings oleh embedding model sebelum disimpan ke Chroma. Di sinilah letak inti RAG-nya: pencarian berbasis makna (*semantic search*), sehingga user bisa bertanya dengan bahasa sehari-hari yang luwes tanpa harus mencocokkan kata kunci secara kaku.

4. **Integrasi LLM untuk Rekomendasi Dinamis.** Hasil retrieval dari vector DB sebenarnya sudah informatif, tapi responsnya terasa kaku dan mentah — di sinilah peran LLM untuk merangkum dan memberikan rekomendasi yang enak dibaca. Aplikasi ini menyediakan mode "AI" dan "Normal", serta mendukung multi-provider dan multi-model lewat konfigurasi API key.

## Lesson Learned

- Karakteristik tiap embedding model sangat bervariasi. Model yang dilatih murni data bahasa Inggris memang tajam untuk query Inggris, tapi untuk pencarian bahasa Indonesia kasual, multilingual embedding model jauh lebih relevan.
- Trade-off akurasi vs komputasi sangat terasa. Semakin besar kapasitas modelnya, hasil retrieval memang makin presisi tapi latency dan resource-nya melonjak. Di project ini saya sempat menguji `bge-m3` dan `e5-small-embedding`.
- Engine scraper ditulis menggunakan Go. Keunggulan goroutine-nya sangat terasa saat mengeksekusi tiga varian ejaan query ("kos", "kosan", "kost") untuk satu kode pos secara paralel alih-alih sekuensial, memangkas waktu scraping secara drastis.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
