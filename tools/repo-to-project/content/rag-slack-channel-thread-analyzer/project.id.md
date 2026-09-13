# RAG: Analyzer Thread Channel Slack

> Personal · 2026 — *Indonesian translation (review copy)*

Workflow RAG di atas export channel Slack untuk memunculkan riwayat diskusi masa lalu yang relevan dengan issue baru — sehingga bug berulang bisa langsung dilacak ke solusi dan root cause-nya tanpa perlu investigasi dari nol.

**Tech:** fastapi, docker, react, rag, openai, tailwindcss, typescript *(shared — not translated)*
**Source:** https://github.com/athallarizky/slack-rag *(shared)*

## Overview

Di kantor kami ada channel Slack `#dev-bugs` tempat tim operasional melempar tiket laporan kendala. Channel ini hampir nggak pernah sepi — tiap hari selalu ada isu baru yang masuk.

Tantangan klasiknya: banyak bug yang sebenarnya pernah terjadi sebelumnya. Masalah itu sudah pernah dipecahkan — sering kali oleh engineer lain yang berbeda tim — sehingga kalau kamu nggak terlibat langsung saat itu, gampang banget luput kalau solusinya sudah ada. Terkadang kamu merasa issuenya familiar, tapi mencari thread lama yang relevan — membaca detail percakapan, mencari root cause, dan melihat apa fix-nya — memakan waktu tersendiri.

Untuk mengatasi friksi ini, saya membangun workflow RAG sederhana:

- Ekspor data percakapan channel dari Slack (format JSON)
- Normalisasi, parsing thread, dan bersihkan datanya
- Ingestion ke vector database sebagai knowledge base untuk RAG

Sekarang jauh lebih mudah melompat langsung ke thread-thread lama yang paling mirip dengan kendala yang baru dilaporkan. Agent bahkan bisa langsung menganalisis dan merangkum isi percakapan masa lalu saat itu juga, sehingga tracking masalah nggak perlu lagi dimulai dari nol.

Potensi pemanfaatannya juga nggak terbatas pada laporan bug saja. Diskusi apa pun di Slack yang diekspor bisa dijadikan knowledge base — channel customer support, diskusi arsitektur engineering, atau dokumentasi incident response tim.

Secara teknis, setup provider AI-nya dibuat sengaja fleksibel: bisa pakai API key langsung (OpenAI, dll.), atau lewat custom command yang memanggil CLI agent di background (seperti Claude Code, Factory Droid, atau CLI tooling internal lainnya).

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
