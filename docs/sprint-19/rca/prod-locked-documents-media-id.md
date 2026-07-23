# RCA: `/admin` 500 — `no such column: media_id` di payload_locked_documents_rels

> Date: 2026-07-24 · Sprint-19 · Severity: High
> Related: Payload internal table `payload_locked_documents_rels`

---

## What happened

Setelah deploy sprint-19, `/admin` return 500 dengan digest `1693524175`. Halaman admin tidak bisa dimuat. Error log:

```
SQLITE_ERROR: no such column: media_id
[query]: select ... from "payload_locked_documents_rels" ...
```

## Root cause

`payload_locked_documents_rels` adalah tabel internal Payload yang melacak dokumen yang sedang dikunci (locked) oleh user lain. Tabel ini punya polymorphic FK — satu kolom `_id` per collection. Saat collection baru (`media`) ditambahkan ke Payload config, tabel ini perlu kolom baru `media_id`.

Development (`next dev`) auto-add kolom ini via Drizzle lazy push. Production (`next start`) tidak — sama seperti RCA `prod-schema-not-migrated.md`.

Kami hanya membuat tabel `media` dan kolom FK di tabel konten (authors, projects, articles, site_config), tapi **melewatkan** tabel internal Payload ini.

## Resolution

```sql
ALTER TABLE payload_locked_documents_rels ADD COLUMN media_id integer REFERENCES media(id) ON DELETE CASCADE;
CREATE INDEX payload_locked_documents_rels_media_id_idx ON payload_locked_documents_rels (media_id);
```

## Prevention

- Setelah menambah collection baru, selalu cek `payload_locked_documents_rels` dan `payload_preferences_rels` untuk kolom baru
- Script post-deploy migration harus cover semua tabel yang diubah, termasuk Payload internal
