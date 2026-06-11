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
