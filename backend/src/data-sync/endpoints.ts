// Admin-only REST endpoints wrapping the data-sync engine.
// Registered at the config root → served at /api/<path> by the Payload REST catch-all.

import type { Endpoint } from 'payload'

import { exportToArchive } from './export'
import { formatStamp } from './filenames'
import { importFromArchive } from './import'
import { createSnapshot } from './snapshot'
import { mergeRecords, MergeError } from './merge'
import { resolvePkgVersion } from './version'
import { buildSingleCollectionArchive, SingleArchiveError } from './single'
import { CONTENT_COLLECTIONS, type ContentCollection } from './types'

const PAYLOAD_VERSION = resolvePkgVersion('payload')

function unauthorized(): Response {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

function badRequest(message: unknown): Response {
  return Response.json({ error: message instanceof Error ? message.message : String(message) }, { status: 400 })
}

function serverError(message: unknown): Response {
  return Response.json({ error: message instanceof Error ? message.message : String(message) }, { status: 500 })
}

/** GET /api/data-export → portable content zip (JSON + Markdown + media). */
export const dataExportEndpoint: Endpoint = {
  path: '/data-export',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    try {
      const buf = await exportToArchive(req.payload, {
        sourceEnv: process.env.NODE_ENV ?? 'local',
        payloadVersion: PAYLOAD_VERSION,
        exportedAt: new Date().toISOString(),
      })
      return new Response(new Uint8Array(buf), {
        headers: {
          'content-type': 'application/zip',
          'content-disposition': `attachment; filename="portfolio-data-${formatStamp()}.zip"`,
        },
      })
    } catch (e) {
      return serverError(e)
    }
  },
}

/** POST /api/data-import (multipart: file + dryRun) → ImportReport JSON.
 *  Tolerates a top-level folder prefix (macOS/Windows re-zip) and ignores OS junk. */
export const dataImportEndpoint: Endpoint = {
  path: '/data-import',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    try {
      const form = await req.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return Response.json({ error: 'no file uploaded (field "file")' }, { status: 400 })
      }
      const dryRun = form.get('dryRun') === 'true'
      const replaceAll = form.get('replaceAll') === 'true'
      // Sprint-23 scoped replace: `replaceOnly=articles` (csv) — drift-deletion only for the
      // listed collections; everything else upserts only. Ignored when replaceAll is set.
      const replaceOnly = form.get('replaceOnly')
      const replaceCollections = typeof replaceOnly === 'string' && replaceOnly
        ? replaceOnly.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined
      const buf = Buffer.from(await file.arrayBuffer())
      const report = await importFromArchive(req.payload, buf, {
        dryRun,
        replaceAll,
        replaceCollections: replaceCollections as ContentCollection[] | undefined,
      })
      return Response.json(report)
    } catch (e) {
      return badRequest(e) // empty/corrupt zip, manifest mismatch, partial-archive replace-all → user error
    }
  },
}

/** POST /api/data-insert-one (json: { collection, row, dryRun? }) → ImportReport.
 *  Wraps a single v2 row into an in-memory archive and imports it (idempotent upsert-by-uuid). */
export const dataInsertOneEndpoint: Endpoint = {
  path: '/data-insert-one',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    try {
      const body = (await req.json()) as {
        collection?: string
        row?: unknown
        dryRun?: boolean
      }
      const { collection, row, dryRun } = body ?? {}
      if (!collection || !CONTENT_COLLECTIONS.includes(collection as ContentCollection)) {
        return Response.json(
          { error: `collection must be one of: ${CONTENT_COLLECTIONS.join(', ')}` },
          { status: 400 },
        )
      }
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        return Response.json({ error: 'row must be a single JSON object' }, { status: 400 })
      }
      const { buffer } = await buildSingleCollectionArchive(collection as ContentCollection, [
        row as Record<string, unknown>,
      ])
      const report = await importFromArchive(req.payload, buffer, { dryRun: !!dryRun })
      return Response.json(report)
    } catch (e) {
      if (e instanceof SingleArchiveError) return badRequest(e)
      return serverError(e)
    }
  },
}

/** GET /api/data-snapshot → whole-DB zip (payload.db + documents/). */
export const dataSnapshotEndpoint: Endpoint = {
  path: '/data-snapshot',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    try {
      const buf = await createSnapshot()
      return new Response(new Uint8Array(buf), {
        headers: {
          'content-type': 'application/zip',
          'content-disposition': `attachment; filename="portfolio-snapshot-${formatStamp()}.zip"`,
        },
      })
    } catch (e) {
      return serverError(e)
    }
  },
}

/** POST /api/data-merge (json: collection, winnerUuid, loserUuid, dryRun?) → MergeReport JSON.
 *  Repoints every incoming relationship loser→winner, then deletes the loser (dry-run by preview). */
export const dataMergeEndpoint: Endpoint = {
  path: '/data-merge',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    try {
      const body = (await req.json()) as {
        collection?: string
        winnerUuid?: string
        loserUuid?: string
        dryRun?: boolean
      }
      const { collection, winnerUuid, loserUuid, dryRun } = body ?? {}
      if (!collection || !winnerUuid || !loserUuid) {
        return Response.json(
          { error: 'collection, winnerUuid, loserUuid are required' },
          { status: 400 },
        )
      }
      const report = await mergeRecords(req.payload, collection as any, winnerUuid, loserUuid, {
        dryRun: !!dryRun,
      })
      return Response.json(report)
    } catch (e) {
      if (e instanceof MergeError) return badRequest(e) // bad uuid / collection / winner==loser → 400
      return serverError(e)
    }
  },
}

export const dataSyncEndpoints: Endpoint[] = [
  dataExportEndpoint,
  dataImportEndpoint,
  dataInsertOneEndpoint,
  dataSnapshotEndpoint,
  dataMergeEndpoint,
]
