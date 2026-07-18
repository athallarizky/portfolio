import { getPayload } from 'payload'
import config from './payload.config'
import { seedDocuments } from './seed/phases/documents'
import { seedArticles } from './seed/phases/articles'
import { seedProjects } from './seed/phases/projects'
import { seedSocialAndGlobals } from './seed/phases/social-globals'

async function seed() {
  const payload = await getPayload({ config })

  await seedDocuments(payload)
  await seedArticles(payload)
  await seedProjects(payload)
  await seedSocialAndGlobals(payload)

  console.log('\n🎉 Seed complete!')
  process.exit(0)
}

export { seedDocuments, seedArticles, seedProjects, seedSocialAndGlobals }

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
