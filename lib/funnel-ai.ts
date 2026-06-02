import OpenAI from 'openai'
import type { FunnelAnswers, FunnelAIReport, FunnelSegment } from '@/types/funnel'
import { SEGMENT_LABELS, answerSummary } from '@/lib/funnel-questions'

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// The lens the report should be written through, per segment. This is what
// makes an HNW report talk about estate/legacy instead of "income protection".
const SEGMENT_FRAMING: Record<FunnelSegment, string> = {
  pro: `This is a YOUNG PROFESSIONAL building their financial foundation. Frame the report around protecting their growing income, building an emergency fund, managing debt, and starting early. "estimatedRange" should be a realistic monthly coverage budget based on their income.`,
  family: `This is a FAMILY PROVIDER. Frame the report around income replacement, protecting dependents, education funding, and clearing debts (the DIME approach). "estimatedRange" should be a realistic monthly coverage budget for their household income.`,
  ofw: `This is an OFW (Overseas Filipino Worker) supporting family back home. Frame the report around protecting their family if income stops, building toward coming home for good, and the risk of family over-dependence on remittances. Acknowledge their sacrifice warmly. "estimatedRange" should be a realistic monthly coverage budget based on their remittance level.`,
  entrepreneur: `This is a SELF-EMPLOYED ENTREPRENEUR with no employer safety net. Frame the report around income protection when they cannot work, separating personal and business finances, and building their own retirement. "estimatedRange" should be a realistic monthly coverage budget for a variable-income earner.`,
  business: `This is an established BUSINESS OWNER. Frame the report around business continuity, key-person protection, succession planning, personal liability from business loans, and protecting their family and legacy. Do NOT focus on basic HMO/income questions. "estimatedRange" should describe a sensible protection/key-person coverage range rather than a small monthly premium.`,
  hnw: `This is a HIGH NET WORTH INDIVIDUAL. Their concern is LEGACY and WEALTH TRANSFER, not monthly income. Frame the report around estate planning, the Philippine 6% estate tax and the need for liquid cash to pay it, clean asset transfer (trusts, clear beneficiaries), avoiding family conflict, and their stated legacy priority. NEVER frame this as "income protection" or suggest a small monthly premium. "estimatedRange" should describe the scale of estate-liquidity / legacy coverage worth considering, not a monthly budget. "biggestGap" should focus on estate/transfer risk.`,
}

const SYSTEM_PROMPT = `You are a warm, responsible financial protection advisor for Filipinos.
Generate a short, personalized Financial Protection Report based on the user's profile.

Rules:
- Do NOT mention specific insurance product names or company names. Use coverage types only (e.g., "life coverage", "health insurance plan", "emergency fund", "estate liquidity", "key-person coverage").
- Be warm, use simple Filipino-friendly English.
- Keep the report concise — it will be read on a phone.
- Tailor EVERYTHING to the person's life stage described in the framing. The score, gaps, and recommendations must reflect what actually matters for their situation.

Return ONLY valid JSON matching this schema exactly — no markdown, no extra text:
{
  "protectionScore": number (1-100, based on their gaps and risk level for their life stage),
  "scoreLabel": one of exactly: "Critical Gaps" | "Needs Attention" | "Partially Protected" | "Well Protected" | "Strongly Protected",
  "snapshot": [
    { "icon": "✅" or "❌" or "⚠️", "text": string }
  ],
  "biggestGap": string (1 sentence identifying the single most urgent need for THEIR situation),
  "recommendation": string (1-2 sentences, coverage type only, no product or company names),
  "estimatedRange": string (framed appropriately for their life stage — see framing),
  "nextStep": string (warm, 1 sentence, encourages booking a free consultation)
}

The snapshot array must have exactly 4 items. Use ✅ for things they have handled, ❌ for missing/urgent, ⚠️ for partial or uncertain.`

export async function generateFunnelReport(
  firstName: string,
  answers: FunnelAnswers
): Promise<FunnelAIReport> {
  const segment = answers.segment
  const framing = segment
    ? `Profile type: ${SEGMENT_LABELS[segment]}\n${SEGMENT_FRAMING[segment]}\n`
    : `Profile type: General. Frame the report around overall financial protection based on the answers.\n`

  const userMessage = `${framing}
Client first name: ${firstName}

Their answers:
${answerSummary(segment, answers)}

Generate their personalized Financial Protection Report, written specifically for this life stage.`

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
