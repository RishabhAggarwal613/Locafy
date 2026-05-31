'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import LocationSwitcher from './LocationSwitcher'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { cartApi } from '@/lib/api/cart'

const NAV = [
  { label: 'Explore', href: '/customer/explore' },
  { label: 'Reels', href: '/customer/reels' },
  { label: 'Search', href: '/customer/search' },
  { label: 'Map', href: '/customer/map' },
  { label: 'Orders', href: '/customer/orders' },
]

export default function CustomerNavbar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { logout } = useAuth()

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user,
  })

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/customer/explore" className="font-bold text-indigo-600 shrink-0">Locafy</Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(href) ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {user && (
            <Link href="/customer/cart" className="relative p-2 text-gray-600 hover:text-indigo-600">
              🛒
              {(cart?.itemCount ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart!.itemCount}
                </span>
              )}
            </Link>
          )}
          <LocationSwitcher compact />
          {user ? (
            <>
              <Link href="/customer/profile" className="hidden sm:inline text-xs text-gray-500 hover:text-indigo-600">
                Saved
              </Link>
              <span className="hidden sm:inline text-xs text-gray-500 truncate max-w-[100px]">{user.name}</span>
              <button type="button" onClick={() => logout('/customer')} className="text-xs text-gray-500 hover:text-red-500">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/customer/auth" className="text-sm font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
