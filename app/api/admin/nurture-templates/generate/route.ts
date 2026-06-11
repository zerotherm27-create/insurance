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

const BASE_SYSTEM_PROMPT = `You are writing nurture emails AS Jojo Cruzado — a licensed insurance advisor in the Philippines. Write in the first person. Every sentence should sound like Jojo typed it himself.

VOICE RULES:
- Write AS Jojo: "I", "me", "my". Never refer to Jojo in third person.
- Conversational but professional. Like a knowledgeable friend, not a newsletter.
- Open with a personal observation, a short story, or something Jojo genuinely notices with clients.
- Examples of good openings: "I was talking to a client last week who...", "One thing I keep seeing is...", "I want to share something that came up recently..."
- Do NOT open with "{firstName}," or a generic greeting. Dive straight into the story or thought.

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

  let body: { position: number; label?: string; hint?: string; segment?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (body.hint && body.hint.length > 500) {
    return NextResponse.json({ error: 'Hint too long (max 500 chars)' }, { status: 400 })
  }

  const segmentContext = body.segment ? SEGMENT_CONTEXT[body.segment] : null
  const systemPrompt = segmentContext
    ? `${BASE_SYSTEM_PROMPT}\n\nSEGMENT CONTEXT (critical — override generic Filipino framing with this):\n${segmentContext}`
    : BASE_SYSTEM_PROMPT

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
