// Backfill engine — assigns a content-level uuid to every content record that lacks one.
//
// One-time migration for pre-uuid data. Run independently per env (local & prod); uuids differ
// across envs at first but self-align on the next content sync (a natural-key match on import
// overwrites the target's uuid with the archive's). Idempotent: records that already have a uuid
// are skipped. The ensureUuid hook covers records created after the field was added; this covers
// the ones that predate it.

import type { Payload } from 'payload'
import { randomUUID } from 'node:crypto'

import { CONTENT_COLLECTIONS } from './types'

export interface BackfillReport {
  scanned: Record<string, number>
  backfilled: Record<string, number>
  dryRun: boolean
}

/** Assign a uuid to every uuid-less content record. Idempotent (skips records that already have one). */
export async function backfillUuids(
  payload: Payload,
  opts: { dryRun?: boolean } = {},
): Promise<BackfillReport> {
  const dryRun = opts.dryRun ?? false
  const report: BackfillReport = { scanned: {}, backfilled: {}, dryRun }

  for (const collection of CONTENT_COLLECTIONS) {
    const res = await payload.find({ collection, depth: 0, limit: 0, pagination: false } as any)
    let scanned = 0
    let filled = 0
    for (const doc of res.docs as any[]) {
      scanned++
      if (doc.uuid) continue // already has one
      if (!dryRun) {
        // update, not create → the ensureUuid hook is a no-op → our explicit uuid is preserved.
        await payload.update({ collection, id: doc.id, data: { uuid: randomUUID() } } as any)
      }
      filled++
    }
    report.scanned[collection] = scanned
    report.backfilled[collection] = filled
  }

  return report
}
