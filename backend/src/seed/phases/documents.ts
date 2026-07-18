import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'
import { CATEGORIES, DOCUMENTS } from '../data/documents'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const legacyAssets = path.resolve(__dirname, '../../../../frontend/assets/documents')

export async function seedDocuments(payload: Payload) {
  for (const cat of CATEGORIES) {
    const existing = await payload.find({ collection: 'document-categories', where: { slug: { equals: cat.slug } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    await payload.create({ collection: 'document-categories', data: cat })
    console.log(`✅ Category: ${cat.label}`)
  }
  const catLookup = await payload.find({ collection: 'document-categories', limit: 10 })
  const catMap = new Map(catLookup.docs.map((c) => [c.slug, c.id]))

  for (const doc of DOCUMENTS) {
    const categoryId = catMap.get(doc.category)
    if (!categoryId) { console.warn(`⚠️  "${doc.title}" — no category "${doc.category}"`); continue }
    const existing = await payload.find({ collection: 'documents', where: { title: { equals: doc.title } }, limit: 1 })
    if (existing.totalDocs > 0) continue
    const filePath = path.join(legacyAssets, doc.file)
    if (!fs.existsSync(filePath)) { console.warn(`⚠️  "${doc.title}" — file not found`); continue }
    const fileBuffer = fs.readFileSync(filePath)
    await payload.create({
      collection: 'documents',
      data: { title: doc.title, category: categoryId, excerpt: doc.excerpt, updated: doc.updated },
      file: { data: fileBuffer, mimetype: doc.file.endsWith('.md') ? 'text/markdown' : 'application/pdf', name: doc.file, size: fileBuffer.length },
    })
    console.log(`✅ Document: ${doc.title}`)
  }
}
