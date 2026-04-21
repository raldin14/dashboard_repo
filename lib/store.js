let audits = []

export function saveAudit(audit) {
  audits.unshift(audit)
  if (audits.length > 100) audits = audits.slice(0, 100)
}

export function getAudits() {
  return audits
}

export function getAuditByPR(prNumber) {
  return audits.find(a => a.prNumber === prNumber) || null
}

export function getMetrics() {
  const total = audits.length
  const breaking = audits.filter(a => a.status === 'breaking').length
  const clean = audits.filter(a => a.status === 'clean').length
  const filesFixed = audits.reduce((sum, a) => sum + (a.blastRadius?.length || 0), 0)
  const health = total === 0 ? 100 : Math.round((clean / total) * 100)
  return { total, breaking, filesFixed, health }
}