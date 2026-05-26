import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendSequenceEmail } from '@/lib/email'
import type { FunnelAIReport } from '@/types/funnel'

// Each entry: { fromStep, toStep, minDaysAfterCreation }
// Leads at fromStep whose created_at is >= minDays old get the next email
const SEQUENCE_STEPS: Array<{
  fromStep: number
  toStep: number
  emailStep: 1 | 2 | 3 | 4
  minDays: number
}> = [
  { fromStep: 1, toStep: 2, emailStep: 1, minDays: 1 },
  { fromStep: 2, toStep: 3, emailStep: 2, minDays: 3 },
  { fromStep: 3, toStep: 4, emailStep: 3, minDays: 7 },
  { fromStep: 4, toStep: 5, emailStep: 4, minDays: 14 },
]

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createServiceClient()
  const now = new Date()
  const results: Record<string, number> = {}

  for (const { fromStep, toStep, emailStep, minDays } of SEQUENCE_STEPS) {
    const cutoff = new Date(now.getTime() - minDays * 24 * 60 * 60 * 1000)

    const { data: leads, error } = await supabase
      .from('funnel_leads')
      .select('id, first_name, email, ai_report')
      .eq('sequence_step', fromStep)
      .not('email', 'is', null)
      .lte('created_at', cutoff.toISOString())
      .limit(50)

    if (error) {
      console.error(`Cron step ${emailStep} query error:`, error.message)
      results[`step${emailStep}_error`] = 1
      continue
    }

    let sent = 0
    for (const lead of leads ?? []) {
      try {
        await sendSequenceEmail({
          step: emailStep,
          firstName: lead.first_name,
          email: lead.email as string,
          report: lead.ai_report as FunnelAIReport,
        })
        await supabase
          .from('funnel_leads')
          .update({ sequence_step: toStep, last_emailed_at: now.toISOString() })
          .eq('id', lead.id)
        sent++
      } catch (err) {
        console.error(`Failed step ${emailStep} for lead ${lead.id}:`, err)
      }
    }
    results[`step${emailStep}_sent`] = sent
  }

  return NextResponse.json({ ok: true, timestamp: now.toISOString(), results })
}
