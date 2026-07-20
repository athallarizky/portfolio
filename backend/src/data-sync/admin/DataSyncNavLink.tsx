'use client'

// Sidebar entry to /admin/data-sync, registered via admin.components.afterNav.
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const DataSyncNavLink = () => {
  const pathname = usePathname()
  const active = !!pathname?.endsWith('/admin/data-sync')

  return (
    <div
      style={{
        borderTop: '1px solid var(--theme-border-color, #e6e6e6)',
        marginTop: 8,
        paddingTop: 8,
        paddingInline: 8,
      }}
    >
      <Link
        href="/admin/data-sync"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 6,
          textDecoration: 'none',
          color: active ? 'var(--theme-elevation-800, #1a1a1a)' : 'var(--theme-elevation-600, #555)',
          background: active ? 'var(--theme-elevation-150, #efefef)' : 'transparent',
          fontWeight: active ? 600 : 400,
          fontSize: 14,
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>↻</span>
        Data Sync &amp; Backup
      </Link>
    </div>
  )
}

export default DataSyncNavLink
