import type { Payload } from 'payload'

export async function findOrCreate(
  payload: Payload,
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<number> {
  const existing = await payload.find({ collection: collection as any, where, limit: 1 })
  if (existing.totalDocs > 0) return existing.docs[0].id as number
  const created = await payload.create({ collection: collection as any, data: data as any })
  return created.id as number
}
