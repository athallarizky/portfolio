// CLI: `npm run import -- <archive.zip> [-- --dry-run] [-- --replace] [-- --replace-only <csv>]`
// Dry-run prints the report with zero writes; a real run backs up payload.db first.
// --replace: after upserting, delete records absent from the archive (a full archive is required).
// --replace-only articles,projects: sprint-23 scoped replace — drift-deletion only for the listed
// collections (each must be in the archive); everything else upserts only.

import fs from 'fs'
import { getPayload } from 'payload'

import config from '../../payload.config'
import { importFromArchive } from '../import'

async function run() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const replaceAll = args.includes('--replace')
  const roIdx = args.indexOf('--replace-only')
  const replaceCollections = roIdx !== -1
    ? (args[roIdx + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    : undefined
  // The value following --replace-only is also a positional — exclude it only when present
  // (when roIdx is -1, args[roIdx + 1] would alias args[0] — the zip path itself).
  const roValue = roIdx !== -1 ? args[roIdx + 1] : undefined
  const zipPath = args.find((a) => !a.startsWith('--') && a !== roValue)

  if (!zipPath) {
    console.error('Usage: npm run import -- <archive.zip> [-- --dry-run] [-- --replace] [-- --replace-only articles,projects]')
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const buf = fs.readFileSync(zipPath)
  const report = await importFromArchive(payload, buf, {
    dryRun,
    replaceAll,
    replaceCollections: replaceCollections as import('../types').ContentCollection[] | undefined,
  })

  const mode = replaceAll ? ' (replace-all)' : replaceCollections?.length ? ` (replace-only: ${replaceCollections.join(',')})` : ''
  console.log(`\n${dryRun ? '🔍 DRY RUN (no writes)' : '✅ IMPORT complete'}${mode}`)
  if (report.backupPath) console.log('  backup :', report.backupPath)
  console.log('  created:', JSON.stringify(report.created))
  console.log('  updated:', JSON.stringify(report.updated))
  const deletedSum = Object.values(report.deleted).reduce((a, b) => a + b, 0)
  if (deletedSum) console.log('  deleted:', JSON.stringify(report.deleted))
  const overlaySum = Object.values(report.localeOverlays ?? {}).reduce((a, b) => a + b, 0)
  if (overlaySum) {
    console.log(`  locale overlays (per-locale writes, other locales untouched): ${JSON.stringify(report.localeOverlays)}`)
  }
  if (report.skippedReferenced.length) {
    console.log(`  skipped (referenced): ${report.skippedReferenced.length}`)
    for (const s of report.skippedReferenced) console.log(`    - [${s.collection}] ${s.key}: ${s.reason}`)
  }
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
