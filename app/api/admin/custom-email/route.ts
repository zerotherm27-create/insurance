import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { sendCustomEmail } from '@/lib/email'
import type { FunnelAIReport } from '@/types/funnel'

interface Criteria {
  sources?: string[]
  eventTags?: string[]
  segments?: string[]
  statuses?: string[]
}

interface Content {
  subject: string
  heading: string
  paragraphs: string[]
  ctaText: string
}

// One-off custom email blast to leads matching a set of criteria — e.g.
// everyone tagged with a specific event. Separate from the automated
// flow/nurture drip cron; sent on demand from the admin dashboard.
//
// dryRun: true returns just the matching-lead count, for the UI's live
// "N leads match" feedback while the admin adjusts filters.
export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { dryRun?: boolean; criteria?: Criteria; content?: Content }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { sources = [], eventTags = [], segments = [], statuses = [] } = body.criteria ?? {}

  const supabase = createServiceClient()
  let query = supabase
    .from('funnel_leads')
    .select('id, first_name, email, protection_score, ai_report', { count: 'exact' })
    .not('email', 'is', null)

  if (sources.length > 0) query = query.in('source', sources)
  if (eventTags.length > 0) query = query.in('event_tag', eventTags)
  if (segments.length > 0) query = query.in('segment', segments)
  if (statuses.length > 0) query = query.in('status', statuses)
  // Deliberately NOT excluding TERMINAL_STATUSES here (unlike the daily
  // nurture cron) — a one-off blast should be able to reach closed_won /
  // closed_lost leads too if they're criteria-matched.

  const { data: leads, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.dryRun) {
    return NextResponse.json({ matched: count ?? leads?.length ?? 0 })
  }

  const content = body.content
  if (!content || !content.subject || !content.heading || !content.ctaText) {
    return NextResponse.json({ error: 'Missing email content' }, { status: 400 })
  }

  let sent = 0
  let failed = 0
  const now = new Date().toISOString()

  for (const lead of leads ?? []) {
    try {
      await sendCustomEmail({
        leadId: lead.id,
        firstName: lead.first_name,
        email: lead.email as string,
        protectionScore: lead.protection_score ?? 0,
        aiReport: lead.ai_report as FunnelAIReport | null,
        subject: content.subject,
        heading: content.heading,
        paragraphs: content.paragraphs,
        ctaText: content.ctaText,
      })
      await supabase.from('funnel_leads').update({ last_emailed_at: now }).eq('id', lead.id)
      sent++
    } catch (err) {
      console.error(`Custom email send error for lead ${lead.id}:`, err)
      failed++
    }
  }

  return NextResponse.json({ sent, failed, totalMatched: leads?.length ?? 0 })
}
