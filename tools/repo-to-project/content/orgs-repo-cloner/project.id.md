# GitHub Orgs Repo Cloner

> Personal · 2026 — *Indonesian translation (review copy)*

CLI TypeScript ringan untuk listing dan bulk-clone seluruh repository di sebuah organisasi GitHub — gunakan mode list untuk menakar skala org, dan clone untuk mirror seluruh repo ke disk secara otomatis dengan filter repo arsip.

**Tech:** typescript, node-js *(shared — not translated)*
**Source:** https://github.com/athallarizky/gh-tools *(shared)*

## Overview

GitHub Orgs Repo Cloner dirancang untuk satu fungsi spesifik: menarik seluruh repository dari sebuah organisasi GitHub ke local disk dengan cepat dan tanpa konfigurasi njelimet.

Hanya ada dua subcommand inti:
1. `list --org <name>`: Menangani pagination ke `gh api orgs/<org>/repos` dan mencetak daftar clone URL — langkah awal yang murah untuk memetakan "seberapa besar org ini?" sebelum kamu memutuskan clone massal.
2. `clone --org <name>`: Mengambil daftar yang sama, otomatis menyaring repo yang berstatus archived, lalu menjalankan streaming `git clone` ke `<dest>/<repo>/` satu per satu. Dengan begitu, kamu bisa melihat progres native git secara langsung di terminal.

Arsitekturnya dibuat sengaja ramping. Proses listing men-shell-out ke `gh` CLI bawaan (bebas ribet urusan personal access token); proses cloning men-shell-out ke binary `git` sistem, sehingga SSH key dan credential helper yang sudah kamu pasang langsung jalan otomatis — termasuk untuk repo private.

Tidak ada concurrency pool yang rumit atau manifest sidecar yang berlebihan: hanya pagination rapi, deduplikasi berbasis `full_name`, filter archived, dan output directory. Aman dijalankan berulang kali (idempotent), karena `git clone` otomatis melewati repo yang sudah ada di disk.

Nilai lebihnya ada pada kontrak integrasi dengan AI agent. Semua flag bersifat deterministik tanpa prompt interaktif, dan `SKILLS.md` di dalamnya ditulis khusus agar dipahami LLM — lengkap dengan kata kunci pemicu kapan agent harus menggunakannya dan kapan tidak. Ini menjadikannya utility primitive yang solid untuk backup org, proses offboarding/migrasi antar instance GitHub, atau analisis kode offline (air-gapped) — mengunduh semua codebase ke laptop agar terminal agent bisa leluasa me-ripgrep, membaca, dan menganalisis kode tanpa tercekik kuota rate-limit API.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
