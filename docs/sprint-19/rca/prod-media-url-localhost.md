# RCA: Production Image URLs — `localhost:3000` di Production HTML

> Date: 2026-07-24 · Sprint-19 · Severity: Critical
> Related: `frontend/src/lib/api.ts`, `.github/workflows/deploy.yml`

---

## What happened

Setelah deploy fix URL pertama, gambar di production masih menunjuk ke `http://localhost:3000/api/media/file/...`:

```html
<img src="http://localhost:3000/api/media/file/2022-03-22%2010.22.59-400x300.jpg">
```

Browser klien (public internet) tidak bisa akses `localhost:3000` — semua gambar broken.

## Root cause

Tiga lapis penyebab:

### 1. GitHub Actions hardcode `PUBLIC_API_URL`

`.github/workflows/deploy.yml` line 56:

```yaml
env:
  PUBLIC_API_URL: http://localhost:3000/api
```

Ini benar untuk SSR fetch (frontend server-side perlu fetch backend di localhost VPS). Tapi nilai ini juga ter-bake ke **client-side code** via `import.meta.env.PUBLIC_API_URL` saat `astro build`.

### 2. Fix pertama salah asumsi

Fix sebelumnya: kalau `PUBLIC_API_URL` mengandung `localhost` → kosongkan `API_ORIGIN`. Tapi ini juga mem-break local dev (port 4321 vs 3000).

### 3. Bedakan dev vs build

Astro runtime punya `import.meta.env.DEV`:
- `true` di `astro dev` (port berbeda)
- `false` di `astro build` (production, same origin via nginx)

## Resolution

```ts
// api.ts
export const API_ORIGIN = import.meta.env.DEV ? 'http://localhost:3000' : '';

// Screenshots.svelte
const DEV = (import.meta as any).env?.DEV ?? false;
const API_ORIGIN = DEV ? 'http://localhost:3000' : '';
```

| Mode | `API_ORIGIN` | Image src |
|------|-------------|-----------|
| `astro dev` (local) | `http://localhost:3000` | `http://localhost:3000/api/media/file/...` ✅ |
| `astro build` (production) | `''` (empty) | `/api/media/file/...` → resolve ke origin publik ✅ |

## Prevention

- Selalu cek HTML output setelah deploy: `curl https://athallarizky.com/ | grep 'src=.*media'`
- Bedakan env untuk SSR fetch (`API`) vs client-side asset URL (`API_ORIGIN`)
- Jangan asumsikan `PUBLIC_API_URL` yang sama cocok untuk kedua konteks
