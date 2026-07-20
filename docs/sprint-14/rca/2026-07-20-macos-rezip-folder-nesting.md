# RCA — macOS re-zip folder nesting broke content import

> **Date:** 2026-07-20 · **Severity:** Medium · **Component:** `backend/src/data-sync/import.ts` (admin upload path)
> **Status:** ✅ Resolved

## 1. Summary

Editing an exported archive and re-zipping it on macOS (Finder "Compress") wraps every entry under a
top-level folder (e.g. `portfolio-data (1)/manifest.json`) and appends `__MACOSX/`, `.DS_Store`, `._*`
junk. The importer only looked for `manifest.json` at the archive **root**, so it rejected perfectly
valid edited archives with `archive missing entry: manifest.json` — blocking the bulk-edit-then-rezip
workflow, which is the feature's main use case. Fix: `detectPrefix()` resolves a single top-level folder
and all reads go through it; OS junk is ignored.

## 2. Impact

Blocked the owner's primary workflow (download → edit JSON → re-zip → upload) on macOS. No data loss,
no prod impact (dev-only). Cost ~5 debug rounds because the happy path (curl, unedited download) always
worked and several plausible causes were red herrings.

## 3. Symptoms (observed)

| Signal | Value |
|---|---|
| UI error after upload | `archive missing entry: manifest.json` → `not a portfolio content archive (manifest.json missing)` |
| Reproduces | download → **edit** a JSON → re-zip on macOS → upload |
| Does **not** reproduce | download → upload *without* editing (200); any curl upload (200) |
| On-disk file | `unzip -l ~/Downloads/portfolio-data.zip` shows `manifest.json` present |

## 4. Timeline

| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | Tested the import endpoint with a real file via curl | 200 + report | ruled out endpoint/engine bug |
| 2 | Blamed the empty file body in the user's pasted curl (copy-as-curl strips binary) | plausible — but not the user's real request | **red herring** |
| 3 | GET /api/data-export → re-upload via curl; mimicked the browser's exact multipart | all 200 | couldn't reproduce via curl |
| 4 | Hypothesized "uploaded the DB snapshot" (snapshot has `snapshot-manifest.json`, not `manifest.json`) | user's file had `manifest.json` | **red herring** |
| 5 | Added debug logging; dumped the received bytes to `/tmp/data-import-received.zip` | captured `portfolio-data (1)/manifest.json` + `__MACOSX/` | **the cause** |
| 6 | User clue: "only fails when I **edit** the file, then re-zip" | macOS Compress wraps contents in a folder | confirmed root cause |
| 7 | `detectPrefix()` + ignore junk; thread prefix through all reads | edited+rezipped zip → 200, 0 errors | **real fix** |

## 5. Root cause

macOS Finder "Compress" (and the `zip` CLI when zipping a **folder**) stores entries under the folder
name rather than at the archive root:

```
portfolio-data (1)/manifest.json        ← NOT at root
portfolio-data (1)/collections/...
portfolio-data (1)/.DS_Store            ← Finder metadata
__MACOSX/portfolio-data (1)/._manifest.json   ← resource forks
```

`importFromArchive` did `zip.getEntry('manifest.json')` (root only) → missed it → threw. The on-disk
file was valid (`unzip -l` showed `manifest.json`), which is why the file "looked fine" while the import
still failed — adm-zip read the central directory fine, but the entry path carried the folder prefix.

**Evidence:** the `/tmp/data-import-received.zip` dump (the exact bytes the server received) showed the
`portfolio-data (1)/` prefix — distinct from the bytes curl sent (no prefix).

## 6. The fix

`backend/src/data-sync/import.ts` — resolve a root prefix once, read everything through it:

```diff
+ export function detectPrefix(zip: AdmZip): string {
+   if (zip.getEntry('manifest.json')) return ''
+   const isJunk = (n: string) =>
+     n.startsWith('__MACOSX/') || n.endsWith('.DS_Store') || path.basename(n).startsWith('._')
+   const dirs = new Set<string>()
+   for (const e of zip.getEntries()) {
+     if (isJunk(e.entryName)) continue
+     const i = e.entryName.indexOf('/')
+     if (i > 0) dirs.add(e.entryName.slice(0, i))
+   }
+   for (const d of dirs) if (zip.getEntry(`${d}/manifest.json`)) return `${d}/`
+   return ''
+ }
```

All reads use `${pfx}`: `manifest.json`, `collections/<slug>.json`, `globals/<slug>.json`,
`media/<filename>` (threaded through `upsertDoc` and `resolveSelfRefs`). A snapshot zip uploaded to the
content import now yields a friendly "this is a DB snapshot, use snapshot:restore" error.

Related fixes found during the same debug session:
- **Empty/corrupt zip → graceful 400 JSON** instead of an unhandled 500 (`endpoints.ts` try/catch).
- **Smart Apply button** (Phase 8): dry-run → one-click Apply, so the dry-run-isn't-a-write confusion
  can't recur.

## 7. Verification

| Metric | Before | After |
|---|---|---|
| Edited + rezipped Mac zip import | 400 `manifest missing` | **200**, 0 errors (`detectPrefix` → `portfolio-data (1)/`) |
| Untouched download → upload | 200 | 200 (prefix `''`) |
| `__MACOSX/` / `.DS_Store` / `._*` in zip | confused the lookup | ignored |
| Empty/corrupt zip | unhandled 500 | **400** JSON |

## 8. Why it was hard to find (contributing factors)

- **The happy path always worked** (curl, unedited download→upload) — so the engine/endpoint looked
  correct, masking that the failure was input-specific.
- The pasted **copy-as-curl had an empty file body** → pointed at "empty upload" (red herring #2).
- **The on-disk file was valid** (`unzip -l` showed `manifest.json`) → "the file is fine" masked that
  the *received* bytes carried a prefix (they only diverged from disk after edit + re-zip).
- The user's first description ("download then upload") **omitted the edit+re-zip step** — the actual
  trigger — until they clarified.

**Lesson:** when "it works for me but not for the user," capture the **exact bytes the server received**,
not the file on the client's disk.

## 9. Lessons & action items

- [x] Importer tolerates a top-level folder prefix + ignores OS junk (`detectPrefix`) — done.
- [x] Empty/corrupt zip → graceful 400, not 500 — done (`endpoints.ts` try/catch).
- [x] Smart Apply (dry-run → one click) — done (Phase 8).
- [ ] Add an integration test that builds a folder-nested + junk zip (simulating macOS) and asserts
      import succeeds + the prefix is detected.
- [x] Documented in `final-report.md` §4 (re-zip tolerance + natural-key-identity decisions).

## 10. References

- `backend/src/data-sync/import.ts` — `detectPrefix()`
- `backend/src/data-sync/endpoints.ts` — try/catch (400/500)
- [`../final-report.md`](../final-report.md) §4, §6
- [`../../GUIDE.md`](../../GUIDE.md) §3 (RCA template) — adm-zip central-directory / entry-path behavior
