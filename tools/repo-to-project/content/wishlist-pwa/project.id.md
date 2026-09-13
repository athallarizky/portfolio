# Wishlist PWA

## Ringkasan Teknis

`wishlist-pwa` adalah Progressive Web App client-first (sekaligus aplikasi Android berbasis Capacitor) yang menyatukan daftar produk impian dari berbagai marketplace (Shopee, Tokopedia) ke dalam satu tempat tanpa perlu registrasi akun ataupun server database pusat. Dengan mengombinasikan **Web Share Target API** dan proxy serverless **Cloudflare Worker**, pengguna bisa langsung memencet tombol "Bagikan / Share" dari dalam aplikasi e-commerce bawaan untuk otomatis menangkap, mengekstrak metadata, dan menyimpan kartu produk langsung di perangkat lokal.

## Arsitektur Teknis & Alur Penangkapan Data

```
[ Aplikasi Marketplace Native ] (Shopee / Tokopedia)
           │ User klik "Share" ──▶ Pilih "Wishlist PWA"
           ▼
[ Web Share Target API / Android Intent Filter ]
           │ Menangkap raw text share + parameter URL produk
           ▼
[ Cloudflare Worker Edge Proxy ] (GET /metadata?url=...)
           │ Bypass aturan CORS & fetch DOM HTML
           │ Parsing tag OpenGraph: title, image, price, canonical url
           ▼
[ PWA Client (Vanilla JS) ]
    ├── Regex Parser (membersihkan tracker referral dan link redirect)
    ├── IndexedDB Engine (menyimpan data secara offline tanpa server)
    └── Service Worker (caching app shell agar aplikasi terbuka instan)
```

1. **Intersepsi Share Native (Web Share Target API):** Dikonfigurasi lewat `manifest.webmanifest` dan intent filter Capacitor Android. Begitu user membagikan link barang dari aplikasi belanja di HP, sistem operasi Android langsung meneruskan payload share ke handler capture PWA tanpa perlu copy-paste link manual.
2. **Parser Regex Pembersih Link:** Aplikasi e-commerce sering menyisipkan teks promosi yang berantakan, kode afiliasi merchant, hingga URL redirect pendek. Modul parser regex khusus bertugas menyaring parameter sampah tersebut dan mengekstrak URL produk kanonikal yang siap di-scrape.
3. **CORS Edge Proxy (Cloudflare Worker):** Mekanisme keamanan browser mencegah script frontend men-scrape DOM dari domain marketplace secara langsung. Serverless Cloudflare Worker berperan sebagai edge proxy ringan: ia mengambil halaman HTML produk target, membedah metadata OpenGraph (`og:title`, `og:image`, harga), lalu mengembalikannya sebagai JSON terstruktur dalam waktu ~120ms.
4. **Penyimpanan Lokal via IndexedDB:** Mengusung arsitektur zero central database. Seluruh daftar barang, kategori, hingga catatan harga tersimpan aman di HP pengguna menggunakan IndexedDB lokal. Data pengguna 100% private dan tidak pernah dikirim ke database backend mana pun.
5. **App Shell Offline:** Service Worker bawaan melakukan pre-cache untuk seluruh aset HTML, JS, CSS, dan icon, sehingga aplikasi bisa dibuka seketika dan dipakai mengelola wishlist meski sedang tidak ada koneksi internet.
