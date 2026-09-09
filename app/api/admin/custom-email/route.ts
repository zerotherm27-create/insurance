import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'
import { countMatchingLeads, sendCustomEmailBlast, type CustomEmailCriteria, type CustomEmailContent } from '@/lib/custom-email-blast'

// One-off custom email blast to leads matching a set of criteria — e.g.
// everyone tagged with a specific event. Separate from the automated
// flow/nurture drip cron; sent on demand from the admin dashboard.
//
// dryRun: true returns just the matching-lead count, for the UI's live
// "N leads match" feedback while the admin adjusts filters.
export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { dryRun?: boolean; criteria?: CustomEmailCriteria; content?: CustomEmailContent }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const criteria = body.criteria ?? {}

  if (body.dryRun) {
    try {
      const matched = await countMatchingLeads(criteria)
      return NextResponse.json({ matched })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Count failed' }, { status: 500 })
    }
  }

  const content = body.content
  if (!content || !content.subject || !content.heading || !content.ctaText) {
    return NextResponse.json({ error: 'Missing email content' }, { status: 400 })
  }

  try {
    const result = await sendCustomEmailBlast(criteria, content)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 500 })
  }
}
