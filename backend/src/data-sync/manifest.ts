// Archive manifest: stamps provenance + schema version so an importer can sanity-check
// an archive before touching the DB.

import { SCHEMA_VERSION, type ArchiveManifest } from './types'

export class ManifestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ManifestError'
  }
}

export function buildManifest(opts: {
  sourceEnv: string
  payloadVersion: string
  counts: Record<string, number>
  exportedAt: string
}): ArchiveManifest {
  return {
    schemaVersion: SCHEMA_VERSION,
    tool: 'portfolio-data-sync',
    exportedAt: opts.exportedAt,
    sourceEnv: opts.sourceEnv,
    payloadVersion: opts.payloadVersion,
    counts: opts.counts,
  }
}

/** Throws ManifestError if `m` is not a valid archive manifest for this schema version. */
export function validateManifest(m: unknown): asserts m is ArchiveManifest {
  if (!m || typeof m !== 'object') throw new ManifestError('manifest is not an object')
  const man = m as Record<string, unknown>
  if (man.schemaVersion !== SCHEMA_VERSION) {
    throw new ManifestError(`schemaVersion mismatch: expected ${SCHEMA_VERSION}, got ${String(man.schemaVersion)}`)
  }
  if (man.tool !== 'portfolio-data-sync') {
    throw new ManifestError(`tool mismatch: "${String(man.tool)}" — not a portfolio-data-sync archive`)
  }
  if (typeof man.exportedAt !== 'string' || !man.exportedAt) {
    throw new ManifestError('manifest.exportedAt missing or invalid')
  }
  if (typeof man.counts !== 'object' || man.counts === null) {
    throw new ManifestError('manifest.counts missing')
  }
}
