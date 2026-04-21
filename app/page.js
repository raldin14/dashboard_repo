'use client';
import { useEffect, useState } from 'react';
import Badge from '@/components/Badge';

export default function Home() {
  const [data, setData] = useState({
    audits: [],
    metrics: { total: 0, breaking: 0, filesFixed: 0, health: 100 },
  });
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [activeLivePR, setActiveLivePR] = useState(null);
  const [liveLog, setLiveLog] = useState([]);

  useEffect(() => {
    // Initial load
    fetch('/api/audits')
      .then((r) => r.json())
      .then(setData);

    // Global Server-Sent Events connection for 0-polling Real-Time updates
    const sse = new EventSource('/api/stream');
    sse.onmessage = (e) => {
      const payload = JSON.parse(e.data);
      if (payload.type === 'state') {
        setData({ audits: payload.audits, metrics: payload.metrics });
        
        // Also keep the live modal in sync if it's open
        setLiveLog((currentLiveLog) => {
           // We use a functional state update here to avoid putting activeLivePR in dependency array 
           // and reconnecting the SSE socket every time we click a PR
           return currentLiveLog;
        });
      }
    };
    return () => sse.close();
  }, []);

  // Sync live log whenever data changes or modal opens
  useEffect(() => {
    if (activeLivePR) {
      const audit = data.audits.find(a => a.prNumber === activeLivePR);
      if (audit) setLiveLog(audit.log || []);
    }
  }, [data.audits, activeLivePR]);

  const { audits, metrics } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Dashboard</h1>
        <span
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary, #666)',
            background: '#EAF3DE',
            color: '#3B6D11',
            padding: '3px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Webhook active
        </span>
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        {[
          { label: 'PRs audited', value: metrics.total },
          {
            label: 'Breaking drifts',
            value: metrics.breaking,
            color: metrics.breaking > 0 ? '#E24B4A' : undefined,
          },
          { label: 'Files impacted', value: metrics.filesFixed },
          {
            label: 'Health score',
            value: `${metrics.health}%`,
            color: metrics.health > 80 ? '#639922' : '#E24B4A',
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: 'var(--color-background-secondary, #f0f0f0)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary, #666)',
                marginBottom: 4,
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: m.color || 'inherit',
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two column panels */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
      >
        {/* Recent PRs */}
        <div
          style={{
            background: 'white',
            border: '0.5px solid #e0e0e0',
            borderRadius: 12,
            padding: '1rem 1.25rem',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#666',
              marginBottom: '0.75rem',
            }}
          >
            Recent pull requests
          </div>
          {audits.length === 0 && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>
              No audits yet — waiting for webhooks
            </div>
          )}
          {audits.slice(0, 6).map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0',
                borderBottom: '0.5px solid #f0f0f0',
                fontSize: 13,
              }}
            >
              <a
                href={
                  a.prUrl || `https://github.com/${a.repo}/pull/${a.prNumber}`
                }
                target='_blank'
                rel='noreferrer'
                style={{
                  color: '#534AB7',
                  fontWeight: 500,
                  minWidth: 36,
                  textDecoration: 'underline',
                }}
              >
                #{a.prNumber}
              </a>
              <div style={{ flex: 1 }}>
                <div>{a.prTitle}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#999',
                    fontFamily: 'monospace',
                  }}
                >
                  {a.branch}
                </div>
              </div>
              {a.status === 'pending' && (
                <button
                  onClick={() => {
                    setActiveLivePR(a.prNumber);
                    setLiveLog(a.log || []);
                    setShowLiveModal(true);
                  }}
                  style={{
                    background: '#534AB7', color: 'white', padding: '4px 10px',
                    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f', animation: 'pulse-opacity 1.5s infinite' }} />
                  Watch Live
                </button>
              )}
              <Badge status={a.status} />
            </div>
          ))}
        </div>

        {/* Latest drift report */}
        <div
          style={{
            background: 'white',
            border: '0.5px solid #e0e0e0',
            borderRadius: 12,
            padding: '1rem 1.25rem',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#666',
              marginBottom: '0.75rem',
            }}
          >
            Latest drift report {audits[0] ? `— PR #${audits[0].prNumber}` : ''}
          </div>
          {(!audits[0] || !audits[0]?.driftReport?.length) && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>
              No drift data yet
            </div>
          )}
          {(audits[0]?.driftReport || []).map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                padding: '7px 0',
                borderBottom: '0.5px solid #f0f0f0',
                fontSize: 13,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  marginTop: 5,
                  flexShrink: 0,
                  background:
                    item.severity === 'BREAKING'
                      ? '#E24B4A'
                      : item.severity === 'WARNING'
                        ? '#EF9F27'
                        : '#639922',
                }}
              />
              <div>
                <div style={{ fontWeight: 500 }}>{item.field}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Blast radius */}
        <div
          style={{
            background: 'white',
            border: '0.5px solid #e0e0e0',
            borderRadius: 12,
            padding: '1rem 1.25rem',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#666',
              marginBottom: '0.75rem',
            }}
          >
            Blast radius {audits[0] ? `— PR #${audits[0].prNumber}` : ''}
          </div>
          {(!audits[0] || !audits[0]?.blastRadius?.length) && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>
              No impacted files yet
            </div>
          )}
          {(audits[0]?.blastRadius || []).map((file, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: '0.5px solid #f0f0f0',
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#555',
              }}
            >
              {file.path}
              <Badge status={file.impact} />
            </div>
          ))}
        </div>

        {/* Webhook log */}
        <div
          style={{
            background: 'white',
            border: '0.5px solid #e0e0e0',
            borderRadius: 12,
            padding: '1rem 1.25rem',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#666',
              marginBottom: '0.75rem',
            }}
          >
            Agent Final Output
          </div>
          {(!audits[0] || (!audits[0].finalReport && audits[0].status !== 'pending')) && (
            <div style={{ fontSize: 13, color: '#999', padding: '1rem 0' }}>
              No output yet
            </div>
          )}
          {audits[0]?.status === 'pending' && !audits[0]?.finalReport && (
            <div style={{ fontSize: 13, color: '#534AB7', padding: '1rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
               <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f', animation: 'pulse-opacity 1.5s infinite' }} />
               Audit in progress (click Watch Live)...
            </div>
          )}
          {audits[0]?.finalReport && (
            <div style={{ 
               fontSize: 13, color: '#333', whiteSpace: 'pre-wrap', 
               fontFamily: 'monospace', background: '#f9f9f9', padding: '1rem', 
               borderRadius: 8, border: '1px solid #eee', maxHeight: '400px', overflowY: 'auto'
            }}>
              {audits[0].finalReport}
            </div>
          )}
        </div>
      </div>

      {/* Live Stream Modal */}
      {showLiveModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'white', width: '600px', height: '80vh', borderRadius: 12,
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f', animation: 'pulse-opacity 1.5s infinite' }} />
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Agent Execution Stream (PR #{activeLivePR})</h2>
              </div>
              <button onClick={() => setShowLiveModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#fafafa' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 10 }}>
                {liveLog.map((line, i, arr) => {
                  const isLast = i === arr.length - 1;
                  const isError = line.includes('!') || line.includes('❌') || line.includes('🚨');
                  const isSuccess = line.includes('✓') || line.includes('✅');
                  const color = isError ? '#E24B4A' : isSuccess ? '#639922' : '#444';
                  const dotColor = isError ? '#E24B4A' : isSuccess ? '#639922' : (isLast ? '#534AB7' : '#aaa');
                  
                  return (
                    <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: isLast ? 0 : 20 }}>
                      {!isLast && (
                        <div style={{ position: 'absolute', left: 4, top: 20, bottom: -4, width: 2, background: '#e0e0e0' }} />
                      )}
                      {isLast && (
                        <div className="animated-line" style={{ position: 'absolute', left: 4, top: 20, width: 2, background: 'linear-gradient(to bottom, #534AB7, transparent)' }} />
                      )}
                      <div 
                        className={isLast ? 'pulsing-dot' : ''}
                        style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, marginTop: 5, zIndex: 1, position: 'relative', flexShrink: 0 }} 
                      />
                      <div style={{ fontSize: 13, color: color, fontFamily: 'monospace', lineHeight: 1.4 }}>
                        {line}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse-opacity { from { opacity: 0.4; } to { opacity: 1; transform: scale(1.1); } }
        @keyframes pulse-line { 0% { opacity: 0.3; height: 10px; } 50% { opacity: 1; height: 30px; } 100% { opacity: 0.3; height: 10px; } }
        .animated-line { animation: pulse-line 1.5s infinite ease-in-out; }
        @keyframes pulse-dot { 0% { box-shadow: 0 0 0 0 rgba(83, 74, 183, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(83, 74, 183, 0); } 100% { box-shadow: 0 0 0 0 rgba(83, 74, 183, 0); } }
        .pulsing-dot { animation: pulse-dot 2s infinite; }
      `}</style>
    </div>
  );
}
