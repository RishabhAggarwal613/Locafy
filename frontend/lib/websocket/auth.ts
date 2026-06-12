export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('locafy-auth')
    if (!raw) return null
    const state = JSON.parse(raw)
    return state?.state?.accessToken ?? null
  } catch {
    return null
  }
}

import { getWsUrl as resolveWsUrl } from '@/lib/env'

export function getWsUrl(): string {
  return resolveWsUrl()
}
