# PHP Smart Semicolon

## Ringkasan Teknis

`php-auto-semicolon` adalah ekstensi editor untuk VS Code dan Cursor yang membawa kemampuan **Automatic Semicolon Insertion (ASI)** ke PHP setiap kali file di-save. Masalah klasik saat pindah dari JavaScript ke PHP adalah muscle memory titik koma: formatter populer (Laravel Pint, PHP-CS-Fixer, `@prettier/plugin-php`) bakal langsung crash saat ketemu syntax error, sehingga tidak bisa membetulkan titik koma yang hilang. Ekstensi ini bekerja layaknya alat reparasi bedah cepat yang berjalan *sebelum* formatter utama dieksekusi.

## Arsitektur Inti & Mesin Lexer

```
On Save Event
      │
      ▼
[ Document Snapshot ] ──▶ [ Single-Pass Lexer ] ──▶ [ Insertion Planner ] ──▶ [ VS Code WorkspaceEdit ]
                                 │                             │
                         - Bracket depth stack         - Skip fluent chains
                         - Masking string & komentar   - Deteksi trailing comment
                         - Detektor Heredoc/Nowdoc     - Validasi closure vs argumen
```

1. **Lexer Single-Pass Tanpa Dependensi:** Dibangun murni dengan TypeScript, lexer ini mampu memindai ~3.000 baris kode PHP dalam waktu kurang dari 2 milidetik. Tanpa overhead parser AST yang berat, ia bekerja dengan scanning karakter berbasis state machine untuk mendeteksi batas sintaksis kode.
2. **Prinsip Fail-Closed yang Aman:** Begitu lexer mendeteksi sintaks yang ambigu, blok kurung yang belum tertutup, atau multi-line string yang belum selesai, ekstensi langsung membatalkan modifikasi buffer. False negative cuma butuh kamu ngetik titik koma manual sekali; tapi false positive bisa merusak eksekusi aplikasi.
3. **Pelacakan State Konteks:**
   - **Stack Kedalaman Kurung:** Mencatat stack tanda kurung yang masih terbuka (`(`, `[`, `{`). Ekspresi di dalam parameter fungsi, array literal, atau header `if` tidak akan pernah disisipi titik koma secara prematur.
   - **Masking Literal:** Menghindari teks di dalam tanda petik tunggal, petik ganda dengan interpolasi variabel (`"halo {$name}"`), komentar satu baris (`//`, `#`), komentar blok (`/* ... */`), serta blok heredoc/nowdoc (`<<<EOD`).
   - **Sensitivitas Batas HTML/PHP:** Mampu membaca transisi antara tag inline HTML dan PHP (`<?php ... ?>`) tanpa salah tafsir.
4. **Penanganan Method Chaining:** Pemanggilan berantai multi-baris (`User::query()->where(...)->first()`) dilacak lewat keberadaan token `->` di awal atau akhir baris, dan titik koma hanya akan diletakkan pada ekspresi penutup di baris terakhir.
5. **Pembedaan Closure:** Mampu membedakan deklarasi closure yang dimasukkan ke variabel (`$callback = function () { ... };`) yang wajib diakhiri titik koma, dengan anonymous closure yang diteruskan sebagai argumen fungsi biasa (`array_map(function () { ... }, $items)`).
6. **Preservasi Komentar:** Menghitung koordinat kolom secara presisi sehingga titik koma disisipkan tepat di akhir ekspresi kode sebelum komentar sebaris (`$timeout = 5000; // milidetik`).
