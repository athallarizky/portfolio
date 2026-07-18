import { getPayload } from 'payload'
import config from '../payload.config'
import { seedArticles } from './phases/articles'

seedArticles(await getPayload({ config }))
  .then(() => { console.log('✅ Articles seeded!'); process.exit(0) })
  .catch((err) => { console.error('❌ Failed:', err); process.exit(1) })
