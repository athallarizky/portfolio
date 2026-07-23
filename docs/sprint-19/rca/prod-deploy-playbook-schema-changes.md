# RCA: Deploy Playbook — Schema Changes ke Production

> Date: 2026-07-24 · Sprint-19 · Severity: Critical
> Context: Semua issue production sprint-19 berasal dari satu root cause yang sama.

---

## What happened

Deploy sprint-19 ke production memerlukan 3 siklus debug + manual fix untuk mencapai state stabil:

1. Tabel `media` tidak ada → 500 semua endpoint
2. Kolom FK baru di tabel konten tidak ada → 500 setelah tabel media dibuat
3. Kolom `media_id` di `payload_locked_documents_rels` tidak ada → `/admin` 500

Setiap siklus: hit API → 500 → baca log → ALTER TABLE → restart PM2 → ulangi.

## Root cause

**Payload 3 + Drizzle di `next start` (production) tidak auto-push schema migration.** Development mode (`next dev`) melakukannya secara lazy saat API request pertama. Production tidak.

Tidak ada migration file yang digenerate sebelum deploy. Akibatnya, Drizzle tidak tahu perubahan apa yang harus diapply ke production DB.

## Solusi Jangka Panjang

### Opsi A: Migration file (recommended)

Setiap kali ada schema change, generate migration sebelum commit:

```bash
cd backend
npx payload migrate:create   # Generate migration dari schema diff
git add src/migrations/
git commit -m "chore: migration for sprint-XX schema changes"
```

Di production, setelah deploy:

```bash
cd /root/portfolio/backend
cp payload.db payload.db.pre-migration.bak
npx payload migrate            # Apply migration
pm2 restart portfolio-backend
```

### Opsi B: Deploy script otomatis

Tambahkan post-deploy step di GitHub Actions workflow yang menjalankan `npx payload migrate` di VPS setelah rsync.

### Opsi C: Pre-build migration (saat ini)

Karena kita build di GitHub runner, bisa include `MIGRATIONS_DIR` dan copy migration file sebagai bagian dari build artifact. Tapi lebih sederhana jalankan migration di VPS.

## Checklist Sebelum Deploy Schema Change

- [ ] `npx payload migrate:create` → commit migration file
- [ ] Backup production DB (`npm run snapshot`)
- [ ] Deploy kode baru
- [ ] `npx payload migrate` di production
- [ ] `pm2 restart portfolio-backend`
- [ ] Verifikasi: curl semua endpoint, cek `/admin`
