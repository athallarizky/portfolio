'use client'

// Interactive half of the Data Sync admin view.
// - Polished with @payloadcms/ui Button + section cards.
// - Upload runs dry-run first; if clean + has changes, an "Apply" button runs the real import
//   on the same file (no need to toggle the checkbox + re-pick).

import { useRef, useState, type ReactNode } from 'react'
import { Button } from '@payloadcms/ui'

import { MergePanel } from './MergePanel'

type ImportError = { collection: string; key: string; message: string }
type Report = {
  created: Record<string, number>
  updated: Record<string, number>
  unchanged: Record<string, number>
  errors: ImportError[]
  dryRun: boolean
}

const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)

export const DataSyncClient = () => {
  const [busy, setBusy] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dryRun, setDryRun] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const download = async (path: string, filename: string) => {
    setBusy(path)
    setError(null)
    try {
      const res = await fetch(`/api${path}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
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

  const doImport = async (f: File, isDryRun: boolean) => {
    setBusy('import')
    setError(null)
    setReport(null)
    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('dryRun', isDryRun ? 'true' : 'false')
      const res = await fetch('/api/data-import', { method: 'POST', body: fd })
      const json = (await res.json()) as Report & { error?: string }
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setReport(json)
      setFile(f)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  const changes = report ? sum(report.created) + sum(report.updated) : 0
  const canApply = !!report && report.dryRun && report.errors.length === 0 && changes > 0

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ marginBottom: 4 }}>Data Sync &amp; Backup</h1>
      <p style={{ color: 'var(--theme-elevation-500, #888)', marginTop: 0, marginBottom: 28 }}>
        Export/import content (portable JSON + Markdown + media) or snapshot the whole DB. Every action
        requires an admin session.
      </p>

      <Section
        title="Content export / import"
        description="A portable .zip of every collection + globals. Edit the JSON between download & upload to bulk-create/update — keep each item's slug / name / title / platform stable to update in place."
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button buttonStyle="secondary" onClick={() => download('/data-export', 'portfolio-data.zip')} disabled={!!busy}>
            {busy === '/data-export' ? 'Preparing…' : '⬇ Download content (.zip)'}
          </Button>
          <Button buttonStyle="primary" onClick={() => fileInputRef.current?.click()} disabled={!!busy}>
            {busy === 'import' ? 'Working…' : `⬆ Upload ${dryRun ? '(dry-run)' : '(apply)'}`}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) doImport(f, dryRun)
              e.target.value = ''
            }}
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} disabled={!!busy} />
            dry-run (preview only)
          </label>
        </div>

        {canApply && file && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: 'var(--theme-success-100, #eaf5ee)',
              border: '1px solid var(--theme-success-300, #bfe3cd)',
              borderRadius: 6,
            }}
          >
            <strong>Dry-run OK — {changes} change(s), 0 errors.</strong>
            <span style={{ color: 'var(--theme-elevation-500, #888)', marginLeft: 8 }}>
              Apply writes to the DB (payload.db is backed up first).
            </span>
            <div style={{ marginTop: 10 }}>
              <Button buttonStyle="primary" onClick={() => doImport(file, false)} disabled={!!busy}>
                {busy === 'import' ? 'Applying…' : '✓ Apply these changes'}
              </Button>
            </div>
          </div>
        )}
      </Section>

      <MergePanel />

      <Section
        title="DB snapshot (whole instance)"
        description="A raw backup of payload.db + documents/. Use to migrate or restore the whole instance."
      >
        <Button buttonStyle="secondary" onClick={() => download('/data-snapshot', 'portfolio-snapshot.zip')} disabled={!!busy}>
          {busy === '/data-snapshot' ? 'Preparing…' : '⬇ Download DB snapshot (.zip)'}
        </Button>
        <p style={{ color: 'var(--theme-elevation-500, #888)', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          Restore is CLI-only (offline, destructive):{' '}
          <code>npm run snapshot:restore -- portfolio-snapshot.zip -- --yes</code>
        </p>
      </Section>

      {report && <ReportCard report={report} />}

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--theme-error-100, #fdecea)',
            border: '1px solid var(--theme-error-300, #f5c2c0)',
            borderRadius: 6,
            color: 'var(--theme-error-500, #a52822)',
          }}
        >
          <strong>⚠ Error:</strong> {error}
        </div>
      )}
    </div>
  )
}

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

const ReportCard = ({ report }: { report: Report }) => {
  const nonzero = (r: Record<string, number>) => Object.entries(r).filter(([, n]) => n > 0) as [string, number][]
  const created = nonzero(report.created)
  const updated = nonzero(report.updated)

  return (
    <section style={{ marginTop: 4, padding: 20, border: '1px solid var(--theme-border-color, #e6e6e6)', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>{report.dryRun ? '🔍 Dry-run result' : '✅ Import applied'}</h2>
      {created.length > 0 && <Badges label={report.dryRun ? 'Would create' : 'Created'} items={created} color="#1a7f37" />}
      {updated.length > 0 && <Badges label={report.dryRun ? 'Would update' : 'Updated'} items={updated} color="#0969da" />}
      {report.errors.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          <strong style={{ color: 'var(--theme-error-500, #a52822)' }}>
            ⚠ {report.errors.length} error(s):
          </strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {report.errors.map((e, i) => (
              <li key={i} style={{ color: 'var(--theme-error-500, #a52822)', fontSize: 13 }}>
                [{e.collection}] <code>{e.key}</code>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ color: '#1a7f37', margin: '8px 0 0' }}>No errors. ✓</p>
      )}
    </section>
  )
}

const Badges = ({
  label,
  items,
  color,
}: {
  label: string
  items: [string, number][]
  color: string
}) => (
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
