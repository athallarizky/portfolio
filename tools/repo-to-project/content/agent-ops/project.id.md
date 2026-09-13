# Agent Ops

## Ringkasan Teknis

`agent-ops` adalah kumpulan agent otomasi server otonom yang bertugas memelihara dan menjaga kestabilan infrastruktur VPS. Agent utamanya, `doctor`, menerapkan **prinsip zero-tool diagnostic**: seluruh proses pembacaan metrik, evaluasi threshold, hingga pengiriman alert dikerjakan secara deterministik lewat script TypeScript, sementara LLM hanya dipanggil sebagai mesin penalaran murni berstatus read-only tanpa hak eksekusi apa pun.

## Arsitektur Teknis & Pipeline State

```
[ Trigger Cron (Per Jam) ]
           │
           ▼
[ Kolektor Vitals ] ──▶ Beban CPU, MemAvailable RAM, tekanan swap, df disk, unit systemd, ping HTTP
           │
           ▼
[ Classifier Engine ] ──▶ Evaluasi threshold batas aman, lonjakan delta, & filter flapping (config.ts)
           │
     ┌─────┴────────────────────────┐
     ▼ (Hasil: NORMAL / GREEN)      ▼ (Hasil: TERDETEKSI ANOMALI)
[ Exit Instan ] (0 token, $0)  [ LLM Diagnostician ] (Prompt zero-tool: analisa root cause & risiko)
                                    │
                                    ▼
                               [ Fingerprint Hasher ] (Deduplikasi metrik via SHA-256)
                                    │
                                    ▼
                               [ GitHub Issues API ] ──▶ Buka / update issue saat terjadi masalah
                                                         └── Auto-close issue saat metrik pulih
```

1. **Koleksi Metrik Deterministik:** Runner TypeScript ringan membaca kondisi sistem operasi langsung lewat modul builtin Node dan utilitas native Linux: load average 1m/5m/15m, margin memori riil (`/proc/meminfo`), kapasitas swap, pemakaian disk (`df`), status service systemd (`systemctl is-active`), hingga latency endpoint HTTP publik.
2. **Klasifikasi Berbasis Konfigurasi:** Seluruh ambang batas dipusatkan di `config.ts` tanpa perlu menyentuh alur logika kode. Dilengkapi kalkulasi delta lonjakan metrik serta filter anti-flapping untuk mencegah alert palsu akibat gangguan jaringan sesaat.
3. **Lapisan Diagnostik LLM Tanpa Tool:** Model LLM (`glm-5-turbo` atau Claude via Pi AI) memegang **nol tools eksekusi**, tanpa izin shell, dan tanpa credential database. Model hanya menerima snapshot JSON yang sudah disanitasi, lalu menghasilkan teks diagnosa terstruktur mengenai akar masalah, tingkat keparahan risiko, serta saran langkah mitigasi bagi engineer.
4. **Deduplikasi Fingerprint & Sinkronisasi Lifecycle:** Menghasilkan hash SHA-256 yang stabil dari signature anomali yang terjadi. Jika kendala masih berlangsung di beberapa siklus cron berikutnya, `doctor` memperbarui issue yang ada alih-alih melakukan spam issue baru di repo GitHub. Saat seluruh metrik kembali hijau, ia menulis komentar konfirmasi lalu otomatis menutup issue tersebut.
5. **Fixture Testing Terisolasi:** Dilengkapi rangkaian fixture JSON offline lengkap (misal `disk-90.json`, `ram-exhaustion.json`) untuk menjalankan pengetesan unit classifier L0 dan simulasi alur diagnosa tanpa perlu menyentuh server live.
