import { EventEmitter } from 'events'

export const eventBus = new EventEmitter()
let audits = []

export function saveAudit(audit) {
  const existing = audits.find(a => a.prNumber === audit.prNumber)
  if (existing) {
    if (audit.clearLog) {
      existing.log = []
      existing.finalReport = null
    } else if (audit.log && existing.log) {
      audit.log = [...existing.log, ...audit.log]
    }
    Object.keys(audit).forEach(k => audit[k] === undefined && delete audit[k])
    Object.assign(existing, audit)
    eventBus.emit('update', { type: 'state', audits, metrics: getMetrics() })
  } else {
    audits.unshift(audit)
    eventBus.emit('update', { type: 'state', audits, metrics: getMetrics() })
  }
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