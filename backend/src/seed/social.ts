import { getPayload } from 'payload'
import config from '../payload.config'
import { seedSocialAndGlobals } from './phases/social-globals'

seedSocialAndGlobals(await getPayload({ config }))
  .then(() => { console.log('✅ Social + globals seeded!'); process.exit(0) })
  .catch((err) => { console.error('❌ Failed:', err); process.exit(1) })
