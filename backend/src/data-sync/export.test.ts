import { test } from 'node:test'
import assert from 'node:assert/strict'

import { rewriteRelations, type IdRefMaps } from './export'
import type { RelationRef } from './types'

function makeMaps(): IdRefMaps {
  const m: IdRefMaps = new Map()
  m.set(
    'tags',
    new Map<string, RelationRef>([
      ['1', { uuid: 'tag-u-1', key: 'ai' }],
      ['2', { uuid: 'tag-u-2', key: 'workflow' }],
    ]),
  )
  m.set('authors', new Map<string, RelationRef>([['10', { uuid: 'author-u-10', key: 'Athalla Rizky' }]]))
  return m
}

test('rewriteRelations: hasMany → array of dual {uuid,key} refs', () => {
  const doc: Record<string, any> = { title: 'X', tags: [1, 2], author: null, relatedArticles: null }
  rewriteRelations(doc, 'articles', makeMaps())
  assert.deepEqual(doc.tags, [
    { uuid: 'tag-u-1', key: 'ai' },
    { uuid: 'tag-u-2', key: 'workflow' },
  ])
})

test('rewriteRelations: hasOne → dual {uuid,key} ref', () => {
  const doc: Record<string, any> = { title: 'X', tags: null, author: 10, relatedArticles: null }
  rewriteRelations(doc, 'articles', makeMaps())
  assert.deepEqual(doc.author, { uuid: 'author-u-10', key: 'Athalla Rizky' })
})

test('rewriteRelations: preserves the doc own uuid (it is the identity, not a relation)', () => {
  const doc: Record<string, any> = { uuid: 'self-u', title: 'X', tags: [1], author: 10, relatedArticles: null }
  rewriteRelations(doc, 'articles', makeMaps())
  assert.equal(doc.uuid, 'self-u')
})

test('rewriteRelations: a target without a uuid emits a key-only ref (v1 fallback path)', () => {
  const maps: IdRefMaps = new Map()
  maps.set('tags', new Map([['1', { uuid: undefined, key: 'ai' }]]))
  const doc: Record<string, any> = { tags: [1], author: null, relatedArticles: null }
  rewriteRelations(doc, 'articles', maps)
  assert.equal(doc.tags[0].key, 'ai')
  assert.equal(doc.tags[0].uuid, undefined)
})

test('rewriteRelations: unresolved hasOne id → null (never an orphaned id leaks out)', () => {
  const doc: Record<string, any> = { title: 'X', tags: null, author: 999, relatedArticles: null }
  rewriteRelations(doc, 'articles', makeMaps()) // no author id 999 in the map
  assert.equal(doc.author, null)
})
