# Phase 0 Report — Discovery: Does Payload delete uploaded files?

> Completed: 2026-07-23

---

## 1. How to Run

```bash
# Source code audit (no runtime needed)
cat backend/node_modules/payload/dist/collections/operations/deleteByID.js | grep -A6 deleteAssociatedFiles
```

## 2. Finding

**Payload 3 automatically deletes uploaded files when a document is deleted.**

Source: `payload/dist/collections/operations/deleteByID.js:90`:
```js
await deleteAssociatedFiles({
    collectionConfig, config,
    doc: docToDelete,
    overrideDelete: true,
    req
});
```

`deleteAssociatedFiles()` (`payload/dist/uploads/deleteAssociatedFiles.js`) does:
```js
const fileToDelete = `${staticPath}/${doc.filename}`;
await fs.unlink(fileToDelete);
// + all sizes if doc.sizes exists
```

Called in three delete paths:
| Path | File | Line |
|------|------|------|
| Local API `payload.delete` | `collections/operations/deleteByID.js` | 90 |
| Bulk delete | `collections/operations/delete.js` | 114 |
| File replacement on update | `collections/operations/utilities/update.js` | 78 |

## 3. Impact on Sprint-18 Scope

**Backlog item #2 ("media cleanup on document replace-all delete") is invalidated.** No orphaned files can result from `replaceDrift` — Payload's delete path includes `deleteAssociatedFiles` unconditionally. The code audit confirms `overrideDelete: true` is hardcoded, not configurable.

**Sprint-18 reduced to item #3 only:** replace-all prod observation.

## 4. Decision

| Decision | Rationale |
|----------|-----------|
| Cancel media cleanup | Payload handles it natively; building a redundant cleanup would be dead code |
