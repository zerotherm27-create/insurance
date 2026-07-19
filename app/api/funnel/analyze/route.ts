import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import { generateFunnelReport, generateDeterministicReport } from '@/lib/funnel-ai'
import { validateAnswers } from '@/lib/funnel-questions'
import { firstNameOf } from '@/lib/name'
import {
  ATTRIBUTION_COOKIE_NAME,
  UTM_PARAM_KEYS,
  parseAttributionCookie,
  type AttributionCookie,
} from '@/lib/attribution'
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

  // The form collects the full name (stored for CRM); greetings use the first word.
  const greetName = firstNameOf(firstName)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const attribution = parseAttributionCookie(cookieStore.get(ATTRIBUTION_COOKIE_NAME)?.value)

  // Validate answers against the segment's question set (prevents prompt injection)
  const invalidField = validateAnswers(answers.segment, answers)
  if (invalidField) {
    return NextResponse.json({ error: `Invalid or missing answer for ${invalidField}` }, { status: 400 })
  }

  // Repeat submission within 24h (matched by email, then mobile): refresh the
  // report from the new answers using the zero-cost deterministic engine,
  // update the existing lead, and never send a second email. The lead sees a
  // "welcome back" notice via the `returning` flag.
  try {
    const supabase = createServiceClient()
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    let existing: {
      id: string
      ai_report: unknown
      created_at: string
      utm_source: string | null
      utm_medium: string | null
      utm_campaign: string | null
      utm_content: string | null
      utm_term: string | null
    } | null = null
    const byEmail = await supabase
      .from('funnel_leads')
      .select('id, ai_report, created_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term')
      .eq('email', email)
      .gte('created_at', cutoff)
      .limit(1)
      .maybeSingle()
    existing = byEmail.data
    if (!existing) {
      const byMobile = await supabase
        .from('funnel_leads')
        .select('id, ai_report, created_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term')
        .eq('mobile', mobile)
        .gte('created_at', cutoff)
        .limit(1)
        .maybeSingle()
      existing = byMobile.data
    }

    if (existing?.ai_report) {
      const refreshed = generateDeterministicReport(answers)
      const attributionUpdate: AttributionCookie = {}
      for (const key of UTM_PARAM_KEYS) {
        const value = attribution[key]
        if (!existing[key] && value) attributionUpdate[key] = value
      }
      // Keep the stored email and mobile: a mobile match with a new email must
      // not let the lead redirect future drip emails to an unverified address.
      const { error: updateError } = await supabase
        .from('funnel_leads')
        .update({
          first_name: firstName,
          segment: answers.segment ?? null,
          answers,
          protection_score: refreshed.protectionScore,
          ai_report: refreshed,
          ...attributionUpdate,
        })
        .eq('id', existing.id)
      return NextResponse.json({
        id: existing.id,
        firstName: greetName,
        report: updateError ? (existing.ai_report as FunnelAIReport) : refreshed,
        createdAt: existing.created_at,
        segment: answers.segment ?? null,
        returning: true,
      })
    }
  } catch {
    // non-fatal — continue with new submission
  }

  // Always generate report server-side (never trust client-provided report data)
  let report: FunnelAIReport
  try {
    report = await generateFunnelReport(greetName, answers)
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
        utm_source: attribution.utm_source ?? null,
        utm_medium: attribution.utm_medium ?? null,
        utm_campaign: attribution.utm_campaign ?? null,
        utm_content: attribution.utm_content ?? null,
        utm_term: attribution.utm_term ?? null,
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
      await sendFunnelReport({ leadId, firstName: greetName, email, report })
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err)
      console.error('Immediate email failed:', emailError)
    }
  }

  return NextResponse.json({
    id: leadId,
    firstName: greetName,
    report,
    createdAt: new Date().toISOString(),
    segment: answers.segment ?? null,
    ...(emailError ? { emailError } : {}),
  })
}
