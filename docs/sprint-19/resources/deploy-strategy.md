# Sprint-19 — Production Deploy Strategy

> Date: 2026-07-24 · Audience: owner + operator
> Status: ✅ Deployed. Production stable: frontend + admin + all APIs 200.
> Context: Deploy sprint-19 Media collection ke production. Production masih menjalankan skema sprint-17/18.

---

## Risiko

### 1. Drizzle schema migration conflict

Field `screenshots` di Projects berubah dari `array[{bannerColor, icon, label}]` menjadi `upload hasMany` yang reference ke `media`. Drizzle akan mencoba:

```
Is media table created or renamed from another table?
❯ + media                        create table
  ~ projects_screenshots › media rename table
```

Di dev mode, Payload prompt interaktif. **Di production tidak ada prompt** — Drizzle bisa salah memutuskan rename tabel `projects_screenshots` → `media`, merusak data.

### 2. Data `screenshots` hilang

Format lama (`{bannerColor, icon, label}`) tidak kompatibel dengan format baru (upload reference ke media IDs). Tidak ada path migrasi otomatis. Data akan kosong setelah deploy.

### 3. Tabel baru perlu dibuat

Collection `media` adalah collection baru. Perlu tabel SQLite baru. Payload auto-push schema saat Next.js boot, tapi konflik rename bisa memblok ini.

---

## Prosedur Deploy

### Step 1 — Backup production

```bash
ssh root@athallarizky.com
cd /root/portfolio/backend

# Snapshot DB mentah (cadangan utama)
npm run snapshot
# → portfolio-snapshot-YYYY-MM-DD-HH-MM.zip

# Content export (semua collection)
npm run export
# → portfolio-data-YYYY-MM-DD-HH-MM.zip
```

Download kedua file ke lokal sebagai safety net.

### Step 2 — Deploy kode via GitHub Actions

Trigger workflow `Deploy to VPS` dari GitHub Actions.

**PENTING:** setelah deploy, PM2 akan auto-restart backend. Tapi Payload mungkin gagal boot karena schema conflict. Jangan panik — lanjut ke step 3.

### Step 3 — Resolve schema conflict

```bash
ssh root@athallarizky.com
cd /root/portfolio/backend

# Cek apakah backend jalan — seharusnya tidak (crash di schema push)
pm2 list

# Backup DB sebelum operasi manual
cp payload.db payload.db.pre-sprint-19.bak

# Hapus tabel screenshots lama
sqlite3 payload.db "DROP TABLE IF EXISTS projects_screenshots;"
sqlite3 payload.db "DROP TABLE IF EXISTS projects_screenshots_rels;"
sqlite3 payload.db "DROP TABLE IF EXISTS projects_screenshots_locales;"

# Hapus tabel media jika sudah setengah dibuat (dari failed migration)
sqlite3 payload.db "DROP TABLE IF EXISTS media;"
sqlite3 payload.db "DROP TABLE IF EXISTS media_rels;"

# Restart backend
pm2 restart portfolio-backend

# Tunggu 5 detik, lalu trigger schema push via API
sleep 5
curl -s http://localhost:3000/api/media?limit=1
```

### Step 4 — Verifikasi

```bash
# Cek semua konten lama masih ada
curl -s http://localhost:3000/api/projects?limit=3 | python3 -m json.tool | head -20
curl -s http://localhost:3000/api/articles?limit=1
curl -s http://localhost:3000/api/tags?limit=1
curl -s http://localhost:3000/api/authors?limit=1

# Media collection seharusnya kosong (belum ada upload)
curl -s http://localhost:3000/api/media?limit=1

# Cek frontend berfungsi
curl -s https://athallarizky.com/ -o /dev/null -w "%{http_code}"
```

### Step 5 — Re-upload konten visual

Melalui admin panel `/admin`:
1. Upload gambar ke **Media** collection
2. Assign `avatar` ke tiap **Author**
3. Assign `bannerImage` + `screenshots` ke tiap **Project** (upload ulang screenshot)
4. Assign `featuredImage` ke tiap **Article** (opsional)
5. Assign `avatar` ke **SiteConfig** untuk homepage hero

### Step 6 — Re-export data (setelah re-upload)

```bash
ssh root@athallarizky.com
cd /root/portfolio/backend

# Export ulang — sekarang termasuk media collection dengan file gambar
npm run export
# → portfolio-data-YYYY-MM-DD-HH-MM.zip

# Download untuk backup
```

---

## Rollback Plan (jika deploy gagal total)

### Full restore dari snapshot

```bash
ssh root@athallarizky.com
cd /root/portfolio/backend

# Stop backend
pm2 stop portfolio-backend

# Restore DB mentah dari snapshot
npm run snapshot:restore -- portfolio-snapshot-YYYY-MM-DD-HH-MM.zip -- --yes

# Git revert ke commit sebelum sprint-19
cd /root/portfolio
git checkout <commit-sebelum-sprint-19>

# Restart
pm2 restart portfolio-backend
```

### Restore dari content export

```bash
# Import content saja (upsert by uuid — tidak menghapus data baru)
cd /root/portfolio/backend
npm run import -- portfolio-data-YYYY-MM-DD-HH-MM.zip
```

---

## Checklist Sebelum Deploy

- [ ] Backup snapshot + export dari production, download ke lokal
- [ ] Verifikasi di lokal: `npx tsc --noEmit` + `npm test` + `npm run build` clean
- [ ] Pastikan koneksi SSH ke VPS berfungsi
- [ ] Baca ulang step 3 — operasi SQL manual pada production DB
- [ ] Siapkan mental: screenshots akan kosong, perlu re-upload manual
