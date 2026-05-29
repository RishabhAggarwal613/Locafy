import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

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

// On 401, clear auth state
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('locafy-auth')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
