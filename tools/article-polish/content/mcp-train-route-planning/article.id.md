# Bagaimana MCP Membuat Claude Bisa Merencanakan Rute Kereta — krl-mcp dalam Praktik

> 2026-11-01 · 4 min read

Bertanya "kereta apa yang sampai sebelum jam 6?" ke chat model dulu ujungnya tebakan. Dengan MCP server, itu jadi pertanyaan sungguhan dengan jawaban terverifikasi — ini cara kerjanya, ditelusuri dari ujung ke ujung.

**Tags:** ai, workflow (shared dengan EN)
**Author:** Athalla Rizky

---

## Pertanyaan yang Dulu Berujung Buntu

"Aku di Tanah Abang, harus di Kebayoran sebelum jam 6 — kereta apa?"

Pertanyaan yang ditanyakan setiap komuter Jakarta. Aplikasi chat tidak bisa menjawabnya. Chat model telanjang *sort of* bisa — dengan menebak, yang untuk jadwal kereta lebih buruk daripada tidak menjawab. Yang model butuhkan sebenarnya adalah jadwalnya: papan keberangkatan nyata, urutan perhentian nyata, angka nyata yang bisa dihitung, bukan dihafal.

Kesenjangan itulah yang ditutup oleh [Model Context Protocol](https://modelcontextprotocol.io). Aku membangun [krl-mcp](https://github.com/athallarizky/krl-mcp) untuk menyaksikannya bekerja pada data yang kukenal baik — MCP server self-contained untuk jadwal KRL Commuter Jabodetabek, ditulis dalam Go, dengan seluruh snapshot open-krl ter-embed di dalam binary-nya. Daftarkan sekali, dan Claude Code berubah menjadi perencana perjalanan komuter yang menyebut sumber angkanya.

## Apa yang Sebenarnya Dilakukan MCP di Sini

MCP adalah standar penghubung antara LLM host dan tools. Tiga bagian yang penting:

- **Host** — Claude Code, Claude Desktop, Cursor. Bagian yang menalar dan berbicara denganmu.
- **Server** — program kecil (di sini: satu binary Go ±15 MB) yang mengekspos *tools* lewat stdio, berbicara JSON-RPC.
- **Tools** — fungsi dengan nama, deskripsi, dan input ter-tipe. Model di host-lah yang memutuskan tool mana dipanggil, dengan argumen apa, hanya dari deskripsi itu.

Tanpa plugin store, tanpa API key, tanpa infrastruktur. `go install` binary-nya, `claude mcp add krl -- <path>`, dan toolbox model bertambah enam instrumen baru:

| Tool | Yang dijawab |
|---|---|
| `get_stations` | Katalog 111 stasiun (Jabodetabek + Yogyakarta–Solo) dengan koordinat |
| `get_departures` | Papan keberangkatan satu stasiun dalam jendela waktu |
| `plan_trip` | Perencanaan perjalanan langsung: `depart_at` (paling pagi duluan) atau `arrive_by` (paling akhir yang masih sempat) |
| `find_nearest_station` | Koordinat GPS → stasiun terdekat beserta jaraknya |
| `get_lines` | Line komersial dan warna kanoniknya |
| `get_trip_stops` | Urutan perhentian lengkap satu kereta |

## Satu Query, Ditelusuri Ujung ke Ujung

"Dari Juanda ke Bogor, sore ini sekitar jam 5." Model tidak menanyakannya padaku — ia memanggil:

```
plan_trip(from="Juanda", to="Bogor", depart_at="17:00")
```

Server memindai index in-memory-nya dan mengembalikan kereta-kereta langsung, paling pagi duluan. Jawaban yang kembali:

> **Kereta 1362** — berangkat Juanda **17:04**, tiba Bogor **18:23** (79 menit), dengan perhentian antara di sepanjang jalur.

Dan karena tool mengembalikan perhentian *via*, model bisa memberitahumu apakah keretanya melewati stasiun yang dekat tujuanmu sungguhan — bukan sekadar "ada kereta." Balik pertanyaannya jadi "harus *tiba* sebelum 18:00" dan tool yang sama, dalam mode `arrive_by`, mengembalikan kereta *terakhir* yang masih sempat. Itu primitif perencanaan sungguhan, bukan sekadar kotak pencarian.

Polanya saling menyusun. "Aku di Monas, jalan ke stasiun mana?" adalah `find_nearest_station` dengan koordinat. "Kereta 5133D lewat mana sih?" adalah `get_trip_stops` — dan yang ini lebih penting dari kelihatannya, lihat bawah.

## Kenapa Jawabannya Tetap Jujur

Tiga keputusan desain menjaga model agar tidak menyesatkanmu dengan percaya diri:

**Jawaban kosong membawa petunjuk.** Saat tidak ada perjalanan langsung, `plan_trip` tidak sekadar mengembalikan kosong — ia mengembalikan `transfer_candidates`: perhentian di mana rute satu transfer *memang mungkin*. Model mendapat bahan untuk menalar, bukan celah untuk diisi karangan.

**Headsign bukan rute.** Kereta `5133D` bertuliskan "ANGKE" di depan, padahal menempuh ring selatan lewat Manggarai. Tanya headsign-nya dan kamu akan diarahkan ke arah yang salah — persis yang terjadi saat pertama kali kuji tanpa data perhentian: model menarasikan rute yang masuk akal dan salah. `get_trip_stops` ada supaya "kereta ini *sebenarnya* lewat mana" dijawab dari data.

**Waktu itu service-day, bukan jam dinding.** `24:04` berarti 00:04 setelah tengah malam *di hari layanan yang sama* — konvensi GTFS yang menjaga kereta-kereta terakhir tetap sortable. Planner menerima jam hingga 47, jadi query "lewat tengah malam" tetap jalan.

(Momen rute-halusinasi itu mengajariku pelajaran umumnya: saat model salah memakai tool-mu, perbaikannya biasanya mengekspos data yang ia butuhkan, bukan memperketat prompt. Daftar bug yang ditemukan model saat dogfooding ada di README repo — deskripsi tool itu kontrak, dan LLM menguji setiap kalimatnya.)

## Coba dalam 60 Detik

```bash
go install github.com/athallarizky/krl-mcp/cmd/krl-mcp@latest
claude mcp add krl --scope user -- "$(go env GOPATH)/bin/krl-mcp"
```

(Tidak pakai Go? Ambil binary pra-build untuk platform-mu dari [releases](https://github.com/athallarizky/krl-mcp/releases). MCP host mana pun cocok — Claude Desktop dan Cursor memakai server yang sama lewat config JSON.)

Lalu tinggal tanya, dalam bahasa apa pun:

> "Aku di Pasar Senen, mau ke Depok sebelum jam 8 pagi. Kereta mana?"

## Polanya Berlaku Umum

krl-mcp tentang kereta, tapi bentuknya universal: **dataset ter-pin + logika domain + enam tool yang jujur = pakar bidang yang bisa disewa LLM mana pun.** Jadwal, katalog, API internal, instrumen lab — kalau pertanyaannya bisa dinyatakan sebagai tool call dengan output yang jujur, lapisan percakapannya gratis. Modelnya tidak pernah jadi hambatan. Yang selama ini hilang adalah cara untuk mengecek.

---

*Generated by tools/article-polish. Import via the publish pipeline, or copy article.json into the admin dashboard.*
