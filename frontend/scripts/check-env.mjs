#!/usr/bin/env node
/**
 * Warn when required env vars are missing during build.
 * Run `npm run check-env` (CHECK_ENV=1) to fail locally before deploy.
 */

const REQUIRED = [
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_BACKEND_URL',
]

const missing = REQUIRED.filter((key) => !process.env[key]?.trim())

if (missing.length === 0) {
  console.log('[check-env] All required environment variables are set.')
  process.exit(0)
}

const message = `[check-env] Missing required env: ${missing.join(', ')}`
const strict = process.env.CHECK_ENV === '1'

if (strict) {
  console.error(message)
  console.error('Copy frontend/.env.example to frontend/.env.local and fill in values.')
  console.error('Or add them in Vercel → Project Settings → Environment Variables.')
  process.exit(1)
}

console.warn(message)
if (process.env.VERCEL) {
  console.warn('[check-env] Build continues — add env vars in Vercel for auth, API, and maps to work.')
} else {
  console.warn('[check-env] Build continues — set vars in .env.local for full functionality.')
}
