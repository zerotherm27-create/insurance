import { createServiceClient } from '@/lib/supabase'
import { sendCustomEmail } from '@/lib/email'
import type { FunnelAIReport } from '@/types/funnel'

export interface CustomEmailCriteria {
  sources?: string[]
  eventTags?: string[]
  segments?: string[]
  statuses?: string[]
}

export interface CustomEmailContent {
  subject: string
  heading: string
  paragraphs: string[]
  ctaText: string
}

function matchQuery(criteria: CustomEmailCriteria) {
  const { sources = [], eventTags = [], segments = [], statuses = [] } = criteria
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

  return query
}

export async function countMatchingLeads(criteria: CustomEmailCriteria): Promise<number> {
  const { count, data, error } = await matchQuery(criteria)
  if (error) throw new Error(error.message)
  return count ?? data?.length ?? 0
}

// Shared by the immediate "Send Custom Email" route and the scheduled-send
// cron — recipients are matched fresh at call time either way.
export async function sendCustomEmailBlast(
  criteria: CustomEmailCriteria,
  content: CustomEmailContent
): Promise<{ sent: number; failed: number; totalMatched: number }> {
  const { data: leads, error } = await matchQuery(criteria)
  if (error) throw new Error(error.message)

  const supabase = createServiceClient()
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

  return { sent, failed, totalMatched: leads?.length ?? 0 }
}
