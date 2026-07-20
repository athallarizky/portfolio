// CLI: `npm run merge -- <collection> <winnerUuid> <loserUuid> [-- --dry-run]`
// Merges loser into winner (repoints incoming relations, deletes loser). Dry-run prints the report only.

import { getPayload } from 'payload'

import config from '../../payload.config'
import { mergeRecords } from '../merge'

async function run() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const [collection, winnerUuid, loserUuid] = args.filter((a) => !a.startsWith('--'))

  if (!collection || !winnerUuid || !loserUuid) {
    console.error('Usage: npm run merge -- <collection> <winnerUuid> <loserUuid> [-- --dry-run]')
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const report = await mergeRecords(payload, collection as any, winnerUuid, loserUuid, { dryRun })

  console.log(`\n${dryRun ? '🔍 DRY RUN (no writes)' : '✅ MERGE complete'}`)
  if (report.backupPath) console.log('  backup :', report.backupPath)
  console.log(`  ${collection}: winner=${report.winner?.label}  loser=${report.loser?.label}`)
  if (report.repointed.length) {
    console.log('  repointed:')
    for (const r of report.repointed) console.log(`    - ${r.fromCollection}.${r.field}: ${r.count}`)
  } else {
    console.log('  repointed: (none)')
  }
  if (report.loserOutgoing.length) {
    console.log('  loser outgoing relations (discarded with the loser):')
    for (const o of report.loserOutgoing) console.log(`    - ${o}`)
  }
  if (!dryRun) console.log(`  loser deleted: ${report.deletedLoser}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ merge failed:', err)
  process.exit(1)
})
