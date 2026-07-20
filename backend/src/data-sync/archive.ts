// Zip helpers — create in memory (archiver) and read (adm-zip).
// NOTE: archiver v8 dropped the callable default export; use `new ZipArchive(opts)`.

import { ZipArchive } from 'archiver'
import AdmZip from 'adm-zip'

export interface ZipEntry {
  path: string
  data: Buffer | string
}

/** Build a zip Buffer from path/data entries (max compression). */
export function createZip(entries: ZipEntry[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } })
    const chunks: Buffer[] = []
    archive.on('data', (c: Buffer) => chunks.push(c))
    archive.on('warning', (w: unknown) => reject(w))
    archive.on('error', (e: unknown) => reject(e))
    archive.on('end', () => resolve(Buffer.concat(chunks)))
    for (const e of entries) {
      archive.append(typeof e.data === 'string' ? Buffer.from(e.data, 'utf8') : e.data, { name: e.path })
    }
    archive.finalize()
  })
}

/** Open a zip Buffer for reading. */
export function readZip(buf: Buffer): AdmZip {
  return new AdmZip(buf)
}

/** Read + JSON.parse an entry from an open zip. Throws if the entry is absent. */
export function readJson<T = unknown>(zip: AdmZip, path: string): T {
  const entry = zip.getEntry(path)
  if (!entry) throw new Error(`archive missing entry: ${path}`)
  return JSON.parse(entry.getData().toString('utf8')) as T
}

/** Read a raw entry as a Buffer (for media files). Throws if the entry is absent. */
export function readEntry(zip: AdmZip, path: string): Buffer {
  const entry = zip.getEntry(path)
  if (!entry) throw new Error(`archive missing entry: ${path}`)
  return entry.getData()
}

/** List entry paths in the zip. */
export function listEntries(zip: AdmZip): string[] {
  return zip.getEntries().map((e) => e.entryName)
}
