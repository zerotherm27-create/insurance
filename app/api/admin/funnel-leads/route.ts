import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('funnel_leads')
    .select(
      'id, created_at, first_name, mobile, email, segment, answers, protection_score, ai_report, advisor_playbook, status, sequence_step, last_emailed_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term, email_events(event_type)'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data })
}
