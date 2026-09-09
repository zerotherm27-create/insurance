import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAdminAuth } from '@/lib/admin-auth'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SEGMENT_CONTEXT: Record<string, string> = {
  pro: 'Target audience: young Filipino professional, 24-35, building their financial foundation. Focus on career income protection, starting a family, and first-time financial planning. Relatable everyday scenarios.',
  family: 'Target audience: parent or household provider responsible for dependants. Focus on life cover adequacy, children\'s education fund, and medical emergencies.',
  ofw: 'Target audience: Overseas Filipino Worker sending money home. Focus on remote family protection, income replacement, and the risk of "what if something happens to me abroad". Acknowledge the sacrifice and the distance.',
  entrepreneur: 'Target audience: Filipino freelancer or solo business owner with no employer benefits. Focus on income unpredictability, no HMO, and business continuity.',
  business: 'Target audience: established Philippine business owner with employees. Focus on key-man risk, business succession, and obligation to protect staff.',
  hnw: 'Target audience: high-net-worth Filipino individual. These are sophisticated readers managing significant assets. Focus ONLY on estate tax liquidity, legacy structures, wealth transfer, and business succession. NEVER write about basic coverage or "pagprotekta sa pamilya" framing. Tone: peer-level, precise, understated. No exclamation points.',
}

const SYSTEM_PROMPT = `You are writing a one-off custom email AS Jojo Cruzado — a licensed insurance advisor in the Philippines. Write in the first person. Every sentence should sound like Jojo typed it himself.

VOICE RULES:
- Write AS Jojo: "I", "me", "my". Never refer to Jojo in third person.
- Conversational but professional. Like a knowledgeable friend, not a newsletter.

CONTENT RULES:
- NEVER mention product names (no "Sun MaxiLink", "Sun Smarter Life", etc.)
- NEVER mention company or brand names
- NEVER make specific peso claims about premiums or coverage amounts
- Keep paragraphs SHORT: 2-3 sentences, mobile-first
- Use {variable} tokens where appropriate: {firstName}, {score}, {scoreLabel}, {gap}
- Subject lines: under 50 characters, personalized, no ALL CAPS
- NEVER use em dashes (—). Use periods, commas, or colons instead.

CTA TEXT RULES:
- The cta_text goes on a Calendly booking button. It must be clear and specific.
- Good examples: "Book a Free Chat", "Schedule a Quick Call", "Let's Talk This Week", "Book 30 Minutes Together"
- Bad examples: "Let's Talk", "Click Here", "Learn More", "Ask Me Anything" — too vague
- Keep it under 5 words.

AVAILABLE VARIABLES:
- {firstName} — lead's first name
- {score} — their protection score (1-100)
- {scoreLabel} — e.g. "Needs Attention", "Critical Gaps"
- {gap} — their biggest identified gap

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

  let body: { hint?: string; segment?: string; eventTags?: string[] }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (body.hint && body.hint.length > 500) {
    return NextResponse.json({ error: 'Hint too long (max 500 chars)' }, { status: 400 })
  }

  const segmentContext = body.segment ? SEGMENT_CONTEXT[body.segment] : null
  const systemPrompt = segmentContext
    ? `${SYSTEM_PROMPT}\n\nSEGMENT CONTEXT (critical — override generic Filipino framing with this):\n${segmentContext}`
    : SYSTEM_PROMPT

  const eventContext = body.eventTags?.length
    ? `\nThis is going to leads tagged with the event: ${body.eventTags.join(', ')}. Write as a follow-up to that specific event/meeting.`
    : ''

  const userPrompt = `Write a one-off custom email for Jojo to send right now to a specific, hand-picked group of leads (e.g. everyone he met at an event, or a specific batch he wants to follow up with).
${eventContext}
${body.hint ? `\nWHAT THIS EMAIL IS ABOUT: ${body.hint}` : '\nNo specific topic given: write a warm, generic follow-up thanking them for their time and inviting a quick chat.'}

Write 2-3 short paragraphs.`

  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 800,
    temperature: 0.75,
    messages: [
      { role: 'system', content: systemPrompt },
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
