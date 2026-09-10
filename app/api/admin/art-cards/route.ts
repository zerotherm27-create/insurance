import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { uploadArtCard, validateArtCardFile } from '@/lib/blob'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('art_cards')
    .select('id, url, filename, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cards: data })
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const validationError = validateArtCardFile(file)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const { url, pathname } = await uploadArtCard(file)

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('art_cards')
    .insert({ url, blob_pathname: pathname, filename: file.name })
    .select('id, url, filename, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ card: data }, { status: 201 })
}
