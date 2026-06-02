import { NextRequest, NextResponse } from 'next/server'
import { generateFunnelReport } from '@/lib/funnel-ai'
import { validateAnswers } from '@/lib/funnel-questions'
import type { FunnelAnswers } from '@/types/funnel'

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

  const invalidField = validateAnswers(answers.segment, answers)
  if (invalidField) {
    return NextResponse.json({ error: `Invalid or missing answer for ${invalidField}` }, { status: 400 })
  }

  try {
    const report = await generateFunnelReport('Friend', answers)
    return NextResponse.json({ report })
  } catch (err) {
    console.error('Preview generation failed:', err)
    return NextResponse.json({ error: 'Report generation failed. Please try again.' }, { status: 500 })
  }
}
