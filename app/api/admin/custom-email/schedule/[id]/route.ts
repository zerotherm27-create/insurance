import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

// Cancels a pending scheduled send. Already-sent or already-canceled rows
// are left alone (kept as history) rather than deleted.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('scheduled_emails')
    .update({ status: 'canceled' })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found or already sent/canceled.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
