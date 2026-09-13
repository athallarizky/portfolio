# GitHub Starred Collector

> Personal · 2026 — *Indonesian translation (review copy)*

CLI TypeScript berbasis flag yang mengonversi timbunan repo starred milik user GitHub mana pun menjadi knowledge base terkategorisasi bergaya Obsidian — menghasilkan Markdown untuk dibaca manusia, CSV untuk konsumsi agent atau pipeline RAG, serta command merge untuk membangun katalog tool tim.

**Tech:** typescript, node-js *(shared — not translated)*
**Source:** https://github.com/athallarizky/gh-tools *(shared)*

## Overview

GitHub Starred Collector mengubah tumpukan repo starred yang menggunung dan tak berujung menjadi knowledge base terstruktur yang gampang dicari. Cukup jalankan `collect --user <login>`, dan CLI ini akan menarik semua repo yang kamu (atau user lain) beri bintang, memvalidasi tiap item via Zod schema, menyortir serta menyaringnya, lalu mengekspor dua file ke folder `collections/<user>/`: file `starred.md` yang nyaman dibaca manusia dan file `data.csv` siap konsumsi untuk AI agent maupun pipeline RAG.

Kekuatan utamanya ada pada sistem kategorisasi otomatis. Engine regex dengan 22 aturan mengelompokkan tiap repo ke bucket relevan — AI/Agents/LLM, Frontend/UI/Design, Security/Privacy, Awesome Lists, dan seterusnya — yang langsung tercermin pada struktur output. Dokumen Markdown-nya tersaji layaknya katalog terkurasi: dilengkapi YAML frontmatter, daftar isi beserta jumlah repo per kategori, visualisasi statistik bahasa via ASCII bar-chart, serta kartu detail per repo berisi jumlah star, lisensi, kebaruan commit terakhir, hingga badge status ARCHIVED/TEMPLATE.

Autentikasinya mendukung dual-mode: jika ada `GITHUB_TOKEN`, ia memakai native `fetch` dengan penanganan rate-limit otomatis; jika tidak, ia akan otomatis men-shell-out ke `gh` CLI lokal. Kamu sama sekali nggak perlu pusing mengurus logic auth sendiri.

Value terbesarnya ada pada workflow kolaboratif yang dimungkinkannya. Command `combine` bisa menggabungkan koleksi dari banyak user sekaligus, mendeduplikasi konflik (snapshot dengan star terbanyak yang menang), dan melacak repo mana saja yang di-star oleh sejumlah rekan setim — memudahkan pembuatan katalog tool bersama untuk organisasi. Semuanya dirancang berbasis flag dan deterministik; file `SKILLS.md` di dalamnya memandu agent eksternal kapan dan bagaimana memanggil CLI ini, sehingga siklus kerjanya menjadi *collect → read → reason* tanpa perlu kamu babysit script-nya secara manual. Mau cari tool untuk problem tertentu? Tinggal serahkan katalog starred-mu ke agent dan tanyakan.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
