'use client'

import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

export default function VendorDashboardPage() {
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="font-bold text-emerald-600">Locafy Vendor</Link>
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: 'Dashboard', href: '/vendor/dashboard', icon: '📊' },
            { label: 'Shop Profile', href: '/vendor/shop', icon: '🏪' },
            { label: 'Products', href: '/vendor/products', icon: '📦' },
            { label: 'Reels', href: '/vendor/reels', icon: '🎬' },
            { label: 'Orders', href: '/vendor/orders', icon: '🛒' },
            { label: 'History', href: '/vendor/history', icon: '📋' },
            { label: 'Finance', href: '/vendor/finance', icon: '💰' },
          ].map(({ label, href, icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={() => logout('/vendor')}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.name ?? 'Vendor'}!</h1>
        <p className="text-gray-500 mb-8">Your shop dashboard — coming in Phase 4.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: '—', color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Active Products', value: '—', color: 'bg-blue-50 text-blue-700' },
            { label: 'Today\'s Revenue', value: '—', color: 'bg-purple-50 text-purple-700' },
            { label: 'Reel Views', value: '—', color: 'bg-orange-50 text-orange-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-5`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm mt-1 opacity-70">{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
