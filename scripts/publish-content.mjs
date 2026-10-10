#!/usr/bin/env node
// Sprint-23 publish script (runs on the GitHub Actions runner — never on the VPS).
//
//   node scripts/publish-content.mjs <publish.zip> --collection articles|projects [--dry-run]
//
// Logs in with the publish service account, then imports the zip with
// replaceOnly=<collection> — scoped replace-all: the target collection converges
// 1:1 with the archive; refs upsert only.
//
// Sprint-27 addendum: serverless platforms cap request bodies (Vercel: 4.5 MB),
// which a media-heavy projects zip blows past. When the S3_* env vars are present
// the zip is uploaded to the R2 bucket's `publish-inbox/` prefix and the API is
// pointed at the object key (/api/data-import-r2); otherwise the legacy multipart
// POST (/api/data-import) is used — fine for small, text-only zips.
//
// Environment:
//   PUBLISH_BASE     — API base (default: https://athallarizky.com)
//   PUBLISH_EMAIL    — Payload service-account email   (GitHub secret)
//   PUBLISH_PASSWORD — Payload service-account password (GitHub secret)
//   S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY — R2 (GitHub secrets)

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const colIdx = args.indexOf('--collection')
const collection = colIdx !== -1 ? args[colIdx + 1] : undefined
const zipPath = args.find((a) => !a.startsWith('--') && a !== collection)

const base = (process.env.PUBLISH_BASE ?? 'https://athallarizky.com').replace(/\/$/, '')
const email = process.env.PUBLISH_EMAIL
const password = process.env.PUBLISH_PASSWORD
const s3 = {
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
}
const useR2 = Boolean(s3.endpoint && s3.bucket && s3.accessKeyId && s3.secretAccessKey)

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

  // 2. Import the zip with scoped replace
  const buf = fs.readFileSync(zipPath)
  let res
  if (useR2) {
    // The S3 client lives in backend/node_modules (the runner npm-ci's backend first);
    // anchor a require there so this root-level script can load it.
    const req = createRequire(path.resolve('backend', 'package.json'))
    const { S3Client, PutObjectCommand } = req('@aws-sdk/client-s3')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const key = `publish-inbox/publish-${collection}-${stamp}.zip`
    console.log(`→ uploading ${zipPath} (${(buf.length / 1e6).toFixed(1)} MB) to R2 ${key} …`)
    const client = new S3Client({
      endpoint: s3.endpoint,
      region: 'auto',
      credentials: { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey },
    })
    await client.send(
      new PutObjectCommand({ Bucket: s3.bucket, Key: key, Body: buf, ContentType: 'application/zip' }),
    )
    console.log(`→ importing from R2 (replaceOnly: ${collection}${dryRun ? ', DRY RUN' : ''}) …`)
    res = await fetch(`${base}/api/data-import-r2`, {
      method: 'POST',
      headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, dryRun, replaceOnly: collection }),
    })
  } else {
    const form = new FormData()
    form.append('file', new Blob([buf]), 'publish.zip')
    form.append('dryRun', dryRun ? 'true' : 'false')
    form.append('replaceOnly', collection)
    console.log(`→ importing ${zipPath} (replaceOnly: ${collection}${dryRun ? ', DRY RUN' : ''}) …`)
    res = await fetch(`${base}/api/data-import`, {
      method: 'POST',
      headers: { Authorization: `JWT ${token}` },
      body: form,
    })
  }
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
