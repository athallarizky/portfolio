import { getPayload } from 'payload'
import config from '../payload.config'
import { seedDocuments } from './phases/documents'

seedDocuments(await getPayload({ config }))
  .then(() => { console.log('✅ Documents seeded!'); process.exit(0) })
  .catch((err) => { console.error('❌ Failed:', err); process.exit(1) })
