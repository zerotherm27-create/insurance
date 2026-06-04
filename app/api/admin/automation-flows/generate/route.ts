import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { FlowDefinition } from '@/types/automation-flow'

function auth(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SYSTEM_PROMPT = `You are an email automation flow designer for Filipino insurance advisor Jojo.

You generate email automation flows as JSON. The flow is a directed acyclic graph with nodes and edges.

Available node types:
- trigger: Entry point. Always exactly one. data: { type: "trigger", label: "New Lead", triggerType: "new_lead" }
- wait: Pause before next step. data: { type: "wait", label: "Wait X days", days: number (1-90) }
- send_email: Send an email. data: { type: "send_email", label: string, templateId: string }
- condition: Branch Yes/No. data: { type: "condition", label: string, conditionType: "lead_status", statusValues: LeadStatus[] }

Available templateIds (you MUST use one of these exactly):
- "followup_1" — "Did you review your results?" (Day 1, nurture)
- "followup_2" — "The #1 mistake Filipinos make" (Day 3, educational)
- "followup_3" — "Ready to close your gaps?" (Day 7, conversion)
- "followup_4" — "A story for you" (Day 14, social proof)

Available LeadStatus values: "new", "contacted", "engaged", "decision_pending", "closed_won", "closed_lost"

For condition nodes:
- statusValues = the statuses that route to the YES (left/green) branch
- The NO (right/red) branch is everything else

Layout rules:
- Start trigger at position {x:340, y:40}
- Space nodes ~130px apart vertically
- For branches after a condition, put YES branch at x~100, NO branch at x~560
- Nodes in the same branch share the same x coordinate

Edge rules:
- Normal edges: { id, source, target } (no sourceHandle)
- Condition edges MUST have sourceHandle: "yes" or "no"

Output ONLY valid JSON matching this TypeScript type:
{
  nodes: Array<{ id: string, type: string, position: {x:number, y:number}, data: object }>,
  edges: Array<{ id: string, source: string, target: string, sourceHandle?: "yes"|"no" }>
}

No explanation, no markdown, just the raw JSON object.`

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { prompt: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2000,
    temperature: 0.3,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: body.prompt },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? ''

  let flow: FlowDefinition
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    flow = JSON.parse(cleaned) as FlowDefinition
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 })
  }

  return NextResponse.json({ flow })
}
