// Merge engine — combine two same-collection records: repoint every incoming relationship from
// loser → winner, then delete the loser. Winner-takes-all on fields (loser's data is discarded; its
// outgoing relationships are reported but not preserved). Dry-run + pre-merge backup, mirroring import.
//
// The incoming-relationship set is derived from `RELATIONS` via `inverseRelations()`, so a new
// relationship automatically flows into merge (single source of truth).

import type { Payload } from 'payload'

import { CONTENT_COLLECTIONS, type ContentCollection } from './types'
import { NATURAL_KEYS, RELATIONS, inverseRelations } from './keys'
import { backupDb } from './import'

export interface MergeRepoint {
  fromCollection: string
  field: string
  count: number
}

export interface MergeReport {
  collection: string
  winner: { uuid: string; label: string } | null
  loser: { uuid: string; label: string } | null
  /** Incoming relations repointed loser→winner (one entry per (collection, field)). */
  repointed: MergeRepoint[]
  /** Loser's own outgoing relations — discarded with the loser; surfaced for awareness. */
  loserOutgoing: string[]
  deletedLoser: boolean
  dryRun: boolean
  backupPath?: string
}

export class MergeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MergeError'
  }
}

export interface MergeOptions {
  dryRun?: boolean
  backupDir?: string
  /** Override the pre-merge backup (used by tests to stay hermetic). Defaults to copying payload.db. */
  backup?: () => string | undefined
}

/** Does `doc[field]` reference `id`? At depth:0 relationships are raw ids (not populated objects). */
export function fieldReferencesId(
  doc: Record<string, any>,
  field: string,
  id: number | string,
  hasMany: boolean,
): boolean {
  const match = (v: any) => v != null && String(typeof v === 'object' ? v.id : v) === String(id)
  const val = doc[field]
  if (hasMany) return Array.isArray(val) && val.some(match)
  return val != null && match(val)
}

/** Replace loser.id with winner.id in a hasMany array, dedup, preserving the original id value type. */
function repointHasMany(arr: any[], loserId: number | string, winnerId: number | string): any[] {
  const seen = new Set<string>()
  const next: any[] = []
  for (const v of arr) {
    const s = String(v)
    if (s === String(loserId)) continue // drop loser
    if (seen.has(s)) continue // dedup
    seen.add(s)
    next.push(v)
  }
  if (!seen.has(String(winnerId))) next.push(winnerId)
  return next
}

async function findOneByUuid(
  payload: Payload,
  collection: ContentCollection,
  uuid: string,
): Promise<Record<string, any> | null> {
  const res = await payload.find({
    collection,
    where: { uuid: { equals: uuid } },
    limit: 1,
    depth: 0,
  } as any)
  return (res.totalDocs ?? 0) > 0 ? (res.docs[0] as Record<string, any>) : null
}

export async function mergeRecords(
  payload: Payload,
  collection: ContentCollection,
  winnerUuid: string,
  loserUuid: string,
  opts: MergeOptions = {},
): Promise<MergeReport> {
  const dryRun = opts.dryRun ?? false
  if (!winnerUuid || !loserUuid) throw new MergeError('winnerUuid and loserUuid are required')
  if (winnerUuid === loserUuid) throw new MergeError('winner and loser must be different records')
  if (!(CONTENT_COLLECTIONS as readonly string[]).includes(collection)) {
    throw new MergeError(`unknown content collection: ${collection}`)
  }

  const keyField = NATURAL_KEYS[collection] ?? 'id'

  const [winner, loser] = await Promise.all([
    findOneByUuid(payload, collection, winnerUuid),
    findOneByUuid(payload, collection, loserUuid),
  ])
  if (!winner) throw new MergeError(`winner not found in ${collection}: uuid ${winnerUuid}`)
  if (!loser) throw new MergeError(`loser not found in ${collection}: uuid ${loserUuid}`)

  const report: MergeReport = {
    collection,
    winner: { uuid: winnerUuid, label: String(winner[keyField] ?? winner.id) },
    loser: { uuid: loserUuid, label: String(loser[keyField] ?? loser.id) },
    repointed: [],
    loserOutgoing: RELATIONS[collection]?.map((r) => `${collection}.${r.field} → ${r.to}`) ?? [],
    deletedLoser: false,
    dryRun,
  }

  // Repoint every incoming relationship from loser → winner.
  const incoming = inverseRelations().get(collection) ?? []
  for (const rel of incoming) {
    const all = await payload.find({
      collection: rel.fromCollection,
      depth: 0,
      limit: 0,
      pagination: false,
    } as any)
    const docs = (all.docs as Record<string, any>[]).filter((d) =>
      fieldReferencesId(d, rel.field, loser.id, rel.hasMany),
    )
    if (docs.length === 0) continue

    if (!dryRun) {
      for (const doc of docs) {
        if (rel.hasMany) {
          const arr = Array.isArray(doc[rel.field]) ? doc[rel.field] : []
          await payload.update({
            collection: rel.fromCollection,
            id: doc.id,
            data: { [rel.field]: repointHasMany(arr, loser.id, winner.id) },
          } as any)
        } else {
          await payload.update({
            collection: rel.fromCollection,
            id: doc.id,
            data: { [rel.field]: winner.id },
          } as any)
        }
      }
    }
    report.repointed.push({ fromCollection: rel.fromCollection, field: rel.field, count: docs.length })
  }

  if (!dryRun) {
    report.backupPath = (opts.backup ?? (() => backupDb(opts.backupDir, 'premerge')))()
    await payload.delete({ collection, id: loser.id } as any)
    report.deletedLoser = true
  }

  return report
}
