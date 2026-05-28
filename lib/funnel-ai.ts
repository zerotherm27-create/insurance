import OpenAI from 'openai'
import type { FunnelAnswers, FunnelAIReport, FunnelSegment } from '@/types/funnel'
import { LABEL_MAP } from '@/lib/funnel-questions'

const SEGMENT_LABELS: Record<FunnelSegment, string> = {
  pro: 'Young Professional',
  family: 'Family / Parent (breadwinner)',
  ofw: 'OFW (Overseas Filipino Worker)',
  entrepreneur: 'Entrepreneur / Self-Employed',
  business: 'Business Owner',
  hnw: 'High Net Worth Individual',
}

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SYSTEM_PROMPT = `You are a warm, responsible financial protection advisor for Filipinos.
Generate a short, personalized Financial Protection Report based on the user's profile.

Rules:
- Do NOT mention specific insurance product names or company names. Use coverage types only (e.g., "life coverage", "health insurance plan", "emergency fund").
- Be warm, use simple Filipino-friendly English.
- Keep the report concise — it will be read on a phone.

Return ONLY valid JSON matching this schema exactly — no markdown, no extra text:
{
  "protectionScore": number (1-100, based on their coverage gaps and risk level),
  "scoreLabel": one of exactly: "Critical Gaps" | "Needs Attention" | "Partially Protected" | "Well Protected" | "Strongly Protected",
  "snapshot": [
    { "icon": "✅" or "❌" or "⚠️", "text": string }
  ],
  "biggestGap": string (1 sentence identifying the single most urgent protection need),
  "recommendation": string (1-2 sentences, coverage type only, no product or company names),
  "estimatedRange": string (e.g. "₱1,500 – ₱3,000/month", base on their income range),
  "nextStep": string (warm, 1 sentence, encourages booking a free consultation)
}

The snapshot array must have exactly 4 items. Use ✅ for protections they have, ❌ for missing, ⚠️ for partial or uncertain.`

export async function generateFunnelReport(
  firstName: string,
  answers: FunnelAnswers
): Promise<FunnelAIReport> {
  const segmentLine = answers.segment
    ? `Segment context: ${SEGMENT_LABELS[answers.segment]} — tailor the profileSummary and nextStep language to speak directly to this person's situation.\n`
    : ''

  const userMessage = `
Client: ${firstName}
Age range: ${LABEL_MAP.ageRange[answers.ageRange]}
Family situation: ${LABEL_MAP.familyStatus[answers.familyStatus]}
Monthly income: ${LABEL_MAP.incomeRange[answers.incomeRange]}
Life insurance: ${LABEL_MAP.lifeInsurance[answers.lifeInsurance]}
Health coverage: ${LABEL_MAP.healthCoverage[answers.healthCoverage]}
Biggest financial worry: ${LABEL_MAP.biggestWorry[answers.biggestWorry]}
Employment type: ${LABEL_MAP.employment[answers.employment]}
${segmentLine}
Generate their personalized Financial Protection Report.`

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  })

  const text = completion.choices[0]?.message?.content ?? ''
  if (!text) throw new Error('Empty response from OpenAI')
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in OpenAI response')
  return JSON.parse(jsonMatch[0]) as FunnelAIReport
}
