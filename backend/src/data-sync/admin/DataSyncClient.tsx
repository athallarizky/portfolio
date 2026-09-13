'use client'

// Interactive half of the Data Sync admin view (sprint-14, redesigned sprint-17).
// Upload flow: click "Upload content (.zip)" → pick a file → modal asks Merge vs Replace-all →
// PREVIEW (dry-run, Step 2 of 2) → Apply (Replace-all requires an explicit confirm). The mode is
// chosen per-upload in the modal. Nothing is written until Apply; a success card replaces the preview
// once the write lands.

import { useRef, useState, type ReactNode } from 'react'
import { Button } from '@payloadcms/ui'

import { MergePanel } from './MergePanel'

type ImportError = { collection: string; key: string; message: string }
type SkippedRef = { collection: string; key: string; reason: string }
type Report = {
  created: Record<string, number>
  updated: Record<string, number>
  unchanged: Record<string, number>
  deleted: Record<string, number>
  skippedReferenced: SkippedRef[]
  localeOverlays?: Record<string, number>
  errors: ImportError[]
  backupPath?: string
  dryRun: boolean
}

const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)
const nz = (r: Record<string, number>) => Object.entries(r).filter(([, n]) => n > 0) as [string, number][]

type Mode = 'merge' | 'replace'

export const DataSyncClient = () => {
  const [busy, setBusy] = useState<string | null>(null)
  const [busyLabel, setBusyLabel] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('merge')
  const [confirmed, setConfirmed] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetPreview = () => {
    setReport(null)
    setConfirmed(false)
  }

  const download = async (path: string, fallbackName: string) => {
    setBusy(path)
    setError(null)
    try {
      const res = await fetch(`/api${path}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const cd = res.headers.get('content-disposition') || ''
      const m = /filename="?([^";]+)"?/.exec(cd)
      const filename = m?.[1] || fallbackName
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  const doImport = async (f: File, isDryRun: boolean, m: Mode) => {
    setBusy('import')
    setBusyLabel(isDryRun ? 'Running preview…' : 'Applying changes…')
    setError(null)
    setReport(null)
    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('dryRun', isDryRun ? 'true' : 'false')
      fd.append('replaceAll', m === 'replace' ? 'true' : 'false')
      const res = await fetch('/api/data-import', { method: 'POST', body: fd })
      const json = (await res.json()) as Report & { error?: string }
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setReport(json)
      setFile(f)
      setMode(m)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
      setBusyLabel(null)
    }
  }

  /** Modal choice → close modal + run the dry-run PREVIEW in that mode. */
  const chooseMode = (m: Mode) => {
    const f = pendingFile
    setPendingFile(null)
    if (f) doImport(f, true, m)
  }

  const changes = report ? sum(report.created) + sum(report.updated) + sum(report.deleted) : 0
  const deletes = report ? sum(report.deleted) : 0
  const previewing = !!report && report.dryRun
  const applied = !!report && !report.dryRun
  const canApply = previewing && report!.errors.length === 0 && changes > 0 && (mode !== 'replace' || confirmed)
  const appliedClean = applied && report!.errors.length === 0

  const countsBlock = report ? (
    <div style={{ marginTop: 8 }}>
      {sum(report.created) > 0 && (
        <Badges label={report.dryRun ? 'Would create' : 'Created'} items={nz(report.created)} color="#1a7f37" />
      )}
      {sum(report.updated) > 0 && (
        <Badges label={report.dryRun ? 'Would update' : 'Updated'} items={nz(report.updated)} color="#0969da" />
      )}
      {sum(report.deleted) > 0 && (
        <Badges label={report.dryRun ? 'Would delete' : 'Deleted'} items={nz(report.deleted)} color="#b35900" />
      )}
      {sum(report.localeOverlays ?? {}) > 0 && (
        <Badges
          label={report.dryRun ? 'Would localize' : 'Locale overlays'}
          items={nz(report.localeOverlays)}
          color="#8250df"
        />
      )}
      {report.skippedReferenced.length > 0 && (
        <div className="ds-skipped">
          Kept (still referenced): {report.skippedReferenced.map((s) => `[${s.collection}] ${s.key}`).join(', ')}
        </div>
      )}
    </div>
  ) : null

  const errorsBlock = report && report.errors.length > 0 ? (
    <div style={{ marginTop: 10 }}>
      <strong style={{ color: 'var(--theme-error-500, #a52822)' }}>⚠ {report.errors.length} error(s):</strong>
      <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
        {report.errors.map((e, i) => (
          <li key={i} style={{ color: 'var(--theme-error-500, #a52822)', fontSize: 13 }}>
            [{e.collection}] <code>{e.key}</code>: {e.message}
          </li>
        ))}
      </ul>
    </div>
  ) : null

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px' }}>
      <style>{DS_CSS}</style>
      <h1 style={{ marginBottom: 4 }}>Data Sync &amp; Backup</h1>
      <p style={{ color: 'var(--theme-elevation-500, #888)', marginTop: 0, marginBottom: 28 }}>
        Export/import content (portable JSON + Markdown + media) or snapshot the whole DB. Every action
        requires an admin session.
      </p>

      <Section
        title="Content export / import"
        description="A portable .zip of every collection + globals. Edit the JSON between download & upload to bulk-create/update — keep each item's slug / name / title / platform stable to update in place."
      >
        <div className="ds-actions">
          <Button
            buttonStyle="secondary"
            onClick={() => download('/data-export', 'portfolio-data.zip')}
            disabled={!!busy || !!pendingFile}
          >
            {busy === '/data-export' ? 'Preparing…' : '⬇ Download content (.zip)'}
          </Button>
          <Button
            buttonStyle="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!busy || !!pendingFile}
          >
            {busy === 'import' ? 'Working…' : '⬆ Upload content (.zip)'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                resetPreview()
                setPendingFile(f)
              }
              e.target.value = ''
            }}
          />
        </div>

        {/* loading state */}
        {busy === 'import' && (
          <div className="ds-loading">
            <span className="ds-spinner" />
            <span>{busyLabel}</span>
          </div>
        )}

        {/* Step 2: preview → Apply. White card, colored left border = readable text. */}
        {previewing && (
          <div className={`ds-card ds-card-${mode}`}>
            <div className="ds-card-head">
              <span className="ds-pill">Step 2 of 2 · preview</span>
              <strong className={`ds-card-title ds-card-title-${mode}`}>
                {mode === 'replace' ? '⚠ Replace-all' : 'Merge'} — {changes} change(s)
                {deletes > 0 ? `, ${deletes} deletion(s)` : ''}, 0 errors
              </strong>
            </div>
            <div className="ds-card-note">
              <strong>Nothing written yet.</strong> Apply backs up payload.db first
              {mode === 'replace' ? '. Records not in the archive WILL be deleted.' : '.'}
            </div>
            {countsBlock}
            {mode === 'replace' && (
              <label className="ds-confirm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={!!busy}
                />
                <span>
                  I understand <strong>{deletes}</strong> record(s) not in the archive will be deleted.
                </span>
              </label>
            )}
            <div className="ds-card-actions">
              <Button
                buttonStyle="primary"
                onClick={() => doImport(file!, false, mode)}
                disabled={!!busy || (mode === 'replace' && !confirmed)}
              >
                {busy === 'import'
                  ? 'Applying…'
                  : mode === 'replace'
                    ? `⚠ Apply — delete ${deletes} & write changes`
                    : '✓ Apply changes'}
              </Button>
              <button type="button" className="ds-link-btn" onClick={resetPreview} disabled={!!busy}>
                discard preview
              </button>
            </div>
          </div>
        )}

        {/* success state (inline in this section) */}
        {applied && (
          <div className={`ds-card ${appliedClean ? 'ds-card-success' : 'ds-card-replace'}`}>
            <div className="ds-card-head">
              <span className={`ds-pill ${appliedClean ? 'ds-pill-ok' : ''}`}>
                {appliedClean ? 'Done' : 'Partial'}
              </span>
              <strong className={`ds-card-title ${appliedClean ? 'ds-card-title-success' : 'ds-card-title-replace'}`}>
                {appliedClean ? '✅ Import applied' : `⚠ Applied with ${report!.errors.length} error(s)`}
              </strong>
            </div>
            <div className="ds-card-note">
              {report!.backupPath ? (
                <>
                  DB backed up to <code>{report!.backupPath}</code>.
                </>
              ) : (
                <strong>Changes written to the DB.</strong>
              )}
            </div>
            {countsBlock}
            {errorsBlock}
            <div className="ds-card-actions">
              <button type="button" className="ds-link-btn" onClick={resetPreview} disabled={!!busy}>
                dismiss
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="ds-error-box">
            <strong>⚠ Error:</strong> {error}
          </div>
        )}
      </Section>

      <MergePanel />

      <Section
        title="DB snapshot (whole instance)"
        description="A raw backup of payload.db + documents/. Use to migrate or restore the whole instance."
      >
        <Button
          buttonStyle="secondary"
          onClick={() => download('/data-snapshot', 'portfolio-snapshot.zip')}
          disabled={!!busy}
        >
          {busy === '/data-snapshot' ? 'Preparing…' : '⬇ Download DB snapshot (.zip)'}
        </Button>
        <p style={{ color: 'var(--theme-elevation-500, #888)', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          Restore is CLI-only (offline, destructive):{' '}
          <code>npm run snapshot:restore -- portfolio-snapshot.zip -- --yes</code>
        </p>
      </Section>

      {pendingFile && (
        <ModeModal
          filename={pendingFile.name}
          onMerge={() => chooseMode('merge')}
          onReplace={() => chooseMode('replace')}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </div>
  )
}

const ModeModal = ({
  filename,
  onMerge,
  onReplace,
  onCancel,
}: {
  filename: string
  onMerge: () => void
  onReplace: () => void
  onCancel: () => void
}) => (
  <div className="ds-overlay" onClick={onCancel}>
    <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
      <div className="ds-modal-eyebrow">Step 1 of 2</div>
      <h3 className="ds-modal-title">Import archive</h3>
      <div className="ds-file-pill">📄 {filename}</div>
      <p className="ds-modal-help">
        Choose how to apply this archive. You'll preview the result before anything is written.
      </p>
      <div className="ds-choices">
        <button type="button" className="ds-choice ds-merge" onClick={onMerge}>
          <div className="ds-choice-icon">⬆</div>
          <div className="ds-choice-body">
            <div className="ds-choice-title">Merge</div>
            <div className="ds-choice-desc">Add new + update existing. Safe — never deletes.</div>
          </div>
        </button>
        <button type="button" className="ds-choice ds-replace" onClick={onReplace}>
          <div className="ds-choice-icon">⚠</div>
          <div className="ds-choice-body">
            <div className="ds-choice-title">Replace all</div>
            <div className="ds-choice-desc">Make DB match the archive. Deletes records not in it.</div>
          </div>
        </button>
      </div>
      <div className="ds-modal-foot">
        <button type="button" className="ds-link-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)

const DS_CSS = `
.ds-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px;}
.ds-modal{background:var(--theme-elevation-0,#fff);border:1px solid var(--theme-border-color,#e6e6e6);border-radius:14px;padding:26px;max-width:520px;width:100%;box-shadow:0 24px 70px rgba(15,23,42,.35);}
.ds-modal-eyebrow{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--theme-elevation-400,#9aa0a6);}
.ds-modal-title{margin:4px 0 12px;font-size:19px;}
.ds-file-pill{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:6px 12px;border-radius:999px;background:var(--theme-elevation-100,#f1f3f5);color:var(--theme-elevation-800,#333);font-size:13px;font-family:ui-monospace,monospace;}
.ds-modal-help{color:var(--theme-elevation-600,#555);font-size:13px;margin:14px 0 18px;}
.ds-choices{display:flex;gap:12px;}
.ds-choice{flex:1;display:flex;gap:12px;align-items:flex-start;text-align:left;padding:16px;border-radius:11px;border:2px solid;cursor:pointer;font:inherit;color:inherit;transition:transform .12s ease,box-shadow .12s ease,background .12s ease;}
.ds-choice:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(15,23,42,.1);}
.ds-choice:focus-visible{outline:3px solid rgba(9,105,218,.4);outline-offset:1px;}
.ds-choice-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0;color:#fff;}
.ds-choice-title{font-size:15px;font-weight:700;line-height:1.2;}
.ds-choice-desc{font-size:12px;opacity:.82;margin-top:3px;line-height:1.35;}
.ds-merge{border-color:#bfe3cd;background:#eaf5ee;color:#1a7f37;}
.ds-merge:hover{background:#ddf1e4;}
.ds-merge .ds-choice-icon{background:#1a7f37;}
.ds-replace{border-color:#f0d9a0;background:#fdf6e3;color:#b35900;}
.ds-replace:hover{background:#fbeccd;}
.ds-replace .ds-choice-icon{background:#b35900;}
.ds-modal-foot{text-align:right;margin-top:16px;}
.ds-link-btn{background:none;border:none;color:var(--theme-elevation-500,#888);cursor:pointer;font-size:13px;text-decoration:underline;padding:0;}
.ds-link-btn:hover:not(:disabled){color:var(--theme-elevation-900,#111);}
.ds-link-btn:disabled{opacity:.5;cursor:default;}

.ds-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}

.ds-loading{display:flex;align-items:center;gap:10px;margin-top:14px;padding:12px 14px;border-radius:8px;background:var(--theme-elevation-100,#f1f3f5);font-size:13px;color:var(--theme-elevation-800,#333);}
.ds-spinner{width:14px;height:14px;border:2px solid var(--theme-elevation-300,#c4c9cf);border-top-color:#0969da;border-radius:50%;display:inline-block;animation:ds-spin .7s linear infinite;}
@keyframes ds-spin{to{transform:rotate(360deg);}}

.ds-card{margin-top:16px;padding:16px 16px 16px 18px;border-radius:10px;background:var(--theme-elevation-0,#fff);border:1px solid var(--theme-border-color,#e6e6e6);border-left:4px solid var(--theme-elevation-300,#c4c9cf);}
.ds-card-merge{border-left-color:#1a7f37;}
.ds-card-replace{border-left-color:#b35900;}
.ds-card-success{border-left-color:#1a7f37;}
.ds-card-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ds-pill{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:999px;background:rgba(15,23,42,.08);color:var(--theme-elevation-700,#444);}
.ds-pill-ok{background:#1a7f37;color:#fff;}
.ds-card-title{font-size:15px;color:var(--theme-elevation-900,#111);}
.ds-card-title-merge{color:#1a7f37;}
.ds-card-title-replace{color:#b35900;}
.ds-card-title-success{color:#1a7f37;}
.ds-card-note{font-size:13px;color:var(--theme-elevation-700,#444);margin-top:8px;line-height:1.5;}
.ds-card-note code{font-size:12px;}
.ds-skipped{margin-top:8px;font-size:12px;color:var(--theme-elevation-500,#666);}
.ds-confirm{display:flex;align-items:flex-start;gap:8px;margin-top:14px;padding:10px 12px;border-radius:8px;background:#fdf6e3;border:1px solid #f0d9a0;font-size:13px;color:#7a3d00;cursor:pointer;}
.ds-confirm input{margin-top:2px;}
.ds-confirm strong{color:#5a2d00;}
.ds-card-actions{display:flex;align-items:center;gap:14px;margin-top:14px;}

.ds-error-box{margin-top:16px;padding:14px 16px;background:var(--theme-error-100,#fdecea);border:1px solid var(--theme-error-300,#f5c2c0);border-radius:8px;color:var(--theme-error-500,#a52822);font-size:13px;}
`

const Section = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <section
    style={{
      marginBottom: 24,
      padding: 20,
      border: '1px solid var(--theme-border-color, #e6e6e6)',
      borderRadius: 8,
      background: 'var(--theme-elevation-50, #fafafa)',
    }}
  >
    <h2 style={{ marginTop: 0, marginBottom: 4 }}>{title}</h2>
    <p style={{ color: 'var(--theme-elevation-500, #888)', fontSize: 13, marginTop: 0, marginBottom: 16 }}>
      {description}
    </p>
    {children}
  </section>
)

const Badges = ({ label, items, color }: { label: string; items: [string, number][]; color: string }) => (
  <div style={{ marginTop: 8 }}>
    <div style={{ fontSize: 13, color: 'var(--theme-elevation-500, #888)', marginBottom: 6 }}>{label}:</div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map(([k, n]) => (
        <span
          key={k}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 13,
            background: `${color}22`,
            color,
          }}
        >
          {k} <strong>{n}</strong>
        </span>
      ))}
    </div>
  </div>
)
