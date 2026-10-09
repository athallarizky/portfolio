# Kodeva

## Ringkasan Teknis

`Kodeva` adalah ekosistem digital storefront B2B SaaS dan platform riset decision-science yang dibangun untuk operasional bisnis UMKM di Indonesia (mencakup aplikasi POS Kasir, HR & Payroll, hingga add-on langganan cloud). Selain berfungsi sebagai toko online software performa tinggi, Kodeva dirancang khusus sebagai wahana riset produksi (*research vehicle*) untuk mengaudit model decision AI pihak ketiga (secara spesifik engine **JEV dari TypeSafe AI**) pada use case skoring lead masuk.

Dibangun dengan Next.js 16 App Router dan runtime **embedded Payload CMS 3** di atas database serverless PostgreSQL (Neon), arsitektur ini memangkas batas jaringan antar service dengan menyatukan CMS dan aplikasi storefront dalam satu proses Node.js. Platform ini juga memuat modul internal **Decision Lab** (`/admin/decision-lab`) yang menguji kalibrasi model, Expected Calibration Error (ECE), dan koreksi Platt scaling pada ribuan data sintetis secara empiris.

## Arsitektur & Alur Pipeline

```
[ Form Lead / Funnel Storefront ] (/api/leads)
                   │
                   ▼
     [ Ekstraksi Fitur ] (UTM source, channel kontak, waktu pengisian, landing page)
                   │
                   ▼
    [ Interface JevClient ]
    ├── MockJevClient (Positive control: disuntikkan bias per decile & noise σ)
    └── RealJevClient (Koneksi live ke api.typesafe.ai — noul p + choice margin)
                   │
                   ▼
    [ Engine Kalibrasi Keputusan ] (src/lib/jev/)\n    ├── Expected Calibration Error (ECE vs Ground-Truth pTrue)
    ├── Brier Loss Score
    └── Post-Hoc Platt Scaler: pPlatt = σ(a · logit(p) + b)
                   │
                   ▼
     [ Pipeline Penjualan Advisory ] (/admin/leads)
    ├── Skor Terkoreksi 'Potensi Konversi' (pPlatt ?? p, dibulatkan 2 desimal)
    ├── Tier Prioritas Kontak (🔴 Tinggi / 🟡 Sedang / 🟢 Rendah)
    └── Log Audit Permanen (latencyMs, payload mentah model, token audit)
```

## Inovasi Arsitektur Utama

1. **Embedded Payload 3 di Next.js 16:** Next.js App Router dan Payload CMS berjalan berdampingan di satu runtime. Frontend mengambil data langsung lewat in-process **Local API**, query database lokal tanpa latensi HTTP round-trip. Sinkronisasi data menggunakan strategi caching 2 lapis: on-demand tag revalidation (`revalidateTag`) instan saat admin mempublikasikan konten, dipadukan fallback ISR berbasis waktu.
2. **Generator Ground-Truth Deterministik (`generator.ts`):** Supaya audit model AI tidak terjebak bias subjektif, engine pengujian memakai PRNG Mulberry32 ber-seed untuk membuat 1.570 lead sintetis unik di 3 skenario dunia ekonomi makro:
   - **Baseline:** Distribusi marketing standar (tingkat konversi nyata 18.1%).
   - **Drift-Source:** Pergeseran channel akuisisi ke traffic sosial dingin (konversi nyata 20.4%).
   - **Drift-Price:** Tekanan ekonomi makro saat harga naik (konversi nyata 6.5%).
   Generator ini memegang probabilitas konversi sejati (`pTrue`) dan hasil konversi biner yang dirahasiakan total dari model AI.
3. **Positive Control Berbasis Mock (`MockJevClient`):** Sebelum membakar biaya kuota API ke penyedia AI, instrumen statistik (ECE, Brier) diverifikasi dulu menggunakan mock client yang sengaja disuntikkan bias desil. Ini membuktikan alat auditnya sudah valid sebelum menguji model sungguhan.
4. **Hasil Audit Empiris Model JEV:**
   - **Skor Mentah Mengalami Miskalibrasi:** Skor mentah JEV selalu keluar di angka flat `~0.42` di ketiga skenario dunia, benar-benar buta terhadap pergeseran distribusi. Pada skenario harga naik (konversi nyata cuma 6.5%), JEV tetap mengklaim peluang 41.8% (~6.4× lipat overconfident, ECE 0.352).
   - **Perbaikan Murah via Platt Scaling:** Pembungkusan logistik 2 parameter ($a=1.406, b=-1.261$) memangkas ECE dari 0.267 menjadi `< 0.02`. Kurva belajar membuktikan kalibrasi sudah optimal hanya dengan **$n \approx 50$ lead berlabel**.
   - **Validitas Margin Keyakinan:** Metrik selisih margin internal terbukti berkorelasi negatif kuat ($\rho = -0.43 \text{ s/d } -0.55$) terhadap error prediksi — menjadikannya satu-satunya indikator ketidakpastian yang informatif tanpa perlu dikoreksi.
5. **Pagar Keamanan Advisory-Only di Produksi:** Karena model statistik selalu punya potensi salah fatal di area ekor (*distribution tails*), skor AI dilarang keras memicu aksi otomatis (seperti auto-reject lead). Skor disajikan sebagai nilai saran (*advisory*) bersama tier prioritas untuk mempermudah tim sales manusia.
6. **Nol Cumulative Layout Shift (CLS):** Halaman publik mempertahankan skor Lighthouse mobile **CLS = 0.000**, Best Practices 100, SEO 100, dan Performance >90 berkat server-side rendering deterministik dan layout CSS presisi.
