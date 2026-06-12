'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/lib/hooks/useAuth'
import LocafyLogo from '@/components/shared/LocafyLogo'

const NAV = [
  { label: 'Dashboard', href: '/vendor/dashboard', icon: '📊' },
  { label: 'Shop Profile', href: '/vendor/shop', icon: '🏪' },
  { label: 'Products', href: '/vendor/products', icon: '📦' },
  { label: 'Reels', href: '/vendor/reels', icon: '🎬' },
  { label: 'Orders', href: '/vendor/orders', icon: '🛒' },
  { label: 'History', href: '/vendor/history', icon: '📋', disabled: true },
  { label: 'Finance', href: '/vendor/finance', icon: '💰' },
]

export default function VendorSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100">
        <LocafyLogo href="/" label="Locafy Vendor" size="sm" labelClassName="text-emerald-600 font-bold text-sm" />
        <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ label, href, icon, disabled }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          if (disabled) {
            return (
              <span key={href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 cursor-not-allowed">
                <span>{icon}</span>{label}
                <span className="ml-auto text-[10px] uppercase tracking-wide">Soon</span>
              </span>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <span>{icon}</span>{label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => logout('/vendor')}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
