'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import { adminApi, type AdminAnalytics } from '@/lib/api/admin'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Platform overview and pending actions.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Customers', value: stats?.totalCustomers, color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
          { label: 'Vendors', value: stats?.totalVendors, color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
          { label: 'Orders Today', value: stats?.ordersToday, color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
          { label: 'GMV Today', value: stats ? `₹${Math.round(stats.gmvToday)}` : undefined, color: 'bg-orange-500/10 text-orange-300 border-orange-500/20' },
          { label: 'Active Shops', value: stats?.activeShops, color: 'bg-gray-800 text-gray-300 border-gray-700' },
          { label: 'Pending Verification', value: stats?.shopsPendingVerification, color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
          { label: 'Delivery Online', value: stats?.deliveryPartnersOnline, color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
          { label: 'GMV (Month)', value: stats ? `₹${Math.round(stats.gmvThisMonth)}` : undefined, color: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-5 border`}>
            <p className="text-2xl font-bold">{loading ? '—' : (value ?? 0)}</p>
            <p className="text-sm mt-1 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Shops Pending Verification</h2>
          <Link href="/admin/shops?pending=1" className="text-sm text-rose-400 hover:text-rose-300">View all →</Link>
        </div>
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading...</p>
        ) : !stats?.pendingShops?.length ? (
          <p className="text-gray-500">No shops awaiting verification.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-2 pr-4">Shop</th>
                  <th className="pb-2 pr-4">City</th>
                  <th className="pb-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingShops.map((shop) => (
                  <tr key={shop.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="py-3 pr-4">{shop.name}</td>
                    <td className="py-3 pr-4">{shop.city ?? '—'}</td>
                    <td className="py-3">{shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
