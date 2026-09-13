# Claude Wrist (cw)

## Ringkasan Teknis

`claude-wrist` (`cw`) adalah bridge hardware-software yang menyulap smartwatch (**Huawei Watch Fit 4 Pro**) menjadi remote control fisik untuk coding agent. Saat kita menjalankan sesi panjang **Claude Code** di dalam **Termux di HP Android**, pemanggilan tool berbahaya (eksekusi bash command atau pengeditan file) butuh persetujuan manusia. Daripada harus melototin layar terminal terus-menerus, tombol approval dan potongan log terminal langsung diteruskan ke pergelangan tangan.

## Arsitektur Alur & Relay Komunikasi

```
[ Huawei Watch Fit 4 Pro ]
      │  Bluetooth LE (Paket P2P)
      ▼
[ Android Bridge APK ] (Kotlin + Huawei Wear Engine)
      │  HTTP Long-Poll (localhost:8742)
      ▼
[ cw-hub ] (Node.js Server Tanpa Dependensi di Termux)
   ├── Hooks Listener (menerima event tool_approval dari Claude CLI)
   └── tmux Controller (mengirim keystroke 'y' / 'n' ke session aktif)
      ▼
[ Claude Code TUI ] (Berjalan di dalam session tmux)
```

1. **Prinsip Utama (Zero Latensi / Tanpa LLM Tambahan):** Smartwatch tidak menjalankan model AI apa pun, dan bridge juga tidak memanggil API cloud luar. Jam tangan murni berfungsi sebagai perangkat I/O fisik untuk sesi Claude Code lokal yang memang sudah berjalan.
2. **`cw-hub` (Koordinator Lokal):** Server HTTP Node.js tanpa dependensi pihak ketiga yang berjalan di `localhost:8742` dalam environment Termux HP:
   - **Approval Hooks:** Terhubung ke event lifecycle Claude Code (`pre-tool-call`). Saat sebuah tool butuh izin eksekusi, script hook otomatis mengirim metadata (nama tool, file target, diff perintah) via POST ke `cw-hub`.
   - **Integrasi tmux:** Mengontrol proses background `tmux` lewat command Unix (`tmux send-keys -t claude:0 ...`), menyuntikkan approval tanpa perlu interaksi manual di layar terminal HP.
3. **Bridge Relay Android (Kotlin):** Service native Android yang mengintegrasikan **Huawei Wear Engine SDK**:
   - Menjaga koneksi HTTP long-poll yang hemat daya ke `cw-hub` di `localhost:8742`.
   - Mengemas payload approval ke dalam paket binary ringkas yang dikirim via Bluetooth LE ke smartwatch.
   - Menerjemahkan ketukan tombol di jam tangan (Approve / Deny) kembali menjadi respon HTTP ke `cw-hub`.
4. **UI Smartwatch (HarmonyOS / Lite Wearable):** Tampilan jam yang ringkas dan responsif: menampilkan detail nama tool, parameter perintah yang akan dieksekusi, dua tombol taktil (Approve / Reject), serta live stream 5 baris log terminal terakhir.
