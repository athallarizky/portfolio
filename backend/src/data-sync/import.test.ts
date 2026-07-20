import { test } from 'node:test'
import assert from 'node:assert/strict'
import AdmZip from 'adm-zip'

import { makeIdResolver, UnresolvedRelationError } from './relations'
import { createZip } from './archive'
import { CONTENT_COLLECTIONS, type ImportReport } from './types'
import {
  toRef,
  rewriteRelationsToIds,
  primeResolver,
  assertFullArchive,
  ReplaceAllError,
  archiveIdentitySet,
  collectReferenced,
  replaceDrift,
} from './import'

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

// ---- primeResolver: partial-archive relation resolution ----

test('primeResolver: populates resolver from DB for targets absent from the archive', async () => {
  const resolver = makeIdResolver()
  const payload: any = {
    find: async ({ collection }: any) =>
      collection === 'technologies'
        ? { docs: [{ id: 1, slug: 'go', uuid: 'u-go' }, { id: 2, slug: 'docker', uuid: 'u-docker' }] }
        : { docs: [] },
  }
  // archive has only 'projects' → technologies absent → primed from DB
  await primeResolver(payload, resolver, new Set(['projects']))
  assert.equal(resolver.resolve('technologies', { key: 'go' }), 1)
  assert.equal(resolver.resolve('technologies', { uuid: 'u-docker', key: 'docker' }), 2)
})

test('primeResolver: skipped (no DB fetch) for collections already in the archive', async () => {
  const resolver = makeIdResolver()
  let fetched: string[] = []
  const payload: any = {
    find: async ({ collection }: any) => {
      fetched.push(collection)
      return { docs: [] }
    },
  }
  // every relation target is present in the archive → nothing fetched
  await primeResolver(
    payload,
    resolver,
    new Set(['document-categories', 'tags', 'authors', 'technologies', 'articles']),
  )
  assert.deepEqual(fetched, [], 'must not fetch DB for collections already in the archive')
})

// ---- replace-all (sprint-17) ----

test('assertFullArchive: throws when content collections are missing', () => {
  assert.throws(() => assertFullArchive(new Set(['projects', 'articles'])), ReplaceAllError)
})

test('assertFullArchive: ok when all 8 content collections present', () => {
  assert.doesNotThrow(() => assertFullArchive(new Set(CONTENT_COLLECTIONS)))
})

test('archiveIdentitySet: uuid when present, else natural key', () => {
  const ids = archiveIdentitySet('projects', [
    { uuid: 'u-1', slug: 'a' },
    { slug: 'b' },
  ] as Record<string, unknown>[])
  assert.ok(ids.has('u-1'))
  assert.ok(ids.has('b'))
  assert.equal(ids.size, 2)
})

test('collectReferenced: gathers resolved target ids per target collection', async () => {
  const resolver = makeIdResolver()
  resolver.set('tags', 'ai', 1, 'u-ai')
  resolver.set('authors', 'Atha', 10, 'u-atha')
  const zip = new AdmZip(
    await createZip([
      {
        path: 'collections/articles.json',
        data: JSON.stringify([
          {
            slug: 'x',
            tags: [{ uuid: 'u-ai', key: 'ai' }],
            author: { uuid: 'u-atha', key: 'Atha' },
            relatedArticles: [],
          },
        ]),
      },
    ]),
  )
  const refIds = collectReferenced(zip, '', resolver)
  assert.deepEqual([...refIds.get('tags')!].sort(), [1])
  assert.deepEqual([...refIds.get('authors')!].sort(), [10])
})

const emptyReport = (): ImportReport => ({
  created: {},
  updated: {},
  unchanged: {},
  deleted: {},
  skippedReferenced: [],
  errors: [],
  dryRun: false,
})

test('replaceDrift: deletes absent records, keeps in-archive, skips referenced', async () => {
  const archiveIdentities = new Map([['authors', new Set(['u-a'])]])
  const refIds = new Map<string, Set<number | string>>([['authors', new Set([2])]]) // id 2 still referenced
  const db = {
    authors: [
      { id: 1, uuid: 'u-a', name: 'A' }, // in archive → keep
      { id: 2, uuid: 'u-b', name: 'B' }, // absent but referenced → skip
      { id: 3, uuid: 'u-c', name: 'C' }, // absent, not referenced → delete
    ],
  }
  const deleted: number[] = []
  const payload: any = {
    find: async ({ collection }: any) => ({ docs: db[collection as keyof typeof db] }),
    delete: async ({ id }: any) => {
      deleted.push(id)
      return { id }
    },
  }
  const report = emptyReport()
  await replaceDrift(payload, archiveIdentities as any, refIds as any, report, false)
  assert.deepEqual(deleted, [3])
  assert.equal(report.deleted.authors, 1)
  assert.equal(report.skippedReferenced.length, 1)
  assert.equal(report.skippedReferenced[0].key, 'u-b')
})

test('replaceDrift: dry-run counts would-deletes without deleting', async () => {
  const archiveIdentities = new Map([['authors', new Set(['u-a'])]])
  const refIds = new Map<string, Set<number | string>>()
  const db = {
    authors: [
      { id: 1, uuid: 'u-a', name: 'A' }, // in archive → keep
      { id: 5, uuid: 'u-x', name: 'X' }, // absent → would delete
    ],
  }
  const deleted: number[] = []
  const payload: any = {
    find: async ({ collection }: any) => ({ docs: db[collection as keyof typeof db] }),
    delete: async ({ id }: any) => {
      deleted.push(id)
      return { id }
    },
  }
  const report = emptyReport()
  report.dryRun = true
  await replaceDrift(payload, archiveIdentities as any, refIds as any, report, true)
  assert.deepEqual(deleted, [], 'dry-run must not delete')
  assert.equal(report.deleted.authors, 1, 'but counts the would-delete')
})

test('replaceDrift: a delete that throws (e.g. FK) is reported as an error without aborting the pass', async () => {
  const archiveIdentities = new Map([['authors', new Set<string>([])]]) // both DB authors are drift
  const refIds = new Map<string, Set<number | string>>()
  const db = { authors: [{ id: 7, uuid: 'u-7', name: 'G' }, { id: 8, uuid: 'u-8', name: 'H' }] }
  const deleted: number[] = []
  const payload: any = {
    find: async ({ collection }: any) => ({ docs: db[collection as keyof typeof db] }),
    delete: async ({ id }: any) => {
      if (id === 7) throw new Error('FK constraint')
      deleted.push(id)
      return { id }
    },
  }
  const report = emptyReport()
  await replaceDrift(payload, archiveIdentities as any, refIds as any, report, false)
  assert.deepEqual(deleted, [8], 'the non-throwing delete still ran')
  assert.equal(report.deleted.authors, 1)
  assert.equal(report.errors.length, 1)
  assert.equal(report.errors[0].key, 'u-7')
  assert.match(report.errors[0].message, /delete failed/)
})
