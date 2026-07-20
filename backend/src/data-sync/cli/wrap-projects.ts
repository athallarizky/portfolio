// CLI: `npm run wrap:projects -- <projects.json> [-- --out <path>]`
// Wraps one-or-more v2 project rows into an importable zip (manifest + collections/projects.json).
// Archive building is shared with the admin/insert-one paths via buildSingleCollectionArchive.
// Output default: portfolio-projects-<YYYY-MM-DD-HH-MM>-<slug>.zip (collision-safe: -2, -3, …).

import fs from 'fs'
import path from 'path'

import { formatStamp } from '../filenames'
import { buildSingleCollectionArchive, SingleArchiveError } from '../single'

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

  const slug = String(rows[0].slug ?? '')
  const out = outArg ?? `portfolio-projects-${formatStamp()}-${slug}.zip`
  const finalOut = uniquePath(out)

  let built
  try {
    built = await buildSingleCollectionArchive('projects', rows)
  } catch (e) {
    if (e instanceof SingleArchiveError) {
      console.error(`❌ ${e.message}`)
      process.exit(1)
    }
    throw e
  }

  fs.mkdirSync(path.dirname(finalOut), { recursive: true })
  fs.writeFileSync(finalOut, built.buffer)
  console.log(
    `✅ Wrapped ${rows.length} project(s) → ${finalOut} (${built.buffer.length.toLocaleString()} bytes)`,
  )
  if (built.filledUuids) console.log(`   (${built.filledUuids} row(s) got a fresh uuid)`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ wrap failed:', err)
  process.exit(1)
})
