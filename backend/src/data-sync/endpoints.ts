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
 *  Tolerates a top-level folder prefix (macOS/Windows re-zip) and ignores OS junk.
 *  ⚠️ Vercel caps request bodies at 4.5 MB — for larger zips use /api/data-import-r2. */
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

/** Sprint-27 addendum: POST /api/data-import-r2 (json: { key, dryRun, replaceOnly? }).
 *  Serverless request bodies are capped (Vercel: 4.5 MB), so large publish zips travel
 *  via the R2 bucket instead: the client uploads the zip to `publish-inbox/`, then calls
 *  this endpoint with the object key. Same engine + options as /api/data-import; the
 *  object is deleted best-effort after a successful import (inbox, not storage). */
export const dataImportR2Endpoint: Endpoint = {
  path: '/data-import-r2',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    const { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env
    if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
      return serverError('R2 import is not configured (S3_* env vars missing)')
    }
    try {
      const body = (await req.json()) as {
        key?: string
        dryRun?: boolean
        replaceAll?: boolean
        replaceOnly?: string
      }
      const { key, dryRun, replaceAll, replaceOnly } = body ?? {}
      // Only the inbox prefix, zip extension, safe filename chars — never arbitrary keys.
      if (typeof key !== 'string' || !/^publish-inbox\/[A-Za-z0-9._-]+\.zip$/.test(key)) {
        return Response.json(
          { error: 'key must be publish-inbox/<name>.zip with a safe filename' },
          { status: 400 },
        )
      }
      const replaceCollections =
        typeof replaceOnly === 'string' && replaceOnly
          ? replaceOnly.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined

      const { S3Client, GetObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      const s3 = new S3Client({
        endpoint: S3_ENDPOINT,
        region: 'auto',
        credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
      })
      const got = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }))
      if (!got.Body) return Response.json({ error: `object not found: ${key}` }, { status: 404 })
      const buf = Buffer.from(await got.Body.transformToByteArray())

      const report = await importFromArchive(req.payload, buf, {
        dryRun: !!dryRun,
        replaceAll: !!replaceAll,
        replaceCollections: replaceCollections as ContentCollection[] | undefined,
      })
      // Inbox hygiene — keep the object only when something went wrong (debuggability).
      if (!report.errors?.length) {
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })).catch(() => null)
      }
      return Response.json(report)
    } catch (e) {
      return badRequest(e) // missing object, corrupt zip, manifest mismatch → user error
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
  dataImportR2Endpoint,
  dataInsertOneEndpoint,
  dataSnapshotEndpoint,
  dataMergeEndpoint,
]
