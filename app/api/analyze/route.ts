import { NextRequest, NextResponse } from 'next/server'
import { analyzeProfile } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase'
import { calculateProtectionScore } from '@/lib/scoring'
import type { AssessmentData } from '@/types'

export async function POST(req: NextRequest) {
  let assessmentData: AssessmentData

  try {
    assessmentData = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (
    !assessmentData?.clientDetails ||
    !assessmentData?.goalsAndPriorities ||
    !Array.isArray(assessmentData.goalsAndPriorities.goals)
  ) {
    return NextResponse.json({ error: 'Invalid assessment data' }, { status: 400 })
  }

  try {
    const scoreBreakdown = calculateProtectionScore(assessmentData)
    const aiAnalysis = await analyzeProfile(assessmentData)

    const finalAnalysis = {
      ...aiAnalysis,
      scoreBreakdown,
    }

    // Storage is best-effort — errors are logged but don't fail the response
    const supabase = createServiceClient()
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        full_name: assessmentData.clientDetails.fullName,
        birthday: assessmentData.clientDetails.birthday,
        age: assessmentData.clientDetails.age,
        gender: assessmentData.clientDetails.gender,
        smoker: assessmentData.clientDetails.smoker,
        occupation: assessmentData.clientDetails.occupation,
        income_range: assessmentData.clientDetails.incomeRange,
        monthly_budget: assessmentData.clientDetails.monthlyBudget,
        has_hmo: assessmentData.clientDetails.hasHMO,
        has_emergency_fund: assessmentData.clientDetails.hasEmergencyFund,
        is_breadwinner: assessmentData.clientDetails.isBreadwinner,
        has_existing_insurance: assessmentData.clientDetails.hasExistingInsurance,
        goals: assessmentData.goalsAndPriorities.goals,
        priority_style: assessmentData.goalsAndPriorities.priorityStyle,
        risk_comfort: assessmentData.goalsAndPriorities.riskComfort,
        protection_score: scoreBreakdown.total,
        primary_recommendation: aiAnalysis.primaryRecommendation?.productId,
        ai_analysis: finalAnalysis,
        assessment_data: assessmentData,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Supabase storage error (non-fatal):', dbError.message)
    }

    return NextResponse.json({
      analysisId: lead?.id ?? 'local',
      analysis: finalAnalysis,
    })
  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
