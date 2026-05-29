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
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

export default function VendorLoginPage() {
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
      if (data.user.role !== 'VENDOR') {
        toast.error('This account is not a vendor account.')
        return
      }
      toast.success('Welcome back!')
      router.push('/vendor/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Vendor sign in"
      subtitle="Manage your shop, products, and orders"
      accentColor="bg-emerald-600"
      footerText="New vendor?"
      footerLinkLabel="Create a vendor account"
      footerLinkHref="/vendor/auth/signup"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Email address"
          type="email"
          placeholder="shop@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Link href="/vendor/auth/forgot-password" className="text-xs text-emerald-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-colors
              ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-400 bg-white'}`}
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span>
          ) : 'Sign in'}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400">
          <span className="bg-white px-3">or</span>
        </div>
      </div>

      <GoogleSignInButton role="VENDOR" redirectTo="/vendor/dashboard" />
    </AuthCard>
  )
}
