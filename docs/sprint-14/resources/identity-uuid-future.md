# Identity: natural-key today → `uuid` next sprint (design note)

> **Audience:** the agent implementing the follow-up sprint. This is context + a proposed plan, not
> implemented code. Companion: [`data-design.md`](./data-design.md) §5 · [`../final-report.md`](../final-report.md) §4.

## 1. The limitation we hit (sprint-14)

Today, a record's **identity is its natural key** — `slug` (articles/projects/tags/technologies/document-categories),
`name` (authors), `title` (documents), `platform` (social-profiles). Upsert matches on that key.

This makes the archive **portable between local & prod** (whose DB `id`s differ) — the whole point — but it
has one sharp edge:

> **Renaming a record (changing its key) creates a DUPLICATE.** The old record is orphaned.

Example: editing `authors.json` and changing `"name": "Athalla Rizky"` → `"name": "Athalla R."` makes the
importer treat `"Athalla R."` as a brand-new author. Result: two authors in the DB (the old `"Athalla Rizky"`
untouched + the new `"Athalla R."`). Same for renaming an article's `slug`, a project's `slug`, etc.

This surprised the owner mid-bulk-edit. It's **by-design, not a bug** (portability requires a non-DB-id
identity), so it didn't get an RCA — but it's the main UX gotcha of the current design.

Other things natural-key identity can't do: **merge** two records, **move** a record between slugs cleanly,
or survive a key typo.

## 2. Proposed direction: stable content-level `uuid`

Give every content record an **immutable, content-level `uuid`** (UUID v4). Identity = `uuid`. The natural
key stays as the **display handle** + relationship target for human reading and legacy archives.

- Rename-safe: same `uuid` + new `slug` → **update in place** (the slug changes, identity stays).
- Portable: `uuid` is content-level (not the DB `id`), so it ports between envs unchanged.
- Merge/move become possible (point relationships at a uuid, reassign).

## 3. Implementation plan (next sprint)

### 3.1 Schema (`backend/src/collections/*.ts`)
Add a `uuid` field to all **8 content collections** (not globals — they're single-instance by slug; not
users/contact-messages — excluded from sync):
```ts
{ name: 'uuid', type: 'text', unique: true, index: true,
  admin: { readOnly: true, disabled: true },  // set by the system, hidden from editors
  defaultValue: () => crypto.randomUUID() }
```
(Verify the `defaultValue`-as-function pattern works in Payload 3; otherwise a `beforeChange` hook that
fills `uuid` when missing.)

### 3.2 Export (`backend/src/data-sync/export.ts`)
- Include `uuid` per record (don't strip it — it's now the identity, like `filename` for documents).
- For relationships, serialize **both** the target `uuid` (primary) **and** its natural key (fallback for
  humans/legacy). Resolution on import tries uuid first.
- Bump `manifest.schemaVersion` → **2**. (v1 = natural-key-only; v2 = uuid + natural-key fallback.)

### 3.3 Import (`backend/src/data-sync/import.ts`)
- Upsert key precedence: **`uuid` first** (if present) → else natural key (v1 archive fallback).
  - find existing by `uuid` → `update` (rename-safe).
  - new `uuid` → `create` (hook/defaultValue should NOT clobber the imported uuid — pass it through).
- Relationship resolution: resolve by target `uuid` → fall back to natural key.
- Keep `detectPrefix()` (macOS re-zip tolerance) and the dry-run/backup/error handling as-is.

### 3.4 Migration (one-time, per env)
A script (`backend/src/data-sync/cli/backfill-uuid.ts` or a seed phase): for each content collection, find
docs with no `uuid` → assign one (re-save through the Local API so the `defaultValue`/hook fires). Run once
locally and once on prod. Existing v1 archives remain importable (fallback path), so no big-bang.

### 3.5 Admin UI
Hide `uuid` from editors (`admin.disabled: true`) — it's system-managed, never hand-edited. The Data Sync
UI unchanged (still upsert/merge); only identity becomes uuid-based under the hood.

## 4. Trade-offs

| | Natural-key only (today) | `uuid` identity (proposed) |
|---|---|---|
| Rename / move / merge | ❌ creates duplicate | ✅ update in place |
| Portable across envs | ✅ | ✅ (uuid is content-level) |
| Archive human-readability | ✅ (slug is the handle) | ✅ (slug still present; uuid alongside) |
| Extra field per record | — | 1 hidden field (storage trivial) |
| Migration needed | — | yes, one-time backfill |

## 5. Edge cases / decisions for the implementer

- **uuid collision**: `unique: true` enforces it; regen on the (astronomically rare) conflict.
- **Imported uuid must pass through**: ensure create doesn't let `defaultValue` overwrite an explicitly
  provided `uuid` (check Payload's create semantics; may need to set it in `data` and skip the hook).
- **Documents** (upload collection): `uuid` on the document record; media re-upload logic unchanged
  (still keyed by `filename` in the archive's `media/`).
- **Backwards compat**: a v1 archive (no uuids) must still import via the natural-key fallback. Detect via
  `manifest.schemaVersion` (or absence of `uuid` on rows).
- **Globals**: no uuid needed (single-instance, keyed by slug).

## 6. References

- Current identity map: [`data-design.md`](./data-design.md) §1, §5
- Upsert/resolve code: `backend/src/data-sync/{keys,relations,import}.ts`
- Manifest schema: `backend/src/data-sync/{types,manifest}.ts` (`SCHEMA_VERSION`)
