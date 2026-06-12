/**
 * Normalized public env vars for client and build-time checks.
 * Set these in Vercel → Project Settings → Environment Variables.
 */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/** Spring Boot API base URL (browser + SockJS). */
export function getBackendUrl(): string {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080')
}

/** SockJS endpoint — uses HTTPS in production (Vercel → api.locafy.in). */
export function getWsUrl(): string {
  return `${getBackendUrl()}/ws`
}

/** Required on Vercel for a working deployment (maps/payments still degrade gracefully if optional keys missing). */
export const REQUIRED_VERCEL_ENV = [
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_BACKEND_URL',
] as const

export const OPTIONAL_VERCEL_ENV = [
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
] as const

export function missingRequiredEnv(): string[] {
  return REQUIRED_VERCEL_ENV.filter((key) => !process.env[key]?.trim())
}
