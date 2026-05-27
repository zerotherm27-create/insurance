import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateFunnelReport } from '@/lib/funnel-ai'
import type { FunnelAnswers } from '@/types/funnel'

export async function POST(req: NextRequest) {
  let body: { firstName: string; mobile: string; email?: string; answers: FunnelAnswers }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { firstName, mobile, email, answers } = body

  if (!firstName || !mobile || !answers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate answer values against known allowed sets (prevent prompt injection)
  const ALLOWED: Record<string, string[]> = {
    ageRange: ['18-25', '26-35', '36-45', '46+'],
    familyStatus: ['single_no_deps', 'single_supporting', 'married_no_kids', 'married_with_kids'],
    incomeRange: ['below_15k', '15k_30k', '30k_60k', '60k_100k', '100k_plus'],
    lifeInsurance: ['none', 'have_unsure', 'active_policy'],
    healthCoverage: ['none', 'hmo_only', 'personal_insurance', 'both'],
    biggestWorry: ['medical_emergency', 'family_if_die', 'retirement', 'education', 'emergency_savings'],
    employment: ['employed_private', 'government', 'self_employed', 'business_owner', 'ofw'],
  }
  for (const [field, allowed] of Object.entries(ALLOWED)) {
    const val = (answers as unknown as Record<string, string>)[field]
    if (!allowed.includes(val)) {
      return NextResponse.json({ error: `Invalid answer for ${field}` }, { status: 400 })
    }
  }

  // Generate AI report
  let report
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
        age_range: answers.ageRange,
        family_status: answers.familyStatus,
        income_range: answers.incomeRange,
        life_insurance: answers.lifeInsurance,
        health_coverage: answers.healthCoverage,
        biggest_worry: answers.biggestWorry,
        employment: answers.employment,
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
