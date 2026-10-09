# Mengaudit Model AI Decision: Pelajaran Menguji JEV pada 1.500+ Lead

## Jebakan Ilusi "Confidence Score"

Ketika sebuah model machine learning atau AI decision API mengembalikan angka desimal seperti `0.85`, intuisi kita sebagai manusia biasanya langsung mengambil kesimpulan praktis: *"Berarti peluang kejadian ini terjadi adalah 85% dong."*

Tim produk dan engineer sangat suka ilusi ini. Rasanya rapi, kuantitatif, dan meyakinkan. Tanpa ragu, kita langsung bikin logika otomatisasi di kode aplikasi:

```typescript
if (lead.score > 0.8) {
  assignDedicatedAccountExecutive(lead)
} else if (lead.score < 0.2) {
  dropFromOutreachQueue(lead)
}
```

Padahal kenyataannya berbahaya: **skor confidence mentah dari AI hampir tidak pernah mencerminkan probabilitas nyata**. Sebagian besar model neural network dan black-box komersial hanya mengeluarkan ranking logit relatif yang dimampatkan lewat fungsi aktivasi. Skor `0.85` di dunia nyata bisa saja cuma berkonversi 40% — atau malah 95% — tergantung seberapa cocok distribusi data saat itu.

Saat membangun **Kodeva** (platform SaaS B2B untuk UMKM), kami memutuskan menjadikan project ini sebagai laboratorium empiris untuk membuktikannya langsung. Kami mengintegrasikan **JEV** — model AI decision mutakhir dari TypeSafe AI — untuk use case skoring lead penjualan, lalu melakukan audit kalibrasi secara menyeluruh.

Berikut hasil temuan kami setelah menguji 1.570 lead sintetis di tiga skenario ekonomi makro yang berbeda.

## Setup Audit: Memegang Kunci Ground Truth Sendiri

Kalau kita menguji model AI hanya menggunakan data historis lead di database kantor, kita pasti terjebak masalah bias seleksi: tim sales sudah terlanjur memprioritaskan lead tertentu, dan lead yang diabaikan tidak pernah kita ketahui hasil akhirnya.

Agar auditnya objektif, kami membangun **generator ground-truth deterministik** di TypeScript menggunakan PRNG ber-seed (`Mulberry32`). Generator ini mensimulasikan 1.570 data lead di 3 skenario dunia yang berbeda:

1. **Dunia Baseline (konversi nyata 18.1%):** Distribusi marketing normal dari Google Search, Instagram, dan traffic organik.
2. **Dunia Drift-Source (konversi nyata 20.4%):** Pergeseran traffic ke channel akuisisi media sosial yang lebih dingin.
3. **Dunia Drift-Price (konversi nyata 6.5%):** Kondisi saat harga naik tajam dan daya beli pasar melemah drastis.

Generator ini memegang probabilitas sejati (`pTrue`) dan outcome biner yang dirahasiakan total dari model. JEV hanya melihat profil data lead (sumber UTM, channel kontak WhatsApp/email, durasi mengisi form, landing page), lalu diminta menjawab apakah calon customer ini akan membeli lisensi dalam 30 hari.

## Temuan 1: Skor Mentah AI Ternyata Statis dan Buta Terhadap Perubahan Dunia

Hasil pengujiannya sangat mengejutkan. Model AI tidak mengeluarkan probabilitas dinamis, melainkan angka yang cenderung konstan:

| Skenario Dunia | Rata-rata Skor JEV | Tingkat Konversi Nyata | Expected Calibration Error (ECE) |
|---|---|---|---|
| **Baseline** | `0.419` | **18.1%** | `0.238` |
| **Drift-Source** | `0.414` | **20.4%** | `0.210` |
| **Drift-Price** | `0.418` | **6.5%** | **0.352** |

Perhatikan polanya: saat konversi nyata anjlok drastis dari 20.4% ke 6.5%, skor prediksi JEV tetap anteng di kisaran `~0.42`.

Di dunia kenaikan harga (*drift-price*), JEV memprediksi peluang konversi 41.8% untuk lead yang aslinya cuma punya peluang sukses 6.5%. Artinya, model ini **6.4× lipat overconfident**. AI sama sekali tidak punya sensor bawaan untuk mendeteksi pergeseran pasar makro. Bayangkan kalau tim sales menyambungkan skor mentah ini ke otomatisasi anggaran iklan — uang operasional bakal habis mengejar lead yang peluang belinya nyaris nol.

## Temuan 2: Platt Scaling Menyelesaikan Miskalibrasi dengan Murah

Kabar baiknya: miskalibrasi ini bukan akhir dari segalanya, asalkan kita sadar batasannya.

Kami membungkus output skor mentah JEV dengan teknik statistik klasik bernama **Platt scaling** — regresi logistik 2 parameter di atas nilai logit prediksi:

$$p_{\text{calibrated}} = \frac{1}{1 + e^{-(a \cdot \text{logit}(p) + b)}}$$

Koreksi sederhana ini memangkas Expected Calibration Error (ECE) dari **0.267 menjadi kurang dari 0.02** (in-sample 0.002, out-of-sample 0.008–0.021).

Yang paling menarik adalah kurva belajarnya (*learning curve*): formula kalibrasi ini sudah mendatar sempurna hanya dengan **$n \approx 50$ sampel data berlabel**.

Kita nggak butuh ribuan data baru atau proses training ulang model dari awal yang mahal. Cukup catat 50 hasil konversi riil pertama di bisnis kita, lalu pasang wrapper Platt scaling. Seketika itu juga, angka prediksi black-box model AI langsung terkalibrasi akurat dengan kondisi lapangan.

## Temuan 3: Margin adalah Sinyal Kejujuran Model

Selain skor probabilitas utama, JEV mengeluarkan metrik sekunder berupa selisih keyakinan (*margin*).

Saat kami mengukur korelasi peringkat Spearman antara margin ini dengan selisih error prediksi ($|p - p_{\text{true}}|$), hasilnya menunjukkan korelasi negatif yang konsisten kuat:

$$\rho = -0.43 \text{ s/d } -0.55$$

Sederhananya: ketika JEV merasa yakin (margin tinggi), angka skornya memang terbukti jauh lebih dekat ke kenyataan. Begitu marginnya sempit, error prediksinya melonjak. Berbeda dengan skor probabilitas mentah yang overconfident, metrik margin terbukti jujur sejak awal tanpa perlu koreksi tambahan.

## Pelajaran Arsitektur untuk Implementasi AI di Produksi

Eksperimen di Kodeva ini menghasilkan tiga prinsip arsitektur penting saat memakai AI decision model:

1. **Terapkan Prinsip Advisory-Only:** Jangan pernah menyambungkan skor AI secara langsung ke aksi otomatis yang tidak bisa dibatalkan (*irreversible actions*). Di Kodeva, kami menampilkan Potensi Konversi terkoreksi (`pPlatt`) dan lencana prioritas (🔴 Tinggi / 🟡 Sedang / 🟢 Rendah) di dashboard admin untuk membantu sales person manusia, tapi sistem dilarang menolak lead otomatis.
2. **Kalibrasi Sebelum Dikonsumsi:** Kalau ada vendor AI mengklaim API mereka menghasilkan "probabilitas terkalibrasi", jangan percaya begitu saja. Anggap model tersebut belum terkalibrasi sampai kamu membuktikannya sendiri, lalu pasang kalibrasi logistik sederhana di 50 data pertama.
3. **Pisahkan Instrumen Penguji dari Model:** Bungkus model eksternal di balik interface dan buat implementasi mock yang bisa disuntikkan bias buatan. Membuktikan bahwa alat pengujian kita mampu mendeteksi bias adalah satu-satunya cara agar kita bisa percaya hasil evaluasi pada model sungguhan.

AI decision model adalah terobosan luar biasa untuk efisiensi bisnis. Tapi memperlakukan skor confidence mentah mereka sebagai kepastian mutlak adalah risiko operasional yang nyata. Dengan sedikit sentuhan statistika klasik dan arsitektur perangkat lunak yang hati-hati, kita bisa mengubah skor mentah yang menipu menjadi alat bantu keputusan yang bisa diandalkan.
