// Content export — walks collections + globals via the Local API and writes a portable
// zip. Relationships are rewritten from DB ids to natural keys (see keys.ts).
// Bodies (articles/projects) are exported as inline Markdown; Documents media files
// are bundled under media/.

import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'

import {
  CONTENT_COLLECTIONS,
  SYNC_GLOBALS,
  INTERNAL_FIELDS,
  UPLOAD_AUTO_FIELDS,
  type ContentCollection,
  type ArchiveManifest,
  type RelationRef,
} from './types'
import { NATURAL_KEYS, RELATIONS, RELATION_TARGETS, RICH_TEXT_BODY } from './keys'
import { buildManifest } from './manifest'
import { createZip, type ZipEntry } from './archive'
import { getEditorConfig, lexicalToMd } from './converters'

/** Per target collection: Map<id-as-string, { uuid, key }> — the v2 dual-reference form. */
export type IdRefMaps = Map<ContentCollection, Map<string, RelationRef>>

async function buildIdRefMaps(payload: Payload): Promise<IdRefMaps> {
  const maps: IdRefMaps = new Map()
  for (const target of RELATION_TARGETS) {
    const res = await payload.find({
      collection: target,
      depth: 0,
      limit: 0,
      pagination: false,
    } as any)
    const keyField = NATURAL_KEYS[target]
    const m = new Map<string, RelationRef>()
    for (const doc of res.docs as any[]) {
      m.set(String(doc.id), { uuid: doc.uuid ?? undefined, key: doc[keyField] })
    }
    maps.set(target, m)
  }
  return maps
}

/** Rewrite a doc's relationship fields from ids → dual refs { uuid, key }, in place (v2 format). */
export function rewriteRelations(
  doc: Record<string, any>,
  collection: ContentCollection,
  maps: IdRefMaps,
): void {
  const rels = RELATIONS[collection]
  if (!rels) return
  for (const rel of rels) {
    const val = doc[rel.field]
    if (val == null) continue
    const targetMap = maps.get(rel.to)
    if (!targetMap) continue
    if (rel.hasMany) {
      const ids = Array.isArray(val) ? val : [val]
      doc[rel.field] = ids
        .map((id: any) => targetMap.get(String(id)))
        .filter((v: any): v is RelationRef => v !== undefined)
    } else {
      doc[rel.field] = targetMap.get(String(val)) ?? null
    }
  }
}

/** Strip Payload-managed + upload auto-fields. Keeps `filename` on upload collections. */
function stripInternal(doc: Record<string, any>, isUpload: boolean): Record<string, any> {
  const out: Record<string, any> = { ...doc }
  for (const f of INTERNAL_FIELDS) delete out[f]
  if (isUpload) {
    for (const f of UPLOAD_AUTO_FIELDS) delete out[f]
  }
  return out
}

export interface ExportOptions {
  sourceEnv: string
  payloadVersion: string
  /** ISO timestamp; caller supplies so the engine stays deterministic in tests. */
  exportedAt: string
}

/** Resolve the on-disk upload directory for a collection — Payload's
 *  configured staticDir if available, else `<cwd>/<collectionSlug>`. */
export function resolveMediaDir(payload: Payload, collectionSlug: string): string {
  const coll = (payload as any).collections?.[collectionSlug]
  if (coll?.upload?.staticDir) return coll.upload.staticDir as string
  return path.resolve(process.cwd(), collectionSlug)
}

export async function exportToArchive(payload: Payload, opts: ExportOptions): Promise<Buffer> {
  const maps = await buildIdRefMaps(payload)
  const editorConfig = await getEditorConfig(payload)
  const entries: ZipEntry[] = []
  const counts: Record<string, number> = {}

  for (const collection of CONTENT_COLLECTIONS) {
    const isUpload = collection === 'documents' || collection === 'media'
    const res = await payload.find({ collection, depth: 0, limit: 0, pagination: false } as any)
    const rows = (res.docs as any[]).map((doc) => {
      const clean = stripInternal(doc, isUpload)
      rewriteRelations(clean, collection, maps)
      const bodyField = RICH_TEXT_BODY[collection]
      if (bodyField && clean[bodyField]) {
        clean[bodyField] = lexicalToMd(clean[bodyField], editorConfig)
      }
      return clean
    })
    entries.push({ path: `collections/${collection}.json`, data: JSON.stringify(rows, null, 2) })
    counts[collection] = rows.length

    if (isUpload) {
      const mediaDir = resolveMediaDir(payload, collection)
      for (const row of rows) {
        if (!row.filename) continue
        try {
          entries.push({
            path: `media/${collection}/${row.filename}`,
            data: fs.readFileSync(path.join(mediaDir, row.filename)),
          })
        } catch {
          console.warn(`⚠️  media not found, skipping: ${row.filename}`)
        }
      }
    }
  }

  for (const globalSlug of SYNC_GLOBALS) {
    const data = await payload.findGlobal({ slug: globalSlug, depth: 0 } as any)
    const clean = stripInternal(data as Record<string, any>, false)
    entries.push({ path: `globals/${globalSlug}.json`, data: JSON.stringify(clean, null, 2) })
    counts[`global:${globalSlug}`] = 1
  }

  const manifest: ArchiveManifest = buildManifest({
    sourceEnv: opts.sourceEnv,
    payloadVersion: opts.payloadVersion,
    counts,
    exportedAt: opts.exportedAt,
  })
  entries.unshift({ path: 'manifest.json', data: JSON.stringify(manifest, null, 2) })

  return createZip(entries)
}
