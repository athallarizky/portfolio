#!/usr/bin/env node
// geo-tracker — sprint-30 follow-up: GEO citation-share measurement loop.
//
// The one layer of AEO/GEO testing that cannot pass today: do generative engines
// actually CITE us? This script runs a fixed query set against the Perplexity API
// (chosen because it returns explicit `citations` per answer — ChatGPT/Gemini have
// no equivalent API surface) and records every run. First run = baseline; run it
// periodically (weekly) and the drift is the GEO signal.
//
// Usage:
//   PPLX_API_KEY=... node scripts/geo-tracker.mjs            # automated run + record
//   node scripts/geo-tracker.mjs --manual                    # record a manual run (free)
//   node scripts/geo-tracker.mjs --summary                   # table over all runs (no key)
//
// --manual asks you to run each query in the Perplexity WEB UI (free, shows its
// sources), then records what you observe: was our domain among the cited sources?
// Works for ANY engine you can ask by hand — tag the run perplexity / chatgpt /
// google-ai-overview. The automated API path needs prepaid Perplexity credits
// ("Cannot create API key with no credit"); manual is the zero-cost default.
//
// Env: PPLX_API_KEY (automated mode only) — never stored here.
// Output: scripts/geo-runs/<YYYY-MM-DD-HHmm>.json (small, committed for history).
// Zero dependencies (Node 18+). Be polite: 1.5s between queries (automated mode).

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'

const HERE = path.dirname(new URL(import.meta.url).pathname)
const CONFIG = JSON.parse(fs.readFileSync(path.join(HERE, 'geo-queries.json'), 'utf8'))
const RUNS_DIR = path.join(HERE, 'geo-runs')
const MODEL = 'sonar' // cheap, web-grounded, returns citations

const listRuns = () =>
  fs.existsSync(RUNS_DIR)
    ? fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json')).sort()
    : []

function loadRuns() {
  return listRuns().map((f) => JSON.parse(fs.readFileSync(path.join(RUNS_DIR, f), 'utf8')))
}

function fmtRow(label, run, runs) {
  const cited = run.selfCited ? '✓' : '·'
  const total = runs.length
  const citedCount = runs.filter((r) => r.results.find((x) => x.label === label)?.selfCited).length
  const first = runs.find((r) => r.results.find((x) => x.label === label)?.selfCited)?.at?.slice(0, 10)
  return { label, cited, share: `${citedCount}/${total}`, firstCited: first || '—', urls: run.selfUrls }
}

async function runOnce() {
  const key = process.env.PPLX_API_KEY
  if (!key) {
    console.error('PPLX_API_KEY is required for a run (https://www.perplexity.ai/settings/api).')
    console.error('Use --summary to inspect recorded runs without a key.')
    process.exit(1)
  }

  const record = { at: new Date().toISOString(), model: MODEL, results: [] }
  for (const q of CONFIG.queries) {
    let citations = []
    let error = null
    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: q.q }] }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error?.message || `HTTP ${res.status}`)
      citations = body.citations ?? []
    } catch (e) {
      error = String(e.message || e)
    }
    const selfUrls = citations.filter((u) => CONFIG.selfDomains.some((d) => u.includes(d)))
    record.results.push({
      label: q.label,
      query: q.q,
      citations,
      selfCited: selfUrls.length > 0,
      selfUrls,
      ...(error ? { error } : {}),
    })
    console.log(
      error
        ? `✗ [${q.label}] error: ${error}`
        : `${selfUrls.length ? '✓' : '·'} [${q.label}] ${citations.length} citations${selfUrls.length ? ` — SELF: ${selfUrls.join(', ')}` : ''}`,
    )
    await new Promise((r) => setTimeout(r, 1500))
  }

  fs.mkdirSync(RUNS_DIR, { recursive: true })
  const stamp = record.at.slice(0, 16).replace(/[:T]/g, '-')
  const file = path.join(RUNS_DIR, `${stamp}.json`)
  fs.writeFileSync(file, JSON.stringify(record, null, 2))
  const share = record.results.filter((r) => r.selfCited).length
  console.log(`\nrecorded → ${path.relative(process.cwd(), file)} · self-cited ${share}/${record.results.length} queries`)
}

async function manualRun() {
  const engine = process.argv.includes('--engine')
    ? process.argv[process.argv.indexOf('--engine') + 1]
    : 'perplexity'
  console.log(`Manual GEO run (${engine}) — for each query: ask it in the ${engine} web UI,`)
  console.log('then answer whether OUR domains appear among the cited sources.')
  const record = { at: new Date().toISOString(), model: `manual:${engine}`, results: [] }
  for (const q of CONFIG.queries) {
    console.log(`\n❓ ${q.q}`)
    const answer = await ask('  self-cited? [y/n] (u = list urls, Enter = n): ')
    let selfCited = /^y/i.test(answer)
    let selfUrls = []
    if (/^u/i.test(answer)) {
      const urls = await ask('  cited self-urls (comma separated): ')
      selfUrls = urls.split(',').map((s) => s.trim()).filter(Boolean)
      selfCited = selfUrls.length > 0
    } else if (selfCited) {
      const urls = await ask('  (optional) cited self-urls, comma separated: ')
      selfUrls = urls.split(',').map((s) => s.trim()).filter(Boolean)
    }
    record.results.push({ label: q.label, query: q.q, citations: [], selfCited, selfUrls })
  }
  fs.mkdirSync(RUNS_DIR, { recursive: true })
  const stamp = record.at.slice(0, 16).replace(/[:T]/g, '-')
  const file = path.join(RUNS_DIR, `${stamp}-${engine}.json`)
  fs.writeFileSync(file, JSON.stringify(record, null, 2))
  const share = record.results.filter((r) => r.selfCited).length
  console.log(`\nrecorded → ${path.relative(process.cwd(), file)} · self-cited ${share}/${record.results.length} queries`)
}

// Line-queue stdin: bursts (piped answers) are never lost — naive rl.question()
// drops extra lines that arrive while no question is pending.
let rlInit = false
const lines = []
let lineWaiter = null
function initStdin() {
  if (rlInit) return
  rlInit = true
  const iface = readline.createInterface({ input: process.stdin })
  iface.on('line', (l) => {
    lines.push(l)
    lineWaiter?.()
    lineWaiter = null
  })
  iface.on('close', () => {
    lines.push('') // a closed stdin answers every remaining question with the default
    lineWaiter?.()
    lineWaiter = null
  })
}
async function ask(prompt) {
  initStdin()
  process.stdout.write(prompt)
  if (!lines.length) await new Promise((r) => { lineWaiter = r })
  return lines.shift()
}

function summary() {
  const runs = loadRuns()
  if (runs.length === 0) {
    console.log('no recorded runs yet — do the first one with PPLX_API_KEY (that becomes the baseline).')
    return
  }
  const latest = runs[runs.length - 1]
  console.log(`GEO citation tracker — ${runs.length} run(s), latest ${latest.at.slice(0, 10)} (model ${latest.model})\n`)
  console.log('label            latest   overall   first cited')
  console.log('─'.repeat(58))
  for (const q of CONFIG.queries) {
    const row = fmtRow(q.label, latest.results.find((r) => r.label === q.label) ?? {}, runs)
    console.log(
      `${row.label.padEnd(16)} ${row.cited.padEnd(8)} ${row.share.padEnd(9)} ${row.firstCited}`,
    )
  }
  const total = runs.reduce(
    (acc, r) => acc + r.results.filter((x) => x.selfCited).length,
    0,
  )
  const possible = runs.reduce((acc, r) => acc + r.results.length, 0)
  console.log('─'.repeat(58))
  console.log(`aggregate citation share: ${total}/${possible} (${Math.round((total / possible) * 100)}%)`)
  console.log('\nGEO is a drift signal, not pass/fail — compare weeks, not days.')
}

if (process.argv.includes('--summary')) summary()
else if (process.argv.includes('--manual')) await manualRun()
else await runOnce()
