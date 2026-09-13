# Phantom Token Pattern: Solusi Elegan Dilema Auth di Arsitektur Microservices

## Jebakan Autentikasi di Sistem Terdistribusi

Saat merancang sistem autentikasi untuk backend modern, engineer hampir selalu dihadapkan pada dua pilihan arsitektur yang sama-sama punya konsekuensi menyebalkan:

1. **Pilihan A: Kirim JWT langsung ke client.**
   Client menyimpan signed JWT di cookies atau local storage, lalu meneruskannya ke setiap request API. Microservice internal tinggal memvalidasi signature kriptografi di memori tanpa perlu sentuh database. Sangat kencang.
   *Jebakannya:* **Paradoks Revokasi**. Kamu tidak bisa membatalkan JWT yang sudah terbit begitu saja. Kalau akun user diblokir atau API key bocor, token itu tetap sah sampai masa berlakunya habis — kecuali kamu bikin sistem distributed blacklist (yang otomatis menghancurkan keunggulan stateless JWT). Ditambah lagi, isi claims internal seperti user ID, role, sampai billing tier terpampang jelas di browser console client.

2. **Pilihan B: Pakai opaque token di mana-mana.**
   Client cuma pegang string acak yang tidak ada artinya (misal `sk_live_abc123`). Revokasinya gampang luar biasa: hapus saja satu baris data di Redis atau Postgres, seketika user ter-logout.
   *Jebakannya:* **Beban Database Berlipat Ganda**. Kalau satu request dari client memicu panggilan ke 5 microservice internal, kelima service itu harus nembak database auth pusat cuma buat ngecek: *"Token ini masih aktif nggak?"*. Database auth kamu langsung jadi bottleneck utama dan single point of failure.

Gimana caranya dapat revokasi instan di publik, tapi service internal tetap bisa verifikasi tanpa nembak database?

Jawabannya: **Phantom Token Pattern**.

## Analogi Tiket Pesawat dan Boarding Pass

Bayangkan kamu mau naik pesawat terbang:

Begitu beli tiket, maskapai bakal kasih **kode booking** (seperti `K8X2PL`). Kode acak 6 huruf ini tidak menyimpan data identitasmu secara terbuka. Hanya database pusat maskapai yang tahu kalau kode itu milik kamu, untuk rute mana, dan kursi berapa. Kalau penerbangan dibatalkan mendadak, maskapai tinggal mematikan kode booking itu di database mereka dalam hitungan milidetik.

Tapi begitu kamu tiba di pintu security bandara (yang berfungsi sebagai API gateway), petugas mengecek kode booking ke database sekali saja, lalu mencetak **boarding pass fisik** yang dilengkapi barcode dan stempel resmi. Di dalam ruang tunggu dan pintu pesawat, pramugari atau petugas boarding gate tidak perlu menelepon kantor pusat lagi — mereka cukup scan dan cek keabsahan stempel di boarding pass tersebut.

Persis seperti itulah cara kerja Phantom Token Pattern di arsitektur software.

## Cara Kerjanya di Gerbang API Gateway

Alih-alih menyodorkan JWT internal ke client publik yang tidak bisa dipercaya, arsitektur ini memisahkan batasan keamanan edge dengan jaringan internal secara tegas:

1. **Public Edge (Zona Publik):** Client hanya memegang opaque token acak (misal `sk_live_...`). Kalau token ini bocor atau mau dinonaktifkan, kamu tinggal hapus dari store gateway. Detik itu juga token langsung mati.
2. **API Gateway (Perimeter Keamanan):** Saat ada request masuk, gateway melakukan introspeksi token opaque ke cache atau auth store sekali saja. Begitu valid, gateway langsung men-generate JWT internal berdurasi sangat pendek (misal hanya 1–2 menit) yang di-sign menggunakan private key gateway, lengkap dengan claim internal yang dibutuhkan service downstream.
3. **Internal Mesh (Zero-Trust):** Service-service di balik gateway hanya menerima JWT internal ini. Mereka memverifikasi signature publik gateway langsung di memori CPU (cuma butuh beberapa mikrodetik tanpa query database sama sekali). Kalau signature cocok dan token belum expired, request langsung diproses.

Client publik tidak pernah melihat wujud JWT dan isi claims internalnya. Sementara itu, microservice internal tidak pernah perlu query database auth.

## Pelajaran Penting: Bangun dari Nol Tanpa Library

Biar benar-benar paham mekanismenya luar dalam, saya membangun lab eksperimen (`phantom-token-lab`) dari nol murni menggunakan Node.js standard library (`node:crypto` dan `node:http`) — tanpa Express, tanpa library JWT pihak ketiga, dan tanpa Docker. Mengulik kalkulasi kriptografi dan pertukaran token ini secara manual membuahkan beberapa kesimpulan penting:

- **Tentukan security boundary secara sadar:** Jangan anggap gateway publik dan service internal berada di level kepercayaan yang sama. Klien di luar butuh kemudahan revokasi; service di dalam butuh kecepatan dan independensi.
- **Masa berlaku super pendek menyelesaikan masalah revokasi:** Karena JWT internal dibuat secara on-the-fly di gateway dan cuma bertahan 1–2 menit, kita tidak butuh sistem blacklist yang rumit di microservice. Begitu opaque token dicabut di gateway, aliran request baru otomatis terhenti dalam hitungan detik.
- **Stateless itu optimasi internal, bukan konsumsi publik:** Biarkan API publik kamu tetap bersih, sederhana, dan aman dengan token opaque. Manfaatkan sifat stateless JWT di jaringan private internal tempat ia benar-benar menghemat infrastruktur tanpa menimbulkan celah keamanan.

Saat kamu memisahkan token yang dipegang oleh user dari token yang diverifikasi oleh microservice, dilema arsitektur auth terdistribusi ini selesai dengan sangat bersih.
