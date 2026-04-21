'use client'
import { useEffect, useState } from 'react'
import Badge from '@/components/Badge'

export default function Home() {
  const [data, setData] = useState({ audits: [], metrics: { total: 0, breaking: 0, filesFixed: 0, health: 100 } })

  useEffect(() => {
    const load = () => fetch('/api/audits').then(r => r.json()).then(setData)
    load()
    const interval = setInterval(load, 5000) 
    return () => clearInterval(interval)
  }, [])

  const { audits, metrics } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Dashboard</h1>
        <span style={{
          fontSize: 13, color: 'var(--color-text-secondary, #666)',
          background: '#EAF3DE', color: '#3B6D11', padding: '3px 12px',
          borderRadius: 20, fontSize: 12, fontWeight: 500
        }}>
          Webhook active
        </span>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'PRs audited', value: metrics.total },
          { label: 'Breaking drifts', value: metrics.breaking, color: metrics.breaking > 0 ? '#E24B4A' : undefined },
          { label: 'Files impacted', value: metrics.filesFixed },
          { label: 'Health score', value: `${metrics.health}%`, color: metrics.health > 80 ? '#639922' : '#E24B4A' }
        ].map(m => (
          <div key={m.label} style={{
            background: 'var(--color-background-secondary, #f0f0f0)',
            borderRadius: 8, padding: '0.75rem 1rem'
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #666)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: m.color || 'inherit' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Two column panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Recent PRs */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#666', marginBottom: '0.75rem' }}>Recent pull requests</div>
          {audits.length === 0 && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>No audits yet — waiting for webhooks</div>
          )}
          {audits.slice(0, 6).map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
              borderBottom: '0.5px solid #f0f0f0', fontSize: 13
            }}>
              <span style={{ color: '#534AB7', fontWeight: 500, minWidth: 36 }}>#{a.prNumber}</span>
              <div style={{ flex: 1 }}>
                <div>{a.prTitle}</div>
                <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{a.branch}</div>
              </div>
              <Badge status={a.status} />
            </div>
          ))}
        </div>

        {/* Latest drift report */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#666', marginBottom: '0.75rem' }}>
            Latest drift report {audits[0] ? `— PR #${audits[0].prNumber}` : ''}
          </div>
          {(!audits[0] || audits[0].driftReport.length === 0) && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>No drift data yet</div>
          )}
          {(audits[0]?.driftReport || []).map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '7px 0',
              borderBottom: '0.5px solid #f0f0f0', fontSize: 13
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                background: item.severity === 'BREAKING' ? '#E24B4A' : item.severity === 'WARNING' ? '#EF9F27' : '#639922'
              }} />
              <div>
                <div style={{ fontWeight: 500 }}>{item.field}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Blast radius */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#666', marginBottom: '0.75rem' }}>
            Blast radius {audits[0] ? `— PR #${audits[0].prNumber}` : ''}
          </div>
          {(!audits[0] || audits[0].blastRadius.length === 0) && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>No impacted files yet</div>
          )}
          {(audits[0]?.blastRadius || []).map((file, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: '0.5px solid #f0f0f0',
              fontSize: 12, fontFamily: 'monospace', color: '#555'
            }}>
              {file.path}
              <Badge status={file.impact} />
            </div>
          ))}
        </div>

        {/* Webhook log */}
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#666', marginBottom: '0.75rem' }}>Webhook activity</div>
          {(!audits[0] || audits[0].log.length === 0) && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>No activity yet</div>
          )}
          {(audits[0]?.log || []).map((line, i) => (
            <div key={i} style={{
              fontSize: 12, fontFamily: 'monospace', padding: '4px 0',
              borderBottom: '0.5px solid #f0f0f0',
              color: line.includes('!') ? '#E24B4A' : line.includes('✓') ? '#639922' : '#888'
            }}>
              {line}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}