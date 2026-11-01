# Guardian: Anjing Penjaga Keamanan yang Hidup di Luar Brankas

> 2026-11-01 · 5 min read

Seseorang menanam malware tidur di kode saya — menyamar sebagai font dan pengaturan editor, dikirim lewat commit yang tampak persis milik saya. Ini alasan jawabannya adalah penjaga yang hidup di luar repositori saya, dan apa yang itu ajarkan tentang kepercayaan.

**Tags:** github, learning (shared dengan EN)
**Author:** Athalla Rizky

---

## Commit yang Tampak Seperti Milik Saya

Pada Oktober 2026, pemeriksaan rutin atas repositori saya sendiri menemukan sesuatu yang mengganggu: commit yang membawa **pesan commit saya, tanggal saya, nama author saya** — tapi saya tidak pernah membuatnya. Seseorang telah menulis ulang riwayat di bawah permadani, menanam material asing di dalam commit kembar yang dirancang untuk lolos dari pandangan sekilas.

Ini kelas serangan nyata, dan punya nama: **kampanye supply-chain**. Idenya bukan menerobos komputermu dengan gebrakan. Idennya menyelinapkan barang-barang senyap ke tempat yang sudah kamu percaya — kode kamu sendiri — lalu menunggu.

## yang Sebenarnya Ditanam

Supaya jelas tentang ancamannya tanpa jargon, ini terjemahan apa yang ditanam kampanye tersebut:

- **Jebakan yang tersambung ke pintu editormu.** File konfigurasi mungil yang membuat code editor menjalankan sesuatu *seketika kamu membuka foldernya*. Kamu tidak mengklik apa pun. Membuka project-nya adalah pemicunya.
- **Font palsu yang sebenarnya kode.** File bernama seperti aset font yang tak berdosa — padahal teks terselubung, menunggu untuk mengambil dan menjalankan hal-hal lebih buruk dari internet.
- **Penumpang di build-mu.** Tambahan kecil pada file config yang sudah ada, supaya payload juga bangun saat kamu membangun atau mengembangkan project seperti biasa.

Semuanya **tidur**, dan semuanya **terselubung**. File font itu sungguhan font di luar. File editor itu pengaturan yang tampak mati. Masing-masing bagian bisa bicara manis melewati penjaga. Justru *kombinasinya* — dan fakta bahwa folder font muncul semalam di project yang tak pernah memilikinya — yang membongkar kampanye itu.

## Kenapa Kamu Tak Bisa Menjaga Brankas dengan Kunci Maling

Insting pertama saya jelas: pasang perlindungan *di dalam* repositori. Sebuah pemeriksaan, sebuah script, sebuah aturan.

Lalu cacatnya menyadarkanmu. **Kunci curian yang sama yang memasukkan penyerang juga bisa mematikan apa pun yang tersimpan di dalam.** Workflow, proteksi, script revert — semuanya cuma file di dalam repo. Gembok di dalam brankas hanya setiada pemegang kunci paling tidak dipercaya dari brankas itu.

Wawasan tunggal itu membentuk semua yang menyusul: **penjaganya harus hidup di luar radius ledakan.**

## Apa Itu Guardian

[Guardian](https://github.com/athallarizky/guardian) adalah jawaban saya: penjaga keamanan yang hidup di tempat terpisahnya sendiri dan **mengelilingi setiap project yang saya miliki, secara terjadwal, mencari sidik jari kampanye ini persis** — jebakan editor, folder font palsu, penumpang config, string loader-nya.

Saat menemukan sesuatu, dua hal terjadi: ia **mengajukan laporan** (sebuah issue, supaya tak ada yang hilang), dan ia **mengetuk ponsel saya** — notifikasi Telegram menyebut nama repositori sesungguhnya. Bukan peringatan kabur; nama asli, seketika.

Dan menurut desain, penyusup tak bisa membisukannya. Kredensial Guardian hanya bisa **membaca**. Tak ada yang bisa ia edit, matikan, atau hapus — termasuk alarm Guardian sendiri.

## Jam Alarm butuh Jam Alarm Sendiri

Realitas menambahkan bab yang tak terprediksi rencana mana pun. Setelah kampanye itu, scheduler milik GitHub sendiri mulai *diam-diam* melewatkan pemeriksaan per jam Guardian — run-nya cuma tidak terjadi, tanpa error di mana pun.

Perbaikannya nyaris komedi: heartbeat kecil independen di Cloudflare yang memeriksa "apakah Guardian benar-benar berjalan belakangan ini?" — dan memicunya ulang kalau jadwalnya senyap. Jam alarm cadangan untuk jam alarm. Nyaris tanpa biaya, hidup di platform ketiga, dan hidup damai dengan jadwal aslinya: siapa pun yang menyala duluan menang, dan tak ada yang jalan dua kali.

## Tiga Pelajaran yang Layak Disimpan

- **Penyamaran mengalahkan "kelihatannya mencurigakan."** Font yang ditanam adalah font sungguhan; pengaturannya JSON yang valid. Deteksi yang bertanya *"apakah file ini tampak jahat?"* kalah. Deteksi yang bertanya *"kenapa ada folder font di project yang tak pernah memilikinya?"* menang. Kehadiran dan penempatan, bukan penampilan.
- **Kontrol harus hidup di luar radius ledakan.** Perlindungan apa pun yang bisa diedit kredensial penyerang bukanlah perlindungan — itu dekorasi.
- **Kesunyian bukan keamanan.** Pada awalnya, satu run yang kena throttle gagal mengambil data dan melaporkan semuanya bersih. Sejak itu, setiap kegagalan adalah ERROR yang keras, bukan centang hijau. Pemeriksaan yang bisa gagal secara diam lebih buruk daripada tak ada pemeriksaan.

## Akhir yang Jujur

Kampanye itu tertangkap, riwayat yang ditanam dibersihkan, dan si penjaga kini berjalan entah ada yang mengingatnya atau tidak — yang memang seluruh inti penjaga. Tak ada di sini yang butuh keahlian eksotis. Cukup satu pertanyaan tak nyaman yang dijadikan serius:

> *Kalau seseorang sudah memegang kunci semua yang saya miliki, apa yang tersisa yang **tak bisa** mereka sentuh?*

Guardian adalah jawaban saya atas pertanyaan itu. Ia tidak berada di dalam brankas. Justru itu fiturnya.

## FAQ

**Apa itu serangan supply-chain, dengan bahasa sederhana?**

Alih-alih menyerang komputermu secara langsung, penyerang menyelinapkan kode berbahaya ke sesuatu yang sudah kamu percaya — library yang kamu pasang, tool yang kamu pakai, atau repositorimu sendiri. Kerusakannya datang menyamar sebagai bagian dari alur kerja normalmu, itu sebabnya peringatan biasa tidak berbunyi.

**Kenapa perlindungannya tidak bisa hidup di dalam repositori saja?**

Karena apa pun yang tersimpan di dalam repositori — workflow, script, pengaturan — bisa diedit atau dihapus oleh siapa pun yang memegang akses tulisnya. Kredensial curian yang sama yang membuat penyerang menanam kode juga bisa mematikan penjaga yang tersimpan di sampingnya. Karena itu Guardian berjalan dari tempat terpisah dengan akses baca-saja.

**Apa yang terjadi ketika Guardian menemukan sesuatu?**

Ia mengajukan GitHub issue supaya temuan terlacak dan tidak dobel, dan mengirim notifikasi Telegram ke grup privat yang menyebut nama repositori sesungguhnya yang terdampak. Nama repo di issue publik disamarkan dengan kode turunan; nama aslinya hanya muncul di notifikasi privat.

---

*Generated by tools/article-polish. Import via the publish pipeline.*
