#!/usr/bin/env node
/**
 * Fail Vercel builds when required env vars are missing.
 * Local dev skips this check unless CHECK_ENV=1.
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

const onVercel = Boolean(process.env.VERCEL)
const strict = onVercel || process.env.CHECK_ENV === '1'

const message = `[check-env] Missing required env: ${missing.join(', ')}`

if (strict) {
  console.error(message)
  if (onVercel) {
    console.error('Add them in Vercel → Project Settings → Environment Variables.')
  } else {
    console.error('Copy frontend/.env.example to frontend/.env.local and fill in values.')
  }
  process.exit(1)
}

console.warn(`${message} (skipped — not on Vercel)`)
