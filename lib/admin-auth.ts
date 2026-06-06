import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Timing-safe admin auth check. Returns a NextResponse error if auth fails, null if OK.
 * Usage: const err = checkAdminAuth(req); if (err) return err
 */
export function checkAdminAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 500 })
  }

  const header = req.headers.get('authorization') ?? ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : ''

  const secretBuf = Buffer.from(secret, 'utf8')
  const providedBuf = Buffer.from(provided, 'utf8')

  // Always compare same-length buffers to prevent timing leaks; also check length equality
  const lengthMatch = secretBuf.length === providedBuf.length
  const compareBuf = lengthMatch ? providedBuf : Buffer.alloc(secretBuf.length)
  const valid = timingSafeEqual(secretBuf, compareBuf) && lengthMatch

  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
