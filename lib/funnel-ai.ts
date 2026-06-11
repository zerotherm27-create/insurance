import OpenAI from 'openai'
import type { FunnelAnswers, FunnelAIReport, FunnelSegment } from '@/types/funnel'
import { SEGMENT_LABELS, answerSummary } from '@/lib/funnel-questions'
import {
  buildCoverageBenefits,
  computeProtectionScore,
  scoreLabelFor,
  estimatedRangeFor,
  snapshotFromBenefits,
  benefitTableForPrompt,
} from '@/lib/coverage-benefits'

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// One short tone line per segment. Amounts, statuses, and the score are all
// precomputed in lib/coverage-benefits.ts, so the AI only needs voice guidance.
const SEGMENT_TONE: Record<FunnelSegment, string> = {
  pro: 'Young professional building a foundation. Encourage starting early while coverage is cheap.',
  family: 'Family provider. Center the people who depend on them.',
  ofw: 'OFW supporting family from abroad. Acknowledge their sacrifice warmly and the dream of coming home.',
  entrepreneur: 'Self-employed with no employer safety net. They are their own benefits department.',
  business: 'Established business owner. Speak peer to peer about continuity and keeping business debt away from family.',
  hnw: 'High net worth, focused on legacy and clean wealth transfer. Confident, discreet tone. Never mention monthly budgets.',
}

const SYSTEM_PROMPT = `You are a warm financial protection advisor for Filipinos. You will receive a client's life stage, quiz answers, and a precomputed coverage table (id | name | status | amounts). Write SHORT personalized prose around those facts. Never change or invent numbers or statuses.
Rules: no insurance product names, no company names, no em dashes, simple Filipino-friendly English, phone-readable.
Return ONLY valid JSON:
{
  "biggestGap": "1 sentence naming the single most urgent gap from the table",
  "recommendation": "1-2 sentences on what to prioritize, coverage types only",
  "nextStep": "1 warm sentence encouraging a free consultation",
  "benefitNotes": { "<benefitId>": "1 short sentence on why this matters for THEIR situation" }
}
benefitNotes: only for benefits with status gap or partial, at most 3 entries.`

interface AIProse {
  biggestGap: string
  recommendation: string
  nextStep: string
  benefitNotes?: Record<string, string>
}

// Deterministic fallback so the lead still gets a complete report if OpenAI
// is down or returns malformed JSON.
function fallbackProse(benefits: ReturnType<typeof buildCoverageBenefits>): AIProse {
  const firstGap = benefits.find((b) => b.status === 'gap') ?? benefits.find((b) => b.status === 'partial')
  return {
    biggestGap: firstGap
      ? `Your most urgent gap right now is ${firstGap.name.toLowerCase()}.`
      : 'Your protection basics look covered, and a review can confirm nothing is missed.',
    recommendation: firstGap?.starterAmount
      ? `Start at the starter level for ${firstGap.name.toLowerCase()}, then build toward the ideal coverage as your budget grows.`
      : 'A short review of your current coverage will show the fastest way to close your remaining gaps.',
    nextStep: 'Book a free consultation with Jojo to walk through your results and your options.',
  }
}

export async function generateFunnelReport(
  firstName: string,
  answers: FunnelAnswers
): Promise<FunnelAIReport> {
  const segment = answers.segment

  // Deterministic facts: benefits, score, label, range. Zero AI involvement.
  const benefits = buildCoverageBenefits(answers)
  const protectionScore = computeProtectionScore(benefits)
  const scoreLabel = scoreLabelFor(protectionScore)
  const estimatedRange = estimatedRangeFor(segment, answers)

  const tone = segment
    ? `${SEGMENT_LABELS[segment]}. ${SEGMENT_TONE[segment]}`
    : 'General profile. Frame around overall financial protection.'

  const userMessage = `Life stage: ${tone}
Client first name: ${firstName}

Their answers:
${answerSummary(segment, answers)}

Coverage table (precomputed, do not alter):
${benefitTableForPrompt(benefits)}

Write the personalized prose for this client.`

  let prose: AIProse
  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in OpenAI response')
    prose = JSON.parse(jsonMatch[0]) as AIProse
  } catch (err) {
    console.error('Funnel AI prose failed, using deterministic fallback:', err)
    prose = fallbackProse(benefits)
  }

  // Merge AI one-liners into gap/partial benefits only (max 3, per prompt).
  const notes = prose.benefitNotes ?? {}
  const coverageBenefits = benefits.map((b) =>
    b.status !== 'have' && notes[b.id] ? { ...b, whyItMatters: notes[b.id] } : b
  )

  return {
    protectionScore,
    scoreLabel,
    snapshot: snapshotFromBenefits(coverageBenefits),
    biggestGap: prose.biggestGap,
    recommendation: prose.recommendation,
    estimatedRange,
    nextStep: prose.nextStep,
    coverageBenefits,
  }
}
