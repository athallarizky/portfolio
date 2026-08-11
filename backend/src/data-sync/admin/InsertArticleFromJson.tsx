'use client'

// "Add article from JSON" — a compact trigger button on /admin/collections/articles (beforeList)
// that opens a modal. The heavy form lives in the modal (not a big card above the list). Paste or
// upload a single v2 article row; the server wraps it into an in-memory archive and imports it
// (idempotent upsert-by-uuid; tags + author resolve via priming).

import { useState } from 'react'
import { Button } from '@payloadcms/ui'

type Report = {
  created: Record<string, number>
  updated: Record<string, number>
  errors: { collection: string; key: string; message: string }[]
  dryRun: boolean
}
const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)

const SAMPLE = `{
  "title": "My Article",
  "slug": "my-article",
  "excerpt": "One-line summary of the article.",
  "tags": ["ai", "backend"],
  "author": "Athalla Rizky",
  "publishedAt": "2026-01-01T00:00:00.000Z",
  "readMinutes": 5,
  "body": "## Overview\\n\\nStart writing your article here.\\n\\n## Key Points\\n\\n- Point one\\n- Point two",
  "status": "published"
}`

export const InsertArticleFromJson = () => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setReport(null)
    setError(null)
  }

  const parse = (): Record<string, unknown> => {
    if (!text.trim()) throw new Error('paste an article JSON or pick a .json file')
    const p = JSON.parse(text)
    if (Array.isArray(p)) throw new Error('expected a single article object, not an array')
    if (!p || typeof p !== 'object') throw new Error('not a JSON object')
    return p as Record<string, unknown>
  }

  const submit = async (isDryRun: boolean) => {
    setError(null)
    setReport(null)
    let row: Record<string, unknown>
    try {
      row = parse()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/data-insert-one', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ collection: 'articles', row, dryRun: isDryRun }),
      })
      const json = (await res.json()) as Report & { error?: string }
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setReport(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const changes = report ? sum(report.created) + sum(report.updated) : 0
  const previewing = !!report && report.dryRun
  const applied = !!report && !report.dryRun
  const canApply = previewing && report!.errors.length === 0 && changes > 0

  const close = () => {
    setOpen(false)
    reset()
    setText('')
  }

  return (
    <>
      <style>{IAJ_CSS}</style>
      <div className="iaj-bar">
        <Button buttonStyle="secondary" onClick={() => setOpen(true)}>
          ＋ Create new from JSON
        </Button>
      </div>

      {open && (
        <div className="iaj-overlay" onClick={close}>
          <div className="iaj-modal" onClick={(e) => e.stopPropagation()}>
            <div className="iaj-head">
              <div>
                <div className="iaj-eyebrow">Articles</div>
                <h3 className="iaj-title">Add one article from JSON</h3>
              </div>
              <button type="button" className="iaj-x" onClick={close} aria-label="Close">
                ✕
              </button>
            </div>

            <p className="iaj-help">
              Paste an article JSON (the <code>tools/article-polish</code> format) or upload a{' '}
              <code>.json</code>. Re-importing the same row <strong>updates in place</strong> (by{' '}
              <code>uuid</code>); <code>tags</code> and <code>author</code> resolve automatically by
              slug and name.
            </p>

            <div className="iaj-filerow">
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    reset()
                    f
                      .text()
                      .then(setText)
                      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
                  }
                  e.target.value = ''
                }}
              />
              <button type="button" className="iaj-link" onClick={() => { setText(SAMPLE); reset() }}>
                paste sample
              </button>
              {text && (
                <button type="button" className="iaj-link" onClick={() => { setText(''); reset() }}>
                  clear
                </button>
              )}
            </div>

            <textarea
              className="iaj-textarea"
              value={text}
              onChange={(e) => { setText(e.target.value); reset() }}
              placeholder={SAMPLE}
              spellCheck={false}
            />

            {busy && (
              <div className="iaj-loading">
                <span className="iaj-spinner" />
                <span>Working…</span>
              </div>
            )}

            {previewing && (
              <div className={`iaj-result ${report!.errors.length === 0 ? 'iaj-result-ok' : 'iaj-result-err'}`}>
                <strong>
                  Preview — would create {sum(report!.created)}, update {sum(report!.updated)}.
                </strong>
                {report!.errors.length > 0 ? (
                  <ul>
                    {report!.errors.map((e, i) => (
                      <li key={i}>
                        <code>{e.key}</code>: {e.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span> No errors.</span>
                )}
              </div>
            )}

            {applied && (
              <div className="iaj-result iaj-result-ok">
                <strong>
                  ✅ Applied — created {sum(report!.created)}, updated {sum(report!.updated)}.
                </strong>
                <div className="iaj-result-note">Close &amp; refresh the list to see it.</div>
              </div>
            )}

            {error && <div className="iaj-error">⚠ {error}</div>}

            <div className="iaj-actions">
              {!applied && (
                <Button buttonStyle="secondary" onClick={() => submit(true)} disabled={busy || !text.trim()}>
                  {busy ? 'Working…' : '🔍 Preview'}
                </Button>
              )}
              {canApply && (
                <Button buttonStyle="primary" onClick={() => submit(false)} disabled={busy}>
                  {busy ? 'Creating…' : '✓ Apply'}
                </Button>
              )}
              <button type="button" className="iaj-link iaj-cancel" onClick={close}>
                {applied ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InsertArticleFromJson

const IAJ_CSS = `
.iaj-bar{display:flex;justify-content:flex-start;align-items:center;gap:12px;margin:12px 0 0;}

.iaj-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px;}
.iaj-modal{background:var(--theme-elevation-0,#fff);border:1px solid var(--theme-border-color,#e6e6e6);border-radius:14px;padding:24px;max-width:620px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 24px 70px rgba(15,23,42,.35);}
.iaj-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.iaj-eyebrow{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--theme-elevation-400,#9aa0a6);}
.iaj-title{margin:4px 0 0;font-size:18px;}
.iaj-x{background:none;border:none;font-size:18px;line-height:1;color:var(--theme-elevation-500,#888);cursor:pointer;padding:4px 8px;border-radius:6px;}
.iaj-x:hover{background:var(--theme-elevation-100,#f1f3f5);color:var(--theme-elevation-900,#111);}
.iaj-help{color:var(--theme-elevation-600,#555);font-size:13px;margin:14px 0 12px;line-height:1.5;}
.iaj-help code,.iaj-help strong code{font-size:12px;}

.iaj-filerow{display:flex;align-items:center;gap:14px;margin-bottom:8px;flex-wrap:wrap;}
.iaj-textarea{width:100%;min-height:170px;font-family:ui-monospace,monospace;font-size:12px;padding:10px;border-radius:8px;border:1px solid var(--theme-border-color,#d4d4d4);background:var(--theme-elevation-0,#fff);box-sizing:border-box;color:var(--theme-elevation-900,#111);resize:vertical;}
.iaj-textarea:focus{outline:2px solid rgba(9,105,218,.4);border-color:#0969da;}

.iaj-loading{display:flex;align-items:center;gap:10px;margin-top:12px;font-size:13px;color:var(--theme-elevation-700,#444);}
.iaj-spinner{width:14px;height:14px;border:2px solid var(--theme-elevation-300,#c4c9cf);border-top-color:#0969da;border-radius:50%;display:inline-block;animation:iaj-spin .7s linear infinite;}
@keyframes iaj-spin{to{transform:rotate(360deg);}}

.iaj-result{margin-top:12px;padding:10px 12px;border-radius:8px;font-size:13px;border:1px solid;line-height:1.5;}
.iaj-result-ok{background:#eaf5ee;border-color:#bfe3cd;color:#1a7f37;}
.iaj-result-err{background:#fdecea;border-color:#f5c2c0;color:#a52822;}
.iaj-result ul{margin:6px 0 0;padding-left:18px;}
.iaj-result-note{margin-top:4px;font-size:12px;opacity:.8;}
.iaj-error{margin-top:12px;padding:10px 12px;border-radius:8px;background:#fdecea;border:1px solid #f5c2c0;color:#a52822;font-size:13px;}

.iaj-actions{display:flex;align-items:center;gap:12px;margin-top:16px;}
.iaj-cancel{margin-left:auto;}
.iaj-link{background:none;border:none;color:var(--theme-elevation-500,#888);cursor:pointer;font-size:13px;text-decoration:underline;padding:0;}
.iaj-link:hover{color:var(--theme-elevation-900,#111);}
`