'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/lib/hooks/useAuth'
import LocafyLogo from '@/components/shared/LocafyLogo'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Shops', href: '/admin/shops', icon: '🏪' },
  { label: 'Products', href: '/admin/products', icon: '📋' },
  { label: 'Orders', href: '/admin/orders', icon: '📦' },
  { label: 'Categories', href: '/admin/categories', icon: '🏷️' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-800">
        <LocafyLogo href="/" label="Locafy Admin" size="sm" labelClassName="text-rose-500 font-bold text-sm" />
        <p className="text-xs text-gray-600 mt-1 truncate">{user?.email}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-rose-400'
              }`}
            >
              <span>{icon}</span>{label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <button
          type="button"
          onClick={() => logout('/admin')}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
