import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { applyNurtureSkip, loadNurtureContext, resolveLead } from '@/lib/nurture-skip'

const MAX_LEADS = 200

interface Skipped {
  id: string
  reason: string
}

// Skip to nurture for many leads at once. `position` is a nurture email
// position, or "next" to start each lead at the next email they are due.
// Leads that can't take it (closed, no email, no flow, not eligible) are
// skipped and reported, so one bad lead never fails the batch.
export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const body = await req.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body.leadIds) ? body.leadIds.filter((i: unknown) => typeof i === 'string') : []
  const wantsNext = body.position === 'next'
  const position = Number(body.position)
  if (ids.length === 0) return NextResponse.json({ error: 'No leads selected' }, { status: 400 })
  if (ids.length > MAX_LEADS) {
    return NextResponse.json({ error: `Too many leads. Max ${MAX_LEADS} at a time.` }, { status: 400 })
  }
  if (!wantsNext && !Number.isInteger(position)) {
    return NextResponse.json({ error: 'Choose a nurture email' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const ctx = await loadNurtureContext(supabase)
  let moved = 0
  const skipped: Skipped[] = []

  for (const id of ids) {
    const r = await resolveLead(supabase, ctx, id)
    if ('error' in r) {
      skipped.push({ id, reason: r.error })
      continue
    }

    const target = wantsNext
      ? r.nurture.options.find((o) => o.position > r.nurture.sentThrough)?.position
      : r.nurture.options.find((o) => o.position === position)?.position
    if (target === undefined) {
      skipped.push({ id, reason: wantsNext ? 'No nurture email left for this lead' : 'Not eligible for that nurture email' })
      continue
    }

    const failure = await applyNurtureSkip(supabase, id, r, target)
    if (failure) skipped.push({ id, reason: failure })
    else moved++
  }

  return NextResponse.json({ moved, skipped })
}
