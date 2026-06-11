import OpenAI from 'openai'
import { PRODUCTS, type Product } from '@/lib/products'
import { SEGMENT_LABELS, answerSummary } from '@/lib/funnel-questions'
import { benefitTableForPrompt } from '@/lib/coverage-benefits'
import type { AdvisorPlaybook, FunnelAIReport, FunnelAnswers, FunnelSegment } from '@/types/funnel'

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SYSTEM_PROMPT = `You are coaching Jojo, a licensed insurance advisor, on how to approach a specific lead.

Your output is PRIVATE to Jojo — the lead will never see it. Write to him directly in the second person ("you", "your call"). Be tactical, not generic.

You will be given:
- The lead's life-stage segment and answers.
- A short lead-facing report Jojo already sent them (so you know the framing they received).
- A JSON catalog of products Jojo actively sells. You MUST only recommend products whose "id" appears in that catalog — never invent products.

Generate a playbook that helps Jojo open the call, deepen discovery, position the right product, and handle pushback.

Rules:
- Lead temperature: "hot" = email provided AND clear urgent gap; "warm" = email provided OR critical gap; "cold" = neither.
- Pick 1–3 products. Use the product "id" verbatim from the catalog for productId. Use the "name" verbatim for productName.
- Tailor whyForThisLead to the lead's actual answers and gap — not generic copy.
- positioningAngle should map the product to the lead's stated worry / segment in 1 sentence.
- Discovery questions must be specific (not "what are your goals") — ground them in answers given.
- Objections should be realistic for THIS profile (e.g., budget-conscious starters vs HNW estate clients have different concerns).
- NEVER use em dashes (—) in any text field. Use periods, commas, or colons instead.
- openingApproach must name the lead's most critical gap and immediately frame why that gap makes protection urgent NOW, not later. Never open with generic rapport.

CRITICAL COACHING RULE — NEVER DEFER:
Never advise Jojo to tell the lead to fix a non-insurance problem first. Every gap is a reason protection is MORE urgent, not a reason to wait. Apply this bridging logic in talkingPoints, discoveryQuestions, likelyObjections, and openingApproach:

- Debt gap: the debt is why income and life protection are urgent. If something happens while the debt is outstanding, the family inherits the obligation with no income. Position life protection as shielding the family from that scenario while they work on the debt.
- Emergency fund gap: a critical illness or income protection plan fills the gap savings cannot. Hospitalization, income loss, or disability wipes out whatever cash they have. Protection and savings serve different purposes — the plan covers the catastrophic event the savings would never survive.
- Health / critical illness gap: no HMO, no employer coverage is the opening. A health and critical illness plan is the direct solution, not a reason to wait.
- Income protection gap: a breadwinner with no coverage is a single point of failure for the family. Every month unprotected is a month of uninsured risk.
- Estate / legacy gap (HNW): estate tax is a certain future obligation. The product is the liquidity solution — not something to plan later. The estate will be taxed whether or not the plan exists.
- Retirement gap: waiting makes premiums more expensive. Starting now locks in younger-age rates while building cash value toward that retirement goal.

Reframe every objection using this pattern: "Your [situation] is exactly why we should do this now. Here is how this plan protects you while you address that." Every talkingPoint, every objection response, and every crossSellOpportunity must drive toward a product recommendation or a next step. Never toward waiting.

TONE — CONSULTATIVE, NOT SALESY:
Write like a trusted financial adviser educating a client, not a salesperson closing a deal. The goal is to help Jojo explain WHY protection comes first in a way that is clear, honest, and grounded in this lead's real numbers. Avoid hype words ("amazing", "best", "don't miss out"). Be specific and calm. Honesty earns the sale.

protectionCase: 3 to 5 sentences. This is the heart of the playbook. Explain, in plain consultative language, why securing protection is the priority for THIS lead right now. Reference their actual gap, segment, and the peso figures from the coverage breakdown. Teach the logic (e.g. why an unprotected breadwinner with debt is a single point of failure). Do not pitch a product here. Educate first.

prosAndCons: An honest, balanced view Jojo can put on the table. pros = 2-3 concrete reasons acting now genuinely benefits this specific lead. cons = 2-3 REAL trade-offs or considerations to be upfront about (e.g. premium is a long-term commitment, starter tier covers less than ideal, budget needs to flex). Do not invent fake cons or pretend there are none. Acknowledging real trade-offs is what makes the advice trustworthy and not salesy.

smartPlan: A SMART action plan for the recommended next step. Each field is one specific sentence grounded in this lead's figures:
- specific: exactly what coverage to secure (type and purpose, no product name needed here).
- measurable: the target peso coverage amount, drawn from the coverage breakdown (ideal or starter).
- achievable: how to make it fit this lead's budget reality (e.g. start at starter tier, scale later).
- relevant: how it directly closes the lead's most critical gap.
- timeBound: a concrete timeframe (e.g. book the consultation within 48 hours, apply within 2 weeks).

Return ONLY valid JSON matching this schema — no markdown, no extra text:
{
  "leadTemperature": "hot" | "warm" | "cold",
  "temperatureReason": string,
  "protectionCase": string,
  "openingApproach": string,
  "talkingPoints": string[],
  "prosAndCons": { "pros": string[], "cons": string[] },
  "discoveryQuestions": string[],
  "recommendedProducts": [
    { "productId": string, "productName": string, "whyForThisLead": string, "positioningAngle": string }
  ],
  "smartPlan": { "specific": string, "measurable": string, "achievable": string, "relevant": string, "timeBound": string },
  "likelyObjections": [ { "objection": string, "response": string } ],
  "crossSellOpportunities": string[]
}

talkingPoints: 3-5 items. prosAndCons.pros: 2-3 items. prosAndCons.cons: 2-3 items. discoveryQuestions: 3-5 items. likelyObjections: 2-3 items. crossSellOpportunities: 1-3 items.`

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

  const benefitsTable = report?.coverageBenefits?.length
    ? `\nCOVERAGE BREAKDOWN (id | name | status | amounts):\n${benefitTableForPrompt(report.coverageBenefits)}`
    : ''

  const reportSummary = report
    ? `protectionScore: ${report.protectionScore}
scoreLabel: ${report.scoreLabel}
biggestGap: ${report.biggestGap}
recommendation: ${report.recommendation}${benefitsTable}`
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

Generate Jojo's advisor playbook for this lead.

Your JSON response MUST include ALL of these keys, none omitted: leadTemperature, temperatureReason, protectionCase, openingApproach, talkingPoints, prosAndCons, discoveryQuestions, recommendedProducts, smartPlan, likelyObjections, crossSellOpportunities. The protectionCase, prosAndCons (with pros and cons arrays), and smartPlan (with specific, measurable, achievable, relevant, timeBound) are required and must be fully written out.`

  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2400,
    temperature: 0.6,
    response_format: { type: 'json_object' },
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
