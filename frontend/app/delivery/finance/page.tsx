'use client'

import { useQuery } from '@tanstack/react-query'
import DeliveryShell from '@/components/delivery/DeliveryShell'
import { deliveryApi } from '@/lib/api/delivery'

export default function DeliveryFinancePage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['delivery-dashboard'],
    queryFn: () => deliveryApi.getDashboard(),
  })

  const { data: history } = useQuery({
    queryKey: ['delivery-history'],
    queryFn: () => deliveryApi.listHistory(0, 10),
  })

  return (
    <DeliveryShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finance</h1>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-green-800">₹{dashboard?.todayEarnings ?? 0}</p>
              <p className="text-sm text-green-700 mt-1">Earned today · {dashboard?.todayDeliveries ?? 0} deliveries</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-emerald-800">₹{dashboard?.totalEarnings ?? 0}</p>
              <p className="text-sm text-emerald-700 mt-1">All-time · {dashboard?.totalDeliveries ?? 0} deliveries</p>
            </div>
          </div>

          <h2 className="font-semibold text-gray-900 mb-3">Recent payouts</h2>
          {!history?.content.length ? (
            <p className="text-gray-500 text-sm">Complete deliveries to see earnings here.</p>
          ) : (
            <div className="space-y-2">
              {history.content.map(({ order, partnerEarning }) => (
                <div key={order.id} className="flex justify-between text-sm bg-white border border-gray-100 rounded-lg px-4 py-3">
                  <span className="text-gray-700">{order.orderNumber}</span>
                  <span className="font-medium text-green-700">+₹{partnerEarning ?? order.deliveryFee}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6">UPI withdrawals coming in a future update. Earnings reflect delivery fees per completed order.</p>
        </>
      )}
    </DeliveryShell>
  )
}
