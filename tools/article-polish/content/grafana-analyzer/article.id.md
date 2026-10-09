# Menerjemahkan Log Grafana Menjadi Bahasa Manusia dengan AI Agent

## Dilema Triage Bug Saat Engineer Sibuk

Di Kitabisa, sering banget kejadian ketika ada laporan bug masuk dari user, tapi seluruh engineer lagi sibuk ngerjain hal mendesak lainnya. Di saat yang sama, Product Manager atau tim ops pengin tahu secepatnya: *sebenarnya masalahnya apa sih? Berdampak ke transaksi donasi atau cuma isu minor?*

Niatnya mau mandiri ngecek langsung ke dashboard Grafana... tapi pas lihat log-nya... 😅

Log-nya sangat abstrak, penuh metrik teknis, tumpukan JSON, dan error stack trace yang mustahil dipahami kalau nggak familiar sama codebase service tersebut. Ujung-ujungnya, tiket bug report itu nganggur di antrean, cuma bisa nunggu sampai ada engineer yang available buat tracing log-nya dari nol.

## Kepikiran: Kenapa Nggak Diterjemahkan Jadi Bahasa Manusia?

Dari gesekan berulang itu muncul ide sederhana: **kenapa nggak bikin tools yang bisa translate log Grafana jadi bahasa manusia?** Supaya siapapun — mau itu PM, tim ops, atau engineer baru — bisa langsung paham apa yang lagi error tanpa perlu pusing baca log mentah.

Sebenarnya Grafana sudah punya MCP (Model Context Protocol) server resminya sendiri. Tapi kalau buat kebutuhan internal tim yang spesifik, setup MCP sering terbentur urusan permission token dan konfigurasi jaringan. Jadi saya iseng coba buat sendiri tool yang lebih ringkas dan pas dengan kebutuhan sehari-hari: **Grafana Analyzer**.

Cara pakainya dibuat sesimpel mungkin. User cukup ngomong pakai bahasa percakapan sehari-hari:

> *"Tolong lihat log jam 2 siang tadi di service payment, ada error nggak, dan jelasin buat non-engineer."*

...dan dalam hitungan detik, agent langsung kasih kesimpulan yang to the point.

## Cara Kerjanya di Balik Layar

Di balik prompt percakapan yang santai itu, sistem menjalankan alur 4 langkah praktis:

1. **Ambil Session via Playwright:** Daripada pusing bikin API token atau service account baru, tool ini membuka browser Chromium lokal user via Playwright. Session login GitHub OAuth yang sudah aktif langsung ditangkap cookie-nya (`grafana_session`) dan disimpan ke cache lokal selama 12 jam.
2. **Parsing Intent Otomatis:** Input user seperti *"jam 2 siang tadi di service payment"* di-parse oleh model (Claude) menjadi parameter query terstruktur: environment (`stg`/`prod`), namespace Kubernetes (`payment`), keyword pencarian, dan rentang waktu epoch millisecond berbasis WIB (UTC+7).
3. **Parse & Normalisasi Log:** Raw log dari API Loki biasanya kotor dan penuh escape code warna terminal. Tool ini memfilter log, membersihkan karakter ANSI, dan membatasi data hanya pada 500 baris terbaru supaya hemat token dan nggak bikin context LLM kepenuhan.
4. **Terjemahkan Pakai LLM:** Log yang sudah rapi dikirim ke Claude dengan instruksi khusus: cari root cause error-nya, abaikan noise yang nggak relevan, lalu jelaskan dalam bahasa manusia yang ramah non-engineer.

Hasilnya? Tim non-engineer langsung dapat jawaban konkret:

> *"Sekitar jam 14.05, service payment sempat kena database connection timeout ke replica utama. Nggak ada saldo user yang hilang, tapi ada 12 transaksi checkout yang gagal dapet konfirmasi dari payment gateway."*

Bukan cuma deretan angka error code yang bikin bingung.

## Dampak Nyata di Workflow Tim

Efek dari tool kecil ini ternyata kerasa banget di operasional sehari-hari:

- **Issue Tracing Jadi Self-Serve:** PM dan tim ops nggak perlu selalu nunggu engineer luang cuma buat tahu gambaran besar masalahnya. Mereka bisa self-serve ngecek scope kendala dalam hitungan menit.
- **Waktu Engineer Nggak Terbuang:** Pas engineer akhirnya available, mereka nggak perlu mulai investigasi dari nol lagi. Konteksnya sudah siap: service apa, jam berapa, dan komponen apa yang dicurigai error. Engineer bisa langsung fokus ke fixing code.
- **Observability yang Inklusif:** Data telemetri seharusnya bukan hal eksklusif yang cuma bisa dibaca segelintir orang. Begitu log bisa dipahami dalam bahasa sehari-hari, koordinasi satu tim jadi jauh lebih cepat.

Kadang solusi AI yang paling berdampak itu bukan agent raksasa yang serba bisa, melainkan jembatan kecil yang bisa menerjemahkan sistem teknis rumit menjadi sesuatu yang gampang dimengerti semua orang.
