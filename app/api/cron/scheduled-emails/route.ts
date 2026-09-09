import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendCustomEmailBlast, type CustomEmailCriteria, type CustomEmailContent } from '@/lib/custom-email-blast'

// Runs frequently (see vercel.json) to fire scheduled custom email blasts
// close to their requested time. Requires Vercel Pro — the Hobby plan
// silently limits crons to once/day, which would defeat time-of-day
// scheduling.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const { data: due, error } = await supabase
    .from('scheduled_emails')
    .select('id, criteria, content')
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results: Record<string, unknown>[] = []

  for (const row of due ?? []) {
    try {
      const result = await sendCustomEmailBlast(
        row.criteria as CustomEmailCriteria,
        row.content as CustomEmailContent
      )
      await supabase
        .from('scheduled_emails')
        .update({ status: 'sent', result, sent_at: new Date().toISOString() })
        .eq('id', row.id)
      results.push({ id: row.id, ...result })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Send failed'
      await supabase
        .from('scheduled_emails')
        .update({ status: 'failed', result: { error: message }, sent_at: new Date().toISOString() })
        .eq('id', row.id)
      results.push({ id: row.id, error: message })
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}
