# Mini Harness

> Personal · OSS · 2026 — *Indonesian translation (review copy)*

Harness AI coding agent minimalis tanpa framework dalam ~180 baris TypeScript — dilengkapi REPL interaktif, streaming SSE, eksekusi tool paralel, dan self-correcting error handling.

**Tech:** typescript, tools *(shared — not translated)*
**Source:** https://github.com/athallarizky/mini-harness *(shared)*

## Overview

`mini-harness` adalah implementasi bersih dari autonomous terminal coding agent, dibangun dari nol dalam ~180 baris TypeScript menggunakan Bun dan `@anthropic-ai/sdk` resmi. Dengan membuang semua overhead framework (tanpa LangChain atau orchestrator besar), tool ini membedah mekanisme inti di balik coding agent modern seperti Claude Code: sebuah `while` loop murni, message history di memori, streaming SSE deltas, dan penanganan tool yang self-correcting.

## Arsitektur Teknis & Alur Kerja

Harness ini membagi tanggung jawab ke tiga modul ringkas:

```
user turn ──▶ history[] ──▶ ask() ──▶ [ Claude Model ]
                 ▲                           │ stream (SSE)
                 │                           ▼
         tool_result[] ◀── runTool() ◀── tool_use
                 │       (Promise.all)
                 └──────── loop until stop_reason !== "tool_use"
```

1. **`src/llm.ts` (The Translator):** Membungkus SDK client dan system prompt SOP. Menyediakan satu pintu masuk streaming `ask()` dengan alokasi `max_tokens: 8192` (krusial agar penulisan file besar via `write_file` tidak terpotong di tengah jalan).
2. **`src/tools.ts` (The Hands):** Mendefinisikan katalog tool dengan JSON Schema yang ketat (`read_file`, `write_file`, `list_files`, `web_fetch`). Executor memvalidasi parameter sebelum operasi disk dijalankan (mencegah file rusak akibat input `undefined`) dan menyertakan pembatas token budget (pemotongan `max_chars` dengan paginasi `start_char`). Yang terpenting, kegagalan di-return sebagai string `ERROR: ...` alih-alih melempar exception, sehingga model bisa membaca pesan error tersebut dan otomatis memperbaikinya di putaran berikutnya.
3. **`src/index.ts` (The Brain):** Mengelola siklus hidup dual-loop:
   - **Outer Loop (REPL):** Berbasis `readline/promises`. Menyimpan satu array `MessageParam[]` yang berfungsi sebagai session memory. Perintah `/reset` langsung mengosongkan array di tempat, memberi agent amnesia instan tanpa perlu restart proses.
   - **Inner Loop (Agent Turn):** Berjalan hingga `MAX_ITERATION = 10`. Meneruskan token streaming langsung ke `process.stdout.write` begitu delta tiba. Saat model berhenti dengan status `tool_use`, loop mengumpulkan semua pemanggilan tool, mengeksekusinya secara bersamaan via `Promise.all()`, memasangkan hasil ke masing-masing `tool_use_id`, menambahkan satu pesan hasil user terpadu, dan mengulang loop.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
