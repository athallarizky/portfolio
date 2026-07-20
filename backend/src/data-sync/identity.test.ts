import { test } from 'node:test'
import assert from 'node:assert/strict'

import { ensureUuid, uuidField } from './identity'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

test('ensureUuid: assigns a uuid on create when missing', () => {
  const data: Record<string, unknown> = { name: 'Atha' }
  const out = ensureUuid({ data, operation: 'create' }) as Record<string, unknown>
  assert.ok(out.uuid, 'uuid should be set')
  assert.equal(typeof out.uuid, 'string')
  assert.match(out.uuid as string, UUID_V4)
})

test('ensureUuid: preserves a provided uuid (import pass-through)', () => {
  const fixed = '550e8400-e29b-41d4-a716-446655440000'
  const data: Record<string, unknown> = { name: 'Atha', uuid: fixed }
  const out = ensureUuid({ data, operation: 'create' }) as Record<string, unknown>
  assert.equal(out.uuid, fixed, 'a provided uuid must be preserved, not overwritten')
})

test('ensureUuid: no-op on update (uuid is immutable)', () => {
  const data: Record<string, unknown> = { name: 'Atha' } // no uuid present
  const out = ensureUuid({ data, operation: 'update' }) as Record<string, unknown>
  assert.equal(out.uuid, undefined, 'update must not assign a uuid')
})

test('ensureUuid: empty-string uuid is treated as missing on create', () => {
  const data: Record<string, unknown> = { name: 'Atha', uuid: '' }
  const out = ensureUuid({ data, operation: 'create' }) as Record<string, unknown>
  assert.match(out.uuid as string, UUID_V4)
})

test('uuidField: hidden from editors, unique, indexed', () => {
  assert.equal(uuidField.name, 'uuid')
  assert.equal(uuidField.type, 'text')
  assert.equal(uuidField.unique, true)
  assert.equal(uuidField.index, true)
  assert.equal(uuidField.admin?.disabled, true, 'must be hidden from the admin UI')
})
