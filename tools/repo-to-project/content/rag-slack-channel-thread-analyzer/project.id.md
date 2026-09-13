# RAG: Analyzer Thread Channel Slack

> Personal · 2026 — *Indonesian translation (review copy)*

Workflow RAG di atas channel Slack yang diekspor, yang mengangkat thread lama serupa dengan laporan baru — jadi isu berulang bisa dilacak ke root cause-nya alih-alih diselesaikan dari nol.

**Tech:** fastapi, docker, react, rag, openai, tailwindcss, typescript *(shared — not translated)*
**Source:** https://github.com/athallarizky/slack-rag *(shared)*

## Overview

Di kantor kami ada channel #dev-bugs tempat tim operasional mengajukan laporannya. Channel yang tidak pernah sepi — setiap hari selalu ada yang baru masuk.

Satu tantangan yang berulang: sebagian bug ternyata repetisi. Issuennya pernah diselesaikan — sering oleh orang lain — jadi kecuali kamu ada di sana saat itu, mudah sekali melewatkan bahwa masalah yang sama sudah punya solusi yang diketahui. Atau kamu merasa issuenya terlihat familiar, tapi menemukan thread lama yang relevan — root cause-nya, resolusinya — adalah pencarian tersendiri.

Jadi saya membangun workflow RAG sederhana di sekelilingnya:

- ekspor data percakapan channel dari Slack (JSON)
- normalisasi dan bersihkan datanya
- jadikan knowledge base untuk RAG

Sekarang jauh lebih mudah melompat langsung ke thread lama yang paling mirip dengan laporan baru. Agent bahkan bisa menganalisis dan meringkas percakapan masa lalu saat itu juga, jadi melacak sebuah issue tidak lagi berarti mulai dari nol.

Use case-nya juga tidak terbatas pada bug. Apa pun yang hidup di channel yang diekspor bisa menjadi knowledge base — channel support, diskusi engineering, apa pun yang dibutuhkan tim.

Di sisi teknis, setup providernya sengaja fleksibel: colok API key langsung, atau pakai custom command yang memanggil CLI agent di belakang layar. Factory Droid, Claude Code, atau provider lain sama-sama jalan.

---

*Architecture, tech tags, and links are shared fields and stay in English — see `project.md`.
This translation ships as `project.id.json` (sprint-24 bilingual overlay).*
