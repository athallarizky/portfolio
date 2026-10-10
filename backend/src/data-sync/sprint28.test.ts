// Sprint-28 regression tests: globals' relation portability, timestamp preservation,
// and the experiences collection gap. Each test pins one production incident.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { GLOBAL_RELATIONS, IMPORT_ORDER, NATURAL_KEYS } from './keys'
import { CONTENT_COLLECTIONS, INTERNAL_FIELDS } from './types'
import { rewriteGlobalRelations, type IdRefMaps } from './export'
import { rewriteGlobalRelationsToIds } from './import'
import type { RelationRef } from './types'

function mediaMap(entries: [string, RelationRef][]): IdRefMaps {
  const inner = new Map(entries.map(([id, ref]) => [id, ref]))
  const maps: IdRefMaps = new Map()
  maps.set('media', inner)
  return maps
}

// ---- Issue 1: globals' relations must travel as {uuid, key} refs, not numeric ids ----

test('site-config.avatar is declared as a global relation targeting media', () => {
  const rels = GLOBAL_RELATIONS['site-config']
  assert.ok(rels, 'site-config must be in GLOBAL_RELATIONS')
  assert.equal(rels.length, 1)
  assert.equal(rels[0].field, 'avatar')
  assert.equal(rels[0].to, 'media')
  assert.equal(rels[0].hasMany, false)
})

test('rewriteGlobalRelations turns a source-DB avatar id into a dual ref', () => {
  const maps = mediaMap([
    ['1', { uuid: 'e3f36cd0-fec4-4ad5-8300-ff975531a2cb', key: '2022-03-22 10.22.59-3.jpg' }],
  ])
  const doc: Record<string, any> = { name: 'Athalla Rizky', avatar: 1 }
  rewriteGlobalRelations(doc, 'site-config', maps)
  assert.deepEqual(doc.avatar, {
    uuid: 'e3f36cd0-fec4-4ad5-8300-ff975531a2cb',
    key: '2022-03-22 10.22.59-3.jpg',
  })
})

test('rewriteGlobalRelations leaves unknown/unmapped ids as null (single-ref semantics)', () => {
  const maps = mediaMap([])
  const doc: Record<string, any> = { avatar: 99 }
  rewriteGlobalRelations(doc, 'site-config', maps)
  assert.equal(doc.avatar, null)
})

test('rewriteGlobalRelationsToIds resolves a dual ref to the local DB id', () => {
  const resolve = (collection: string, ref: { uuid?: string; key: string }) =>
    ref.uuid === 'e3f36cd0-fec4-4ad5-8300-ff975531a2cb' ? 52 : undefined
  const resolver = { resolve } as any
  const out = rewriteGlobalRelationsToIds(
    'site-config',
    { avatar: { uuid: 'e3f36cd0-fec4-4ad5-8300-ff975531a2cb', key: 'x.jpg' } },
    resolver,
  )
  assert.equal(out.avatar, 52)
})

test('rewriteGlobalRelationsToIds drops an unresolvable optional ref instead of throwing', () => {
  const resolver = { resolve: () => undefined } as any
  const out = rewriteGlobalRelationsToIds('site-config', { avatar: { uuid: 'nope', key: 'x.jpg' } }, resolver)
  assert.ok(!('avatar' in out))
})

// ---- Issue 2: archives keep original timestamps so order survives environment moves ----

test('INTERNAL_FIELDS no longer strips createdAt/updatedAt (sprint-27 flattened them)', () => {
  assert.deepEqual([...INTERNAL_FIELDS], ['id'])
})

// ---- Issue 4: experiences must be part of the sync set ----

test('experiences is in CONTENT_COLLECTIONS, NATURAL_KEYS and IMPORT_ORDER', () => {
  assert.ok((CONTENT_COLLECTIONS as readonly string[]).includes('experiences'))
  assert.equal(NATURAL_KEYS.experiences, 'company')
  assert.ok(IMPORT_ORDER.includes('experiences'))
})

test('every synced collection has a natural key and an import-order slot', () => {
  for (const c of CONTENT_COLLECTIONS) {
    assert.ok(NATURAL_KEYS[c], `missing natural key: ${c}`)
    assert.ok(IMPORT_ORDER.includes(c), `missing import order slot: ${c}`)
  }
})
