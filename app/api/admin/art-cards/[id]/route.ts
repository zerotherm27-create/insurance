import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { deleteArtCard } from '@/lib/blob'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = createServiceClient()

  const { data: card } = await supabase
    .from('art_cards')
    .select('blob_pathname')
    .eq('id', id)
    .single()

  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deleteArtCard(card.blob_pathname)

  const { error } = await supabase.from('art_cards').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
