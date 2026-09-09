import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

const VALID_SEGMENTS = ['pro', 'family', 'ofw', 'entrepreneur', 'business', 'hnw']
const MAX_ROWS = 500

interface RawRow {
  first_name?: unknown
  mobile?: unknown
  email?: unknown
  age?: unknown
  segment?: unknown
  event_tag?: unknown
}

interface SkipReason {
  row: number
  reason: string
}

// Bulk-insert leads parsed client-side from an uploaded Excel/CSV file (see
// BulkImportModal.tsx). Same validation rules as the single Add Lead form,
// applied per-row so one bad row doesn't fail the whole batch.
export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { rows?: RawRow[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const rows = Array.isArray(body.rows) ? body.rows : []
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows to import.' }, { status: 400 })
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows — max ${MAX_ROWS} per import.` }, { status: 400 })
  }

  const toInsert: Record<string, unknown>[] = []
  const skipped: SkipReason[] = []

  rows.forEach((raw, i) => {
    const rowNum = i + 1
    const firstName = typeof raw.first_name === 'string' ? raw.first_name.trim() : ''
    const mobile = typeof raw.mobile === 'string' ? raw.mobile.trim() : ''
    const email = typeof raw.email === 'string' ? raw.email.trim() : ''
    const segmentRaw = typeof raw.segment === 'string' ? raw.segment.trim().toLowerCase() : ''
    const eventTag = typeof raw.event_tag === 'string' ? raw.event_tag.trim() : ''

    if (!firstName || !mobile) {
      skipped.push({ row: rowNum, reason: 'Missing first name or mobile.' })
      return
    }

    let age: number | null = null
    if (raw.age !== undefined && raw.age !== null && raw.age !== '') {
      const n = typeof raw.age === 'number' ? raw.age : Number(raw.age)
      if (!Number.isInteger(n) || n < 18 || n > 120) {
        skipped.push({ row: rowNum, reason: 'Age must be a whole number between 18 and 120.' })
        return
      }
      age = n
    }

    const segment = VALID_SEGMENTS.includes(segmentRaw) ? segmentRaw : null
    if (segmentRaw && !segment) {
      skipped.push({ row: rowNum, reason: `Unrecognized segment "${segmentRaw}".` })
      return
    }

    toInsert.push({
      first_name: firstName,
      mobile,
      email: email || null,
      age,
      segment,
      status: 'new',
      source: 'manual',
      event_tag: eventTag || null,
    })
  })

  if (toInsert.length === 0) {
    return NextResponse.json({ inserted: 0, skipped }, { status: 200 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('funnel_leads').insert(toInsert).select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inserted: data?.length ?? toInsert.length, skipped })
}
