'use client'

import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="font-bold text-rose-500">Locafy Admin</Link>
          <p className="text-xs text-gray-600 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
            { label: 'Users', href: '/admin/users', icon: '👥' },
            { label: 'Shops', href: '/admin/shops', icon: '🏪' },
            { label: 'Orders', href: '/admin/orders', icon: '📦' },
            { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
          ].map(({ label, href, icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-rose-400 transition-colors">
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button onClick={() => logout('/admin')}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Platform management — coming in Phase 10.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: '—', color: 'bg-gray-800 text-gray-300' },
            { label: 'Active Shops', value: '—', color: 'bg-gray-800 text-gray-300' },
            { label: 'Orders Today', value: '—', color: 'bg-gray-800 text-gray-300' },
            { label: 'GMV (Month)', value: '—', color: 'bg-gray-800 text-gray-300' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-5 border border-gray-700`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm mt-1 opacity-60">{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
