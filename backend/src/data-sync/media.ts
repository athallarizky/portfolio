// Sprint-27: git-tracked project screenshots in the publish pipeline.
//
// Convention (tools/repo-to-project/content/<slug>/):
//   screenshots/            image files (png/jpg/webp/gif/svg)
//   project.json            "screenshots": [{ "file": "home.png", "alt": "...", "caption": "..." }]
//
// `file` is relative to screenshots/. The packed media filename is "<slug>-<file>" so the
// media natural key (filename) can never collide across projects. Media uuids are
// uuidv5(namespace, filename) — deterministic across machines, so re-publishes update media
// in place and local/prod converge on the same identity without coordination.
//
// Import side needs NO changes: media is a standard upload collection (the importer already
// creates/updates rows from archive files), and `screenshots` rides the generic relation
// rewrite once declared in RELATIONS (keys.ts). Media imports before projects (IMPORT_ORDER),
// so refs always resolve; collectReferenced() protects media rows from replace-all drift
// deletion while a published project still references them.

import fs from 'fs'
import path from 'path'
import { createHash } from 'node:crypto'

import type { ZipEntry } from './archive'
import { WrapPublishError } from './cli/wrap-publish'

/** Fixed uuidv5 namespace for portfolio media uuids. Any fixed value works — must never change. */
export const MEDIA_UUID_NAMESPACE = '6f4d2a9c-11ab-4b7e-8f1a-b7e2f1a00001'

/** RFC-4122 v5 (SHA-1, named-space) uuid — zero-dependency implementation. */
export function uuidV5(name: string, namespace: string = MEDIA_UUID_NAMESPACE): string {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex')
  const digest = createHash('sha1').update(ns).update(Buffer.from(name, 'utf8')).digest()
  digest[6] = (digest[6] & 0x0f) | 0x50 // version 5
  digest[8] = (digest[8] & 0x3f) | 0x80 // RFC variant
  const h = digest.toString('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg)$/i

/** One entry of project.json → "screenshots": [{ file, alt?, caption? }]. */
export interface ScreenshotSpec {
  file: string
  alt?: string
  caption?: string
}

/** One packed screenshot: the media collection row, the zip file entry, and the relation ref. */
export interface PackedScreenshot {
  mediaRow: { uuid: string; filename: string; alt: string; caption?: string }
  fileEntry: ZipEntry
  ref: { uuid: string; key: string }
}

/** Pack one declared media spec ({ file, alt?, caption? }) into a media row + zip entry + ref.
 *  Dedupe: the same archive filename (same project + file) is packed ONCE — a later spec
 *  reusing it (e.g. bannerImage pointing at the same screenshot) gets the same ref, so both
 *  fields share one media row. `packed` accumulates across the whole publish. */
export function packMediaSpec(opts: {
  slug: string
  title?: string
  contentDir: string
  spec: unknown
  packed: Map<string, PackedScreenshot>
}): PackedScreenshot {
  const { slug, title, contentDir, spec, packed } = opts
  if (!spec || typeof spec !== 'object' || typeof (spec as ScreenshotSpec).file !== 'string' || !(spec as ScreenshotSpec).file) {
    throw new WrapPublishError(`${slug}: media spec must be an object with a "file" string (relative to screenshots/)`)
  }
  const s = spec as ScreenshotSpec
  if (!IMAGE_RE.test(s.file)) {
    throw new WrapPublishError(`${slug}: media file "${s.file}" is not a supported image (png/jpg/webp/gif/svg)`)
  }
  const filename = `${slug}-${s.file}`
  const existing = packed.get(filename)
  if (existing) return existing
  const abs = path.join(contentDir, 'screenshots', s.file)
  if (!fs.existsSync(abs)) {
    throw new WrapPublishError(`${slug}: media file not found: screenshots/${s.file}`)
  }
  const uuid = uuidV5(filename)
  const alt = typeof s.alt === 'string' && s.alt.trim() ? s.alt : `${title ?? slug} — ${s.file}`
  const entry: PackedScreenshot = {
    mediaRow: {
      uuid,
      filename,
      alt,
      ...(typeof s.caption === 'string' && s.caption ? { caption: s.caption } : {}),
    },
    fileEntry: { path: `media/media/${filename}`, data: fs.readFileSync(abs) },
    ref: { uuid, key: filename },
  }
  packed.set(filename, entry)
  return entry
}

/** Pack one project row's "screenshots" field → media rows + zip file entries + relation refs. */
export function packScreenshots(opts: {
  slug: string
  title?: string
  contentDir: string
  refs: unknown
  packed: Map<string, PackedScreenshot>
}): PackedScreenshot[] {
  const { slug, refs } = opts
  if (refs == null) return []
  if (!Array.isArray(refs)) {
    throw new WrapPublishError(
      `${slug}: "screenshots" must be an array of { file, alt?, caption? } (file is relative to screenshots/)`,
    )
  }
  return refs.map((spec) => packMediaSpec({ ...opts, spec }))
}
