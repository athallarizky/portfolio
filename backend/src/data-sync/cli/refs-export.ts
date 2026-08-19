// CLI: `npm run refs:export`
// Dumps the canonical refs manifest (tags + technologies) from the DB →
// tools/content/refs/{tags,technologies}.json — the git source of truth for
// relation rows (sprint-23 publish pipeline). Re-run whenever refs change in admin.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../../payload.config'

/** Repo root = backend/.. (this file lives at backend/src/data-sync/cli/). */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..')
const OUT_DIR = path.join(REPO_ROOT, 'tools', 'content', 'refs')

async function main() {
  const payload = await getPayload({ config })

  async function dump(collection: 'tags' | 'technologies', fields: string[]) {
    const res = await payload.find({ collection, depth: 0, limit: 0, pagination: false } as never)
    return (res.docs as unknown as Record<string, unknown>[]).map((d) => {
      const row: Record<string, unknown> = {}
      for (const f of fields) if (d[f] !== undefined && d[f] !== null) row[f] = d[f]
      return row
    })
  }

  const tags = await dump('tags', ['uuid', 'name', 'slug'])
  const technologies = await dump('technologies', ['uuid', 'name', 'slug', 'icon'])

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, 'tags.json'), JSON.stringify(tags, null, 2) + '\n')
  fs.writeFileSync(path.join(OUT_DIR, 'technologies.json'), JSON.stringify(technologies, null, 2) + '\n')
  console.log(`✅ refs exported → ${path.relative(process.cwd(), OUT_DIR)}/ (tags: ${tags.length}, technologies: ${technologies.length})`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ refs:export failed:', err)
  process.exit(1)
})
