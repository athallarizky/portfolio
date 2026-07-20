// User-facing zip filename stamp: local-time YYYY-MM-DD-HH-MM (sortable in a listing
// AND human-readable). Used by the export/snapshot/wrap CLIs + the admin download
// Content-Disposition. Internal .bak files keep ISO (machine) — see backupDb()/restoreSnapshot().

export function formatStamp(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}-${p(d.getMinutes())}`
}
