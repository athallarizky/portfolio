// CLI: `npm run snapshot [outPath]` — zips the active DB + documents/ for a whole-instance backup.

import fs from 'fs'
import { createSnapshot } from '../snapshot'
import { formatStamp } from '../filenames'

async function run() {
  const out = process.argv[2] ?? `portfolio-snapshot-${formatStamp()}.zip`
  const buf = await createSnapshot()
  fs.writeFileSync(out, buf)
  console.log(`✅ Snapshot ${buf.length.toLocaleString()} bytes → ${out}`)
}

run().catch((err) => {
  console.error('❌ snapshot failed:', err)
  process.exit(1)
})
