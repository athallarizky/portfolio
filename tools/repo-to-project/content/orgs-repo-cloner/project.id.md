# GitHub Orgs Repo Cloner

> Personal · 2026 — *Indonesian translation (review copy)*

CLI kecil berbasis flag yang mengenumerasi dan bulk-clone seluruh repository dalam satu organisasi GitHub — list untuk mengukur ukuran, clone untuk mirror seluruh org ke disk, dengan repo terarsip tersaring dan agent-driven sejak desain.

**Tech:** typescript, node-js *(shared — not translated)*
**Source:** https://github.com/athallarizky/gh-tools *(shared)*

## Overview

GitHub Orgs Repo Cloner mengerjakan satu hal dengan baik: menarik seluruh repository sebuah organisasi GitHub ke disk. Dua subcommand, tanpa ceremoni. `list --org <name>` memaginasi `gh api orgs/<org>/repos` dan mencetak setiap clone URL — smoke test murah untuk "seberapa besar org ini?" sebelum kamu berkomitmen melakukan bulk clone. `clone --org <name>` menjalankan listing yang sama, membuang repo terarsip secara default, dan men-streaming `git clone` ke `<dest>/<repo>/`, satu repo demi satu, jadi kamu melihat progress asli git saat berjalan.

Desainnya sengaja tipis. Listing men-shell-out ke `gh` CLI (tanpa urusan token sendiri); cloning men-shell-out ke `git` biasa, jadi SSH key dan credential helper yang sudah kamu punya langsung jalan — termasuk untuk repo private, selama `gh auth login` dan auth git sudah disetup. Tidak ada concurrency pool, tidak ada flag shallow-clone, tidak ada manifest sidecar: hanya pagination, dedup berdasarkan `full_name`, penyaringan archived, dan direktori tujuan. Re-run aman — `git clone` melewati yang sudah ada di disk.

Yang membuatnya lebih dari sekadar script lima baris adalah kontrak agent-nya. Setiap flag deterministik dan bebas-prompt, dan `SKILLS.md` per package ditulis *untuk LLM* — ia mendata frasa user persis yang harus memicu tiap subcommand ("clone all of <org>'s repos", "mirror an entire GitHub organization") dan mengontraskannya dengan paket saudaranya, jadi agent tahu kapan *tidak* perlu memakainya. Itu membuatnya primitive yang bersih untuk workflow yang memang ditujukan baginya: backup dan mirroring org, offboarding atau migrasi antar instance GitHub, dan analisis lokal air-gapped — jatuhkan seluruh repo ke laptop agar agent bisa grep, membaca, atau menalar kode sebuah org tanpa bolak-balik ke API.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
