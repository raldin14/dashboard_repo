import Sidebar from '@/components/Sidebar'

export const metadata = { title: 'API Evolution Engine' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0, display: 'flex', fontFamily: 'system-ui, sans-serif',
        background: 'var(--color-background-tertiary, #f5f5f5)'
      }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: 'calc(100vw - 220px)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}