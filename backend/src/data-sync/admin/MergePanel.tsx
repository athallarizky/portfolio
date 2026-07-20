'use client'

// Merge panel — part of the Data Sync admin view (sprint-15).
// Pick a collection, then a winner + loser by uuid; preview (dry-run) which relations get repointed
// and which loser is deleted; Apply runs the real merge on the same selection.

import { useEffect, useState } from 'react'
import { Button } from '@payloadcms/ui'

type Record = { id: number | string; uuid: string; label: string }
type MergeReport = {
  collection: string
  winner: { uuid: string; label: string } | null
  loser: { uuid: string; label: string } | null
  repointed: { fromCollection: string; field: string; count: number }[]
  loserOutgoing: string[]
  deletedLoser: boolean
  dryRun: boolean
  backupPath?: string
}

const COLLECTIONS = [
  { slug: 'articles', label: 'Articles', titleField: 'title' },
  { slug: 'projects', label: 'Projects', titleField: 'title' },
  { slug: 'authors', label: 'Authors', titleField: 'name' },
  { slug: 'tags', label: 'Tags', titleField: 'name' },
  { slug: 'technologies', label: 'Technologies', titleField: 'name' },
  { slug: 'document-categories', label: 'Document categories', titleField: 'label' },
  { slug: 'documents', label: 'Documents', titleField: 'title' },
  { slug: 'social-profiles', label: 'Social profiles', titleField: 'platform' },
] as const

export const MergePanel = () => {
  const [slug, setSlug] = useState<string>(COLLECTIONS[0].slug)
  const [titleField, setTitleField] = useState<string>(COLLECTIONS[0].titleField)
  const [records, setRecords] = useState<Record[]>([])
  const [winnerUuid, setWinnerUuid] = useState('')
  const [loserUuid, setLoserUuid] = useState('')
  const [report, setReport] = useState<MergeReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch the collection's records whenever the selection changes.
  useEffect(() => {
    setError(null)
    setReport(null)
    setWinnerUuid('')
    setLoserUuid('')
    const meta = COLLECTIONS.find((c) => c.slug === slug)!
    setTitleField(meta.titleField)
    fetch(`/api/${slug}?depth=0&limit=0`)
      .then((r) => r.json())
      .then((data: { docs: any[] }) => {
        const recs = (data.docs ?? [])
          .filter((d) => d.uuid)
          .map((d) => ({ id: d.id, uuid: d.uuid, label: String(d[meta.titleField] ?? d.id) }))
        setRecords(recs)
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [slug])

  const doMerge = async (isDryRun: boolean) => {
    if (!winnerUuid || !loserUuid) return
    setBusy(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch('/api/data-merge', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ collection: slug, winnerUuid, loserUuid, dryRun: isDryRun }),
      })
      const json = (await res.json()) as MergeReport & { error?: string }
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setReport(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const canApply =
    !!report && report.dryRun && report.winner?.uuid === winnerUuid && report.loser?.uuid === loserUuid

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 20,
        border: '1px solid var(--theme-border-color, #e6e6e6)',
        borderRadius: 8,
        background: 'var(--theme-elevation-50, #fafafa)',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 4 }}>Merge duplicates</h2>
      <p style={{ color: 'var(--theme-elevation-500, #888)', fontSize: 13, marginTop: 0, marginBottom: 16 }}>
        Combine two records in the same collection. Every relationship pointing at the <em>loser</em> is
        repointed to the <em>winner</em>, then the loser is deleted (payload.db is backed up first).
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr 1fr', maxWidth: 640 }}>
        <label style={{ fontSize: 13 }}>
          Collection
          <select value={slug} onChange={(e) => setSlug(e.target.value)} style={selectStyle}>
            {COLLECTIONS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Winner (keep)
          <select value={winnerUuid} onChange={(e) => setWinnerUuid(e.target.value)} style={selectStyle}>
            <option value="">— select —</option>
            {records
              .filter((r) => r.uuid !== loserUuid)
              .map((r) => (
                <option key={r.uuid} value={r.uuid}>
                  {r.label} ({r.uuid.slice(0, 8)})
                </option>
              ))}
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Loser (delete)
          <select value={loserUuid} onChange={(e) => setLoserUuid(e.target.value)} style={selectStyle}>
            <option value="">— select —</option>
            {records
              .filter((r) => r.uuid !== winnerUuid)
              .map((r) => (
                <option key={r.uuid} value={r.uuid}>
                  {r.label} ({r.uuid.slice(0, 8)})
                </option>
              ))}
          </select>
        </label>
      </div>

      {records.length === 0 && (
        <p style={{ color: 'var(--theme-elevation-500, #888)', fontSize: 13, margin: '12px 0 0' }}>
          No records with a uuid yet — run <code>npm run backfill:uuid</code> first.
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Button
          buttonStyle="secondary"
          onClick={() => doMerge(true)}
          disabled={busy || !winnerUuid || !loserUuid}
        >
          {busy ? 'Working…' : '🔍 Preview (dry-run)'}
        </Button>
        {canApply && (
          <Button buttonStyle="primary" onClick={() => doMerge(false)} disabled={busy}>
            {busy ? 'Applying…' : '✓ Apply merge'}
          </Button>
        )}
      </div>

      {report && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: report.dryRun ? 'var(--theme-elevation-50, #f4f4f4)' : 'var(--theme-success-100, #eaf5ee)',
            border: '1px solid var(--theme-border-color, #e6e6e6)',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          <strong>{report.dryRun ? '🔍 Dry-run result' : '✅ Merge applied'}</strong>
          {report.backupPath && <div style={{ color: 'var(--theme-elevation-500,#888)' }}>backup: {report.backupPath}</div>}
          {report.repointed.length > 0 ? (
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              {report.repointed.map((r) => (
                <li key={`${r.fromCollection}.${r.field}`}>
                  <code>{r.fromCollection}.{r.field}</code>: {r.count} repointed →{' '}
                  <strong>{report.winner?.label}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: '8px 0 0' }}>No incoming relations to repoint.</p>
          )}
          {!report.dryRun && <p style={{ margin: '8px 0 0' }}>Loser <code>{report.loser?.label}</code> deleted. ✓</p>}
          {report.loserOutgoing.length > 0 && (
            <div style={{ color: 'var(--theme-elevation-500,#888)', marginTop: 8 }}>
              Loser's own relations (discarded): {report.loserOutgoing.join(', ')}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 16, background: '#fdecea', border: '1px solid #f5c2c0', borderRadius: 6, color: '#a52822', fontSize: 13 }}>
          <strong>⚠ Error:</strong> {error}
        </div>
      )}
    </section>
  )
}

const selectStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 4,
  padding: '6px 8px',
  borderRadius: 4,
  border: '1px solid var(--theme-border-color, #d4d4d4)',
  background: 'var(--theme-elevation-0, #fff)',
  fontSize: 13,
}
