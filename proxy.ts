// proxy.ts
// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`
// (exports `proxy` instead of `middleware`). See:
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ATTRIBUTION_COOKIE_MAX_AGE,
  ATTRIBUTION_COOKIE_NAME,
  UTM_PARAM_KEYS,
} from '@/lib/attribution'

export function proxy(request: NextRequest) {
  // First-touch: never overwrite an existing attribution cookie.
  if (request.cookies.has(ATTRIBUTION_COOKIE_NAME)) {
    return NextResponse.next()
  }

  const params = request.nextUrl.searchParams
  const attribution: Record<string, string> = {}
  for (const key of UTM_PARAM_KEYS) {
    const value = params.get(key)
    if (value) attribution[key] = value
  }

  if (Object.keys(attribution).length === 0) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  response.cookies.set(ATTRIBUTION_COOKIE_NAME, JSON.stringify(attribution), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
  })
  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
}
