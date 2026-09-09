import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import type { CustomEmailCriteria, CustomEmailContent } from '@/lib/custom-email-blast'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('scheduled_emails')
    .select('id, criteria, content, scheduled_at, status, result, created_at, sent_at')
    .order('scheduled_at', { ascending: true })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scheduled: data })
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { criteria?: CustomEmailCriteria; content?: CustomEmailContent; scheduled_at?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const content = body.content
  if (!content || !content.subject || !content.heading || !content.ctaText) {
    return NextResponse.json({ error: 'Missing email content' }, { status: 400 })
  }

  const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at) : null
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: 'Invalid scheduled_at' }, { status: 400 })
  }
  if (scheduledAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Scheduled time must be in the future.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('scheduled_emails')
    .insert({
      criteria: body.criteria ?? {},
      content,
      scheduled_at: scheduledAt.toISOString(),
      status: 'pending',
    })
    .select('id, criteria, content, scheduled_at, status, result, created_at, sent_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scheduled: data }, { status: 201 })
}
