import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAdminAuth } from '@/lib/admin-auth'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SYSTEM_PROMPT = `You are an expert email copywriter for Jojo Cruzado, a licensed insurance advisor in the Philippines.

Jojo helps Filipinos (professionals, families, OFWs, entrepreneurs) understand and close their financial protection gaps.

RULES (absolute, never break):
- NEVER mention product names (no "Sun MaxiLink", "Sun Smarter Life", etc.)
- NEVER mention company or brand names in the email body
- NEVER make specific peso claims about premiums or coverage amounts
- Use warm, Filipino-friendly English — conversational, not corporate
- Keep paragraphs SHORT (2-3 sentences max, mobile-first)
- Use {variable} tokens where appropriate: {firstName}, {score}, {scoreLabel}, {gap}, {recommendation}, {nextStep}, {topGapName}, {topGapIdeal}, {topGapStarter}
- Subject lines: under 50 characters, personalized when possible, no ALL CAPS
- NEVER use em dashes (—) anywhere. Use periods, commas, or colons instead.

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

  let body: { position: number; label?: string; hint?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (body.hint && body.hint.length > 500) {
    return NextResponse.json({ error: 'Hint too long (max 500 chars)' }, { status: 400 })
  }

  const userPrompt = `Write nurture email #${body.position} for Jojo's ongoing email series sent after the main 14-day drip sequence.

PURPOSE: Keep leads engaged with a valuable story, insurance tip, or real-life scenario. This is not a sales email. It should educate, build trust, and keep Jojo top of mind as a knowledgeable and caring advisor.
${body.label ? `TOPIC/LABEL: ${body.label}` : ''}
TONE: Warm, personal, story-driven. Like a helpful message from a knowledgeable friend, not a newsletter.
${body.hint ? `\nADDITIONAL GUIDANCE: ${body.hint}` : ''}

Write 3 short paragraphs. Use {firstName} in the subject. The CTA should be soft and low-pressure (e.g. "Let's Talk", "Ask Me Anything", "Book a Free Chat").`

  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 800,
    temperature: 0.75,
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
