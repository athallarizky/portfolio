# Grafana Analyzer

## Ringkasan Teknis

`grafana-tools` (diberi nama **Grafana Analyzer**) adalah utilitas diagnostik dan interrogasi log berbasis AI yang dirancang untuk alur kerja internal engineering di Kitabisa. Saat terjadi insiden atau laporan bug masuk, log telemetri di Grafana dan Loki biasanya padat, tersebar di berbagai namespace Kubernetes, dan dipenuhi stack trace atau format JSON mentah. Tim non-engineer (product manager, operasional, dan QA) kesulitan memahami cakupan masalah tanpa bantuan engineer, sehingga tiket bug sering tertahan menunggu engineer luang untuk melakukan tracing manual.

Walaupun Grafana memiliki Model Context Protocol (MCP) server resmi, setup-nya membutuhkan API token administratif dan konfigurasi jaringan yang rumit. Grafana Analyzer memecahkan kendala ini dengan menggabungkan ekstraksi session browser via Playwright dan model AI lokal (Claude), sehingga user bisa memeriksa dan mendiagnosis log menggunakan bahasa percakapan sehari-hari.

## Arsitektur & Alur Pipeline

```
[ Input User / Terminal / Claude Code ]
  "Tolong cek log payment jam 2 siang tadi, ada error apa dan jelasin buat non-engineer"
                   │
                   ▼
      [ Intent Parser (intent.js) ]
  (Claude Haiku mengekstrak: env, namespace, keyword pencarian, epoch ms)
                   │
                   ▼
   [ Browser Auth Session (auth.js) ] ────▶ [ Cache Lokal (~/.grafana-tools/session.json) ]
  (Playwright mengambil session login GitHub OAuth)
                   │
                   ▼
       [ Loki Client (query.js) ]
  (Kirim query ke /api/datasources/proxy/... dengan LogQL & range waktu)
                   │
                   ▼
     [ Stream Normalizer (parser.js) ]
  (Bersihkan kode ANSI, ekstrak timestamp, dedup, batasi maks 500 baris)
                   │
                   ▼
     [ Diagnostic Engine (analyze.js) ]
  (Claude Sonnet analisis root cause & stream penjelasan bahasa manusia)
                   │
                   ▼
[ Output Ringkasan Terstruktur untuk Non-Engineer ]
```

1. **Ekstraksi Intent Berbasis Percakapan:** Prompt teks dari user diproses oleh `src/intent.js` menggunakan `claude-haiku-4-5`. Modul ini mengurai bahasa alami menjadi format JSON terstruktur: target environment (`stg` atau `prod`), target namespace Kubernetes (`steril`, `payment`, dll.), keyword pencarian, serta rentang waktu epoch millisecond berbasis zona waktu Asia/Jakarta (UTC+7).
2. **Pembajakan Session OAuth Otomatis:** Daripada repot mengurus permission API token jangka panjang di Grafana, `src/auth.js` memanfaatkan Playwright untuk membuka profile Chromium atau Brave lokal user. Begitu user login via GitHub OAuth, cookie `grafana_session` ditangkap otomatis dan disimpan ke `~/.grafana-tools/session.json` dengan masa aktif 12 jam.
3. **Query LogQL Terarah:** Modul `src/query.js` menyusun payload request ke proxy Grafana Loki (`/api/datasources/proxy/<uid>/loki/api/v1/query_range`), menjalankan ekspresi LogQL seperti `{namespace="payment"} |= `timeout`` dalam rentang waktu yang presisi.
4. **Normalisasi & Efisiensi Budget Token:** Data log mentah dari Loki penuh noise dan metadata berlebih. Modul `src/parser.js` memotong escape codes ANSI, membersihkan JSON, dan membatasi log hanya pada 500 baris terbaru agar tidak menguras context window dan token LLM.
5. **Diagnostik Root Cause Otomatis:** `src/analyze.js` memanggil `claude-sonnet-4-6` dengan system prompt khusus reliability engineering. Model melakukan streaming penjelasan penyebab masalah secara langsung (misal: koneksi database pool habis atau gateway pembayaran mengembalikan HTTP 502) lengkap dengan rekomendasi penanganan.
6. **Dukungan Runtime Ganda:** Bisa dijalankan interaktif lewat terminal REPL (`index.js`) maupun difungsikan sebagai kapabilitas agent yang dipanggil otomatis oleh Claude Code lewat panduan `AGENTS.md`.
