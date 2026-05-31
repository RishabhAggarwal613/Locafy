'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DeliveryShell from '@/components/delivery/DeliveryShell'
import { deliveryApi } from '@/lib/api/delivery'
import { useDeliveryPoolAlerts } from '@/lib/hooks/useDeliveryTracking'

export default function DeliveryOrdersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') === 'active' ? 'active' : 'available'
  const queryClient = useQueryClient()

  useDeliveryPoolAlerts(() => {
    queryClient.invalidateQueries({ queryKey: ['delivery-available'] })
  })

  const { data: available, isLoading: loadingAvailable } = useQuery({
    queryKey: ['delivery-available'],
    queryFn: () => deliveryApi.listAvailable(),
    enabled: tab === 'available',
  })

  const { data: active, isLoading: loadingActive } = useQuery({
    queryKey: ['delivery-active'],
    queryFn: () => deliveryApi.listActive(),
    enabled: tab === 'active',
  })

  const accept = useMutation({
    mutationFn: (id: string) => deliveryApi.acceptOrder(id),
    onSuccess: (data) => {
      toast.success('Order accepted!')
      queryClient.invalidateQueries({ queryKey: ['delivery-active'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard'] })
      router.push(`/delivery/orders/${data.order.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not accept order')
    },
  })

  const orders = tab === 'active' ? active?.content : available?.content
  const isLoading = tab === 'active' ? loadingActive : loadingAvailable

  return (
    <DeliveryShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="flex gap-2 mb-6">
        {(['available', 'active'] as const).map((t) => (
          <Link
            key={t}
            href={`/delivery/orders?tab=${t}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'available' ? 'Available' : 'My active'}
          </Link>
        ))}
      </div>

      {tab === 'available' && (
        <p className="text-sm text-gray-500 mb-4">Orders marked ready by vendors in your zone. Go online on the dashboard to accept.</p>
      )}

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading orders...</p>
      ) : !orders?.length ? (
        <p className="text-gray-500">{tab === 'available' ? 'No orders in your zone right now.' : 'No active deliveries.'}</p>
      ) : (
        <div className="space-y-4">
          {orders.map(({ order, shopAddressLine, partnerEarning }) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.shopName}</p>
                  {shopAddressLine && <p className="text-xs text-gray-400 mt-1">{shopAddressLine}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-700">Earn ₹{partnerEarning ?? order.deliveryFee}</p>
                  <p className="text-xs text-gray-400">{order.status}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(' · ')}
              </p>
              {tab === 'available' ? (
                <button
                  type="button"
                  disabled={accept.isPending}
                  onClick={() => accept.mutate(order.id)}
                  className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  Accept delivery
                </button>
              ) : (
                <Link href={`/delivery/orders/${order.id}`} className="text-sm text-amber-600 font-medium hover:underline">
                  Open delivery →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </DeliveryShell>
  )
}
