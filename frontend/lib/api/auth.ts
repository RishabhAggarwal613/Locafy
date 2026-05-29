import apiClient from './client'
import type { AuthUser, UserRole } from '@/store/authStore'

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  phone?: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/signup', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload)
    return data
  },

  googleSignIn: async (idToken: string, role: UserRole): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/google', { idToken, role })
    return data
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh')
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout')
  },

  linkGoogle: async (idToken: string): Promise<void> => {
    await apiClient.post('/api/auth/google/link', { idToken })
  },

  unlinkGoogle: async (): Promise<void> => {
    await apiClient.delete('/api/auth/google/unlink')
  },
}
