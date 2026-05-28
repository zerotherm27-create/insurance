import { NextRequest, NextResponse } from 'next/server'
import { generateFunnelReport } from '@/lib/funnel-ai'
import type { FunnelAnswers } from '@/types/funnel'

const ALLOWED: Record<string, string[]> = {
  ageRange: ['18-25', '26-35', '36-45', '46+'],
  familyStatus: ['single_no_deps', 'single_supporting', 'married_no_kids', 'married_with_kids'],
  incomeRange: ['below_15k', '15k_30k', '30k_60k', '60k_100k', '100k_plus'],
  lifeInsurance: ['none', 'have_unsure', 'active_policy'],
  healthCoverage: ['none', 'hmo_only', 'personal_insurance', 'both'],
  biggestWorry: ['medical_emergency', 'family_if_die', 'retirement', 'education', 'emergency_savings'],
  employment: ['employed_private', 'government', 'self_employed', 'business_owner', 'ofw'],
}

export async function POST(req: NextRequest) {
  let body: { answers: FunnelAnswers }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { answers } = body
  if (!answers) {
    return NextResponse.json({ error: 'Missing answers' }, { status: 400 })
  }

  for (const [field, allowed] of Object.entries(ALLOWED)) {
    const val = (answers as unknown as Record<string, string>)[field]
    if (!allowed.includes(val)) {
      return NextResponse.json({ error: `Invalid answer for ${field}` }, { status: 400 })
    }
  }

  try {
    const report = await generateFunnelReport('Friend', answers)
    return NextResponse.json({ report })
  } catch (err) {
    console.error('Preview generation failed:', err)
    return NextResponse.json({ error: 'Report generation failed. Please try again.' }, { status: 500 })
  }
}
