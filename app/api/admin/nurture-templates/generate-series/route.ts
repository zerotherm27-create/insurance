import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAdminAuth } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase'

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
- Use {variable} tokens where appropriate: {firstName}, {score}, {scoreLabel}, {gap}
- Subject lines: under 50 characters, personalized when possible, no ALL CAPS
- NEVER use em dashes (—) anywhere. Use periods, commas, or colons instead.
- Each email must feel distinct — different hook, different story or angle

OUTPUT FORMAT (JSON array, no markdown):
[
  {
    "label": "short admin label (5 words max)",
    "subject": "email subject",
    "heading": "email heading",
    "paragraphs": ["paragraph 1", "paragraph 2", "paragraph 3"],
    "cta_text": "button text"
  }
]`

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { count: number; theme?: string; wait_days: number; startPosition: number }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const count = Math.min(Math.max(body.count ?? 5, 1), 10)
  const waitDays = Math.min(Math.max(body.wait_days ?? 3, 1), 30)

  const userPrompt = `Write ${count} nurture emails for Jojo's ongoing series sent after the initial 14-day drip sequence.

PURPOSE: Keep leads engaged over weeks or months with valuable stories, insurance tips, and real-life scenarios. These are NOT sales emails. They should educate, build trust, and keep Jojo top of mind as a knowledgeable and caring advisor.
${body.theme ? `THEME / TOPIC FOCUS: ${body.theme}` : 'THEME: Mix of relatable stories, practical insurance tips, and common Filipino financial mistakes to avoid.'}
TONE: Warm, personal, story-driven. Like a helpful message from a knowledgeable friend.

Make each email feel different — vary the hook, the angle, and the story. Use {firstName} in subjects. CTAs should be soft (e.g. "Let's Talk", "Ask Me Anything", "Book a Free Chat", "I'm here if you have questions").

Write exactly ${count} emails as a JSON array.`

  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 400 * count,
    temperature: 0.8,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? ''
  let generated: Array<{ label: string; subject: string; heading: string; paragraphs: string[]; cta_text: string }>
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    generated = JSON.parse(cleaned)
    if (!Array.isArray(generated)) throw new Error('Not an array')
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 })
  }

  // Save all generated templates to DB
  const supabase = createServiceClient()
  const inserted = []
  for (let i = 0; i < generated.length; i++) {
    const email = generated[i]
    const position = body.startPosition + i
    const { data, error } = await supabase
      .from('nurture_templates')
      .insert({
        position,
        label: email.label ?? `Nurture ${position}`,
        subject: email.subject,
        heading: email.heading,
        paragraphs: email.paragraphs,
        cta_text: email.cta_text,
        wait_days: waitDays,
      })
      .select()
      .single()
    if (!error && data) inserted.push(data)
  }

  return NextResponse.json({ templates: inserted })
}
