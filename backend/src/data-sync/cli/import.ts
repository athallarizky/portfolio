// CLI: `npm run import -- <archive.zip> [-- --dry-run]`
// Dry-run prints the report with zero writes; a real run backs up payload.db first.

import fs from 'fs'
import { getPayload } from 'payload'

import config from '../../payload.config'
import { importFromArchive } from '../import'

async function run() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const zipPath = args.find((a) => !a.startsWith('--'))

  if (!zipPath) {
    console.error('Usage: npm run import -- <archive.zip> [-- --dry-run]')
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const buf = fs.readFileSync(zipPath)
  const report = await importFromArchive(payload, buf, { dryRun })

  console.log(`\n${dryRun ? '🔍 DRY RUN (no writes)' : '✅ IMPORT complete'}`)
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
  console.error('❌ import failed:', err)
  process.exit(1)
})
