'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { href: '/',        label: 'Dashboard'     },
  { href: '/pulls',   label: 'Pull Requests' },
  { href: '/drift',   label: 'Drift Reports' },
  { href: '/blast',   label: 'Blast Radius'  },
  { href: '/log',     label: 'Webhook Log'   },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <div style={{
      background: 'var(--color-background-primary)',
      borderRight: '0.5px solid var(--color-border-tertiary)',
      minHeight: '100vh', width: 220
    }}>
      <div style={{ padding: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)', marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>API Evolution</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Audit Engine</div>
      </div>
      {links.map(l => (
        <Link key={l.href} href={l.href} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 1rem', fontSize: 14, textDecoration: 'none',
          color: path === l.href ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          background: path === l.href ? 'var(--color-background-secondary)' : 'transparent',
          borderLeft: path === l.href ? '2px solid #534AB7' : '2px solid transparent',
          fontWeight: path === l.href ? 500 : 400
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
          {l.label}
        </Link>
      ))}
    </div>
  )
}