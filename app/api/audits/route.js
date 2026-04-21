import { NextResponse } from 'next/server';
import { saveAudit, getAudits, getMetrics } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    audits: getAudits(),
    metrics: getMetrics(),
  });
}

export async function POST(request) {
  const body = await request.json();

  const audit = {
    id: Date.now(),
    runId: body.runId,
    prNumber: body.prNumber,
    prTitle: body.prTitle,
    branch: body.branch,
    repo: body.repo,
    status: body.status,
    driftReport: body.driftReport,
    blastRadius: body.blastRadius,
    log: body.log,
    clearLog: body.clearLog,
    finalReport: body.finalReport,
    createdAt: new Date().toISOString(),
  };

  Object.keys(audit).forEach(
    (key) => audit[key] === undefined && delete audit[key],
  );

  saveAudit(audit);
  return NextResponse.json({ ok: true, id: audit.id });
}
