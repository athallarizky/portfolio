# RCA: Production Deploy — Schema Tidak Auto-Migrate

> Date: 2026-07-24 · Sprint-19 · Severity: Critical
> Related: Payload 3 + Drizzle + `next start` vs `next dev`

---

## What happened

Setelah deploy sprint-19 ke production, backend crash saat pertama kali di-hit. Error: `SQLITE_ERROR: no such table: media`. Semua endpoint 500.

## Root cause

Payload 3 + Drizzle menggunakan **lazy schema push** — tabel dan kolom baru hanya dibuat saat ada request API yang menyentuh collection/field tersebut. Ini bekerja di `next dev` (development mode).

Tapi di **production** (`next start`), Drizzle **tidak auto-push schema**. Payload memerlukan migration yang sudah difinalkan. Tanpa migration, tabel dan kolom baru tidak pernah dibuat.

### Perbedaan dev vs production

| Mode | Schema push | Ketika |
|------|-------------|--------|
| `next dev` | Auto push (lazy) | API request pertama untuk collection baru trigger `CREATE TABLE` |
| `next start` | **Tidak auto push** | Harus ada migration file atau manual DDL |
| `payload migrate:create` | — | Generate migration dari schema diff |
| `payload migrate` | Apply migration | Jalankan migration yang sudah digenerate |

Production tidak punya migration file sprint-19, jadi tabel `media` dan semua kolom FK baru (`avatar_id`, `banner_image_id`, `featured_image_id`, `screenshots` via `projects_rels.media_id`) tidak pernah dibuat.

## Resolution

### Tabel baru: `media`

Dibuat manual via SQLite DDL sesuai schema yang ada di development.

### Kolom baru pada tabel existing

```sql
ALTER TABLE authors ADD COLUMN avatar_id integer REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN banner_image_id integer REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE projects_rels ADD COLUMN media_id integer REFERENCES media(id) ON DELETE CASCADE;
ALTER TABLE articles ADD COLUMN featured_image_id integer REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE site_config ADD COLUMN avatar_id integer REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE payload_locked_documents_rels ADD COLUMN media_id integer REFERENCES media(id) ON DELETE CASCADE;
```

### Indeks terkait

Semua indeks FK dibuat manual (`authors_avatar_idx`, `projects_banner_image_idx`, dst).

## Prevention

- **Checklist deploy selalu include:** generate migration via `payload migrate:create` setelah schema change, commit file migration, dan jalankan `payload migrate` di production setelah deploy.
- Alternatif: tambahkan post-deploy hook di workflow yang jalankan `npx payload migrate` setelah rsync.
- Jangan asumsikan `next start` = `next dev` untuk schema push.
