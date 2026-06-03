import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateAdvisorPlaybook } from '@/lib/advisor-playbook-ai'
import type { FunnelAIReport, FunnelAnswers } from '@/types/funnel'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: lead, error: fetchError } = await supabase
    .from('funnel_leads')
    .select('first_name, mobile, email, answers, ai_report')
    .eq('id', id)
    .single()

  if (fetchError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  let playbook
  try {
    playbook = await generateAdvisorPlaybook({
      firstName: lead.first_name as string,
      mobile: lead.mobile as string,
      email: (lead.email as string | null) ?? null,
      answers: (lead.answers as FunnelAnswers) ?? { segment: undefined },
      report: (lead.ai_report as FunnelAIReport | null) ?? null,
    })
  } catch (err) {
    console.error('Playbook generation failed:', err)
    return NextResponse.json(
      { error: 'Playbook generation failed. Please try again.' },
      { status: 500 }
    )
  }

  const { error: updateError } = await supabase
    .from('funnel_leads')
    .update({ advisor_playbook: playbook })
    .eq('id', id)

  if (updateError) {
    console.error('Failed to persist playbook (non-fatal):', updateError.message)
  }

  return NextResponse.json({ playbook })
}
