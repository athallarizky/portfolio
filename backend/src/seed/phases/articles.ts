import type { Payload } from 'payload'
import { TAGS, AUTHORS, ARTICLES, ARTICLE_BODIES } from '../data/articles'
import { lexicalBody, lexicalParagraph } from '../lib/lexical'

export async function seedArticles(payload: Payload) {
  const tagMap = new Map<string, number>()
  for (const name of TAGS) {
    const existing = await payload.find({ collection: 'tags', where: { name: { equals: name } }, limit: 1 })
    if (existing.totalDocs > 0) { tagMap.set(name, existing.docs[0].id); continue }
    const created = await payload.create({ collection: 'tags', data: { name, slug: name.toLowerCase() } })
    tagMap.set(name, created.id)
    console.log(`✅ Tag: ${name}`)
  }

  const authorMap = new Map<string, number>()
  for (const a of AUTHORS) {
    const existing = await payload.find({ collection: 'authors', where: { name: { equals: a.name } }, limit: 1 })
    if (existing.totalDocs > 0) { authorMap.set(a.name, existing.docs[0].id); continue }
    const created = await payload.create({ collection: 'authors', data: a })
    authorMap.set(a.name, created.id)
    console.log(`✅ Author: ${a.name}`)
  }

  for (const art of ARTICLES) {
    const existing = await payload.find({ collection: 'articles', where: { slug: { equals: art.slug } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    const tagIds = art.tags.map((t) => tagMap.get(t)).filter((id): id is number => id !== undefined)
    const authorId = authorMap.get(art.author)
    const body = ARTICLE_BODIES[art.slug] ? lexicalBody(ARTICLE_BODIES[art.slug]) : lexicalBody([lexicalParagraph(art.excerpt)])
    await payload.create({
      collection: 'articles',
      data: { title: art.title, slug: art.slug, excerpt: art.excerpt, tags: tagIds, author: authorId, publishedAt: art.publishedAt, readMinutes: art.readMinutes, body, bannerColor: art.bannerColor, bannerIcon: art.bannerIcon } as any,
    })
    console.log(`✅ Article: ${art.title}`)
  }
}
