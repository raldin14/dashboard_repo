'use client'
import { useEffect, useState } from 'react'
import Badge from '@/components/Badge'

export default function Pulls() {
  const [audits, setAudits] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/api/audits').then(r => r.json()).then(d => {
      setAudits(d.audits)
      if (d.audits.length > 0) setSelected(d.audits[0])
    })
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '1rem' }}>Pull Requests</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem' }}>

        {/* PR list */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
          {audits.length === 0 && (
            <div style={{ padding: '1rem', fontSize: 13, color: '#999' }}>No PRs audited yet</div>
          )}
          {audits.map(a => (
            <div key={a.id} onClick={() => setSelected(a)} style={{
              padding: '10px 1rem', cursor: 'pointer', fontSize: 13,
              borderBottom: '0.5px solid #f0f0f0',
              background: selected?.id === a.id ? '#f5f3ff' : 'white',
              borderLeft: selected?.id === a.id ? '2px solid #534AB7' : '2px solid transparent'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ color: '#534AB7', fontWeight: 500 }}>#{a.prNumber}</span>
                <Badge status={a.status} />
              </div>
              <div style={{ fontWeight: 500 }}>{a.prTitle}</div>
              <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace', marginTop: 2 }}>{a.branch}</div>
            </div>
          ))}
        </div>

        {/* PR detail */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{selected.prTitle}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {selected.repo} · {selected.branch} · {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge status={selected.status} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#666', marginBottom: '0.75rem' }}>Drift report</div>
                {selected.driftReport.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '0.5px solid #f0f0f0', fontSize: 13 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                                  background: item.severity === 'BREAKING' ? '#E24B4A' : item.severity === 'WARNING' ? '#EF9F27' : '#639922' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.field}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#666', marginBottom: '0.75rem' }}>Blast radius</div>
                {selected.blastRadius.map((file, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0',
                                        borderBottom: '0.5px solid #f0f0f0', fontSize: 12, fontFamily: 'monospace', color: '#555' }}>
                    {file.path}
                    <Badge status={file.impact} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}