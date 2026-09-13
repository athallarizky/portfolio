import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config'
import { EXPERIENCES } from './data/experiences'

type NavItem = { label: string; href: string; icon: string | null; order: number }

async function seedExperiences(payload: Payload) {
  for (const exp of EXPERIENCES) {
    const existing = await payload.find({
      collection: 'experiences',
      where: { company: { equals: exp.company } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`↩︎  Experience exists: ${exp.company}`)
      continue
    }
    await payload.create({ collection: 'experiences', data: exp })
    console.log(`✅ Experience: ${exp.company}`)
  }
}

/** Insert the /experiences nav item after Blogs if missing — merge, never overwrite
 *  (the live nav global may carry data newer than the seed). Orders renumbered 1..n. */
async function seedNavItem(payload: Payload) {
  const nav = await payload.findGlobal({ slug: 'nav' })
  const menuItems = ((nav.menuItems || []) as NavItem[])
    .slice()
    .sort((a, b) => a.order - b.order)
  if (menuItems.some((item) => item.href === '/experiences')) {
    console.log('↩︎  Nav item exists: /experiences')
    return
  }

  const after = menuItems.findIndex((item) => item.href === '/blogs')
  menuItems.splice(after === -1 ? menuItems.length : after + 1, 0, {
    label: 'Experiences',
    href: '/experiences',
    icon: 'solar:case-bold-duotone',
    order: 0, // placeholder — renumbered below
  })
  const renumbered = menuItems.map(({ label, href, icon }, i) => ({ label, href, icon, order: i + 1 }))

  await payload.updateGlobal({ slug: 'nav', data: { menuItems: renumbered } })
  console.log('✅ Nav: Experiences added after Blogs')
}

const payload = await getPayload({ config })
await seedExperiences(payload)
await seedNavItem(payload)
process.exit(0)
