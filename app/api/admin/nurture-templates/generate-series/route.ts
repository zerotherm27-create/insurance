import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAdminAuth } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SEGMENT_CONTEXT: Record<string, string> = {
  pro: 'Target audience: young Filipino professional, 24-35, building their financial foundation. Focus on career income protection, starting a family, and first-time financial planning.',
  family: 'Target audience: parent or household provider responsible for dependants. Focus on life cover adequacy, children\'s education fund, and medical emergencies.',
  ofw: 'Target audience: Overseas Filipino Worker sending money home. Focus on remote family protection, income replacement, and the risk of "what if something happens to me abroad". Acknowledge the sacrifice and the distance.',
  entrepreneur: 'Target audience: Filipino freelancer or solo business owner with no employer benefits. Focus on income unpredictability, no HMO, and business continuity.',
  business: 'Target audience: established Philippine business owner with employees. Focus on key-man risk, business succession, and obligation to protect staff.',
  hnw: 'Target audience: high-net-worth Filipino individual. Sophisticated readers managing significant assets. Focus ONLY on estate tax liquidity, legacy structures, wealth transfer, and business succession. NEVER write about basic coverage or generic protection framing. Tone: peer-level, precise, understated. No exclamation points.',
}

const BASE_SYSTEM_PROMPT = `You are writing nurture emails AS Jojo Cruzado — a licensed insurance advisor in the Philippines. Write in the first person. Every sentence should sound like Jojo typed it himself.

VOICE RULES:
- Write AS Jojo: "I", "me", "my". Never refer to Jojo in third person.
- Conversational but professional. Like a knowledgeable friend, not a newsletter.
- Each email should open with a personal observation, a short story, or something real Jojo notices with clients.
- Good openings: "I was talking to a client last week who...", "One thing I keep seeing is...", "I want to share something that came up recently..."
- Do NOT open with "{firstName}," or a generic greeting. Dive into the story.
- Each email must feel distinct — different hook, different story or angle.

CONTENT RULES:
- NEVER mention product names (no "Sun MaxiLink", "Sun Smarter Life", etc.)
- NEVER mention company or brand names
- NEVER make specific peso claims about premiums or coverage amounts
- Keep paragraphs SHORT: 2-3 sentences, mobile-first
- Use {variable} tokens where appropriate: {firstName}, {score}, {scoreLabel}, {gap}
- Subject lines: under 50 characters, personalized, no ALL CAPS
- NEVER use em dashes (—). Use periods, commas, or colons instead.

CTA TEXT RULES:
- The cta_text goes on a Calendly booking button. Must be clear and specific.
- Good: "Book a Free Chat", "Schedule a Quick Call", "Let's Talk This Week", "Book 30 Minutes Together"
- Bad: "Let's Talk", "Click Here", "Learn More", "Ask Me Anything" — too vague
- Keep it under 5 words. Vary across emails in the series.

AVAILABLE VARIABLES:
- {firstName} — lead's first name
- {score} — their protection score (1-100)
- {scoreLabel} — e.g. "Needs Attention", "Critical Gaps"
- {gap} — their biggest identified gap

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

  let body: { count: number; theme?: string; wait_days: number; startPosition: number; segment?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const count = Math.min(Math.max(body.count ?? 5, 1), 10)
  const waitDays = Math.min(Math.max(body.wait_days ?? 3, 1), 30)

  const segmentContext = body.segment ? SEGMENT_CONTEXT[body.segment] : null
  const systemPrompt = segmentContext
    ? `${BASE_SYSTEM_PROMPT}\n\nSEGMENT CONTEXT (critical — override generic Filipino framing with this):\n${segmentContext}`
    : BASE_SYSTEM_PROMPT

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
      { role: 'system', content: systemPrompt },
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

  const supabase = createServiceClient()
  const segments = body.segment ? [body.segment] : []
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
        segments,
      })
      .select()
      .single()
    if (!error && data) inserted.push(data)
  }

  return NextResponse.json({ templates: inserted })
}
