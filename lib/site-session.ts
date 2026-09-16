import { UAParser } from 'ua-parser-js'
import { isBot } from 'ua-parser-js/bot-detection'

export const SESSION_COOKIE_NAME = 'sma_session'
export const SESSION_COOKIE_MAX_AGE = 60 * 30 // 30 minutes, sliding — inactivity window that defines a "session"

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

interface ParsedUserAgent {
  deviceType: DeviceType
  os: string | null
  browser: string | null
  isBot: boolean
}

// Any UA that isn't a real browser gets isBot: true, so callers can skip
// writing a row entirely rather than storing device_type: 'unknown' noise.
export function parseUserAgent(uaString: string | null): ParsedUserAgent {
  if (!uaString) {
    return { deviceType: 'unknown', os: null, browser: null, isBot: true }
  }

  const result = UAParser(uaString)
  if (isBot(result)) {
    return { deviceType: 'unknown', os: result.os.name ?? null, browser: result.browser.name ?? null, isBot: true }
  }

  const rawType = result.device.type
  const deviceType: DeviceType =
    rawType === 'mobile' ? 'mobile' : rawType === 'tablet' ? 'tablet' : rawType ? 'unknown' : 'desktop'

  return {
    deviceType,
    os: result.os.name ?? null,
    browser: result.browser.name ?? null,
    isBot: false,
  }
}

export interface GeoInfo {
  country: string | null
  region: string | null
  city: string | null
}

// Populated by Vercel's edge network in production; absent in local dev.
export function getGeoFromHeaders(headers: Headers): GeoInfo {
  const country = headers.get('x-vercel-ip-country')
  const region = headers.get('x-vercel-ip-country-region')
  const rawCity = headers.get('x-vercel-ip-city')
  return {
    country,
    region,
    city: rawCity ? decodeURIComponent(rawCity) : null,
  }
}
