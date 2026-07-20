import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildManifest, validateManifest, ManifestError } from './manifest'
import { SCHEMA_VERSION } from './types'

test('buildManifest stamps the required fields', () => {
  const m = buildManifest({
    sourceEnv: 'local',
    payloadVersion: '3.85.2',
    counts: { articles: 4 },
    exportedAt: '2026-07-20T00:00:00.000Z',
  })
  assert.equal(m.schemaVersion, SCHEMA_VERSION)
  assert.equal(m.tool, 'portfolio-data-sync')
  assert.equal(m.sourceEnv, 'local')
  assert.equal(m.counts.articles, 4)
  validateManifest(m) // does not throw
})

test('validateManifest rejects a wrong schemaVersion', () => {
  assert.throws(
    () => validateManifest({ schemaVersion: 99, tool: 'portfolio-data-sync', exportedAt: 'x', counts: {} }),
    ManifestError,
  )
})

test('validateManifest rejects a foreign tool', () => {
  assert.throws(
    () => validateManifest({ schemaVersion: SCHEMA_VERSION, tool: 'something-else', exportedAt: 'x', counts: {} }),
    ManifestError,
  )
})

test('validateManifest rejects non-object input', () => {
  assert.throws(() => validateManifest(null), ManifestError)
  assert.throws(() => validateManifest('nope'), ManifestError)
})
