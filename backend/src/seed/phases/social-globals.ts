import type { Payload } from 'payload'
import { SOCIAL_PROFILES } from '../data/social'
import { SITE_CONFIG, HOME, NAV } from '../data/globals'

export async function seedSocial(payload: Payload) {
  for (const s of SOCIAL_PROFILES) {
    const existing = await payload.find({ collection: 'social-profiles', where: { platform: { equals: s.platform } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    await payload.create({ collection: 'social-profiles', data: s })
    console.log(`✅ Social: ${s.platform}`)
  }
}

export async function seedGlobals(payload: Payload) {
  await payload.updateGlobal({ slug: 'site-config', data: SITE_CONFIG })
  console.log('✅ Global: site-config')

  await payload.updateGlobal({ slug: 'home', data: HOME })
  console.log('✅ Global: home')

  await payload.updateGlobal({ slug: 'nav', data: NAV })
  console.log('✅ Global: nav')
}

export async function seedSocialAndGlobals(payload: Payload) {
  await seedSocial(payload)
  await seedGlobals(payload)
}
