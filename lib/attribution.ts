// lib/attribution.ts
export const ATTRIBUTION_COOKIE_NAME = 'sma_attribution'
export const ATTRIBUTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number]
export type AttributionCookie = Partial<Record<UtmParamKey, string>>

// Parses the sma_attribution cookie value. Returns {} for any malformed,
// missing, or unexpected-shape input rather than throwing, since a bad
// cookie should never break the funnel.
export function parseAttributionCookie(raw: string | undefined): AttributionCookie {
  if (!raw) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (typeof parsed !== 'object' || parsed === null) return {}

  const result: AttributionCookie = {}
  for (const key of UTM_PARAM_KEYS) {
    const value = (parsed as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.length > 0) {
      result[key] = value
    }
  }
  return result
}
