# Wishlist PWA

## Technical Overview

`wishlist-pwa` is a client-first Progressive Web App (and Capacitor-wrapped Android APK) designed to unify product bookmarks across disparate e-commerce platforms (Shopee, Tokopedia) without requiring accounts or central databases. By pairing the **Web Share Target API** with an edge **Cloudflare Worker**, users can hit "Share" directly inside native shopping apps to immediately capture, enrich, and persist product cards locally.

## Technical Architecture & Ingestion Flow

```
[ Native Shopping App ] (Shopee / Tokopedia)
           │ User clicks "Share to Wishlist"
           ▼
[ Web Share Target API / Android Intent Filter ]
           │ Captures raw shared text + URL parameter
           ▼
[ Cloudflare Worker Edge Proxy ] (GET /metadata?url=...)
           │ Bypasses CORS & fetches DOM
           │ Extracts OpenGraph tags: title, image, price, canonical url
           ▼
[ PWA Client (Vanilla JS) ]
    ├── Regex Parser (sanitizes referral trackers and merchant affiliate tokens)
    ├── IndexedDB Engine (persists item collection offline with zero server storage)
    └── Service Worker (caches app shell for instant offline loads)
```

1. **Native Share Interception (Web Share Target API):** Configured via `manifest.webmanifest` and Capacitor Android intent filters. When an e-commerce link is shared from an Android app, the OS pipes the share bundle directly into the PWA's capture handler without manual copy-pasting.
2. **Pure Regex Stream Parser:** E-commerce apps bundle messy promotional text, affiliate tracking IDs, and shortened redirects into share payloads. A dedicated pure parser cleans tracking parameters, extracts canonical item URLs, and prepares clean scrape targets.
3. **CORS Edge Proxy (Cloudflare Worker):** Browser security models block direct DOM scraping from other domains. A serverless Cloudflare Worker acts as a lightweight edge proxy: it fetches the target product page, parses OpenGraph metadata (`og:title`, `og:image`, `og:price:amount`), and returns structured JSON in ~120ms.
4. **Client-Side IndexedDB Storage:** Zero central database architecture. Items, categorizations, and price checkpoints are stored exclusively on the device using native IndexedDB (`idb` wrapper). User data never leaves their local device.
5. **Offline PWA Shell:** A custom Service Worker pre-caches all HTML, JS, CSS, and icon assets, allowing full offline browsing and management of saved wishlists.
