'use client'

import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

export default function DeliveryDashboardPage() {
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="font-bold text-amber-600">Locafy Delivery</Link>
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: 'Dashboard', href: '/delivery/dashboard', icon: '📊' },
            { label: 'Current Orders', href: '/delivery/orders', icon: '🛵' },
            { label: 'History', href: '/delivery/history', icon: '📋' },
            { label: 'Finance', href: '/delivery/finance', icon: '💰' },
          ].map(({ label, href, icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-colors">
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={() => logout('/delivery')}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.name ?? 'Partner'}!</h1>
        <p className="text-gray-500 mb-8">Your delivery dashboard — coming in Phase 7.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Today\'s Deliveries', value: '—', color: 'bg-amber-50 text-amber-700' },
            { label: 'Today\'s Earnings', value: '—', color: 'bg-green-50 text-green-700' },
            { label: 'Total Deliveries', value: '—', color: 'bg-blue-50 text-blue-700' },
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
