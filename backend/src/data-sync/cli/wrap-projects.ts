// CLI: `npm run wrap:projects -- <projects.json> [-- --out <path>]`
// Wraps one-or-more v2 project rows into an importable zip (manifest + collections/projects.json).
// Assigns a uuid to any row missing one. Output default: portfolio-projects-<YYYY-MM-DD-HH-MM>-<slug>.zip
// (collision-safe: appends -2, -3, … if the file exists).

import fs from 'fs'
import path from 'path'
import { randomUUID } from 'node:crypto'

import { buildManifest } from '../manifest'
import { createZip, type ZipEntry } from '../archive'
import { resolvePkgVersion } from '../version'

function timestamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}-${p(d.getMinutes())}`
}

/** Append -2, -3, … if `out` already exists, so a re-run never overwrites a prior zip. */
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
  const input = args.find((a) => !a.startsWith('--') && a !== outArg)

  if (!input) {
    console.error('Usage: npm run wrap:projects -- <projects.json> [-- --out <path>]')
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(input, 'utf8'))
  const rows = (Array.isArray(raw) ? raw : [raw]) as Record<string, unknown>[]
  if (rows.length === 0) {
    console.error('no project rows in input')
    process.exit(1)
  }

  let filled = 0
  for (const row of rows) {
    if (!row.uuid) {
      row.uuid = randomUUID()
      filled++
    }
    if (!row.title || !row.slug) {
      console.error(`row missing required field (title/slug): slug=${String(row.slug ?? '?')}`)
      process.exit(1)
    }
  }

  const slug = String(rows[0].slug)
  const out = outArg ?? `portfolio-projects-${timestamp()}-${slug}.zip`
  const finalOut = uniquePath(out)

  const entries: ZipEntry[] = [
    { path: 'collections/projects.json', data: JSON.stringify(rows, null, 2) },
  ]
  entries.unshift({
    path: 'manifest.json',
    data: JSON.stringify(
      buildManifest({
        sourceEnv: 'generated',
        payloadVersion: resolvePkgVersion('payload'),
        counts: { projects: rows.length },
        exportedAt: new Date().toISOString(),
      }),
      null,
      2,
    ),
  })

  fs.mkdirSync(path.dirname(finalOut), { recursive: true })
  const buf = await createZip(entries)
  fs.writeFileSync(finalOut, buf)
  console.log(`✅ Wrapped ${rows.length} project(s) → ${finalOut} (${buf.length.toLocaleString()} bytes)`)
  if (filled) console.log(`   (${filled} row(s) got a fresh uuid)`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ wrap failed:', err)
  process.exit(1)
})
