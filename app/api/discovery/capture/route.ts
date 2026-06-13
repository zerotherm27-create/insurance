import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { firstNameOf } from '@/lib/name'
import type { DiscoveryAnswers, DiscoveryResult } from '@/lib/discovery'

export async function POST(req: NextRequest) {
  let body: {
    firstName: string
    mobile: string
    email?: string
    answers: DiscoveryAnswers
    result: Pick<DiscoveryResult, 'score' | 'scoreLabel' | 'topGapName' | 'gaps' | 'plan' | 'goalLabel'>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { firstName, mobile, email, answers, result } = body

  if (!firstName || !mobile) {
    return NextResponse.json({ error: 'Name and mobile are required' }, { status: 400 })
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Dedup: if this person already exists (any time), return their id without
  // inserting a duplicate. No email sent — this is a live presentation capture.
  const checks = [
    email
      ? supabase.from('funnel_leads').select('id').eq('email', email).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('funnel_leads').select('id').eq('mobile', mobile).limit(1).maybeSingle(),
  ]
  const [byEmail, byMobile] = await Promise.all(checks)
  const existing = byEmail.data ?? byMobile.data

  if (existing) {
    return NextResponse.json({ id: existing.id, returning: true })
  }

  const { data, error } = await supabase
    .from('funnel_leads')
    .insert({
      first_name: firstNameOf(firstName),
      mobile,
      email: email || null,
      segment: null,
      answers,
      protection_score: result.score,
      ai_report: {
        biggestGap: result.topGapName,
        recommendation: result.plan.coverageType,
        nextStep: result.plan.fitReason,
        scoreLabel: result.scoreLabel,
        goalLabel: result.goalLabel,
        benefits: result.gaps.map((g) => ({
          name: g.name,
          status: g.status,
          idealAmount: g.idealAmount,
          ...(g.starterAmount ? { starterAmount: g.starterAmount } : {}),
        })),
      },
      status: 'new',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[discovery/capture]', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, returning: false })
}
