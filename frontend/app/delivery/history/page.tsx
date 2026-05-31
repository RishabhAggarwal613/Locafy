'use client'

import { useQuery } from '@tanstack/react-query'
import DeliveryShell from '@/components/delivery/DeliveryShell'
import { deliveryApi } from '@/lib/api/delivery'

export default function DeliveryHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-history'],
    queryFn: () => deliveryApi.listHistory(),
  })

  return (
    <DeliveryShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery history</h1>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : !data?.content.length ? (
        <p className="text-gray-500">No completed deliveries yet.</p>
      ) : (
        <div className="space-y-3">
          {data.content.map(({ order, partnerEarning }) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.shopName}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-sm font-semibold text-green-700">+₹{partnerEarning ?? order.deliveryFee}</p>
            </div>
          ))}
        </div>
      )}
    </DeliveryShell>
  )
}
