'use client'

import { useQuery } from '@tanstack/react-query'
import VendorShell from '@/components/vendor/VendorShell'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { vendorApi } from '@/lib/api/shops'

export default function VendorFinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-finance'],
    queryFn: () => vendorApi.getFinanceSummary(),
  })

  return (
    <VendorShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finance</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data ? (
        <p className="text-gray-500">Unable to load finance summary.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{data.shopName}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Revenue today', value: `₹${Math.round(data.todayRevenue)}`, sub: `${data.todayOrders} orders` },
              { label: 'Revenue this month', value: `₹${Math.round(data.monthRevenue)}`, sub: `${data.monthOrders} orders` },
              { label: 'All-time revenue', value: `₹${Math.round(data.totalRevenue)}`, sub: `${data.totalOrders} orders` },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-600 mt-1">{label}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 max-w-md">
            <p className="text-sm text-orange-800 font-medium">Platform fees collected</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">₹{Math.round(data.platformFeesCollected)}</p>
            <p className="text-xs text-orange-700 mt-2">Payout requests coming in a future update.</p>
          </div>
        </>
      )}
    </VendorShell>
  )
}
