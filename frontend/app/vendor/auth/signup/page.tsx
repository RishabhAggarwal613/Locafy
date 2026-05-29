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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[a-z]/, 'Include a lowercase letter')
    .regex(/\d/, 'Include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

export default function VendorSignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await signup({ name: values.name, email: values.email, password: values.password, phone: values.phone, role: 'VENDOR' })
      toast.success('Vendor account created! Set up your shop.')
      router.push('/vendor/shop')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create vendor account"
      subtitle="Start selling to customers in your locality"
      accentColor="bg-emerald-600"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/vendor/auth/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
        <FormField label="Email address" type="email" placeholder="shop@example.com" error={errors.email?.message} {...register('email')} />
        <FormField label="Phone number" type="tel" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
        <FormField label="Password" type="password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
        <FormField label="Confirm password" type="password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <button type="submit" disabled={loading}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-2">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</span> : 'Create vendor account'}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-3">or</span></div>
      </div>
      <GoogleSignInButton role="VENDOR" redirectTo="/vendor/dashboard" label="Sign up with Google" />
    </AuthCard>
  )
}
