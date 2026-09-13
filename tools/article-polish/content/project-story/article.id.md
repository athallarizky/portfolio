# Kenapa Satu Prompt Selalu Gagal Menulis Tech Story (dan Cara Multi-Agent Mengatasinya)

## Jebakan Monolithic Prompt

Hampir semua orang yang mencoba bikin artikel teknis pakai AI pasti pernah terjebak di pola mengecewakan ini:

Kamu menyalin link GitHub atau beberapa potong kode ke ChatGPT atau Claude, lalu ngetik: *"Buatkan artikel blog yang menarik dan mendalam tentang project ini, pakai gaya bahasa saya ya."*

Hasilnya? Hampir selalu hambar dan tidak enak dibaca:

- Dibuka dengan klise membosankan macam: *"Di era transformasi digital yang serba cepat ini..."*
- Paragrafnya dijejali buzzword kosong (*game-changer, seamless, cutting-edge, revolusioner*).
- Cerita-cerita teknis yang justru paling menarik malah terlewat (misal: kenapa kamu memilih SQLite daripada Postgres, atau drama debugging race condition yang menghabiskan waktu semalaman suntuk).

Kenapa bisa begini? Karena menulis cerita engineering yang berbobot itu menuntut dua mode berpikir yang saling bertolak belakang: **pemahaman kode yang dingin dan analitis**, serta **penyampaian cerita manusia yang hangat dan berkarakter**.

Saat kamu memaksa satu prompt tunggal melakukan dua hal itu sekaligus, modelnya bakal mengambil jalan kompromi terburuk. Analisis kodenya jadi dangkal, dan gaya bahasanya jatuh ke gaya robotik standar AI.

## Pembagian Tugas Ala Multi-Agent

Untuk menyelesaikan masalah ini, saya membangun `project-story`: pipeline otomasi penulisan konten teknis berbasis multi-agent graph di TypeScript.

Daripada menuntut satu model serba bisa menyelesaikan semuanya, `project-story` membagi pekerjaan ke empat agent spesialis di bawah koordinasi satu supervisor:

```
                  ┌────────────────┐
                  │   Supervisor   │
                  └──┬───────────┬─┘
                     │           │
          ┌──────────▼──┐     ┌──▼────────────┐
          │ Researcher  │     │ Style Analyzer│
          └──────────┬──┘     └──┬────────────┘
                     │           │
                     └─────┬─────┘
                           ▼
                    ┌──────────────┐
                    │    Writer    │
                    └──────────────┘
```

1. **The Researcher:**
   Tugasnya cuma satu: membedah codebase secara faktual. Dia melakukan clone repo, memeriksa manifest dependensi (`package.json`, `go.mod`), memetakan struktur direktori, dan membaca file arsitektur utama. Agent ini sama sekali tidak menulis artikel. Output-nya murni berupa laporan teknis faktual: problem statement, alur arsitektur, dependensi kunci, dan trade-off teknis.
2. **The Style Analyzer:**
   Agent ini tidak pernah melihat source code sama sekali. Dia cuma membaca panduan gaya penulisan (`SKILL.md`) dan contoh-contoh artikel lama yang performanya bagus. Dari situ, dia mengekstrak aturan gaya bahasa: ritme panjang kalimat, pilihan analogi favorit, daftar buzzword terlarang, hingga batasan kedalaman teknis.
3. **The Writer:**
   Writer menerima laporan fakta dari Researcher dan aturan nada bicara dari Style Analyzer. Dia tidak perlu menebak-nebak cara kerja kode (faktanya sudah divalidasi oleh Researcher), dan dia tidak perlu bingung menentukan tone tulisan (aturannya sudah dirangkum oleh Style Analyzer). Energi komputasinya 100% dialokasikan untuk merangkai cerita yang mengalir dan enak dibaca.
4. **The Supervisor:**
   Mengatur transisi status pada graph, memastikan setiap agent menyelesaikan output-nya sebelum diteruskan ke fase berikutnya.

## Kenapa Pemisahan Tanggung Jawab (Separation of Concerns) Itu Menang?

Memecah alur kerja menjadi peran-peran terisolasi memberi keuntungan telak dibanding prompt raksasa:

- **Nol Halusinasi Fakta Teknis:** Karena Researcher mengumpulkan fakta lebih dulu ke dalam objek state terstruktur, Writer mustahil mengarang API atau library fiktif. Semua klaim teknis berakar langsung dari inspeksi repo asli.
- **Gaya Bahasa Konsisten:** Memisahkan ekstraksi gaya dari pemahaman kode bikin format tulisan jadi modular. Dari satu laporan riset yang sama, kita bisa mengubah output-nya kapan saja: mau jadi blog santai ala senior engineer, thread ringkas di Twitter/X, atau dokumen RFC arsitektur internal.
- **Gampang di-Debug:** Kalau artikel terasa terlalu dangkal, kita tahu Researcher kurang dalam menggali kode. Kalau bahasanya terasa kaku, kita tahu Style Analyzer belum menangkap pola persona dengan tepat. Kita bisa mengevaluasi artefak per tahap tanpa harus mengulang seluruh proses dari awal.

## Pelajaran Penting

Pengalaman mengembangkan `project-story` menegaskan satu prinsip mendasar tentang autonomous agent: **spesialisasi selalu mengalahkan generalisasi**.

Di dunia nyata, kita tidak mungkin menugaskan satu orang yang sama untuk merangkap sebagai systems architect, copywriter brand, sekaligus project manager dalam satu tarikan napas. Kita membagi tugas secara terukur dengan input dan output yang jelas.

Prinsip yang sama berlaku untuk LLM. Jangan tulis prompt 5 halaman yang menuntut satu model mengenakan sepuluh topi berbeda. Bangunlah jaringan agent kecil yang fokus melakukan satu tugas dengan sangat baik — lalu biarkan mereka berkolaborasi.
