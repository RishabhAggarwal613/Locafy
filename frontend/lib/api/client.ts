import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/signup', '/api/auth/google', '/api/auth/refresh']

function isAuthRequest(url?: string): boolean {
  if (!url) return false
  return AUTH_ENDPOINTS.some((path) => url.includes(path))
}

function loginRedirectForCurrentPath(): string {
  if (typeof window === 'undefined') return '/customer/auth'
  const path = window.location.pathname
  if (path.startsWith('/vendor')) return '/vendor/auth'
  if (path.startsWith('/delivery')) return '/delivery/auth'
  if (path.startsWith('/admin')) return '/admin/auth'
  return '/customer/auth'
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Inject JWT access token from store on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('locafy-auth')
    if (raw) {
      try {
        const state = JSON.parse(raw)
        const token = state?.state?.accessToken
        if (token) config.headers.Authorization = `Bearer ${token}`
      } catch {}
    }
  }
  return config
})

// On 401, clear auth state (skip auth endpoints so login errors can be shown)
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const requestUrl = error.config?.url as string | undefined

    if (error.response?.status === 401 && typeof window !== 'undefined' && !isAuthRequest(requestUrl)) {
      localStorage.removeItem('locafy-auth')
      document.cookie = 'locafy-token=; path=/; max-age=0'
      window.location.href = loginRedirectForCurrentPath()
    }
    return Promise.reject(error)
  }
)

export default apiClient
