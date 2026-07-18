import { getPayload } from 'payload'
import config from '../payload.config'
import { seedProjects } from './phases/projects'

seedProjects(await getPayload({ config }))
  .then(() => { console.log('✅ Projects seeded!'); process.exit(0) })
  .catch((err) => { console.error('❌ Failed:', err); process.exit(1) })
