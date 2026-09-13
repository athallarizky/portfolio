# GitHub Daily Work Log

> Personal · 2026 — *Indonesian translation (review copy)*

CLI TypeScript berbasis flag yang merangkum seluruh aktivitas harianmu di GitHub — commit, issue, dan pull request yang kamu buka, update, atau review — menjadi context bundle siap saji, sehingga terminal agent bisa menulis daily engineering log kamu dalam sekali jalan.

**Tech:** typescript, node-js *(shared — not translated)*
**Source:** https://github.com/athallarizky/gh-tools *(shared)*

## Overview

GitHub Daily Work Log menjawab pertanyaan yang kerap bikin bingung tiap engineer pas daily standup: *sebenarnya kemarin saya ngerjain apa aja ya?* Aktivitas sering kali tercecer di berbagai repo — commit di repo A, PR di repo B, ninggalin review di PR tim lain, atau sekadar nimbrung di issue — dan sebagian besar ingatan itu sudah lenyap keesokan paginya. Arahkan CLI ini ke satu tanggal dan timezone tertentu, dan ia akan mengumpulkan rekam jejak lengkapmu menjadi satu bundle terstruktur yang deterministik untuk langsung diringkas oleh AI agent.

Proses pengumpulan datanya berjalan dalam tiga track paralel sebelum digabungkan:
1. **Track Commits:** Menemukan repo lewat contributions API GitHub, mendata seluruh commit harianmu di tiap repo, dan memperkaya tiap item dengan file stats serta PR terkait.
2. **Track Issues & PRs:** Menembakkan tujuh query Search API secara paralel (issues authored-created, authored-updated, assignee-created, assignee-updated; PRs authored-created, authored-updated, reviewed-by), lalu melakukan deduplikasi berbasis node id.
3. **Track PR Commits:** Menelusuri commit di dalam tiap PR itu sendiri untuk menangkap pekerjaan yang masih hidup di feature branch dan belum sempat merge ke branch default.

Semuanya di-merge di bawah method `mergeRepositories` dan dideduplikasi berdasarkan commit SHA. Menariknya, CLI ini sepenuhnya men-shell-out ke `gh` CLI bawaan GitHub — jadi kamu nggak perlu pusing ngurus kode auth atau token baru, cukup pastikan `gh auth login` sudah aktif.

Desain yang sengaja dipilih: CLI ini sama sekali tidak memanggil LLM. Ia hanya menulis empat file ke folder `runs/<date>/`: prompt Markdown yang sudah di-prime dengan aturan kategorisasi serta instruksi "outcomes over activity", model JSON ternormalisasi, respons API mentah, dan manifest. Serahkan prompt tersebut ke Claude, Codex, atau agent apa pun yang kamu pakai, dan laporan kerja harianmu akan langsung tercipta. Karena berbasis flag dan sepenuhnya deterministik, loop ini sangat mudah diintegrasikan ke cron job, workflow n8n, atau otomasi script harian — pembuktian KPI dan standup lancar tanpa perlu arkeologi riwayat commit manual.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
