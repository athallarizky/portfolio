# Zero-Tool Agent: Otomasi Monitoring Server Tanpa Bikin Waswas

## Fantasi Menakutkan Bernama Autonomous Sysadmin

Di skena AI ops, ada tren visualisasi yang terlihat sangat keren: kita beri LLM agent akses terminal penuh, private key SSH, dan akses root. Begitu server bermasalah atau RAM mendadak naik, si agent langsung login otomatis, menjalankan command, ngotak-ngatik file konfigurasi, lalu me-restart service sendirian.

Kedengarannya canggih dan futuristik, sampai kita ingat sifat dasar LLM: **probabilistik dan bisa berhalusinasi**.

Model bisa saja salah membaca output log. Saat panik melihat kapasitas disk 95%, bisa saja si agent mengeksekusi `rm -rf /tmp/*` atau menjalankan migrasi database yang destruktif gara-gara salah menafsirkan status code systemd. Memberi tools eksekusi tanpa batas kepada AI di server production bukan otomasi — itu namanya main rolet Rusia.

Apakah artinya AI tidak punya tempat di urusan server monitoring? Tentu tidak. Solusinya adalah mendefinisikan ulang batas kerjanya: **Dokter mendiagnosis, bukan mengoperasi**.

## Pola Zero-Tool Agent

Di repo toolkit server saya (`agent-ops`), ada agent monitoring bernama `doctor`. Kerjanya berkala lewat cron job di VPS: memantau kondisi server, menganalisis penurunan performa, dan melaporkan anomali.

Yang paling krusial: `doctor` punya **zero execution tools**. Dia tidak punya akses shell, tidak memegang credential database, dan tidak punya kunci SSH. Dia sama sekali tidak bisa menyentuh file di disk atau me-restart proses apa pun.

Arsitekturnya memisahkan kerja deterministik dengan penalaran AI secara sangat tegas:

1. **Pengumpulan Data Deterministik (Cepat & Gratis):**
   Script TypeScript ringan membaca metrik vital server langsung dari OS: beban CPU, sisa RAM, pemakaian swap, sisa disk, status service systemd, dan latency response HTTP.
2. **Klasifikasi Deterministik:**
   Script mengevaluasi angka-angka tadi menggunakan rule dan batasan threshold yang ketat (termasuk filter anti-flapping). Apakah disk di atas 85%? Apakah Nginx berjalan normal? Apakah swap melonjak lebih dari 20% dalam satu jam?
3. **Jalur Cepat Tanpa Token (Zero-Token Path):**
   Kalau semua metrik normal (`green`), script cukup menulis satu baris log lalu selesai (exit). Nol panggilan ke API LLM. Biayanya $0, tidak makan token sama sekali, dan beban server tetap minim.
4. **Penalaran Diagnostik Hanya Saat Terjadi Anomali:**
   Hanya saat ada threshold yang jebol, script memanggil LLM. Tapi alih-alih menyuruhnya "memperbaiki" server, script cuma menyodorkan snapshot JSON dari metrik yang bermasalah dengan instruksi spesifik: *"Ini snapshot anomalinya. Analisis kemungkinan root cause, evaluasi risikonya, dan buatkan ringkasan incident report."*
5. **Pelaporan Terstruktur:**
   Script mengambil hasil diagnosa teks dari LLM tadi, lalu otomatis mem-posting-nya menjadi GitHub Issue. Script juga menghitung fingerprint kriptografis dari anomali tersebut, jadi tidak akan ada duplikasi issue kalau anomali yang sama masih berlangsung di jadwal cron berikutnya. Begitu metrik normal kembali, script otomatis menutup issue tersebut.

## Kenapa Memisahkan Penalaran dari Eksekusi Itu Krusial?

Dengan melucuti tools dari si agent, kita mematikan risiko paling fatal dalam adopsi AI: tindakan destruktif yang tidak disengaja.

- **Zero Blast Radius:** Sekalipun model berhalusinasi parah atau ngawur, dia tidak punya kemampuan teknis buat merusak server. Efek samping paling buruknya cuma teks aneh di sebuah GitHub issue.
- **Efisiensi Biaya Maksimal:** Memanggil LLM di setiap putaran cron tiap menit atau jam itu boros luar biasa. Dengan menyaring lewat rule deterministik, 99.9% pengecekan normal selesai dalam hitungan milidetik secara gratis. LLM cuma dibangunkan saat kita benar-benar butuh kemampuan analisis konteksnya.
- **Notifikasi Berkualitas Tinggi:** Monitoring biasa biasanya cuma spam grafik atau alert yang bikin pusing di grup chat. Diagnostic agent merangkum korelasi antar metrik (misal: "Disk 91% DAN backup SQLite gagal 12 menit lalu") menjadi penjelasan bahasa manusia yang langsung to-the-point.

## Pelajaran Berharga

Membangun `agent-ops` membuktikan satu prinsip penting dalam rekayasa AI production: **agent terbaik sering kali adalah agent yang memegang tools paling sedikit**.

Jangan serahkan ke LLM apa yang bisa dikerjakan dengan andal oleh logika `if/else` biasa. Biarkan kode deterministik mengumpulkan fakta, menghitung angka, dan menyaring kebisingan data. Simpan kekuatan LLM untuk tugas aslinya: mengurai ambiguitas, menghubungkan konteks masalah, dan menjelaskannya ke manusia.

Saat membangun ops agent, jangan ciptakan sysadmin bayangan yang liar. Cukup bangun dokter yang teliti: mengamati fakta, melaporkan diagnosis, dan menyerahkan pisau bedah ke tangan manusia.
