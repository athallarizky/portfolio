import { test } from 'node:test'
import assert from 'node:assert/strict'

import { formatStamp } from './filenames'

test('formatStamp produces YYYY-MM-DD-HH-MM for a fixed local date', () => {
  // Constructed from local components → result is tz-independent (both sides use local).
  const d = new Date(2026, 6, 20, 1, 44, 5, 0) // 2026-07-20 01:44:05 local
  assert.equal(formatStamp(d), '2026-07-20-01-44')
})

test('formatStamp zero-pads single-digit fields', () => {
  const d = new Date(2026, 0, 3, 9, 5, 0, 0) // 2026-01-03 09:05 local
  assert.equal(formatStamp(d), '2026-01-03-09-05')
})
