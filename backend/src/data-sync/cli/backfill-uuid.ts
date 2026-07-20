// CLI: `npm run backfill:uuid [-- --dry-run]`
// Assigns a uuid to every uuid-less content record. Backs up payload.db first (via the npm script).

import { getPayload } from 'payload'

import config from '../../payload.config'
import { backfillUuids } from '../backfill'

async function run() {
  const dryRun = process.argv.slice(2).includes('--dry-run')
  const payload = await getPayload({ config })
  const report = await backfillUuids(payload, { dryRun })

  console.log(`\n${dryRun ? '🔍 DRY RUN (no writes)' : '✅ BACKFILL complete'}`)
  let totalFilled = 0
  for (const c of Object.keys(report.scanned)) {
    totalFilled += report.backfilled[c] ?? 0
    console.log(
      `  ${c.padEnd(20)} scanned=${report.scanned[c]}  ${dryRun ? 'would-fill' : 'filled'}=${report.backfilled[c]}`,
    )
  }
  console.log(`\n  total ${dryRun ? 'would-fill' : 'filled'}: ${totalFilled}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ backfill failed:', err)
  process.exit(1)
})
