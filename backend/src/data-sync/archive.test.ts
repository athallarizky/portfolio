import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createZip, readZip, readJson, readEntry, listEntries } from './archive'

test('zip round-trips a JSON entry', async () => {
  const buf = await createZip([{ path: 'collections/a.json', data: JSON.stringify({ x: 1 }) }])
  const zip = readZip(buf)
  assert.deepEqual(readJson(zip, 'collections/a.json'), { x: 1 })
})

test('zip round-trips a binary entry', async () => {
  const payload = Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF
  const buf = await createZip([{ path: 'media/file.pdf', data: payload }])
  const zip = readZip(buf)
  assert.deepEqual(readEntry(zip, 'media/file.pdf'), payload)
})

test('readJson throws on a missing entry', async () => {
  const buf = await createZip([{ path: 'a.json', data: '{}' }])
  assert.throws(() => readJson(readZip(buf), 'missing.json'))
})

test('listEntries returns all paths', async () => {
  const buf = await createZip([
    { path: 'manifest.json', data: '{}' },
    { path: 'collections/a.json', data: '[]' },
  ])
  const names = listEntries(readZip(buf))
  assert.ok(names.includes('manifest.json'))
  assert.ok(names.includes('collections/a.json'))
})
