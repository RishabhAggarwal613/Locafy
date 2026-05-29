'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthCard } from '@/components/shared/auth/AuthCard'
import { FormField } from '@/components/shared/auth/FormField'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

export default function AdminLoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const data = await login(values.email, values.password)
      if (data.user.role !== 'ADMIN') {
        toast.error('Access denied. Admin credentials required.')
        return
      }
      toast.success('Welcome, Admin.')
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl text-white">Locafy</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Admin portal</h1>
          <p className="mt-1 text-sm text-gray-500">Restricted access — authorised personnel only</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="admin@locafy.in"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-colors bg-gray-800 text-white
                  ${errors.email ? 'border-red-500' : 'border-gray-700 focus:border-rose-500'}`}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-colors bg-gray-800 text-white
                  ${errors.password ? 'border-red-500' : 'border-gray-700 focus:border-rose-500'}`}
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Access admin dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs text-gray-600">
          Admin accounts are provisioned by the platform team.
        </p>
      </div>
    </div>
  )
}
