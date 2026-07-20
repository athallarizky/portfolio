import { test } from 'node:test'
import assert from 'node:assert/strict'

import { makeIdResolver, UnresolvedRelationError } from './relations'
import { toRef, rewriteRelationsToIds } from './import'

// ---- toRef: v1 string vs v2 {uuid,key} parsing ----

test('toRef: v1 plain string → { key }', () => {
  assert.deepEqual(toRef('ai'), { key: 'ai' })
})

test('toRef: v2 { uuid, key } passes through', () => {
  assert.deepEqual(toRef({ uuid: 'u-1', key: 'ai' }), { uuid: 'u-1', key: 'ai' })
})

test('toRef: v2 object without uuid → key-only', () => {
  assert.deepEqual(toRef({ key: 'ai' }), { key: 'ai' })
})

test('toRef: null / undefined / object-without-key → null', () => {
  assert.equal(toRef(null), null)
  assert.equal(toRef(undefined), null)
  assert.equal(toRef({ noKey: 'x' }), null)
})

// ---- resolver.resolve: uuid-first, key fallback ----

test('resolver.resolve: uuid wins over a stale key (rename-safe)', () => {
  const r = makeIdResolver()
  r.set('authors', 'old-name', 7, 'u-7')
  // a renamed record: the ref carries the uuid + a now-stale key
  assert.equal(r.resolve('authors', { uuid: 'u-7', key: 'whatever' }), 7)
})

test('resolver.resolve: falls back to key when uuid is absent or unknown', () => {
  const r = makeIdResolver()
  r.set('authors', 'Athalla', 9)
  assert.equal(r.resolve('authors', { key: 'Athalla' }), 9)
  assert.equal(r.resolve('authors', { uuid: 'unknown', key: 'Athalla' }), 9)
})

// ---- rewriteRelationsToIds: dual + v1 compat ----

test('rewriteRelationsToIds: v2 dual refs resolve to ids', () => {
  const r = makeIdResolver()
  r.set('tags', 'ai', 1, 'tag-u-1')
  r.set('tags', 'workflow', 2, 'tag-u-2')
  r.set('authors', 'Athalla', 10, 'author-u-10')
  const row = {
    uuid: 'art-u',
    slug: 'x',
    title: 'X',
    tags: [
      { uuid: 'tag-u-1', key: 'ai' },
      { uuid: 'tag-u-2', key: 'workflow' },
    ],
    author: { uuid: 'author-u-10', key: 'Athalla' },
    relatedArticles: [],
  }
  const data = rewriteRelationsToIds('articles', row, r)
  assert.deepEqual(data.tags, [1, 2])
  assert.equal(data.author, 10)
  assert.equal(data.uuid, 'art-u', 'own uuid passes through untouched')
})

test('rewriteRelationsToIds: v1 plain-string refs still resolve (backwards compat)', () => {
  const r = makeIdResolver()
  r.set('tags', 'ai', 1)
  r.set('authors', 'Athalla', 10)
  const row = { slug: 'x', title: 'X', tags: ['ai'], author: 'Athalla', relatedArticles: [] }
  const data = rewriteRelationsToIds('articles', row, r)
  assert.deepEqual(data.tags, [1])
  assert.equal(data.author, 10)
})

test('rewriteRelationsToIds: a stale key still resolves when the uuid matches (rename)', () => {
  const r = makeIdResolver()
  // author was renamed from 'Atha' → 'Athalla'; resolver tracked the new key + uuid
  r.set('authors', 'Athalla', 10, 'author-u-10')
  const row = {
    slug: 'x',
    title: 'X',
    tags: [],
    author: { uuid: 'author-u-10', key: 'Atha' }, // stale key, correct uuid
    relatedArticles: [],
  }
  const data = rewriteRelationsToIds('articles', row, r)
  assert.equal(data.author, 10, 'rename-safe: uuid resolves despite stale key')
})

test('rewriteRelationsToIds: missing required author throws', () => {
  const r = makeIdResolver()
  const row = { slug: 'x', title: 'X', tags: [], author: 'Nobody', relatedArticles: [] }
  assert.throws(() => rewriteRelationsToIds('articles', row, r), UnresolvedRelationError)
})
