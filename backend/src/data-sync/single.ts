// Insert-one helper: wrap one or more v2 rows for a single content collection into an
// in-memory archive (manifest v2 + collections/<c>.json) ready for `importFromArchive`.
// Factors the logic that lived in cli/wrap-projects.ts so the admin "Add from JSON" path,
// the wrap CLI, and the insert-one CLI share one implementation. importFromArchive does the
// actual upsert (uuid-first → idempotent) + priming (techTags resolve) — no engine dup.

import { randomUUID } from 'node:crypto'

import { NATURAL_KEYS } from './keys'
import { buildManifest } from './manifest'
import { createZip, type ZipEntry } from './archive'
import { resolvePkgVersion } from './version'
import type { ContentCollection } from './types'

export class SingleArchiveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SingleArchiveError'
  }
}

/** Assign a uuid to rows missing one (in place); returns how many were filled. */
export function fillUuids(rows: Record<string, unknown>[]): number {
  let filled = 0
  for (const row of rows) {
    if (!row.uuid) {
      row.uuid = randomUUID()
      filled++
    }
  }
  return filled
}

/** Validate each row has the collection's natural key; throws on the first offender. */
export function validateRows(collection: ContentCollection, rows: Record<string, unknown>[]): void {
  const keyField = NATURAL_KEYS[collection]
  for (const row of rows) {
    const key = row[keyField]
    if (key === undefined || key === null || key === '') {
      throw new SingleArchiveError(
        `row missing required field "${keyField}" for collection "${collection}"`,
      )
    }
  }
}

export interface BuiltArchive {
  buffer: Buffer
  filledUuids: number
}

/** Wrap one or many rows of a single content collection into an importable zip Buffer. */
export async function buildSingleCollectionArchive(
  collection: ContentCollection,
  rows: Record<string, unknown>[],
): Promise<BuiltArchive> {
  if (rows.length === 0) throw new SingleArchiveError(`no rows for collection "${collection}"`)
  validateRows(collection, rows)
  const filledUuids = fillUuids(rows)

  const entries: ZipEntry[] = [
    { path: `collections/${collection}.json`, data: JSON.stringify(rows, null, 2) },
  ]
  entries.unshift({
    path: 'manifest.json',
    data: JSON.stringify(
      buildManifest({
        sourceEnv: 'generated',
        payloadVersion: resolvePkgVersion('payload'),
        counts: { [collection]: rows.length },
        exportedAt: new Date().toISOString(),
      }),
      null,
      2,
    ),
  })

  const buffer = await createZip(entries)
  return { buffer, filledUuids }
}
