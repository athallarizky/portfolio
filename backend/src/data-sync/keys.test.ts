import { test } from 'node:test'
import assert from 'node:assert/strict'

import { NATURAL_KEYS, RELATIONS, IMPORT_ORDER } from './keys'

test('most collections are keyed by slug', () => {
  assert.equal(NATURAL_KEYS.articles, 'slug')
  assert.equal(NATURAL_KEYS.projects, 'slug')
  assert.equal(NATURAL_KEYS.tags, 'slug')
  assert.equal(NATURAL_KEYS.technologies, 'slug')
  assert.equal(NATURAL_KEYS['document-categories'], 'slug')
})

test('authors keyed by name (no slug field)', () => {
  assert.equal(NATURAL_KEYS.authors, 'name')
})

test('documents keyed by title (no slug field)', () => {
  assert.equal(NATURAL_KEYS.documents, 'title')
})

test('social-profiles keyed by platform', () => {
  assert.equal(NATURAL_KEYS['social-profiles'], 'platform')
})

test('import order respects dependencies', () => {
  const before = (a: string, b: string) => IMPORT_ORDER.indexOf(a as never) < IMPORT_ORDER.indexOf(b as never)
  assert.ok(before('document-categories', 'documents'), 'categories before documents')
  assert.ok(before('tags', 'articles'), 'tags before articles')
  assert.ok(before('authors', 'articles'), 'authors before articles')
  assert.ok(before('technologies', 'projects'), 'technologies before projects')
})

test('required relations are flagged', () => {
  const authorRel = RELATIONS.articles?.find((r) => r.field === 'author')
  assert.ok(authorRel, 'articles.author relation defined')
  assert.equal(authorRel?.required, true)
})

test('self-referential relation is flagged for 2nd-pass resolution', () => {
  const related = RELATIONS.articles?.find((r) => r.field === 'relatedArticles')
  assert.equal(related?.selfRef, true)
})

test('documents.category is a required relation', () => {
  const cat = RELATIONS.documents?.find((r) => r.field === 'category')
  assert.equal(cat?.required, true)
})
