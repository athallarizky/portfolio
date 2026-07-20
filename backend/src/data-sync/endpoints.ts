// Admin-only REST endpoints wrapping the data-sync engine.
// Registered at the config root → served at /api/<path> by the Payload REST catch-all.

import type { Endpoint } from 'payload'

import { exportToArchive } from './export'
import { importFromArchive } from './import'
import { createSnapshot } from './snapshot'
import { mergeRecords, MergeError } from './merge'
import { resolvePkgVersion } from './version'

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
          'content-disposition': 'attachment; filename="portfolio-data.zip"',
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
      const buf = Buffer.from(await file.arrayBuffer())
      const report = await importFromArchive(req.payload, buf, { dryRun })
      return Response.json(report)
    } catch (e) {
      return badRequest(e) // empty/corrupt zip, manifest mismatch, etc. → user error
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
          'content-disposition': 'attachment; filename="portfolio-snapshot.zip"',
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
  dataSnapshotEndpoint,
  dataMergeEndpoint,
]
