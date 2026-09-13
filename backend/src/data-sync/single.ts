// Insert-one helper: wrap one or more v2 rows for a single content collection into an
// in-memory archive (manifest v2 + collections/<c>.json) ready for `importFromArchive`.
// Factors the logic that lived in cli/wrap-projects.ts so the admin "Add from JSON" path,
// the wrap CLI, and the insert-one CLI share one implementation. importFromArchive does the
// actual upsert (uuid-first → idempotent) + priming (techTags resolve) — no engine dup.

import { randomUUID } from 'node:crypto'
import fs from 'fs'

import { NATURAL_KEYS } from './keys'
import { buildManifest } from './manifest'
import { createZip, type ZipEntry } from './archive'
import { resolvePkgVersion } from './version'
import { archiveSchemaVersion, validateOverlayRow, OverlayValidationError } from './locales'
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

/** Sprint-24: attach an optional sibling `<base>.id.json` translation to a single-row
 *  input (e.g. article.json ← article.id.json). The sibling IS the overlay object and
 *  must carry the same uuid + natural key as the EN row (identity check), containing
 *  localized fields only. Returns whether an overlay was attached. */
export function attachOverlaySibling(
  inputPath: string,
  collection: ContentCollection,
  row: Record<string, any>,
): boolean {
  const sibling = inputPath.replace(/\.json$/i, '') + '.id.json'
  if (!fs.existsSync(sibling)) return false
  let parsed: Record<string, any>
  try {
    parsed = JSON.parse(fs.readFileSync(sibling, 'utf8'))
  } catch (e) {
    throw new SingleArchiveError(
      `${sibling}: invalid JSON (${e instanceof Error ? e.message : String(e)})`,
    )
  }
  const keyField = NATURAL_KEYS[collection]
  if (parsed.uuid !== row.uuid || String(parsed[keyField]) !== String(row[keyField])) {
    throw new SingleArchiveError(
      `${sibling}: identity mismatch — expected uuid "${row.uuid}" / ${keyField} "${row[keyField]}" ` +
        `(sibling carries "${parsed.uuid}" / "${String(parsed[keyField])}"); a translation must point at the same record`,
    )
  }
  const { uuid: _u, [keyField]: _k, ...overlay } = parsed
  try {
    validateOverlayRow(collection, overlay)
  } catch (e) {
    if (e instanceof OverlayValidationError) {
      throw new SingleArchiveError(`${sibling}: ${e.message}`)
    }
    throw e
  }
  if (Object.keys(overlay).length === 0) {
    throw new SingleArchiveError(`${sibling}: no localized fields present`)
  }
  row.locales = { ...(row.locales ?? {}), id: overlay }
  return true
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
        // Sprint-24: bilingual rows (locales.<code> overlays) → v3; EN-only → v2,
        // so the zip stays importable wherever the v2 importer is still deployed.
        schemaVersion: archiveSchemaVersion([rows]),
      }),
      null,
      2,
    ),
  })

  const buffer = await createZip(entries)
  return { buffer, filledUuids }
}
