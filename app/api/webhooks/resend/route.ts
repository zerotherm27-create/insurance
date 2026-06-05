import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Resend uses Svix for webhook delivery. Verification:
// signed_content = "{svix-id}.{svix-timestamp}.{raw_body}"
// signature      = HMAC-SHA256(base64_decode(secret_without_whsec_prefix), signed_content)
// compare with   each "v1,<base64>" entry in svix-signature header

function verifySignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET ?? ''
  if (!secret) return false

  const msgId        = headers.get('svix-id')
  const msgTimestamp = headers.get('svix-timestamp')
  const msgSignature = headers.get('svix-signature')
  if (!msgId || !msgTimestamp || !msgSignature) return false

  // Reject timestamps older than 5 minutes
  const ts = Number(msgTimestamp)
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false

  const secretBytes  = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const toSign       = `${msgId}.${msgTimestamp}.${rawBody}`
  const computed     = createHmac('sha256', secretBytes).update(toSign).digest('base64')
  const signatures   = msgSignature.split(' ').map((s) => s.replace(/^v1,/, ''))
  return signatures.some((sig) => sig === computed)
}

// Resend event types we care about
const TRACKED_EVENTS = new Set(['email.opened', 'email.delivered', 'email.bounced', 'email.clicked'])

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!verifySignature(rawBody, req.headers)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: {
    type: string
    data: {
      email_id?: string
      tags?: Record<string, string>
      created_at?: string
    }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!TRACKED_EVENTS.has(payload.type)) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const leadId     = payload.data?.tags?.lead_id
  const templateId = payload.data?.tags?.template_id ?? null

  if (!leadId) {
    // Email sent before tagging was introduced — ignore gracefully
    return NextResponse.json({ ok: true, skipped: true })
  }

  // Strip "email." prefix → "opened" | "delivered" | "bounced" | "clicked"
  const eventType  = payload.type.replace('email.', '')
  const occurredAt = payload.data?.created_at ?? new Date().toISOString()

  const supabase = createServiceClient()
  const { error } = await supabase.from('email_events').insert({
    lead_id:         leadId,
    resend_email_id: payload.data?.email_id ?? null,
    event_type:      eventType,
    template_id:     templateId,
    occurred_at:     occurredAt,
  })

  if (error) {
    console.error('email_events insert error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
