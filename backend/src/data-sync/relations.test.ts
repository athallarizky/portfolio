import { test } from 'node:test'
import assert from 'node:assert/strict'

import { makeIdResolver, resolveRef, planImportOrder, UnresolvedRelationError } from './relations'

test('resolver set/get round-trips', () => {
  const r = makeIdResolver()
  r.set('tags', 'ai', 7)
  assert.equal(r.get('tags', 'ai'), 7)
  assert.equal(r.get('tags', 'missing'), undefined)
  assert.equal(r.get('articles', 'ai'), undefined) // wrong collection
})

test('resolveRef returns the id when present', () => {
  const r = makeIdResolver()
  r.set('authors', 'Atha Rizky', 42)
  assert.equal(resolveRef('authors', 'Atha Rizky', r, 'articles.author'), 42)
})

test('resolveRef throws UnresolvedRelationError when missing', () => {
  const r = makeIdResolver()
  assert.throws(
    () => resolveRef('authors', 'nobody', r, 'articles.author'),
    (e: unknown) =>
      e instanceof UnresolvedRelationError && e.to === 'authors' && e.key === 'nobody',
  )
})

test('planImportOrder keeps dependency order, filtered to present collections', () => {
  // IMPORT_ORDER = document-categories, documents, tags, authors, articles, technologies, projects, social-profiles
  const order = planImportOrder(new Set(['articles', 'tags', 'technologies']))
  assert.deepEqual(order, ['tags', 'articles', 'technologies'])
})

test('planImportOrder drops collections not in the archive', () => {
  const order = planImportOrder(new Set(['projects']))
  assert.deepEqual(order, ['projects'])
})
