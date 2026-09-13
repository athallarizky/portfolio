// CLI: `npm run wrap:articles -- <article.json> [-- --out <path>]`
// Wraps one-or-more v2 article rows into an importable zip (manifest + collections/articles.json).
// Archive building is shared with the admin/insert-one paths via buildSingleCollectionArchive.
// Output default: portfolio-articles-<YYYY-MM-DD-HH-MM>-<slug>.zip (collision-safe: -2, -3, …).

import fs from 'fs'
import path from 'path'

import { formatStamp } from '../filenames'
import { buildSingleCollectionArchive, attachOverlaySibling, SingleArchiveError } from '../single'

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
    console.error('Usage: npm run wrap:articles -- <article.json> [-- --out <path>]')
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(input, 'utf8'))
  const rows = (Array.isArray(raw) ? raw : [raw]) as Record<string, unknown>[]
  if (rows.length === 0) {
    console.error('no article rows in input')
    process.exit(1)
  }

  // Sprint-24: a single-row input auto-attaches an optional `<name>.id.json` sibling.
  let hasOverlay = false
  if (!Array.isArray(raw)) {
    try {
      hasOverlay = attachOverlaySibling(input, 'articles', rows[0] as Record<string, any>)
    } catch (e) {
      if (e instanceof SingleArchiveError) {
        console.error(`❌ ${e.message}`)
        process.exit(1)
      }
      throw e
    }
  }

  const slug = String(rows[0].slug ?? '')
  const out = outArg ?? `portfolio-articles-${formatStamp()}-${slug}.zip`
  const finalOut = uniquePath(out)

  let built
  try {
    built = await buildSingleCollectionArchive('articles', rows)
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
    `✅ Wrapped ${rows.length} article(s) → ${finalOut} (${built.buffer.length.toLocaleString()} bytes)`,
  )
  if (built.filledUuids) console.log(`   (${built.filledUuids} row(s) got a fresh uuid)`)
  if (hasOverlay) console.log('   (id translation attached from sibling .id.json)')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ wrap failed:', err)
  process.exit(1)
})