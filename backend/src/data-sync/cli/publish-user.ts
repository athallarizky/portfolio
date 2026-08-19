// CLI: `PUBLISH_PASSWORD=... npm run publish:account -- --email me@x --name "Publisher"`
// Creates (or verifies) the publish service account used by the sprint-23 pipeline
// (scripts/publish-content.mjs logs in with it). The password is read from the
// PUBLISH_PASSWORD env var so it never appears in shell history or logs.

import { getPayload } from 'payload'

import config from '../../payload.config'

async function run() {
  const args = process.argv.slice(2)
  const read = (flag: string) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }
  const email = read('--email')
  const name = read('--name') ?? 'Publish pipeline'
  const password = process.env.PUBLISH_PASSWORD

  if (!email || !password) {
    console.error('Usage: PUBLISH_PASSWORD=<strong password> npm run publish:account -- --email <email> [--name <name>]')
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 } as never)

  if (existing.totalDocs > 0) {
    console.log(`✅ account already exists: ${email} (id ${(existing.docs as any[])[0].id}) — delete + recreate via admin to rotate the password`)
    process.exit(0)
  }

  const created = await payload.create({
    collection: 'users',
    data: { name, email, password } as never,
  })
  console.log(`✅ publish account created: ${email} (id ${(created as any).id})`)
  console.log('   next: add PUBLISH_EMAIL + PUBLISH_PASSWORD to the GitHub repo secrets')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ publish:account failed:', err)
  process.exit(1)
})
