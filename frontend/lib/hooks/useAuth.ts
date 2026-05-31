'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore, type UserRole } from '@/store/authStore'
import { authApi } from '@/lib/api/auth'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore()
  const router = useRouter()

  const signup = async (payload: {
    name: string
    email: string
    password: string
    phone?: string
    role: UserRole
  }) => {
    const data = await authApi.signup(payload)
    setAuth(data.user, data.accessToken)
    return data
  }

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setAuth(data.user, data.accessToken)
    return data
  }

  const googleLogin = async (idToken: string, role: UserRole) => {
    const data = await authApi.googleSignIn(idToken, role)
    setAuth(data.user, data.accessToken)
    return data
  }

  const logout = async (redirectTo?: string) => {
    try {
      await authApi.logout()
    } catch {
      // Ignore errors — clear locally regardless
    }
    clearAuth()
    toast.success('Logged out')
    router.push(redirectTo ?? '/')
  }

  const refreshToken = async () => {
    try {
      const data = await authApi.refresh()
      setAuth(data.user, data.accessToken)
      return true
    } catch {
      clearAuth()
      return false
    }
  }

  return { user, accessToken, isLoggedIn: !!user, signup, login, googleLogin, logout, refreshToken, clearAuth }
}
