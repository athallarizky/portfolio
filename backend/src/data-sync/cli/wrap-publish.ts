// CLI: `npm run wrap:publish -- --articles | --projects [-- --out <path>]`
// Sprint-23 publish pipeline builder: bundles the FULL row set of one content collection from
// the git-tracked sources under tools/ + the canonical refs manifest into one importable zip.
//
//   articles  ← tools/article-polish/content/*/article.json
//   projects  ← tools/repo-to-project/content/*/project.json
//   refs      ← tools/content/refs/{tags,technologies}.json   (npm run refs:export to refresh)
//
// The zip pairs with `import -- --replace-only <collection>` (or the /api/data-import
// `replaceOnly` field): drift in the target collection gets deleted, refs upsert only.
// Every row MUST carry a stable uuid — identity churn would duplicate records on re-publish.

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { createZip, type ZipEntry } from '../archive'
import { formatStamp } from '../filenames'
import { NATURAL_KEYS } from '../keys'
import { buildManifest } from '../manifest'
import { resolvePkgVersion } from '../version'
import { archiveSchemaVersion } from '../locales'
import { attachOverlaySibling } from '../single'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..')
const REFS_DIR = path.join(REPO_ROOT, 'tools', 'content', 'refs')

export class WrapPublishError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WrapPublishError'
  }
}

/** Parse each source file as one JSON row object. */
function readRows(files: string[], what: string): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []
  for (const f of files) {
    let parsed: unknown
    try {
      parsed = JSON.parse(fs.readFileSync(f, 'utf8'))
    } catch (e) {
      throw new WrapPublishError(`${what}: invalid JSON in ${path.relative(REPO_ROOT, f)}: ${e instanceof Error ? e.message : String(e)}`)
    }
    rows.push(parsed as Record<string, unknown>)
  }
  return rows
}

/** Every publish row needs a stable uuid + a natural key; and the set must be duplicate-free. */
export function validatePublishRows(
  collection: 'articles' | 'projects',
  rows: Record<string, unknown>[],
  sources: string[],
): void {
  const keyField = NATURAL_KEYS[collection]
  const seenUuid = new Map<string, string>()
  const seenKey = new Map<string, string>()
  rows.forEach((row, i) => {
    const src = path.relative(REPO_ROOT, sources[i])
    if (typeof row.uuid !== 'string' || !row.uuid) {
      throw new WrapPublishError(`${src}: missing "uuid" — publish rows need stable identity (re-run the generator tool for this entry)`)
    }
    const key = row[keyField]
    if (typeof key !== 'string' || !key) {
      throw new WrapPublishError(`${src}: missing "${keyField}"`)
    }
    const dupeUuid = seenUuid.get(row.uuid)
    if (dupeUuid) throw new WrapPublishError(`${src}: duplicate uuid with ${dupeUuid} (was this file copied from another entry?)`)
    const dupeKey = seenKey.get(key)
    if (dupeKey) throw new WrapPublishError(`${src}: duplicate ${keyField} "${key}" with ${dupeKey}`)
    seenUuid.set(row.uuid, src)
    seenKey.set(key, src)
  })
}

function readRefs(): { tags: Record<string, unknown>[]; technologies: Record<string, unknown>[] } {
  const read = (name: string) => {
    const p = path.join(REFS_DIR, name)
    if (!fs.existsSync(p)) {
      throw new WrapPublishError(`${p} not found — run \`npm run refs:export\` first (refs manifest is the git source of truth for tags/technologies)`)
    }
    const rows = JSON.parse(fs.readFileSync(p, 'utf8')) as Record<string, unknown>[]
    if (!Array.isArray(rows)) throw new WrapPublishError(`${p}: expected a JSON array`)
    return rows
  }
  return { tags: read('tags.json'), technologies: read('technologies.json') }
}

function uniquePath(out: string): string {
  if (!fs.existsSync(out)) return out
  const dir = path.dirname(out)
  const ext = path.extname(out)
  const base = path.basename(out, ext)
  for (let i = 2; ; i++) {
    const candidate = path.join(dir, `${base}-${i}${ext}`)
    if (!fs.existsSync(candidate)) return candidate
  }
}

async function run() {
  const args = process.argv.slice(2)
  const outIdx = args.indexOf('--out')
  const outArg = outIdx !== -1 ? args[outIdx + 1] : undefined
  const wantArticles = args.includes('--articles')
  const wantProjects = args.includes('--projects')
  if (wantArticles === wantProjects) {
    console.error('Usage: npm run wrap:publish -- --articles | --projects [-- --out <path>]')
    process.exit(1)
  }
  const collection = wantArticles ? 'articles' : 'projects'

  // 1. Target-collection rows from the git-tracked content dirs.
  const baseDir = wantArticles
    ? path.join(REPO_ROOT, 'tools', 'article-polish', 'content')
    : path.join(REPO_ROOT, 'tools', 'repo-to-project', 'content')
  const rowFile = wantArticles ? 'article.json' : 'project.json'
  const sources = fs.existsSync(baseDir)
    ? fs.readdirSync(baseDir)
        .filter((d) => fs.existsSync(path.join(baseDir, d, rowFile)))
        .sort()
        .map((d) => path.join(baseDir, d, rowFile))
    : []
  if (sources.length === 0) {
    console.error(`❌ no ${rowFile} found under ${path.relative(REPO_ROOT, baseDir)}/*/`)
    process.exit(1)
  }
  const rows = readRows(sources, collection)
  validatePublishRows(collection, rows, sources)

  // Sprint-24: optional `<name>.id.json` siblings ride along as locales.id overlays
  // (validated: same uuid+slug, localized fields only). ID stays optional per row.
  const bilingualSources: string[] = []
  sources.forEach((src, i) => {
    if (attachOverlaySibling(src, collection, rows[i] as Record<string, any>)) {
      bilingualSources.push(path.basename(path.dirname(src)))
    }
  })

  // 2. Refs always ride along so relations resolve without any admin pre-work.
  const refs = readRefs()

  // 3. Build the archive: manifest + refs + target collection.
  const files: Record<string, unknown[]> = {
    tags: refs.tags,
    technologies: refs.technologies,
    [collection]: rows,
  }
  const entries: ZipEntry[] = Object.entries(files).map(([c, rs]) => ({
    path: `collections/${c}.json`,
    data: JSON.stringify(rs, null, 2),
  }))
  entries.unshift({
    path: 'manifest.json',
    data: JSON.stringify(
      buildManifest({
        sourceEnv: 'publish',
        payloadVersion: resolvePkgVersion('payload'),
        counts: Object.fromEntries(Object.entries(files).map(([c, rs]) => [c, rs.length])),
        exportedAt: new Date().toISOString(),
        // EN-only publish → v2 (importable by the currently-deployed importer);
        // any bilingual row → v3.
        schemaVersion: archiveSchemaVersion([rows as Record<string, unknown>[]]),
      }),
      null,
      2,
    ),
  })

  const out = uniquePath(
    outArg ?? path.join(REPO_ROOT, 'tools', 'collection', `portfolio-publish-${collection}-${formatStamp()}.zip`),
  )
  fs.mkdirSync(path.dirname(out), { recursive: true })
  const buffer = await createZip(entries)
  fs.writeFileSync(out, buffer)
  console.log(`✅ publish zip → ${path.relative(process.cwd(), out)} (${buffer.length.toLocaleString()} bytes)`)
  console.log(`   ${collection}: ${rows.length} row(s) [${sources.map((s) => path.basename(path.dirname(s))).join(', ')}]`)
  console.log(`   refs: tags ${refs.tags.length}, technologies ${refs.technologies.length}`)
  if (bilingualSources.length) {
    console.log(`   id overlays: ${bilingualSources.length}/${rows.length} row(s) [${bilingualSources.join(', ')}]`)
  }
  console.log(`   apply with: npm run import -- ${path.relative(process.cwd(), out)} -- --replace-only ${collection}`)
  process.exit(0)
}

// Only auto-run when executed directly (npm run wrap:publish), not when imported by tests.
const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isDirectRun) {
  run().catch((err) => {
    console.error('❌ wrap:publish failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
