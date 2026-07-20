import { test } from 'node:test'
import assert from 'node:assert/strict'

import { backfillUuids } from './backfill'

/** Minimal fake Payload — find returns the stored docs; update mutates in place. */
function fakePayload(store: Record<string, any[]>): any {
  return {
    find: async ({ collection }: any) => ({ docs: store[collection] ?? [] }),
    update: async ({ collection, id, data }: any) => {
      const d = store[collection].find((x) => x.id === id)
      if (d) d.uuid = data.uuid
      return d
    },
  }
}

test('backfillUuids: assigns uuid to uuid-less records, leaves existing untouched', async () => {
  const store: Record<string, any[]> = {
    authors: [
      { id: 1, uuid: null },
      { id: 2, uuid: 'keep-me' },
    ],
    tags: [{ id: 1, uuid: null }],
  }
  const r = await backfillUuids(fakePayload(store))
  assert.equal(r.backfilled.authors, 1)
  assert.equal(r.backfilled.tags, 1)
  assert.match(store.authors[0].uuid, /^[0-9a-f-]{36}$/) // assigned a v4 uuid
  assert.equal(store.authors[1].uuid, 'keep-me') // existing preserved
})

test('backfillUuids: idempotent — a second run fills nothing', async () => {
  const store: Record<string, any[]> = { authors: [{ id: 1, uuid: null }] }
  const p = fakePayload(store)
  await backfillUuids(p)
  const r2 = await backfillUuids(p)
  const total = Object.values(r2.backfilled).reduce((a, b) => a + b, 0)
  assert.equal(total, 0, 'everything already has a uuid')
})

test('backfillUuids: dry-run counts but writes nothing', async () => {
  const store: Record<string, any[]> = { authors: [{ id: 1, uuid: null }] }
  const p = {
    find: async ({ collection }: any) => ({ docs: store[collection] ?? [] }),
    update: async () => {
      throw new Error('must not write during a dry-run')
    },
  }
  const r = await backfillUuids(p as any, { dryRun: true })
  assert.equal(r.dryRun, true)
  assert.equal(r.backfilled.authors, 1)
  assert.equal(store.authors[0].uuid, null) // untouched
})

test('backfillUuids: reports scanned counts even when nothing needs filling', async () => {
  const store: Record<string, any[]> = { tags: [{ id: 1, uuid: 'u' }, { id: 2, uuid: 'v' }] }
  const r = await backfillUuids(fakePayload(store))
  assert.equal(r.scanned.tags, 2)
  assert.equal(r.backfilled.tags, 0)
})
