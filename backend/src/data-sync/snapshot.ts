// DB snapshot — a true whole-instance backup: zips the active SQLite DB (incl. -wal/-shm)
// + the documents/ upload folder. Restore is the ONLY destructive (replace-all) path:
// it requires explicit confirm and is best run with the backend stopped (the SQLite file
// may be locked while Payload is running).

import fs from 'fs'
import path from 'path'

import { createZip, readZip, readEntry, listEntries, type ZipEntry } from './archive'

export interface SnapshotMeta {
  schemaVersion: 1
  tool: 'portfolio-db-snapshot'
  exportedAt: string
  dbFiles: string[]
  mediaCount: number
}

export function defaultDbPath(): string {
  return (process.env.DATABASE_URL || 'file:./payload.db').replace(/^file:/, '')
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

/** The DB file plus any SQLite WAL/SHM siblings that exist. */
function dbFiles(dbPath: string): string[] {
  const files = [dbPath]
  for (const ext of ['-wal', '-shm']) {
    const p = `${dbPath}${ext}`
    if (fs.existsSync(p)) files.push(p)
  }
  return files
}

function walkDir(root: string, rel: string, out: ZipEntry[]): void {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(path.join(root, rel), { withFileTypes: true })
  } catch {
    return // directory missing — skip
  }
  for (const e of entries) {
    const relPath = rel ? `${rel}/${e.name}` : e.name
    if (e.isDirectory()) {
      walkDir(root, relPath, out)
    } else {
      out.push({ path: `documents/${relPath}`, data: fs.readFileSync(path.join(root, relPath)) })
    }
  }
}

export interface CreateSnapshotOptions {
  dbPath?: string
  mediaDir?: string
  exportedAt?: string
}

export async function createSnapshot(opts: CreateSnapshotOptions = {}): Promise<Buffer> {
  const dbPath = opts.dbPath ?? defaultDbPath()
  const mediaDir = opts.mediaDir ?? path.resolve(process.cwd(), 'documents')
  const entries: ZipEntry[] = []

  const dbs = dbFiles(dbPath)
  for (const f of dbs) {
    entries.push({ path: path.basename(f), data: fs.readFileSync(f) })
  }

  walkDir(mediaDir, '', entries)

  const meta: SnapshotMeta = {
    schemaVersion: 1,
    tool: 'portfolio-db-snapshot',
    exportedAt: opts.exportedAt ?? new Date().toISOString(),
    dbFiles: dbs.map((f) => path.basename(f)),
    mediaCount: entries.length - dbs.length,
  }
  entries.unshift({ path: 'snapshot-manifest.json', data: Buffer.from(JSON.stringify(meta, null, 2)) })

  return createZip(entries)
}

export interface RestoreOptions {
  confirm: boolean
  dbPath?: string
  mediaDir?: string
}

export function restoreSnapshot(buf: Buffer, opts: RestoreOptions): {
  dbRestored: boolean
  mediaFiles: number
  backupPath?: string
} {
  if (!opts.confirm) {
    throw new Error('restoreSnapshot requires { confirm: true } — it overwrites the active DB + media.')
  }
  const zip = readZip(buf)
  const dbPath = opts.dbPath ?? defaultDbPath()
  const mediaDir = opts.mediaDir ?? path.resolve(process.cwd(), 'documents')
  const dbDir = path.dirname(dbPath)

  // Back up the current DB before overwriting (best-effort — only if it exists).
  const backupPath = `${dbPath}.${timestamp()}.prerestore.bak`
  let backedUp = false
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath)
    backedUp = true
  }

  // Restore DB files — main DB to `dbPath`, siblings (-wal/-shm) follow the same stem.
  const metaEntry = zip.getEntry('snapshot-manifest.json')
  const dbNames: string[] = metaEntry
    ? (JSON.parse(metaEntry.getData().toString('utf8')).dbFiles as string[])
    : ['payload.db']
  const mainName = dbNames[0]
  for (const name of dbNames) {
    const entry = zip.getEntry(name)
    if (!entry) continue
    const target =
      name === mainName ? dbPath : path.join(dbDir, name.replace(mainName, path.basename(dbPath)))
    fs.writeFileSync(target, entry.getData())
  }

  // Restore media.
  fs.mkdirSync(mediaDir, { recursive: true })
  let mediaFiles = 0
  for (const name of listEntries(zip)) {
    if (!name.startsWith('documents/')) continue
    const rel = name.replace(/^documents\//, '')
    const dest = path.join(mediaDir, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, readEntry(zip, name))
    mediaFiles++
  }

  return { dbRestored: true, mediaFiles, backupPath: backedUp ? backupPath : undefined }
}
