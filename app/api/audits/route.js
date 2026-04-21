import { NextResponse } from 'next/server'
import { saveAudit, getAudits, getMetrics } from '@/lib/store'

export async function GET() {
  return NextResponse.json({
    audits: getAudits(),
    metrics: getMetrics()
  })
}

export async function POST(request) {
  const body = await request.json()

  const audit = {
    id: Date.now(),
    prNumber:    body.prNumber,
    prTitle:     body.prTitle    || `PR #${body.prNumber}`,
    branch:      body.branch     || 'unknown',
    repo:        body.repo       || 'unknown',
    status:      body.status     || 'clean',    
    driftReport: body.driftReport || [],         
    blastRadius: body.blastRadius || [],         
    log:         body.log        || [],          
    createdAt:   new Date().toISOString()
  }

  saveAudit(audit)
  return NextResponse.json({ ok: true, id: audit.id })
}