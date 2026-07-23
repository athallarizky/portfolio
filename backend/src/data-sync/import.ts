// Content import — upserts an archive back into Payload via the Local API.
//
// Dry-run by default: reports would-create / would-update + errors, with zero writes.
// Real run: takes a pre-import DB backup, then upserts in dependency order (parents
// before children), resolves self-referential relations in a 2nd pass, converts body
// Markdown → Lexical, and re-uploads Documents media.
//
// Identity (sprint-15): a record's `uuid` is the upsert key (rename-safe). v2 archives
// serialize relations as dual { uuid, key } refs; v1 archives use plain strings. Both import.

import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'
import type AdmZip from 'adm-zip'

import {
  CONTENT_COLLECTIONS,
  SYNC_GLOBALS,
  type ArchiveManifest,
  type ContentCollection,
  type ImportReport,
} from './types'
import { NATURAL_KEYS, RELATIONS, RELATION_TARGETS, RICH_TEXT_BODY } from './keys'
import { validateManifest } from './manifest'
import { readZip, readJson, readEntry } from './archive'
import { getEditorConfig, mdToLexical, type EditorConfig } from './converters'
import {
  makeIdResolver,
  planImportOrder,
  type IdResolver,
  UnresolvedRelationError,
} from './relations'

export interface ImportOptions {
  dryRun: boolean
  /** Directory for the pre-import backup (default: cwd). */
  backupDir?: string
  /** Sprint-17: after upserting, delete records absent from the archive (requires a full archive). */
  replaceAll?: boolean
}

// ---- helpers ----

/** A serialized relation ref is either a v1 plain string (key only) or a v2 { uuid?, key } object. */
export function toRef(val: unknown): { uuid?: string; key: string } | null {
  if (val == null) return null
  if (typeof val === 'string') return { key: val }
  if (typeof val === 'object') {
    const o = val as { uuid?: unknown; key?: unknown }
    if (o.key !== undefined && o.key !== null) {
      const u = typeof o.uuid === 'string' && o.uuid ? o.uuid : undefined
      const ref: { uuid?: string; key: string } = { key: String(o.key) }
      if (u) ref.uuid = u
      return ref
    }
  }
  return null
}

function inferMimetype(filename: string): string {
  switch (filename.toLowerCase().split('.').pop()) {
    case 'pdf':
      return 'application/pdf'
    case 'md':
      return 'text/markdown'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

function safeReadEntry(zip: AdmZip, entryPath: string): Buffer | null {
  try {
    return readEntry(zip, entryPath)
  } catch {
    return null
  }
}

/** Detect a top-level folder prefix so imports survive a macOS/Windows re-zip
 *  (Finder/Explorer wraps the contents in a folder, e.g. `portfolio-data/manifest.json`,
 *  and adds `__MACOSX/`, `.DS_Store`, `._*` junk). Returns '' when manifest.json is at the
 *  archive root. */
export function detectPrefix(zip: AdmZip): string {
  if (zip.getEntry('manifest.json')) return ''
  const isJunk = (n: string) =>
    n.startsWith('__MACOSX/') || n.endsWith('.DS_Store') || path.basename(n).startsWith('._')
  const dirs = new Set<string>()
  for (const e of zip.getEntries()) {
    const n = e.entryName
    if (isJunk(n)) continue
    const i = n.indexOf('/')
    if (i > 0) dirs.add(n.slice(0, i))
  }
  for (const d of dirs) {
    if (zip.getEntry(`${d}/manifest.json`)) return `${d}/`
  }
  return ''
}

/** Copy the active DB to a timestamped .bak (named after the actual DB file);
 *  returns the path, or undefined on failure. `label` distinguishes pre-import vs pre-merge backups. */
export function backupDb(backupDir?: string, label = 'preimport'): string | undefined {
  const raw = process.env.DATABASE_URL || 'file:./payload.db'
  const dbPath = raw.replace(/^file:/, '')
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const base = path.basename(dbPath) // payload.db (or payload.test.db, etc.)
    const out = path.join(backupDir ?? process.cwd(), `${base}.${ts}.${label}.bak`)
    fs.copyFileSync(dbPath, out)
    return out
  } catch {
    return undefined
  }
}

export class ReplaceAllError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReplaceAllError'
  }
}

/** Replace-all needs every content collection in the archive so the full reference graph is present
 *  (no orphan risk). Throws ReplaceAllError listing what's missing. */
export function assertFullArchive(present: ReadonlySet<string>): void {
  const missing = CONTENT_COLLECTIONS.filter((c) => !present.has(c))
  if (missing.length) {
    throw new ReplaceAllError(
      `replace-all requires a full archive; missing collections: ${missing.join(', ')}`,
    )
  }
}

/** Identity of an archive row: uuid if present, else its natural key (string). Matches upsertDoc's
 *  uuid-first → natural-key lookup, so "is this DB record in the archive?" is consistent. */
export function archiveIdentitySet(
  collection: ContentCollection,
  rows: Record<string, any>[],
): Set<string> {
  const ids = new Set<string>()
  for (const row of rows) {
    const uuid = typeof row.uuid === 'string' && row.uuid ? row.uuid : undefined
    ids.add(uuid ?? String(row[NATURAL_KEYS[collection]]))
  }
  return ids
}

/** Walk every archive row's relation fields and collect resolved target ids, keyed by target
 *  collection. Replace-all uses this to skip deleting a record some surviving row still points at. */
export function collectReferenced(
  zip: AdmZip,
  pfx: string,
  resolver: IdResolver,
): Map<ContentCollection, Set<string | number>> {
  const refIds = new Map<ContentCollection, Set<string | number>>()
  const add = (to: ContentCollection, id: number | string) => {
    let s = refIds.get(to)
    if (!s) {
      s = new Set()
      refIds.set(to, s)
    }
    s.add(id)
  }
  for (const collection of CONTENT_COLLECTIONS) {
    const rels = RELATIONS[collection]
    if (!rels) continue
    const entry = safeReadEntry(zip, `${pfx}collections/${collection}.json`)
    if (!entry) continue
    const rows = JSON.parse(entry.toString('utf8')) as Record<string, any>[]
    for (const row of rows) {
      for (const rel of rels) {
        const val = row[rel.field]
        if (val == null) continue
        const refs = (Array.isArray(val) ? val : [val])
          .map((v) => toRef(v))
          .filter((r): r is { uuid?: string; key: string } => r !== null)
        for (const r of refs) {
          const id = resolver.resolve(rel.to, r)
          if (id !== undefined) add(rel.to, id)
        }
      }
    }
  }
  return refIds
}

/** Replace-all drift pass: delete DB records whose identity isn't in the archive — unless still
 *  referenced by a surviving row (refIds), which are reported + kept.
 *
 *  Deletes in REVERSE dependency order (children/leaves before parents) so a drift parent isn't
 *  deleted while a drift child still references it (FK constraint) — e.g. documents before
 *  document-categories, articles before tags/authors, projects before technologies. Each delete is
 *  isolated so one failure (e.g. a surviving row still pointing at it in a hand-edited archive) is
 *  reported as an error without aborting the rest of the pass. */
export async function replaceDrift(
  payload: Payload,
  archiveIdentities: Map<ContentCollection, Set<string>>,
  refIds: Map<ContentCollection, Set<string | number>>,
  report: ImportReport,
  dryRun: boolean,
): Promise<void> {
  const order = [...archiveIdentities.keys()].reverse() // children before parents (FK-safe)
  for (const collection of order) {
    const identities = archiveIdentities.get(collection)!
    const res = await payload.find({ collection, depth: 0, limit: 0, pagination: false } as any)
    for (const doc of res.docs as any[]) {
      const uuid = typeof doc.uuid === 'string' && doc.uuid ? doc.uuid : undefined
      const identity = uuid ?? String(doc[NATURAL_KEYS[collection]])
      if (identities.has(identity)) continue // present in archive → keep
      if (refIds.get(collection)?.has(doc.id)) {
        report.skippedReferenced.push({
          collection,
          key: identity,
          reason: 'still referenced by a surviving record',
        })
        continue
      }
      if (!dryRun) {
        try {
          await payload.delete({ collection, id: doc.id } as any)
        } catch (e) {
          // FK constraint / other delete failure — don't abort the pass; report + keep going so
          // unrelated collections still converge.
          report.errors.push({
            collection: '(replace-all)',
            key: identity,
            message: `delete failed: ${e instanceof Error ? e.message : String(e)}`,
          })
          continue
        }
      }
      report.deleted[collection] = (report.deleted[collection] ?? 0) + 1
    }
  }
}

/** Populate the resolver with existing DB records for relation-target collections NOT in the archive,
 *  so a partial archive (e.g. a projects-only generated import) still resolves relations
 *  (e.g. techTags → technologies). Full archives: every target is in `present` → no-op. */
export async function primeResolver(
  payload: Payload,
  resolver: IdResolver,
  present: ReadonlySet<string>,
): Promise<void> {
  for (const target of RELATION_TARGETS) {
    if (present.has(target)) continue
    const res = await payload.find({ collection: target, depth: 0, limit: 0, pagination: false } as any)
    for (const doc of res.docs as any[]) {
      const key = doc[NATURAL_KEYS[target]]
      if (key != null) resolver.set(target, String(key), doc.id, doc.uuid ?? undefined)
    }
  }
}

/** Rewrite a row's relationship fields from refs (v1 string | v2 {uuid,key}) → ids.
 *  selfRef fields are skipped (resolved in a 2nd pass). Required refs that can't resolve throw. */
export function rewriteRelationsToIds(
  collection: ContentCollection,
  row: Record<string, any>,
  resolver: IdResolver,
): Record<string, any> {
  const data: Record<string, any> = { ...row }
  const rels = RELATIONS[collection]
  if (!rels) return data
  for (const rel of rels) {
    if (rel.selfRef) continue
    const val = data[rel.field]
    if (val == null) {
      if (rel.required) {
        throw new UnresolvedRelationError(rel.to, '(missing)', `${collection}.${rel.field}`)
      }
      continue
    }
    if (rel.hasMany) {
      const refs = (Array.isArray(val) ? val : [val])
        .map((v) => toRef(v))
        .filter((r): r is { uuid?: string; key: string } => r !== null)
      data[rel.field] = refs
        .map((r) => resolver.resolve(rel.to, r))
        .filter((id): id is number | string => id !== undefined)
    } else {
      const ref = toRef(val)
      if (!ref) {
        if (rel.required) throw new UnresolvedRelationError(rel.to, '(invalid)', `${collection}.${rel.field}`)
        delete data[rel.field]
        continue
      }
      const id = resolver.resolve(rel.to, ref)
      if (id === undefined) {
        if (rel.required) throw new UnresolvedRelationError(rel.to, ref.key, `${collection}.${rel.field}`)
        delete data[rel.field]
      } else {
        data[rel.field] = id
      }
    }
  }
  return data
}

type UpsertOutcome = { status: 'created' | 'updated'; id?: number | string; key: string }

async function upsertDoc(
  payload: Payload,
  collection: ContentCollection,
  row: Record<string, any>,
  editorConfig: EditorConfig,
  zip: AdmZip,
  pfx: string,
  resolver: IdResolver,
  dryRun: boolean,
): Promise<UpsertOutcome> {
  const keyField = NATURAL_KEYS[collection]
  const key = String(row[keyField])
  const uuid = typeof row.uuid === 'string' && row.uuid ? row.uuid : undefined
  let data = rewriteRelationsToIds(collection, row, resolver)

  // MD → Lexical for rich-text bodies.
  const bodyField = RICH_TEXT_BODY[collection]
  if (bodyField && typeof data[bodyField] === 'string') {
    data[bodyField] = mdToLexical(data[bodyField], editorConfig)
  }

  // Upload collection: `filename` is auto-managed by Payload, not a data field.
  const isUpload = collection === 'documents' || collection === 'media'
  if (isUpload) {
    delete data.filename
  }

  // Find existing by uuid first (rename-safe), else by natural key (v1 / un-backfilled).
  let existingId: number | string | undefined
  if (uuid) {
    const byUuid = await payload.find({
      collection,
      where: { uuid: { equals: uuid } },
      limit: 1,
      depth: 0,
    } as any)
    if (byUuid.totalDocs > 0) existingId = byUuid.docs[0].id
  }
  if (existingId === undefined) {
    const byKey = await payload.find({
      collection,
      where: { [keyField]: { equals: row[keyField] } },
      limit: 1,
      depth: 0,
    } as any)
    if (byKey.totalDocs > 0) existingId = byKey.docs[0].id
  }
  const exists = existingId !== undefined

  if (dryRun) {
    // Still track existing ids so downstream relations can resolve in dry-run.
    return { status: exists ? 'updated' : 'created', id: existingId, key }
  }

  if (isUpload) {
    // Backwards compat: v2 exports use media/<collection>/<filename>, v1 exports use media/<filename> (documents only).
    const newPath = `${pfx}media/${collection}/${row.filename}`
    const legacyPath = `${pfx}media/${row.filename}`
    const bytes = row.filename
      ? (safeReadEntry(zip, newPath) ?? safeReadEntry(zip, legacyPath))
      : null
    const file =
      bytes && row.filename
        ? { data: bytes, mimetype: inferMimetype(row.filename), name: row.filename, size: bytes.length }
        : undefined
    if (exists) {
      await payload.update({ collection, id: existingId, data, ...(file ? { file } : {}) } as any)
      return { status: 'updated', id: existingId, key }
    }
    if (!file) throw new Error(`"${collection}" record "${key}" has no media file in the archive`)
    const created = await payload.create({ collection, data, file } as any)
    return { status: 'created', id: created.id, key }
  }

  if (exists) {
    await payload.update({ collection, id: existingId, data } as any)
    return { status: 'updated', id: existingId, key }
  }
  const created = await payload.create({ collection, data } as any)
  return { status: 'created', id: created.id, key }
}

/** 2nd pass: resolve self-referential relations (articles.relatedArticles). Returns docs touched. */
async function resolveSelfRefs(
  payload: Payload,
  zip: AdmZip,
  pfx: string,
  resolver: IdResolver,
  dryRun: boolean,
): Promise<number> {
  if (!safeReadEntry(zip, `${pfx}collections/articles.json`)) return 0
  const selfRels = RELATIONS.articles?.filter((r) => r.selfRef) ?? []
  if (selfRels.length === 0) return 0
  const articles = readJson<Record<string, any>[]>(zip, `${pfx}collections/articles.json`)

  let touched = 0
  for (const art of articles) {
    const updates: Record<string, any> = {}
    for (const rel of selfRels) {
      const val = art[rel.field]
      if (!val) continue
      const refs = (Array.isArray(val) ? val : [val])
        .map((v) => toRef(v))
        .filter((r): r is { uuid?: string; key: string } => r !== null)
      updates[rel.field] = refs
        .map((r) => resolver.resolve('articles', r))
        .filter((id): id is number | string => id !== undefined)
    }
    if (Object.keys(updates).length === 0) continue
    if (dryRun) {
      touched++
      continue
    }
    // Find the article by uuid (rename-safe) → slug fallback.
    const uuid = typeof art.uuid === 'string' && art.uuid ? art.uuid : undefined
    let existing
    if (uuid) {
      existing = await payload.find({
        collection: 'articles',
        where: { uuid: { equals: uuid } },
        limit: 1,
        depth: 0,
      } as any)
    }
    if ((!uuid || existing.totalDocs === 0) && art.slug !== undefined) {
      existing = await payload.find({
        collection: 'articles',
        where: { slug: { equals: art.slug } },
        limit: 1,
        depth: 0,
      } as any)
    }
    if (existing && existing.totalDocs > 0) {
      await payload.update({ collection: 'articles', id: existing.docs[0].id, data: updates } as any)
      touched++
    }
  }
  return touched
}

function bump(report: ImportReport, bucket: 'created' | 'updated', collection: string): void {
  report[bucket][collection] = (report[bucket][collection] ?? 0) + 1
}

export async function importFromArchive(
  payload: Payload,
  zipBuf: Buffer,
  opts: ImportOptions,
): Promise<ImportReport> {
  const zip = readZip(zipBuf)
  const pfx = detectPrefix(zip)
  if (!zip.getEntry(`${pfx}manifest.json`)) {
    if (zip.getEntry(`${pfx}snapshot-manifest.json`)) {
      throw new Error(
        "this .zip is a DB snapshot, not a content export — restore it with `npm run snapshot:restore`, or upload a content export (portfolio-data-*.zip) instead",
      )
    }
    throw new Error('not a portfolio content archive (manifest.json missing)')
  }
  const manifest = readJson<ArchiveManifest>(zip, `${pfx}manifest.json`)
  validateManifest(manifest)

  const editorConfig = await getEditorConfig(payload)
  const resolver = makeIdResolver()
  const report: ImportReport = {
    created: {},
    updated: {},
    unchanged: {},
    deleted: {},
    skippedReferenced: [],
    errors: [],
    dryRun: opts.dryRun,
  }

  // Collections present in this archive, in dependency order.
  const present = new Set<string>()
  for (const c of CONTENT_COLLECTIONS) {
    if (zip.getEntry(`${pfx}collections/${c}.json`)) present.add(c)
  }

  // Replace-all needs the full reference graph — refuse a partial archive before any work.
  if (opts.replaceAll) assertFullArchive(present)

  // Prime the resolver with existing DB records for relation targets not in this archive, so a partial
  // archive (e.g. a projects-only generated import) still resolves relations. No-op for full archives.
  await primeResolver(payload, resolver, present)

  if (!opts.dryRun) {
    report.backupPath = backupDb(opts.backupDir)
  }

  const archiveIdentities = new Map<ContentCollection, Set<string>>()
  for (const collection of planImportOrder(present)) {
    const rows = readJson<Record<string, any>[]>(zip, `${pfx}collections/${collection}.json`)
    if (opts.replaceAll) archiveIdentities.set(collection, archiveIdentitySet(collection, rows))
    for (const row of rows) {
      try {
        const outcome = await upsertDoc(payload, collection, row, editorConfig, zip, pfx, resolver, opts.dryRun)
        bump(report, outcome.status, collection)
        if (outcome.id !== undefined) {
          const rowUuid = typeof row.uuid === 'string' && row.uuid ? row.uuid : undefined
          resolver.set(collection, outcome.key, outcome.id, rowUuid)
        }
      } catch (e) {
        report.errors.push({
          collection,
          key: String(row[NATURAL_KEYS[collection]] ?? ''),
          message: e instanceof Error ? e.message : String(e),
        })
      }
    }
  }

  // 2nd pass: self-referential relations.
  try {
    await resolveSelfRefs(payload, zip, pfx, resolver, opts.dryRun)
  } catch (e) {
    report.errors.push({
      collection: 'articles',
      key: '(self-ref)',
      message: e instanceof Error ? e.message : String(e),
    })
  }

  // Globals.
  for (const g of SYNC_GLOBALS) {
    if (!zip.getEntry(`${pfx}globals/${g}.json`)) continue
    const data = readJson<Record<string, any>>(zip, `${pfx}globals/${g}.json`)
    try {
      if (!opts.dryRun) await payload.updateGlobal({ slug: g, data } as any)
      bump(report, 'updated', `global:${g}`)
    } catch (e) {
      report.errors.push({
        collection: `global:${g}`,
        key: g,
        message: e instanceof Error ? e.message : String(e),
      })
    }
  }

  // Sprint-17: replace-all drift pass — delete records absent from the archive (a full archive was
  // asserted above). Records still referenced by a surviving row are reported + kept.
  if (opts.replaceAll) {
    try {
      const refIds = collectReferenced(zip, pfx, resolver)
      await replaceDrift(payload, archiveIdentities, refIds, report, opts.dryRun)
    } catch (e) {
      report.errors.push({
        collection: '(replace-all)',
        key: '',
        message: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return report
}
