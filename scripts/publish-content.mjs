#!/usr/bin/env node
// Sprint-23 publish script (runs on the GitHub Actions runner — never on the VPS).
//
//   node scripts/publish-content.mjs <publish.zip> --collection articles|projects [--dry-run]
//
// Logs in with the publish service account, then POSTs the zip to the existing
// /api/data-import endpoint with replaceOnly=<collection> — scoped replace-all:
// the target collection converges 1:1 with the archive; refs upsert only.
//
// Environment:
//   PUBLISH_BASE     — API base (default: https://athallarizky.com)
//   PUBLISH_EMAIL    — Payload service-account email   (GitHub secret)
//   PUBLISH_PASSWORD — Payload service-account password (GitHub secret)

import fs from 'node:fs'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const colIdx = args.indexOf('--collection')
const collection = colIdx !== -1 ? args[colIdx + 1] : undefined
const zipPath = args.find((a) => !a.startsWith('--') && a !== collection)

const base = (process.env.PUBLISH_BASE ?? 'https://athallarizky.com').replace(/\/$/, '')
const email = process.env.PUBLISH_EMAIL
const password = process.env.PUBLISH_PASSWORD

function fail(msg) {
  console.error(`❌ ${msg}`)
  process.exit(1)
}

if (!zipPath || !fs.existsSync(zipPath)) fail(`zip not found: ${zipPath}`)
if (!['articles', 'projects'].includes(collection)) {
  fail('--collection must be articles or projects')
}
if (!email || !password) fail('PUBLISH_EMAIL / PUBLISH_PASSWORD env vars are required')

async function main() {
  // 1. Login → token
  console.log(`→ logging in to ${base} …`)
  const loginRes = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!loginRes.ok) {
    fail(`login failed (${loginRes.status}): ${await loginRes.text()}`)
  }
  const { token } = await loginRes.json()
  if (!token) fail('login returned no token')
  console.log('✓ logged in')

  // 2. POST the zip (multipart) with scoped replace
  const buf = fs.readFileSync(zipPath)
  const form = new FormData()
  form.append('file', new Blob([buf]), 'publish.zip')
  form.append('dryRun', dryRun ? 'true' : 'false')
  form.append('replaceOnly', collection)

  console.log(`→ importing ${zipPath} (replaceOnly: ${collection}${dryRun ? ', DRY RUN' : ''}) …`)
  const res = await fetch(`${base}/api/data-import`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })
  const text = await res.text()
  let report
  try {
    report = JSON.parse(text)
  } catch {
    fail(`import endpoint returned ${res.status}: ${text.slice(0, 500)}`)
  }
  if (!res.ok) {
    fail(`import failed (${res.status}): ${report?.error ?? JSON.stringify(report).slice(0, 500)}`)
  }

  // 3. Surface the ImportReport
  console.log(`\n${report.dryRun ? '🔍 DRY RUN (no writes)' : '✅ IMPORT complete'} (replace-only: ${collection})`)
  if (report.backupPath) console.log('  backup :', report.backupPath)
  console.log('  created:', JSON.stringify(report.created ?? {}))
  console.log('  updated:', JSON.stringify(report.updated ?? {}))
  const deletedSum = Object.values(report.deleted ?? {}).reduce((a, b) => a + b, 0)
  if (deletedSum) console.log('  deleted:', JSON.stringify(report.deleted))
  if (report.skippedReferenced?.length) {
    console.log(`  skipped (referenced): ${report.skippedReferenced.length}`)
    for (const s of report.skippedReferenced) console.log(`    - [${s.collection}] ${s.key}: ${s.reason}`)
  }
  const errors = report.errors ?? []
  if (errors.length) {
    console.log(`  errors : ${errors.length}`)
    for (const e of errors) console.log(`    - [${e.collection}] ${e.key}: ${e.message}`)
    process.exit(1)
  }
  console.log('  errors : 0')
}

main().catch((err) => fail(err instanceof Error ? err.stack ?? err.message : String(err)))
