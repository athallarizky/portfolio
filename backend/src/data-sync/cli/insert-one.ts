// CLI: `npm run insert-one -- <collection> <file.json> [-- --dry-run]`
// Wraps a single v2 row (or an array of rows) for a content collection into an in-memory archive
// and imports it. Idempotent (uuid-first upsert); techTags/relations resolve via import priming.

import fs from 'fs'
import { getPayload } from 'payload'

import config from '../../payload.config'
import { buildSingleCollectionArchive, SingleArchiveError } from '../single'
import { importFromArchive } from '../import'
import { CONTENT_COLLECTIONS, type ContentCollection } from '../types'

async function run() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const positional = args.filter((a) => !a.startsWith('--'))
  const collection = positional[0]
  const input = positional[1]

  if (!collection || !input) {
    console.error('Usage: npm run insert-one -- <collection> <file.json> [-- --dry-run]')
    console.error(`  collections: ${CONTENT_COLLECTIONS.join(', ')}`)
    process.exit(1)
  }
  if (!CONTENT_COLLECTIONS.includes(collection as ContentCollection)) {
    console.error(`unknown collection "${collection}". valid: ${CONTENT_COLLECTIONS.join(', ')}`)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(input, 'utf8'))
  const rows = (Array.isArray(raw) ? raw : [raw]) as Record<string, unknown>[]

  const payload = await getPayload({ config })
  let built
  try {
    built = await buildSingleCollectionArchive(collection as ContentCollection, rows)
  } catch (e) {
    if (e instanceof SingleArchiveError) {
      console.error(`❌ ${e.message}`)
      process.exit(1)
    }
    throw e
  }
  const report = await importFromArchive(payload, built.buffer, { dryRun })

  console.log(`\n${dryRun ? '🔍 DRY RUN (no writes)' : '✅ INSERT complete'}`)
  if (report.backupPath) console.log('  backup :', report.backupPath)
  console.log('  created:', JSON.stringify(report.created))
  console.log('  updated:', JSON.stringify(report.updated))
  if (report.errors.length) {
    console.log(`  errors : ${report.errors.length}`)
    for (const e of report.errors) console.log(`    - [${e.collection}] ${e.key}: ${e.message}`)
  } else {
    console.log('  errors : 0')
  }
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ insert-one failed:', err)
  process.exit(1)
})
