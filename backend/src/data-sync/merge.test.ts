import { test } from 'node:test'
import assert from 'node:assert/strict'

import { inverseRelations } from './keys'
import { fieldReferencesId, mergeRecords, MergeError } from './merge'

/** Fake Payload: find (respects where.uuid; no-where returns all), update mutates in place, delete filters out. */
function fakePayload(stores: Record<string, any[]>): any {
  return {
    find: async ({ collection, where }: any) => {
      let docs = stores[collection] ?? []
      if (where?.uuid?.equals) docs = docs.filter((d) => d.uuid === where.uuid.equals)
      return { docs, totalDocs: docs.length }
    },
    update: async ({ collection, id, data }: any) => {
      const d = stores[collection].find((x) => x.id === id)
      if (d) Object.assign(d, data)
      return d
    },
    delete: async ({ collection, id }: any) => {
      stores[collection] = stores[collection].filter((x) => x.id !== id)
    },
  }
}

test('inverseRelations: articles pointed at by articles.relatedArticles (self)', () => {
  const into = inverseRelations().get('articles') ?? []
  assert.ok(
    into.some((r) => r.fromCollection === 'articles' && r.field === 'relatedArticles' && r.selfRef),
  )
})

test('inverseRelations: authors pointed at by articles.author (hasOne)', () => {
  const into = inverseRelations().get('authors') ?? []
  assert.ok(into.some((r) => r.fromCollection === 'articles' && r.field === 'author' && !r.hasMany))
})

test('fieldReferencesId: hasOne + hasMany at depth:0', () => {
  assert.equal(fieldReferencesId({ author: 5 }, 'author', 5, false), true)
  assert.equal(fieldReferencesId({ author: 6 }, 'author', 5, false), false)
  assert.equal(fieldReferencesId({ tags: [1, 5, 9] }, 'tags', 5, true), true)
  assert.equal(fieldReferencesId({ tags: [1, 9] }, 'tags', 5, true), false)
  assert.equal(fieldReferencesId({ author: null }, 'author', 5, false), false)
})

test('mergeRecords: repoints a hasOne incoming relation + deletes loser', async () => {
  const stores: Record<string, any[]> = {
    authors: [
      { id: 1, uuid: 'w', name: 'Athalla' },
      { id: 2, uuid: 'l', name: 'Atha' },
    ],
    articles: [{ id: 10, uuid: 'a', slug: 'x', author: 2, tags: [], relatedArticles: [] }],
  }
  const r = await mergeRecords(fakePayload(stores), 'authors', 'w', 'l', { backup: () => undefined })
  assert.equal(r.deletedLoser, true)
  assert.equal(stores.authors.length, 1)
  assert.equal(stores.authors[0].id, 1)
  assert.equal(stores.articles[0].author, 1, 'article.author repointed 2→1')
  assert.deepEqual(r.repointed, [{ fromCollection: 'articles', field: 'author', count: 1 }])
})

test('mergeRecords: repoints + dedups a hasMany incoming relation', async () => {
  const stores: Record<string, any[]> = {
    tags: [
      { id: 1, uuid: 'tw', slug: 'ai' },
      { id: 2, uuid: 'tl', slug: 'AI' },
    ],
    articles: [
      { id: 10, uuid: 'a', slug: 'x', author: null, tags: [2], relatedArticles: [] }, // loser only
      { id: 11, uuid: 'b', slug: 'y', author: null, tags: [1, 2], relatedArticles: [] }, // both → dedup
    ],
  }
  await mergeRecords(fakePayload(stores), 'tags', 'tw', 'tl', { backup: () => undefined })
  assert.deepEqual(stores.articles[0].tags, [1])
  assert.deepEqual(stores.articles[1].tags, [1], 'winner deduped, loser dropped')
  assert.equal(stores.tags.length, 1)
})

test('mergeRecords: self-referential relation repoints within the same collection', async () => {
  const stores: Record<string, any[]> = {
    articles: [
      { id: 1, uuid: 'w', slug: 'win', author: null, tags: [], relatedArticles: [2] }, // winner → loser
      { id: 2, uuid: 'l', slug: 'lose', author: null, tags: [], relatedArticles: [] },
      { id: 3, uuid: 'c', slug: 'third', author: null, tags: [], relatedArticles: [2] }, // third → loser
    ],
  }
  const winner = stores.articles.find((a) => a.uuid === 'w')!
  const third = stores.articles.find((a) => a.uuid === 'c')!
  await mergeRecords(fakePayload(stores), 'articles', 'w', 'l', { backup: () => undefined })
  assert.deepEqual(winner.relatedArticles, [1], 'winner→loser becomes winner→winner (self)')
  assert.deepEqual(third.relatedArticles, [1], 'third repointed to winner')
  assert.equal(stores.articles.find((a) => a.uuid === 'l'), undefined, 'loser deleted')
})

test('mergeRecords: dry-run repoints nothing, deletes nothing', async () => {
  const stores: Record<string, any[]> = {
    authors: [
      { id: 1, uuid: 'w', name: 'Athalla' },
      { id: 2, uuid: 'l', name: 'Atha' },
    ],
    articles: [{ id: 10, uuid: 'a', slug: 'x', author: 2, tags: [], relatedArticles: [] }],
  }
  const r = await mergeRecords(fakePayload(stores), 'authors', 'w', 'l', { dryRun: true })
  assert.equal(r.deletedLoser, false)
  assert.equal(r.dryRun, true)
  assert.equal(stores.authors.length, 2)
  assert.equal(stores.articles[0].author, 2, 'nothing repointed')
  assert.deepEqual(r.repointed, [{ fromCollection: 'articles', field: 'author', count: 1 }])
})

test('mergeRecords: rejects winner==loser / unknown collection / missing uuid', async () => {
  const p = fakePayload({ authors: [{ id: 1, uuid: 'w', name: 'A' }] })
  await assert.rejects(() => mergeRecords(p, 'authors', 'w', 'w'), MergeError)
  await assert.rejects(() => mergeRecords(p, 'users' as any, 'w', 'x'), MergeError)
  await assert.rejects(() => mergeRecords(p, 'authors', 'w', 'missing'), MergeError)
})
