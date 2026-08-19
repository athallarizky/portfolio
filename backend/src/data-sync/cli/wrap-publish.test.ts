import { test } from 'node:test'
import assert from 'node:assert/strict'

import { validatePublishRows, WrapPublishError } from './wrap-publish'

// ---- validatePublishRows: publish sources must be identity-stable and duplicate-free ----

const row = (over: Record<string, unknown>) => ({ uuid: 'u-1', slug: 'a', ...over })

test('validatePublishRows: ok for a clean set', () => {
  assert.doesNotThrow(() =>
    validatePublishRows('articles', [row({ uuid: 'u-1', slug: 'a' }), row({ uuid: 'u-2', slug: 'b' })], ['f1', 'f2']),
  )
})

test('validatePublishRows: missing uuid throws — publish rows need stable identity', () => {
  assert.throws(
    () => validatePublishRows('articles', [{ slug: 'a' }], ['f1']),
    WrapPublishError,
  )
})

test('validatePublishRows: missing natural key throws', () => {
  assert.throws(
    () => validatePublishRows('articles', [{ uuid: 'u-1' }], ['f1']),
    WrapPublishError,
  )
})

test('validatePublishRows: duplicate uuid throws (copied entry)', () => {
  assert.throws(
    () =>
      validatePublishRows(
        'projects',
        [row({ uuid: 'same', slug: 'a' }), row({ uuid: 'same', slug: 'b' })],
        ['f1', 'f2'],
      ),
    WrapPublishError,
  )
})

test('validatePublishRows: duplicate slug throws', () => {
  assert.throws(
    () =>
      validatePublishRows(
        'projects',
        [row({ uuid: 'u-1', slug: 'dupe' }), row({ uuid: 'u-2', slug: 'dupe' })],
        ['f1', 'f2'],
      ),
    WrapPublishError,
  )
})
