'use client'

import { forwardRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/hooks/useAuth'
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton'
import AuthShell from '@/components/shared/auth/AuthShell'
import type { AuthMode, RoleAuthConfig } from '@/lib/auth/roleAuthConfig'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number').optional().or(z.literal('')),
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

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>

interface Props {
  config: RoleAuthConfig
  marketingHref: string
  initialMode?: AuthMode
}

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  ringClass: string
  dark?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { error, placeholder, ringClass, dark, ...inputProps },
  ref,
) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <div className="relative">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          placeholder={placeholder ?? 'Your password'}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-colors pr-10
            ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'}
            ${error ? 'border-red-400 bg-red-50' : ringClass}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${dark ? 'text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  dark?: boolean
  ringClass: string
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, dark, ringClass, ...props },
  ref,
) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
      <input
        ref={ref}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-colors
          ${dark ? 'bg-gray-800 text-white border-gray-700 placeholder:text-gray-500' : 'bg-white border-gray-200'}
          ${error ? 'border-red-400 bg-red-50' : ringClass}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default function RoleAuthPanel({ config, marketingHref, initialMode = 'login' }: Props) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const { login, signup, clearAuth } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { accent, dark } = config

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { phone: '' },
  })

  const handleLogin = async (values: LoginValues) => {
    setLoading(true)
    try {
      const data = await login(values.email.trim().toLowerCase(), values.password)
      if (data.user.role !== config.role) {
        clearAuth()
        toast.error(`This account is registered as ${data.user.role.toLowerCase()}. Use the correct app to sign in.`)
        return
      }
      toast.success('Welcome back!')
      router.push(config.redirectAfterLogin)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Incorrect email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (values: SignupValues) => {
    setLoading(true)
    try {
      await signup({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone: values.phone?.trim() || undefined,
        role: config.role,
      })
      toast.success('Account created successfully!')
      router.push(config.redirectAfterSignup)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputFocus = accent.inputFocus

  return (
    <AuthShell config={config} marketingHref={marketingHref}>
      <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm ${dark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="mb-6">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark ? 'text-gray-500' : accent.text}`}>
            {config.appLabel}
          </p>
          <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            {mode === 'login'
              ? `Sign in to continue to the ${config.appLabel.toLowerCase()}`
              : `Get started with Locafy ${config.role === 'DELIVERY' ? 'delivery' : config.role.toLowerCase()}`}
          </p>
        </div>

        {config.allowSignup ? (
          <div className={`flex rounded-xl p-1 mb-6 ${dark ? 'bg-gray-800/80' : 'bg-gray-100'}`}>
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? accent.tabActive : dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
        ) : null}

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder={config.loginEmailPlaceholder}
              dark={dark}
              ringClass={inputFocus}
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register('email')}
            />
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <PasswordInput
                {...loginForm.register('password')}
                error={loginForm.formState.errors.password?.message}
                ringClass={inputFocus}
                dark={dark}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${accent.button} ${accent.buttonHover}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <Field label="Full name" placeholder="Your name" autoComplete="name" dark={dark} ringClass={inputFocus} error={signupForm.formState.errors.name?.message} {...signupForm.register('name')} />
            <Field label="Email" type="email" autoComplete="email" placeholder={config.loginEmailPlaceholder} dark={dark} ringClass={inputFocus} error={signupForm.formState.errors.email?.message} {...signupForm.register('email')} />
            {config.role !== 'CUSTOMER' && (
              <Field label="Phone number" type="tel" autoComplete="tel" placeholder="+91 98765 43210" dark={dark} ringClass={inputFocus} error={signupForm.formState.errors.phone?.message} {...signupForm.register('phone')} />
            )}
            {config.role === 'CUSTOMER' && (
              <Field label="Phone (optional)" type="tel" placeholder="+91 98765 43210" dark={dark} ringClass={inputFocus} error={signupForm.formState.errors.phone?.message} {...signupForm.register('phone')} />
            )}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <PasswordInput {...signupForm.register('password')} error={signupForm.formState.errors.password?.message} placeholder="Min 8 chars, upper, lower, number" ringClass={inputFocus} dark={dark} />
              <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Use 8+ characters with uppercase, lowercase, and a number.</p>
            </div>
            <Field label="Confirm password" type="password" placeholder="Repeat password" dark={dark} ringClass={inputFocus} error={signupForm.formState.errors.confirmPassword?.message} {...signupForm.register('confirmPassword')} />
            <button type="submit" disabled={loading} className={`w-full text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${accent.button} ${accent.buttonHover}`}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        {config.showGoogle && mode === 'login' && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`} /></div>
              <div className="relative flex justify-center text-xs text-gray-400"><span className={`px-3 ${dark ? 'bg-gray-900' : 'bg-white'}`}>or continue with</span></div>
            </div>
            <GoogleSignInButton role={config.role} redirectTo={config.redirectAfterLogin} />
          </>
        )}

        {config.showGoogle && mode === 'signup' && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`} />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400">
                <span className={`px-3 ${dark ? 'bg-gray-900/80' : 'bg-white'}`}>or</span>
              </div>
            </div>
            <GoogleSignInButton role={config.role} redirectTo={config.redirectAfterSignup} label="Sign up with Google" />
          </>
        )}

        {!config.allowSignup && config.footnote && (
          <p className={`text-center text-xs mt-4 leading-relaxed ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {config.footnote}
          </p>
        )}
      </div>

      <div className={`text-center text-xs mt-6 space-y-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>
          <Link href={marketingHref} className={`hover:underline ${dark ? 'text-gray-400' : accent.text}`}>
            View {config.appLabel.toLowerCase()} overview
          </Link>
        </p>
        <p>
          <Link href="/" className="hover:underline">Back to Locafy home</Link>
        </p>
      </div>
    </AuthShell>
  )
}
