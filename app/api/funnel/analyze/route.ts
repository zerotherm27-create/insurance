import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateFunnelReport } from '@/lib/funnel-ai'
import { validateAnswers } from '@/lib/funnel-questions'
import type { FunnelAnswers, FunnelAIReport } from '@/types/funnel'

export async function POST(req: NextRequest) {
  let body: { firstName: string; mobile: string; email?: string; answers: FunnelAnswers }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { firstName, mobile, email, answers } = body

  if (!firstName || !mobile || !email || !answers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Validate answers against the segment's question set (prevents prompt injection)
  const invalidField = validateAnswers(answers.segment, answers)
  if (invalidField) {
    return NextResponse.json({ error: `Invalid or missing answer for ${invalidField}` }, { status: 400 })
  }

  // Dedup: same email submitted in last 24h returns the existing report without a new send
  if (email) {
    try {
      const supabase = createServiceClient()
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: existing } = await supabase
        .from('funnel_leads')
        .select('id, ai_report, created_at')
        .eq('email', email)
        .gte('created_at', cutoff)
        .limit(1)
        .maybeSingle()
      if (existing?.ai_report) {
        return NextResponse.json({
          id: existing.id,
          firstName,
          report: existing.ai_report as FunnelAIReport,
          createdAt: existing.created_at,
        })
      }
    } catch {
      // non-fatal — continue with new submission
    }
  }

  // Always generate report server-side (never trust client-provided report data)
  let report: FunnelAIReport
  try {
    report = await generateFunnelReport(firstName, answers)
  } catch (err) {
    console.error('Funnel AI generation failed:', err)
    return NextResponse.json(
      { error: 'Report generation failed. Please try again.' },
      { status: 500 }
    )
  }

  // Save to Supabase — isolated, non-blocking on failure
  let leadId = 'local'
  try {
    const supabase = createServiceClient()
    const { data, error: dbError } = await supabase
      .from('funnel_leads')
      .insert({
        first_name: firstName,
        mobile,
        email: email ?? null,
        segment: answers.segment ?? null,
        answers,
        protection_score: report.protectionScore,
        ai_report: report,
        status: 'new',
        sequence_step: 0,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Supabase funnel insert error (non-fatal):', dbError.message)
    } else {
      leadId = data?.id ?? 'local'
    }
  } catch (storageErr) {
    console.error('Supabase unavailable (non-fatal):', storageErr)
  }

  // Send immediate email if provided
  let emailError: string | null = null
  if (email && leadId !== 'local') {
    // Advance sequence_step to 1 regardless of email success so the drip cron can pick this lead up
    try {
      const supabase = createServiceClient()
      await supabase
        .from('funnel_leads')
        .update({ sequence_step: 1, last_emailed_at: new Date().toISOString() })
        .eq('id', leadId)
    } catch {
      // non-fatal
    }

    try {
      const { sendFunnelReport } = await import('@/lib/email')
      await sendFunnelReport({ leadId, firstName, email, report })
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err)
      console.error('Immediate email failed:', emailError)
    }
  }

  return NextResponse.json({
    id: leadId,
    firstName,
    report,
    createdAt: new Date().toISOString(),
    ...(emailError ? { emailError } : {}),
  })
}
