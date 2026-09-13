// Sprint-24 locale overlay model — unit tests.
// Covers: locale-map discrimination, row splitting (locale:'all' → v3 shape),
// the emit-version rule, and importFromArchive's per-locale write behavior
// (the non-clobber guarantee) against a mock payload.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createZip } from './archive'
import { buildManifest } from './manifest'
import { importFromArchive } from './import'
import { buildSingleCollectionArchive, attachOverlaySibling, SingleArchiveError } from './single'
import {
  isLocaleMap,
  rowHasOverlay,
  archiveSchemaVersion,
  splitLocalizedRow,
  validateOverlayRow,
  OverlayValidationError,
} from './locales'

// backupDb() inside a real (non-dry-run) importFromArchive reads DATABASE_URL —
// point it at a non-existent file so the copy no-ops (its failure is tolerated).
process.env.DATABASE_URL = 'file:./payload.test.nonexistent.db'

// ---- isLocaleMap ----

test('isLocaleMap: matches locale-keyed objects', () => {
  assert.equal(isLocaleMap({ en: 'X' }), true)
  assert.equal(isLocaleMap({ en: 'X', id: 'Y' }), true)
  assert.equal(isLocaleMap({ id: ['fitur'] }), true, 'overlay-only maps (e.g. features)')
})

test('isLocaleMap: rejects rich-text states, arrays, scalars, null', () => {
  assert.equal(isLocaleMap({ root: { children: [] } }), false, 'Lexical state')
  assert.equal(isLocaleMap([{ heading: 'x' }]), false)
  assert.equal(isLocaleMap('plain'), false)
  assert.equal(isLocaleMap(null), false)
})

// ---- splitLocalizedRow ----

const articleAllShape = {
  uuid: 'u-1',
  slug: 'x',
  title: { en: 'EN title', id: 'Judul ID' },
  excerpt: { en: 'EN excerpt', id: null }, // id never translated → stays EN-only
  body: { en: { root: { children: [] } }, id: null },
  seo: { metaTitle: { en: null, id: 'Meta ID' }, metaDescription: null, ogImage: '/og.png' },
  tags: [],
}

test('splitLocalizedRow: EN collapses flat, translations move under locales.id', () => {
  const row: Record<string, any> = JSON.parse(JSON.stringify(articleAllShape))
  const has = splitLocalizedRow('articles', row)
  assert.equal(has, true)
  assert.equal(row.title, 'EN title')
  assert.equal(row.excerpt, 'EN excerpt')
})

test('splitLocalizedRow: EN-only locale-map collapses to its EN value, no overlay attached', () => {
  const row: Record<string, any> = JSON.parse(JSON.stringify(articleAllShape))
  splitLocalizedRow('articles', row)
  assert.equal(row.title, 'EN title')
  assert.equal(row.excerpt, 'EN excerpt', 'EN-only map collapses to the flat EN value')
  assert.equal(row.body.root.children.length, 0, 'EN lexical state kept at top level')
  assert.ok(row.locales, 'overlay attached (title + seo.metaTitle have id values)')
  assert.deepEqual(row.locales.id, {
    title: 'Judul ID',
    seo: { metaTitle: 'Meta ID' },
  }, 'overlay carries ONLY localized fields with id values, nested like the row')
  assert.equal(row.seo.metaTitle, undefined, 'en-null field deleted, group kept')
  assert.equal(row.seo.ogImage, '/og.png', 'non-localized group member untouched')
})

test('splitLocalizedRow: overlay-only array (features) — EN absent, id attached, item ids stripped', () => {
  const row: Record<string, any> = {
    slug: 'p',
    title: { en: 'P', id: 'Pid' },
    features: { id: [{ id: 'db-local-1', icon: 'solar:star', heading: 'Fitur' }] },
  }
  const has = splitLocalizedRow('projects', row)
  assert.equal(has, true)
  assert.equal(row.features, undefined, 'EN had no features → field deleted')
  assert.deepEqual(row.locales.id.features, [{ icon: 'solar:star', heading: 'Fitur' }])
})

test('splitLocalizedRow: flat (untranslated) rows are untouched and attach no overlay', () => {
  const row: Record<string, any> = { uuid: 'u', slug: 'x', title: 'Just EN', body: 'md' }
  const has = splitLocalizedRow('articles', row)
  assert.equal(has, false)
  assert.equal(row.title, 'Just EN')
  assert.equal(row.locales, undefined)
})

test('splitLocalizedRow: collections without localized fields are a no-op', () => {
  const row: Record<string, any> = { slug: 'ai', title: 'AI' }
  assert.equal(splitLocalizedRow('tags', row), false)
  assert.deepEqual(row, { slug: 'ai', title: 'AI' })
})

// ---- emit-version rule ----

test('rowHasOverlay: only non-empty overlay locales count', () => {
  assert.equal(rowHasOverlay({ title: 'x' }), false)
  assert.equal(rowHasOverlay({ locales: {} }), false)
  assert.equal(rowHasOverlay({ locales: { id: {} } }), false)
  assert.equal(rowHasOverlay({ locales: { id: { title: 'y' } } }), true)
  assert.equal(rowHasOverlay({ locales: { fr: { title: 'y' } } }), false, 'unknown locale ignored')
})

test('archiveSchemaVersion: 2 when EN-only, 3 when any row overlays', () => {
  assert.equal(archiveSchemaVersion([[{ slug: 'a' }], [{ slug: 'b' }]]), 2)
  assert.equal(
    archiveSchemaVersion([[{ slug: 'a' }], [{ slug: 'b', locales: { id: { title: 'x' } } }]]),
    3,
  )
})

test('buildSingleCollectionArchive stamps v2 for EN-only rows, v3 for bilingual rows', async () => {
  const plain = await buildSingleCollectionArchive('articles', [
    { uuid: 'u-a', slug: 'a', title: 'A' },
  ])
  const bilingual = await buildSingleCollectionArchive('articles', [
    { uuid: 'u-b', slug: 'b', title: 'B', locales: { id: { title: 'Bid' } } },
  ])
  const AdmZip = (await import('adm-zip')).default
  const readManifest = (buf: Buffer) =>
    JSON.parse(new AdmZip(buf).getEntry('manifest.json')!.getData().toString())
  assert.equal(readManifest(plain.buffer).schemaVersion, 2)
  assert.equal(readManifest(bilingual.buffer).schemaVersion, 3)
})

// ---- importFromArchive: per-locale writes (non-clobber) ----

interface CapturedCall {
  op: 'create' | 'update'
  collection: string
  locale?: string
  id?: number | string
  data: Record<string, any>
}

function mockPayload(existing: { uuid: string; id: number; slug: string }[]) {
  const calls: CapturedCall[] = []
  const payload: any = {
    find: async ({ collection, where }: any) => {
      if (collection === 'authors') {
        return { docs: [{ id: 9, name: 'Atha', uuid: 'u-atha' }], totalDocs: 1 }
      }
      if (collection === 'articles') {
        const wantUuid = where?.uuid?.equals
        const match = wantUuid ? existing.find((e) => e.uuid === wantUuid) : undefined
        if (match) return { docs: [{ ...match }], totalDocs: 1 }
        const wantSlug = where?.slug?.equals
        const bySlug = wantSlug ? existing.find((e) => e.slug === wantSlug) : undefined
        return bySlug ? { docs: [{ ...bySlug }], totalDocs: 1 } : { docs: [], totalDocs: 0 }
      }
      return { docs: [], totalDocs: 0 } // other relation targets: empty
    },
    create: async ({ collection, data, locale }: any) => {
      calls.push({ op: 'create', collection, locale, data })
      return { id: 99 }
    },
    update: async ({ collection, id, data, locale }: any) => {
      calls.push({ op: 'update', collection, id, locale, data })
      return { id }
    },
    updateGlobal: async () => ({}),
  }
  return { payload, calls }
}

async function bilingualZip(row: Record<string, any>): Promise<Buffer> {
  const entries = [
    {
      path: 'manifest.json',
      data: JSON.stringify(
        buildManifest({
          sourceEnv: 'test',
          payloadVersion: 'test',
          counts: { articles: 1 },
          exportedAt: '2026-09-13T00:00:00.000Z',
          schemaVersion: row.locales ? 3 : 2,
        }),
      ),
    },
    { path: 'collections/articles.json', data: JSON.stringify([row]) },
  ]
  return createZip(entries)
}

test('importFromArchive: bilingual row → EN update (locale en) + overlay update (locale id, overlay fields only)', async () => {
  const { payload, calls } = mockPayload([{ uuid: 'u-1', id: 5, slug: 'bilingual' }])
  const buf = await bilingualZip({
    uuid: 'u-1',
    slug: 'bilingual',
    title: 'EN title',
    author: { uuid: 'u-atha', key: 'Atha' },
    tags: [],
    relatedArticles: [],
    locales: { id: { title: 'Judul ID', seo: { metaTitle: 'Meta ID' } } },
  })
  const report = await importFromArchive(payload, buf, { dryRun: false })

  assert.equal(report.errors.length, 0)
  assert.equal(report.updated.articles, 1)
  assert.equal(report.localeOverlays.articles, 1)

  const updates = calls.filter((c) => c.op === 'update' && c.id === 5 && c.locale)
  assert.equal(updates.length, 2, 'one EN write + one overlay write')

  const en = updates.find((c) => c.locale === 'en')
  assert.ok(en, 'EN write carries explicit locale en')
  assert.equal(en.data.title, 'EN title')
  assert.equal('locales' in en.data, false, 'overlay never leaks into the EN data')

  const id = updates.find((c) => c.locale === 'id')
  assert.ok(id, 'overlay write carries locale id')
  assert.deepEqual(
    id.data,
    { title: 'Judul ID', seo: { metaTitle: 'Meta ID' } },
    'overlay write carries ONLY the overlay fields — absent locales/fields never written',
  )
})

test('importFromArchive: EN-only archive (v2) never writes locale id — translations survive', async () => {
  const { payload, calls } = mockPayload([{ uuid: 'u-1', id: 5, slug: 'plain' }])
  const buf = await bilingualZip({
    uuid: 'u-1',
    slug: 'plain',
    title: 'EN title',
    author: { uuid: 'u-atha', key: 'Atha' },
    tags: [],
    relatedArticles: [],
  })
  const report = await importFromArchive(payload, buf, { dryRun: false })

  assert.equal(report.errors.length, 0)
  assert.equal(report.localeOverlays.articles, undefined)
  assert.equal(
    calls.some((c) => c.locale === 'id'),
    false,
    'no id-locale write at all — existing translations in the DB are untouchable',
  )
})

test('importFromArchive: dry-run writes nothing but counts planned overlays', async () => {
  const { payload, calls } = mockPayload([{ uuid: 'u-1', id: 5, slug: 'bilingual' }])
  const buf = await bilingualZip({
    uuid: 'u-1',
    slug: 'bilingual',
    title: 'EN title',
    author: { uuid: 'u-atha', key: 'Atha' },
    tags: [],
    relatedArticles: [],
    locales: { id: { title: 'Judul ID' } },
  })
  const report = await importFromArchive(payload, buf, { dryRun: true })
  assert.equal(calls.length, 0, 'dry-run performs zero writes')
  assert.equal(report.localeOverlays.articles, 1, 'but counts the would-be overlay')
})

test('importFromArchive: new row (create path) → create with locale en, then overlay update', async () => {
  const { payload, calls } = mockPayload([]) // nothing exists
  const buf = await bilingualZip({
    uuid: 'u-2',
    slug: 'fresh',
    title: 'EN title',
    author: { uuid: 'u-atha', key: 'Atha' },
    tags: [],
    relatedArticles: [],
    locales: { id: { title: 'Judul ID' } },
  })
  const report = await importFromArchive(payload, buf, { dryRun: false })
  assert.equal(report.created.articles, 1)
  const create = calls.find((c) => c.op === 'create')
  assert.equal(create?.locale, 'en')
  const overlay = calls.find((c) => c.op === 'update' && c.locale === 'id')
  assert.equal(overlay?.id, 99, 'overlay applied to the freshly created doc id')
})

// ---- validateOverlayRow (authored *.id.json content) ----

test('validateOverlayRow: accepts a clean article overlay', () => {
  assert.doesNotThrow(() =>
    validateOverlayRow('articles', { title: 'Judul', body: '# md', seo: { metaTitle: 'M' } }),
  )
})

test('validateOverlayRow: rejects non-localized top-level keys (authoring typo guard)', () => {
  assert.throws(
    () => validateOverlayRow('articles', { title: 'Judul', slug: 'other-slug' }),
    OverlayValidationError,
  )
  assert.throws(
    () => validateOverlayRow('articles', { judul: 'typo' }),
    OverlayValidationError,
  )
})

test('validateOverlayRow: rejects non-localized seo subfields (ogImage stays shared)', () => {
  assert.throws(
    () => validateOverlayRow('articles', { seo: { metaTitle: 'M', ogImage: '/x.png' } }),
    OverlayValidationError,
  )
})

test('validateOverlayRow: rejects overlays for collections without localized fields', () => {
  assert.throws(() => validateOverlayRow('tags', { title: 'x' }), OverlayValidationError)
})

// ---- attachOverlaySibling (wrap CLIs / wrap-publish) ----

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

let tmpSeq = 0
function tmpFile(name: string, content: unknown): string {
  // unique per call — a shared Date.now() alone collides when tests run within the same ms
  const p = path.join(os.tmpdir(), `overlay-test-${process.pid}-${tmpSeq++}-${name}`)
  fs.writeFileSync(p, JSON.stringify(content))
  return p
}

test('attachOverlaySibling: attaches a matching sibling as locales.id (identity keys stripped)', () => {
  const en = tmpFile('article.json', { uuid: 'u-9', slug: 'a', title: 'EN' })
  fs.writeFileSync(en.replace(/\.json$/, '.id.json'), JSON.stringify({ uuid: 'u-9', slug: 'a', title: 'Judul', excerpt: 'Ringkasan' }))
  const row: Record<string, any> = { uuid: 'u-9', slug: 'a', title: 'EN' }
  assert.equal(attachOverlaySibling(en, 'articles', row), true)
  assert.deepEqual(row.locales.id, { title: 'Judul', excerpt: 'Ringkasan' })
})

test('attachOverlaySibling: no sibling → false, row untouched', () => {
  const en = tmpFile('article.json', { uuid: 'u-9', slug: 'a' })
  const row: Record<string, any> = { uuid: 'u-9', slug: 'a' }
  assert.equal(attachOverlaySibling(en, 'articles', row), false)
  assert.equal(row.locales, undefined)
})

test('attachOverlaySibling: identity mismatch (uuid/slug) → refuses', () => {
  const en = tmpFile('article.json', { uuid: 'u-9', slug: 'a' })
  fs.writeFileSync(en.replace(/\.json$/, '.id.json'), JSON.stringify({ uuid: 'u-OTHER', slug: 'a', title: 'X' }))
  assert.throws(
    () => attachOverlaySibling(en, 'articles', { uuid: 'u-9', slug: 'a' }),
    SingleArchiveError,
  )
})

test('attachOverlaySibling: non-localized fields in the sibling → refuses', () => {
  const en = tmpFile('article.json', { uuid: 'u-9', slug: 'a' })
  fs.writeFileSync(en.replace(/\.json$/, '.id.json'), JSON.stringify({ uuid: 'u-9', slug: 'a', bannerColor: '#fff' }))
  assert.throws(
    () => attachOverlaySibling(en, 'articles', { uuid: 'u-9', slug: 'a' }),
    SingleArchiveError,
  )
})
