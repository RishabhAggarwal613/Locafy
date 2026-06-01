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

export function getWsUrl(): string {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/ws`
}
