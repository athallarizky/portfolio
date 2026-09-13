// Archive manifest: stamps provenance + schema version so an importer can sanity-check
// an archive before touching the DB.

import { SCHEMA_VERSION, SUPPORTED_SCHEMA_VERSIONS, type ArchiveManifest } from './types'

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
  /** Sprint-24 emit rule: writers stamp 2 for EN-only archives (deployed-v2-importer
   *  compatible) and 3 when any row carries a locale overlay. Defaults to the current version. */
  schemaVersion?: ArchiveManifest['schemaVersion']
}): ArchiveManifest {
  return {
    schemaVersion: opts.schemaVersion ?? SCHEMA_VERSION,
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
  const sv = man.schemaVersion
  if (typeof sv !== 'number' || !(SUPPORTED_SCHEMA_VERSIONS as readonly number[]).includes(sv)) {
    throw new ManifestError(
      `unsupported schemaVersion: ${String(sv)} (supported: ${[...SUPPORTED_SCHEMA_VERSIONS].join(', ')})`,
    )
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
