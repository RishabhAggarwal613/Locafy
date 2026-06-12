'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import LocafyLogo from '@/components/shared/LocafyLogo'

const NAV = [
  { label: 'Dashboard', href: '/delivery/dashboard', icon: '📊' },
  { label: 'Orders', href: '/delivery/orders', icon: '🛵' },
  { label: 'History', href: '/delivery/history', icon: '📋' },
  { label: 'Finance', href: '/delivery/finance', icon: '💰' },
]

export default function DeliveryShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <LocafyLogo href="/delivery" label="Locafy Delivery" size="sm" labelClassName="text-amber-600 font-bold text-sm" />
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ label, href, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
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
            onClick={() => logout('/delivery')}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-8 overflow-auto">{children}</main>
    </div>
  )
}
