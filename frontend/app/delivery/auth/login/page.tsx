'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

export default function DeliveryLoginPage() {
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
      if (data.user.role !== 'DELIVERY') {
        toast.error('This account is not a delivery partner account.')
        return
      }
      toast.success('Welcome back!')
      router.push('/delivery/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Partner sign in"
      subtitle="Accept deliveries and track your earnings"
      accentColor="bg-amber-500"
      footerText="New delivery partner?"
      footerLinkLabel="Join as a partner"
      footerLinkHref="/delivery/auth/signup"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email address" type="email" placeholder="partner@example.com" error={errors.email?.message} {...register('email')} />
        <FormField label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

        <button type="submit" disabled={loading}
          className="w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span> : 'Sign in'}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-3">or</span></div>
      </div>
      <GoogleSignInButton role="DELIVERY" redirectTo="/delivery/dashboard" />
    </AuthCard>
  )
}
