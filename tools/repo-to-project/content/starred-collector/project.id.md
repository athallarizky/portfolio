# GitHub Starred Collector

> Personal · 2026 — *Indonesian translation (review copy)*

CLI TypeScript berbasis flag yang menarik repo starred milik user GitHub mana pun menjadi knowledge base terkategorisasi bergaya Obsidian — markdown untuk dibaca, CSV untuk diberikan ke agent atau pipeline RAG, dan command merge untuk katalog tool lintas-user.

**Tech:** typescript, node-js *(shared — not translated)*
**Source:** https://github.com/athallarizky/gh-tools *(shared)*

## Overview

GitHub Starred Collector mengubah guliran tanpa ujung repo starred menjadi sesuatu yang benar-benar bisa kamu cari. Jalankan `collect --user <login>` dan ia menarik semua repo yang di-star — milikmu atau orang lain, karena star itu publik — memvalidasi masing-masing lewat schema zod, mengurutkan dan menyaring, lalu menjatuhkan dua file ke `collections/<user>/`: `starred.md` yang enak dibaca manusia dan `data.csv` flat yang siap untuk agent atau pipeline RAG.

Yang membuatnya lebih dari sekadar scraper adalah kategorisasinya. Mesin regex 22 aturan mengarahkan tiap repo ke satu bucket — AI/Agents/LLM, Frontend/UI/Design, Security/Privacy, Awesome Lists, dan seterusnya — dan struktur itu terbawa ke output. Markdown-nya terbaca seperti katalog terkurasi: YAML frontmatter, daftar isi `Daftar Isi` dengan jumlah per kategori, statistik bahasa berbentuk bar-chart ASCII, dan blok detail per repo dengan stars, lisensi, kebaruan maintenance, dan badge ARCHIVED/TEMPLATE. Auth-nya dual-mode — `GITHUB_TOKEN` memakai `fetch` langsung dengan penanganan rate-limit, kalau tidak men-shell-out ke `gh` CLI. Tanpa kode auth sendiri yang harus diurus, apa pun pilihanmu.

Pitch sebenarnya adalah workflow yang dibukanya. Command `combine` mendeduplikasi koleksi banyak user (snapshot dengan star terbanyak menang saat konflik) dan melacak repo yang di-star oleh N user, jadi kamu bisa membangun katalog tool bersama untuk satu tim. Semuanya berbasis flag dan bebas-prompt secara desain — manifest `SKILLS.md` per tool mengajari agent eksternal kapan dan bagaimana memanggilnya, jadi loop-nya menjadi *collect → read → reason* alih-alih mengasuh script. Butuh tool untuk X? Serahkan katalog starred-mu ke agent dan tanya.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
