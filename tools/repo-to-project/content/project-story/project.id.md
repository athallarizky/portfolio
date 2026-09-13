# Project Story

## Ringkasan Teknis

`project-story` adalah pipeline otomasi penulisan konten teknis yang mengubah sembarang repository GitHub publik menjadi artikel blog berbobot siap rilis. Tanpa mengandalkan satu prompt monolitik raksasa yang rentan halusinasi, sistem ini mengorkestrasi sebuah **graf multi-agent terarah di TypeScript** tempat masing-masing agent bekerja mandiri: dari membedah codebase, memodelkan persona gaya bahasa, hingga merangkai narasi tulisan.

## Arsitektur Graf Multi-Agent

```
CLI: npx tsx src/index.ts <git-url> --style personal
                       │
                       ▼
            [ Supervisor Orchestrator ]
           ┌───────────┴───────────┐
           ▼                       ▼
  [ Agent 1: Researcher ]  [ Agent 2: Style Analyzer ]
  - Shallow git clone      - Membaca SKILL.md & sampel artikel
  - Parsing manifest pkg   - Ekstraksi kosakata & batasan tone
  - Pemetaan arsitektur
           │                       │
           └───────────┬───────────┘
                       ▼ (State Graf Digabung)
             [ Agent 3: Writer ]
             - Menulis draf berdasarkan berkas fakta teknis
             - Menerapkan aturan tone & snippet kode
                       │
                       ▼
            [ Output: article.md ]
```

1. **State Machine Graf Terpusat:** Beroperasi di atas kontrak state bersama di `src/state.ts` yang mencatat metadata repo, berkas riset faktual, aturan gaya bahasa, draf tulisan sementara, dan flag verifikasi dari supervisor.
2. **Agent 1 — Codebase Researcher:**
   - Melakukan clone repo dengan flag `--depth=1` untuk menghemat bandwidth dan disk.
   - Memindai manifest dependensi (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`), pohon direktori, dan file entry point secara sistematis.
   - Menghasilkan laporan teknis murni berisi latar belakang repo, alasan pemilihan stack, algoritma kunci, dan trade-off arsitektur.
3. **Agent 2 — Style Analyzer:**
   - Bekerja secara terisolasi tanpa pernah menyentuh source code aplikasi.
   - Membaca panduan persona (`SKILL.md`) dan contoh tulisan terdahulu di folder `writing-style/`.
   - Mengeluarkan kontrak persona terstruktur: variasi panjang kalimat, tingkat kedalaman teknis, dan daftar kata klise AI yang wajib dihindari.
4. **Agent 3 — Narrative Writer:**
   - Menggabungkan laporan fakta dari Researcher dengan kontrak persona dari Style Analyzer.
   - Memformat judul, diagram alur, dan snippet kode secara natural tanpa mengarang API fiktif atau klaim yang tidak ada di repo aslinya.
5. **Lapisan Tooling Terisolasi:** Menyediakan tools deterministik yang aman untuk operasi git, pembacaan file terisolasi, dan parser dokumen markdown di bawah direktori `src/tools/`.
