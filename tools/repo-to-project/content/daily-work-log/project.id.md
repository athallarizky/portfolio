# GitHub Daily Work Log

> Personal · 2026 — *Indonesian translation (review copy)*

CLI TypeScript berbasis flag yang mengumpulkan satu hari aktivitas GitHub — commit, issue, dan pull request yang kamu buka, update, atau review — menjadi bundle siap-agent, sehingga terminal agent bisa menulis log harian engineering-mu dalam sekali jalan.

**Tech:** typescript, node-js *(shared — not translated)*
**Source:** https://github.com/athallarizky/gh-tools *(shared)*

## Overview

GitHub Daily Work Log menjawab pertanyaan yang selalu gagal dijawab tiap engineer saat standup: *sebenarnya saya kemarin ngapain?* Aktivitas tersebar di commit pada satu repo, PR di repo lain, issue yang kamu komentari, review yang kamu tinggalkan — dan sebagian besar sudah tidak ada di kepalamu. Arahkan CLI ini ke satu tanggal dan timezone, dan ia mengumpulkan gambaran utuhnya menjadi satu bundle deterministik dan terstruktur untuk diringkas oleh agent.

Pengumpulan berjalan tiga pass lalu digabung. Track commits menemukan repo lewat contributions API GitHub, mendata commit tiap repo untuk hari itu, dan memperkaya masing-masing dengan file stats dan PR terkait. Track issues & PRs paralel menembakkan tujuh query Search API — issues authored-created, authored-updated, assignee-created, assignee-updated; PR authored-created, authored-updated, reviewed-by — lalu deduplikasi berdasarkan node id. Pass ketiga menelusuri commit milik tiap PR sendiri, menangkap pekerjaan yang hidup di feature branch dan tidak pernah mendarat di branch default. Semuanya digabungkan di bawah `mergeRepositories`, didedup berdasarkan SHA. Seluruhnya men-shell-out ke `gh` CLI — nol kode auth milikmu sendiri, cukup `gh auth login` dan kamu masuk.

Pilihan desain yang disengaja: tool ini tidak pernah memanggil LLM. Ia menulis empat file ke `runs/<date>/`: prompt Markdown yang sudah di-prime dengan aturan pengelompokan dan instruksi "outcomes over activity", model JSON ternormalisasi, respons API mentah, dan manifest. Serahkan prompt-nya ke Codex, Claude, atau apa pun yang kamu jalankan, dan log kerja harian menulis dirinya sendiri. Karena sepenuhnya berbasis flag dan deterministik, loop yang sama jatuh rapi ke cron job, flow n8n, atau otomasi Codex/Cowork — reporting harian dan bukti KPI tanpa arkeologi manual.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
