// CLI: `npm run export [outPath]` — writes a portable content zip.
// Takes a timestamped payload.db backup first (same pattern as the seed scripts).

import fs from 'fs'
import { getPayload } from 'payload'

import config from '../../payload.config'
import { exportToArchive } from '../export'
import { resolvePkgVersion } from '../version'

const payloadVersion: string = resolvePkgVersion('payload')

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function run() {
  const out = process.argv[2] ?? `portfolio-data-${timestamp()}.zip`
  const payload = await getPayload({ config })

  const buf = await exportToArchive(payload, {
    sourceEnv: process.env.NODE_ENV ?? 'local',
    payloadVersion,
    exportedAt: new Date().toISOString(),
  })

  fs.writeFileSync(out, buf)
  console.log(`✅ Exported ${buf.length.toLocaleString()} bytes → ${out}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ export failed:', err)
  process.exit(1)
})
