import OpenAI from 'openai'
import { PRODUCTS, type Product } from '@/lib/products'
import { SEGMENT_LABELS, answerSummary } from '@/lib/funnel-questions'
import type { AdvisorPlaybook, FunnelAIReport, FunnelAnswers, FunnelSegment } from '@/types/funnel'

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SYSTEM_PROMPT = `You are coaching Jojo, a licensed Sun Life of Canada Philippines advisor, on how to approach a specific lead.

Your output is PRIVATE to Jojo — the lead will never see it. Write to him directly in the second person ("you", "your call"). Be tactical, not generic.

You will be given:
- The lead's life-stage segment and answers.
- A short lead-facing report Jojo already sent them (so you know the framing they received).
- A JSON catalog of Sun Life products Jojo actively sells. You MUST only recommend products whose "id" appears in that catalog — never invent products.

Generate a playbook that helps Jojo open the call, deepen discovery, position the right product, and handle pushback.

Rules:
- Lead temperature: "hot" = email provided AND clear urgent gap; "warm" = email provided OR critical gap; "cold" = neither.
- Pick 1–3 products. Use the product "id" verbatim from the catalog for productId. Use the "name" verbatim for productName.
- Tailor whyForThisLead to the lead's actual answers and gap — not generic copy.
- positioningAngle should map the product to the lead's stated worry / segment in 1 sentence.
- Discovery questions must be specific (not "what are your goals") — ground them in answers given.
- Objections should be realistic for THIS profile (e.g., budget-conscious starters vs HNW estate clients have different concerns).

Return ONLY valid JSON matching this schema — no markdown, no extra text:
{
  "leadTemperature": "hot" | "warm" | "cold",
  "temperatureReason": string,
  "openingApproach": string,
  "talkingPoints": string[],
  "discoveryQuestions": string[],
  "recommendedProducts": [
    { "productId": string, "productName": string, "whyForThisLead": string, "positioningAngle": string }
  ],
  "likelyObjections": [ { "objection": string, "response": string } ],
  "crossSellOpportunities": string[]
}

talkingPoints: 3-5 items. discoveryQuestions: 3-5 items. likelyObjections: 2-3 items. crossSellOpportunities: 1-3 items.`

function serializeCatalog(products: readonly Product[]): string {
  return JSON.stringify(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      purpose: p.purpose,
      bestFor: p.bestFor,
      positioning: p.positioning,
      tags: p.tags,
    })),
    null,
    2
  )
}

export async function generateAdvisorPlaybook({
  firstName,
  mobile,
  email,
  answers,
  report,
}: {
  firstName: string
  mobile: string
  email?: string | null
  answers: FunnelAnswers
  report: FunnelAIReport | null
}): Promise<AdvisorPlaybook> {
  const segment = answers.segment
  const segmentLabel = segment ? SEGMENT_LABELS[segment as FunnelSegment] : 'General'

  const reportSummary = report
    ? `protectionScore: ${report.protectionScore}
scoreLabel: ${report.scoreLabel}
biggestGap: ${report.biggestGap}
recommendation: ${report.recommendation}`
    : '(no AI report generated)'

  const userMessage = `LEAD PROFILE
First name: ${firstName}
Mobile: ${mobile}
Email provided: ${email ? 'yes' : 'no'}
Segment: ${segmentLabel}

THEIR ANSWERS:
${answerSummary(segment, answers)}

LEAD-FACING REPORT YOU ALREADY SENT THEM:
${reportSummary}

PRODUCT CATALOG (only recommend from these):
${serializeCatalog(PRODUCTS)}

Generate Jojo's advisor playbook for this lead.`

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1200,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  })

  const text = completion.choices[0]?.message?.content ?? ''
  if (!text) throw new Error('Empty response from OpenAI')
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in OpenAI response')

  const parsed = JSON.parse(jsonMatch[0]) as Omit<AdvisorPlaybook, 'generatedAt'>

  // Drop any AI-invented productIds defensively
  const validIds = new Set(PRODUCTS.map((p) => p.id))
  parsed.recommendedProducts = (parsed.recommendedProducts ?? []).filter((p) =>
    validIds.has(p.productId)
  )

  return { ...parsed, generatedAt: new Date().toISOString() }
}
