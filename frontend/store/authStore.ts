import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'DELIVERY' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  isVerified: boolean
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, accessToken: string) => void
  clearAuth: () => void
  updateUser: (partial: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'locafy-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
)
