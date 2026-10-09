# Eksperimen Mengontrol HP Android Pakai AI Agent (Tanpa Root)

## Mengajak AI Agent Masuk ke HP Android

Sebagian besar AI agent yang kita lihat saat ini biasanya bermain aman di dalam browser web atau terminal desktop. Tapi kalau kita bicara aktivitas sehari-hari — belanja bulanan, pesan ojek online, dompet digital, sampai kirim pesan — semuanya hidup di dalam aplikasi native smartphone.

Baru-baru ini saya riset gimana caranya bikin agent yang bisa kontrol device Android secara mandiri (mirip konsep OpenClaw atau Hermes). Eksperimen ini berhasil dengan use case otomasi aplikasi belanja ritel seperti **Klik Indomaret** dan **Alfagift**: dari buka app, mencari produk, sampai memasukkannya ke keranjang belanja.

Sebenarnya core yang kita butuhkan cuma ada 2 komponen sederhana:

1. **LLM / Orchestrator:** Otak dan matanya (menentukan langkah berikutnya, baca situasi layar, dan handle pop-up).
2. **AccessibilityService:** Tangannya (eksekusi fisik: tap layar, swipe, typing teks, dan inspect elemen).

## Tembok Keamanan Android 14+

Kalau kamu pernah bikin otomasi Android via ADB (`adb shell input tap`), Appium, atau uiautomator2, mungkin kamu mikir kontrol HP itu urusan gampang.

Ternyata di versi Android modern (saya uji langsung di Android 16 HyperOS), **seluruh injeksi input berbasis shell diblokir total**. Sistem operasi bakal melempar security exception: `INJECT_EVENTS requires system permissions`.

Satu-satunya jalur non-root resmi yang tersisa adalah **AccessibilityService** dengan izin gesture (`canPerformGestures="true"`). Lewat fungsi `AccessibilityService.dispatchGesture()`, perintah tap dan swipe diproses langsung oleh `AccessibilityManagerService`, sehingga bypass proteksi `INJECT_EVENTS` secara legal.

Solusinya: saya menjalankan daemon HTTP JavaScript kecil di dalam aplikasi open-source **AutoJs6**. Daemon ini membuka port lokal `9318`, sehingga LLM orchestrator (Claude Code harness atau Hermes-termux) bisa menyuruh HP tap dan swipe lewat pemanggilan REST API biasa.

## Alur "Mengajari" Agent di Aplikasi Mobile

Sebenarnya buat otomasi kedua app tadi, best practice paling gampang tentu via browser web ketimbang mobile app-nya langsung. Tapi inti yang dipelajari di sini adalah: *gimana caranya agent bisa hidup di perangkat Android kita, dan gimana alur melatihnya?*

Singkatnya, flow mengajarkan agent kira-kira seperti ini:

1. **Kalibrasi Window Bounds:** Suruh agent mendeteksi area aktif aplikasi. Misalnya saat mode split-screen atau beda resolusi device, agent harus tahu batasan koordinat layar biar tap-nya tidak meleset.
2. **Inspeksi Elemen Dulu (0 Cost Token):** Sebelum buru-buru menyuruh AI "melihat" lewat screenshot, manfaatkan tree AccessibilityService. Service ini sangat powerful buat membaca posisi teks, button, dan koordinat bounds elemen secara langsung — mirip *Inspect Element* di browser. Metode ini memakan waktu milidetik dan **nol biaya token LLM**.
3. **Partial Vision Screenshot Saat Mentok:** Kadang pas debugging atau ketemu view canvas promo yang ter-obfuscate, agent memang butuh "melihat" lewat screenshot (multimodal vision). Nah, catatan pentingnya: **biaya vision dihitung dari dimensi pixel gambar, bukan dari isi kontennya**. Kirain screenshot dominan teks lebih murah, ternyata sama saja mahalnya. Trik hematnya: suruh agent screenshot parsial (crop area atas beberapa pixel saja buat cari search bar). Biaya token terpangkas drastis tapi konteks visual tetap terjaga.
4. **Kunci Workflow ke Data Terstruktur:** Begitu agent berhasil menemukan urutan langkah yang pas, simpan alurnya ke format data terstruktur (JSON). Jadi untuk eksekusi belanja rutin berikutnya, sistem tinggal me-replay koordinat tanpa perlu looping trial-and-error yang boros biaya.

## Perhatikan Batasan Keamanan

Mengizinkan Accessibility Service artinya memberi AI kunci masuk buat melakukan hampir apa saja di HP kita. Bayangkan kalau agent-nya dilepas tanpa batas lalu salah halusinasi: dia bisa saja checkout barang terus-terusan, atau membaca session perbankan yang tersimpan.

Makanya batasan guardrails itu hukumnya wajib:
- **Batasi Scope Aksi:** Suruh agent hanya untuk tugas non-sensitif (cari barang dan add-to-cart). Tahap sensitif seperti checkout final, input PIN pembayaran, atau otentikasi biometrik harus tetap berada di tangan manusia.
- **Kunci Akses Jaringan:** Pastikan server HTTP hanya listen di interface localhost (`127.0.0.1`) atau pasang shared secret header biar HP tidak bisa dikontrol oleh orang lain di jaringan Wi-Fi yang sama.

Masa depan personal AI agent jelas bergerak ke mobile. Dengan memahami batas keamanan OS dan mengoptimalkan biaya vision, kita bisa bikin asisten cerdas yang beneran fungsional di saku kita.
