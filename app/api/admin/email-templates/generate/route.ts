import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAdminAuth } from '@/lib/admin-auth'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const TEMPLATE_CONTEXT: Record<string, { purpose: string; timing: string; tone: string }> = {
  report: {
    purpose: 'Welcome email sent immediately after the lead completes the quiz. Congratulates them on taking the first step, teases the key insight from their personalized report, and builds anticipation.',
    timing: 'Sent immediately on form submission',
    tone: 'Warm, celebratory, curious — make them feel seen and understood',
  },
  followup_1: {
    purpose: 'Soft re-engagement email sent 1 day after the report. Checks if they reviewed their results, reinforces their biggest gap, and gently nudges them toward a conversation.',
    timing: 'Day 1 after submission',
    tone: 'Conversational, caring, low-pressure — like a message from a knowledgeable friend',
  },
  followup_2: {
    purpose: 'Educational email sent to cold leads (new/contacted status) on day 3. Teaches something surprising or valuable about financial protection in the Philippines — positions Jojo as an expert, not a salesman.',
    timing: 'Day 3 — educational nurture for cold leads',
    tone: 'Insightful, surprising, slightly provocative — make them think differently about insurance',
  },
  followup_3: {
    purpose: 'Conversion-focused email sent to warm/engaged leads. Creates gentle urgency, surfaces the cost of inaction, and makes booking a call feel obvious and low-risk.',
    timing: 'Day 5-7 — conversion push for warm leads',
    tone: 'Direct, confident, empathetic — acknowledge their situation and offer a clear path forward',
  },
  followup_4: {
    purpose: 'Final email in the sequence. Uses a relatable client story or scenario to make the protection gap feel real and personal. Ends with a soft CTA — not a hard sell.',
    timing: 'Day 14 — final nurture / social proof',
    tone: 'Storytelling, emotional, human — make them feel the consequence and the relief',
  },

  // ── Young Professional ───────────────────────────────────────────────
  followup_1_pro: {
    purpose: 'Re-engage a young professional (20s-30s, salaried, no dependants yet) who completed the quiz. Reinforce their biggest gap. Frame protection as the foundation before investing.',
    timing: 'Day 1 after submission',
    tone: 'Peer-to-peer, aspirational, low-pressure. Talk to them like a smart friend, not a salesman.',
  },
  followup_2_pro: {
    purpose: 'Educate a young professional on the cost of waiting. Their biggest financial advantage right now is TIME. Starting protection early = lower premiums, longer coverage, more options.',
    timing: 'Day 3 — educational nudge',
    tone: 'Insightful, slightly provocative. Challenge the "I\'ll deal with it later" mindset without being preachy.',
  },
  followup_3_pro: {
    purpose: 'Conversion email for a young professional. Their income is their biggest asset. Help them see that protecting it now — before life gets complicated — is the smart move.',
    timing: 'Day 7 — conversion push',
    tone: 'Direct, confident, practical. Give them a clear reason to act now, not next year.',
  },
  followup_4_pro: {
    purpose: 'Final email for a young professional. Tell a short story of someone their age who got protected early (or didn\'t). Make the decision feel real and personal, not abstract.',
    timing: 'Day 14 — social proof / final nudge',
    tone: 'Narrative, warm, human. End on hope, not fear.',
  },

  // ── Family / Parent ──────────────────────────────────────────────────
  followup_1_family: {
    purpose: 'Re-engage a parent or breadwinner who completed the quiz. Reinforce the stakes: their family depends on their income. What happens to the kids if they can\'t work?',
    timing: 'Day 1 after submission',
    tone: 'Warm, grounding, parental. Not alarmist — just honest about what love requires.',
  },
  followup_2_family: {
    purpose: 'Educate a family lead on the "breadwinner gap" — most parents prioritize their children\'s needs but leave their own income unprotected. Flip the logic.',
    timing: 'Day 3 — educational nudge',
    tone: 'Eye-opening, caring. Make them realize that protecting themselves IS protecting their family.',
  },
  followup_3_family: {
    purpose: 'Conversion email for a parent. The cost of inaction is measured in what their family would lose — not just money but stability, schooling, the future they planned.',
    timing: 'Day 7 — conversion push',
    tone: 'Direct, emotionally grounded, empathetic. Clear path to action.',
  },
  followup_4_family: {
    purpose: 'Final email. A short story of a parent who planned (or didn\'t). Make the consequence tangible and the relief real. Soft CTA at the end.',
    timing: 'Day 14 — social proof / final nudge',
    tone: 'Storytelling, emotional, human. Hope over fear.',
  },

  // ── OFW ─────────────────────────────────────────────────────────────
  followup_1_ofw: {
    purpose: 'Re-engage an OFW who completed the quiz. Acknowledge their sacrifice: working far from home so their family is provided for. Their protection gap is the one risk that could undo everything.',
    timing: 'Day 1 after submission',
    tone: 'Warm, deeply respectful of their sacrifice. Family-first framing. Never patronizing.',
  },
  followup_2_ofw: {
    purpose: 'Educate an OFW on what happens to remittances and their family\'s stability if they get sick, get injured, or pass away abroad. The distance makes the gap more dangerous.',
    timing: 'Day 3 — educational nudge',
    tone: 'Practical, grounding, caring. Make the risk feel real without being scary.',
  },
  followup_3_ofw: {
    purpose: 'Conversion email for an OFW. They work so hard to protect their family. Protection is the one thing that stays in place even when they\'re thousands of kilometers away.',
    timing: 'Day 7 — conversion push',
    tone: 'Direct, family-first, empowering. Frame coverage as the last line of protection for the people back home.',
  },
  followup_4_ofw: {
    purpose: 'Final email. A story of an OFW family — what happened when something went wrong abroad, and how protection made the difference (or didn\'t). Soft CTA.',
    timing: 'Day 14 — social proof / final nudge',
    tone: 'Narrative, emotional, respectful. Honour the OFW experience.',
  },

  // ── Entrepreneur ─────────────────────────────────────────────────────
  followup_1_entrepreneur: {
    purpose: 'Re-engage a freelancer or self-employed professional. Unlike employees, they have no employer benefits — no HMO, no group life, no sick pay. Their gap is structural, not just a number.',
    timing: 'Day 1 after submission',
    tone: 'Pragmatic, peer-to-peer. Respect their independence while naming the blind spot.',
  },
  followup_2_entrepreneur: {
    purpose: 'Educate an entrepreneur on what a serious illness or injury does to a solo business. Income stops immediately. Overheads continue. Clients go elsewhere.',
    timing: 'Day 3 — educational nudge',
    tone: 'Grounding, business-minded. Paint the scenario clearly without being dramatic.',
  },
  followup_3_entrepreneur: {
    purpose: 'Conversion email for an entrepreneur. They are the business. Protecting themselves IS protecting their livelihood. Frame coverage as a business decision, not a personal expense.',
    timing: 'Day 7 — conversion push',
    tone: 'Direct, pragmatic, confident. Give them a clear business case for acting now.',
  },
  followup_4_entrepreneur: {
    purpose: 'Final email. A story of a freelancer or solo professional who got sick and what happened to their clients, income, and lifestyle — and how protection changed the outcome.',
    timing: 'Day 14 — social proof / final nudge',
    tone: 'Narrative, practical, human. Relatable scenario for independent workers.',
  },

  // ── Business Owner ───────────────────────────────────────────────────
  followup_1_business: {
    purpose: 'Re-engage an established business owner. Their gap isn\'t just personal — it\'s the key-person risk that could destabilize their whole company if something happened to them.',
    timing: 'Day 1 after submission',
    tone: 'Strategic, business-minded, peer-to-peer. Talk about the business, not just their personal finances.',
  },
  followup_2_business: {
    purpose: 'Educate a business owner on key-person risk: what happens to payroll, supplier payments, and client relationships if the owner is suddenly out of the picture.',
    timing: 'Day 3 — educational nudge',
    tone: 'Factual, strategic. Name the business risk clearly. Make it feel like a board-level concern.',
  },
  followup_3_business: {
    purpose: 'Conversion email for a business owner. Business continuity planning always starts with protecting the key person. Frame coverage as the first line of any succession plan.',
    timing: 'Day 7 — conversion push',
    tone: 'Direct, strategic, confident. Clear path from risk to solution.',
  },
  followup_4_business: {
    purpose: 'Final email. A story of a business that survived (or didn\'t) when something happened to the owner — and what made the difference. Soft CTA.',
    timing: 'Day 14 — social proof / final nudge',
    tone: 'Narrative, business case, grounded in reality.',
  },

  // ── High Net Worth ───────────────────────────────────────────────────
  followup_1_hnw: {
    purpose: 'Re-engage an HNW lead focused on estate planning and legacy. Their concern isn\'t income — it\'s whether their estate will transfer cleanly to the next generation, or be eaten by estate tax and probate.',
    timing: 'Day 1 after submission',
    tone: 'Understated, sophisticated, peer-to-peer. No sales pressure. Treat them as an equal who values clarity over hype.',
  },
  followup_2_hnw: {
    purpose: 'Educate an HNW lead on estate tax in the Philippines: 6% on the net estate, payable before assets can transfer. For a large estate this is a significant liquidity event that families are often unprepared for.',
    timing: 'Day 3 — educational nudge',
    tone: 'Factual, strategic, calm. Present this as information, not alarm. HNW leads respond to data, not emotion.',
  },
  followup_3_hnw: {
    purpose: 'Conversion email for an HNW lead. A properly structured plan creates immediate liquidity to cover estate tax without forcing a rushed sale of assets. Frame it as an estate tool, not insurance.',
    timing: 'Day 7 — conversion push',
    tone: 'Direct, strategic, confident. Speak in terms of estate planning and wealth transfer, not "protection".',
  },
  followup_4_hnw: {
    purpose: 'Final email. A story of a family estate — heirs who had to sell property under pressure to cover estate tax, and how a liquidity plan would have changed the outcome. Soft CTA.',
    timing: 'Day 14 — social proof / final nudge',
    tone: 'Narrative, factual, grounded. No melodrama. The situation speaks for itself.',
  },
}

const SYSTEM_PROMPT = `You are an expert email copywriter for Jojo Cruzado, a licensed insurance advisor.

Jojo helps Filipinos (professionals, families, OFWs, entrepreneurs) close their financial protection gaps through life insurance, health riders, and investment-linked plans.

RULES (absolute, never break):
- NEVER mention product names (no "Sun MaxiLink", "Sun Smarter Life", etc.)
- NEVER mention company or brand names in the email body
- NEVER make specific peso claims about premiums or coverage amounts
- Use warm, Filipino-friendly English — conversational, not corporate
- Keep paragraphs SHORT (2-3 sentences max, mobile-first)
- Use {variable} tokens where appropriate: {firstName}, {score}, {scoreLabel}, {gap}, {recommendation}, {nextStep}, {topGapName}, {topGapIdeal}, {topGapStarter}
- Subject lines: under 50 characters, personalized when possible, no ALL CAPS
- NEVER use em dashes (—) anywhere in the output. Use periods, commas, or colons instead.

AVAILABLE VARIABLES:
- {firstName} — lead's first name
- {score} — their protection score (1-100)
- {scoreLabel} — e.g. "Needs Attention", "Critical Gaps"
- {gap} — their biggest identified gap
- {recommendation} — top recommendation from their AI report
- {nextStep} — suggested next step from their AI report
- {topGapName} — name of their most urgent coverage gap (e.g. "Income Replacement")
- {topGapIdeal} — ideal coverage amount for that gap, precomputed (e.g. "₱10,800,000")
- {topGapStarter} — starter coverage amount for that gap, precomputed (e.g. "₱5,400,000")

OUTPUT FORMAT (JSON only, no markdown):
{
  "subject": "string",
  "heading": "string",
  "paragraphs": ["string", "string", "string"],
  "cta_text": "string"
}`

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { templateId: string; hint?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (body.hint && body.hint.length > 500) {
    return NextResponse.json({ error: 'Hint too long (max 500 chars)' }, { status: 400 })
  }

  const ctx = TEMPLATE_CONTEXT[body.templateId]
  if (!ctx) return NextResponse.json({ error: 'Unknown template ID' }, { status: 400 })

  const userPrompt = `Write the "${body.templateId}" email for Jojo's drip sequence.

PURPOSE: ${ctx.purpose}
TIMING: ${ctx.timing}
TONE: ${ctx.tone}
${body.hint ? `\nADDITIONAL GUIDANCE: ${body.hint}` : ''}

Write 3 short paragraphs. Use {firstName} in the subject. Use other variables where they fit naturally. Make the CTA button text action-oriented and specific.`

  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 800,
    temperature: 0.7,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? ''
  let result: { subject: string; heading: string; paragraphs: string[]; cta_text: string }
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    result = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 })
  }

  return NextResponse.json({ content: result })
}
