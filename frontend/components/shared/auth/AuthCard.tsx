import Link from 'next/link'
import LocafyLogo from '@/components/shared/LocafyLogo'

interface Props {
  title: string
  subtitle: string
  footerText: string
  footerLinkLabel: string
  footerLinkHref: string
  children: React.ReactNode
}

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <LocafyLogo href="/" className="justify-center" labelClassName="text-xl text-gray-900 font-bold" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          {children}
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          {footerText}{' '}
          <Link href={footerLinkHref} className="font-medium text-gray-900 hover:underline">
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
