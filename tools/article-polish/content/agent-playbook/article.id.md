# Agent Playbooks: Mengunci Workflow AI Agar Tidak Mengulang Prompt dari Nol

## Penyakit Lupa Ingatan pada AI Agent

Kalau kamu rutin pakai AI coding agent seperti Claude Code, Cursor, atau Copilot, pasti pernah merasakan siklus melelahkan ini:

Kamu menghabiskan 10 menit pertama buat nge-prompt panjang lebar — menjelaskan aturan Git, mewanti-wanti jangan sampai commit secret atau `.env`, memberi tahu cara menulis test yang benar, sampai styling convention. Hasil kerjanya di sesi itu memang rapi.

Tapi begitu terminal ditutup atau masuk sprint baru, si agent kembali amnesia total. Semua aturan tadi menguap. Tanpa rasa bersalah, dia langsung stage file `.env` sembarangan atau bikin satu fungsi raksasa 400 baris.

Memperlakukan AI agent seperti chatbot ad-hoc bakal memaksa kita jadi *micromanager* seumur hidup. Biar hasil kerja tools autonomous ini konsisten selevel senior engineer, kita butuh **playbook yang repeatable**.

## Apa Sebenarnya Agent Playbook Itu?

Agent playbook intinya adalah dokumen briefing terstruktur — biasanya berupa file `SKILL.md` — yang mengunci prosedur engineering tertentu. Jadi daripada repot-repot menyusun prompt dadakan setiap kali mulai ngoding, kita tinggal arahkan si agent ke playbook terkait.

Di repo `agent-playbooks` yang saya pakai sehari-hari, setiap playbook punya tanggung jawab yang spesifik:

- **`feature-workflow`**: Lifecycle 4 tahap (discover, design, build, review) biar agent tidak asal ngetik kode sebelum spesifikasi disepakati bersama.
- **`security-audit`**: Prosedur wajib sebelum commit buat mendeteksi API keys, PII, atau token bocor.
- **`git-workflow`**: Menjaga disiplin conventional commits, melarang auto-push tanpa izin, dan menjaga kebersihan `.gitignore`.
- **`concept-lab`**: Pola eksperimen cleanroom buat membedah konsep teknis baru lewat lab hands-on.

Begitu agent masuk sesi kerja, hal pertama yang dia baca adalah playbook ini. Dokumen ini bekerja layaknya Standard Operating Procedure (SOP) tim engineering.

## Kenapa Struktur Jauh Lebih Penting daripada Full Autonomy?

Ada narasi populer di dunia AI bahwa agent idealnya dibiarkan serba mandiri — kasih goal besar, lalu biarkan dia mikir sendiri dari A sampai Z.

Di dunia nyata, otonomi tanpa batas justru jadi resep bencana: halusinasi liar, scope creep, sampai commit yang berantakan. LLM pada dasarnya adalah mesin probabilistik. Kalau dilepas tanpa batasan, dia bakal memilih jalan pintas yang paling gampang — dan jalan pintas itu hampir tidak pernah sejalan dengan arsitektur production.

Playbook hadir sebagai *guardrails* deterministik yang membungkus model probabilistik. Ini bukan membatasi kecerdasan si model, tapi justru memfokuskan energinya:

1. **Kualitas yang Tertebak**: Agent menjalankan checklist yang sama persis setiap saat. Tidak ada lagi momen "kelupaan" linter atau security scan.
2. **Bebas Beban Pikiran**: Kita tidak perlu mengingat 7 langkah checklist deploy atau PR review di kepala. Playbook yang menanggung beban kognitif itu.
3. **Portabel Lintas Tools**: Format markdown terstruktur bisa dibaca sama baiknya oleh Claude Code, Gemini CLI, Cursor, maupun Codex.

## Pelajaran Penting: Anggap Prompt Seperti Source Code

Lesson learned paling berharga dari mengelola repo playbook terpusat ini sederhana: **perlakukan instruksi agent selayaknya source code biasa**.

- **Version-control workflow kamu:** Begitu melihat ada agent yang salah paham aturan di tengah sprint, jangan cuma marahi di chat. Perbaiki kalimat di playbook, lalu commit. Sistem kerja AI kamu bakal makin matang seiring waktu.
- **Bikin playbook yang modular:** Prompt 2.000 baris yang berusaha menjelaskan segalanya cuma bikin model bingung (*instruction fatigue*). Pecah jadi skill-skill kecil yang fokus pada satu tugas.
- **Terapkan aturan "Baca Dulu, Ngoding Kemudian":** Biasakan mewajibkan agent mengonfirmasi bahwa dia sudah membaca dan memahami playbook sebelum menyentuh file apa pun.

AI agent tidak akan menggantikan disiplin engineering — tools ini justru mempertegasnya. Dengan playbook yang jelas, kita berhenti mengasuh auto-complete dan mulai mengorkestrasi sistem engineering yang rapi dan terukur.
