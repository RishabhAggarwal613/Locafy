'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import VendorShell from '@/components/vendor/VendorShell'
import { vendorApi, type VendorDashboard } from '@/lib/api/shops'
import { useAuthStore } from '@/store/authStore'

export default function VendorDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<VendorDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorApi.getDashboard()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  return (
    <VendorShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.name ?? 'Vendor'}!</h1>
      <p className="text-gray-500 mb-8">
        {stats?.hasShop ? `Managing ${stats.shopName}` : 'Set up your shop to get started.'}
      </p>

      {!loading && !stats?.hasShop && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-emerald-900">You haven&apos;t created a shop yet</p>
            <p className="text-sm text-emerald-700 mt-1">Create your shop profile to start listing products.</p>
          </div>
          <Link href="/vendor/shop" className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 text-center">
            Create Shop
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: loading ? '—' : String(stats?.totalProducts ?? 0), color: 'bg-blue-50 text-blue-700' },
          { label: 'Active Products', value: loading ? '—' : String(stats?.activeProducts ?? 0), color: 'bg-emerald-50 text-emerald-700' },
          { label: "Today's Orders", value: loading ? '—' : String(stats?.todayOrders ?? 0), color: 'bg-purple-50 text-purple-700' },
          { label: "Today's Revenue", value: loading ? '—' : `₹${stats?.todayRevenue ?? 0}`, color: 'bg-orange-50 text-orange-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-5`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm mt-1 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/vendor/shop" className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          {stats?.hasShop ? 'Edit Shop' : 'Create Shop'}
        </Link>
        <Link href="/vendor/products/new" className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
          + Add Product
        </Link>
        <Link href="/vendor/products" className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          View Products
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-8">Orders and revenue stats will populate in Phase 6.</p>
    </VendorShell>
  )
}
