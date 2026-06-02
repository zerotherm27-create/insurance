import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateFunnelReport } from '@/lib/funnel-ai'
import { validateAnswers } from '@/lib/funnel-questions'
import type { FunnelAnswers, FunnelAIReport } from '@/types/funnel'

export async function POST(req: NextRequest) {
  let body: { firstName: string; mobile: string; email?: string; answers: FunnelAnswers; report?: FunnelAIReport }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { firstName, mobile, email, answers, report: preGeneratedReport } = body

  if (!firstName || !mobile || !answers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate answers against the segment's question set (prevents prompt injection)
  const invalidField = validateAnswers(answers.segment, answers)
  if (invalidField) {
    return NextResponse.json({ error: `Invalid or missing answer for ${invalidField}` }, { status: 400 })
  }

  // Use pre-generated report if provided (from preview step), otherwise generate fresh
  let report: FunnelAIReport
  if (preGeneratedReport) {
    report = preGeneratedReport
  } else {
    try {
      report = await generateFunnelReport(firstName, answers)
    } catch (err) {
      console.error('Funnel AI generation failed:', err)
      return NextResponse.json(
        { error: 'Report generation failed. Please try again.' },
        { status: 500 }
      )
    }
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
  if (email && leadId !== 'local') {
    try {
      // @ts-ignore — lib/email.ts is added in Task 10; this import fails at runtime only if email is provided before then
      const { sendFunnelReport } = await import('@/lib/email')
      await sendFunnelReport({ leadId, firstName, email, report })

      // Mark sequence step 1 (immediate email sent)
      try {
        const supabase = createServiceClient()
        await supabase
          .from('funnel_leads')
          .update({ sequence_step: 1, last_emailed_at: new Date().toISOString() })
          .eq('id', leadId)
      } catch {
        // non-fatal
      }
    } catch (emailErr) {
      console.error('Immediate email failed (non-fatal):', emailErr)
    }
  }

  return NextResponse.json({ id: leadId, firstName, report })
}
