// CLI: `npm run snapshot:restore -- <snapshot.zip> -- --yes`
// Destructive: overwrites the active DB + media. Stop the backend first (SQLite file lock).

import fs from 'fs'
import { restoreSnapshot } from '../snapshot'

function run() {
  const args = process.argv.slice(2)
  const zipPath = args.find((a) => !a.startsWith('--'))
  const yes = args.includes('--yes')

  if (!zipPath) {
    console.error('Usage: npm run snapshot:restore -- <snapshot.zip> [-- --yes]')
    process.exit(1)
  }
  if (!yes) {
    console.error('⚠️  restore OVERWRITES the active DB + media. Stop the backend, then re-run with -- --yes.')
    process.exit(1)
  }

  const buf = fs.readFileSync(zipPath)
  const res = restoreSnapshot(buf, { confirm: true })
  console.log(
    `✅ Restored DB ${res.backupPath ? `(backup: ${res.backupPath})` : '(no prior DB)'} + ${res.mediaFiles} media files.`,
  )
}

run()
