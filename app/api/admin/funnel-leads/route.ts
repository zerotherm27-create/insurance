import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

const LEAD_COLUMNS =
  'id, created_at, first_name, mobile, email, segment, answers, protection_score, ai_report, advisor_playbook, status, sequence_step, last_emailed_at, source, event_tag, utm_source, utm_medium, utm_campaign, utm_content, utm_term, email_events(event_type)'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('funnel_leads')
    .select(LEAD_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data })
}

// Manually add a lead from the admin dashboard — someone met in person, a
// phone inquiry, a referral — without going through the quiz or either
// jojocruzado intake path. Tagged source: 'manual' so it stays distinguishable.
export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const firstName = typeof body.first_name === 'string' ? body.first_name.trim() : ''
  const mobile = typeof body.mobile === 'string' ? body.mobile.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const segment = typeof body.segment === 'string' ? body.segment.trim() : ''
  const eventTag = typeof body.event_tag === 'string' ? body.event_tag.trim() : ''

  if (!firstName || !mobile) {
    return NextResponse.json({ error: 'First name and mobile are required.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('funnel_leads')
    .insert({
      first_name: firstName,
      mobile,
      email: email || null,
      segment: segment || null,
      status: 'new',
      source: 'manual',
      event_tag: eventTag || null,
    })
    .select(LEAD_COLUMNS)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ lead: data }, { status: 201 })
}
