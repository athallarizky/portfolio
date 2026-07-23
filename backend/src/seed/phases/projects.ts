import type { Payload } from 'payload'
import { TECHNOLOGIES } from '../data/technologies'
import { PROJECTS, PROJECT_BODIES } from '../data/projects'
import { lexicalBody, lexicalParagraph } from '../lib/lexical'

export async function seedProjects(payload: Payload) {
  const techMap = new Map<string, number>()
  for (const name of TECHNOLOGIES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const existing = await payload.find({ collection: 'technologies', where: { name: { equals: name } }, limit: 1 })
    if (existing.totalDocs > 0) { techMap.set(name, existing.docs[0].id); continue }
    const created = await payload.create({ collection: 'technologies', data: { name, slug } })
    techMap.set(name, created.id)
    console.log(`✅ Tech: ${name}`)
  }

  for (const proj of PROJECTS) {
    const techIds = proj.techNames.map((t) => techMap.get(t)).filter((id): id is number => id !== undefined)
    const body = PROJECT_BODIES[proj.slug] ? lexicalBody(PROJECT_BODIES[proj.slug]) : lexicalBody([lexicalParagraph(proj.excerpt)])
    const data = {
      title: proj.title, slug: proj.slug, year: proj.year, excerpt: proj.excerpt,
      descriptor: proj.descriptor, bannerColor: proj.bannerColor, bannerIcon: proj.bannerIcon,
      techTags: techIds, links: proj.links, body, status: 'published', order: proj.order,
      showOnHome: proj.showOnHome ?? false,
      features: proj.features,
      architecture: proj.architecture,
    } as any
    const existing = await payload.find({ collection: 'projects', where: { slug: { equals: proj.slug } }, limit: 1 })
    if (existing.totalDocs > 0) {
      await payload.update({ collection: 'projects', id: (existing.docs[0] as any).id, data })
      console.log(`🔄 Project updated: ${proj.title}`)
    } else {
      await payload.create({ collection: 'projects', data })
      console.log(`✅ Project created: ${proj.title}`)
    }
  }
}
