import { test } from 'node:test'
import assert from 'node:assert/strict'
import AdmZip from 'adm-zip'

import { buildSingleCollectionArchive, fillUuids, validateRows, SingleArchiveError } from './single'

test('fillUuids: assigns a uuid to rows missing one, leaves an existing uuid untouched', () => {
  const rows = [{ slug: 'a', uuid: 'keep-me' }, { slug: 'b' }] as Record<string, unknown>[]
  const filled = fillUuids(rows)
  assert.equal(filled, 1)
  assert.equal(rows[0].uuid, 'keep-me')
  assert.equal(typeof rows[1].uuid, 'string')
  assert.ok((rows[1].uuid as string).length > 0)
})

test('validateRows: throws on a missing natural key', () => {
  assert.throws(
    () => validateRows('projects', [{ title: 'x' /* no slug */ }] as Record<string, unknown>[]),
    SingleArchiveError,
  )
  assert.doesNotThrow(() => validateRows('projects', [{ slug: 'x' }] as Record<string, unknown>[]))
})

test('buildSingleCollectionArchive: emits a v2 archive with manifest + the row', async () => {
  const { buffer, filledUuids } = await buildSingleCollectionArchive('projects', [
    { title: 'T', slug: 't', year: 2026 },
  ])
  assert.equal(filledUuids, 1, 'the row had no uuid → one filled')

  const zip = new AdmZip(buffer)
  const manifest = JSON.parse(zip.getEntry('manifest.json')!.getData().toString('utf8'))
  assert.equal(manifest.schemaVersion, 2)
  assert.equal(manifest.tool, 'portfolio-data-sync')

  const rows = JSON.parse(zip.getEntry('collections/projects.json')!.getData().toString('utf8'))
  assert.equal(rows.length, 1)
  assert.equal(rows[0].slug, 't')
  assert.equal(typeof rows[0].uuid, 'string')
})

test('buildSingleCollectionArchive: rejects empty rows', async () => {
  await assert.rejects(() => buildSingleCollectionArchive('projects', []), SingleArchiveError)
})

// NOTE: the create / update-in-place / techTags-resolve behavior flows through importFromArchive
// (unchanged engine) and is covered by the e2e on payload.test.db in Phase 4, not duplicated here.
