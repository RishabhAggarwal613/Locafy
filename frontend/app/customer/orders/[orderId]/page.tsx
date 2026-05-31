'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import CustomerShell from '@/components/customer/CustomerShell'
import OrderStatusTimeline from '@/components/customer/OrderStatusTimeline'
import DeliveryRouteMap from '@/components/delivery/DeliveryRouteMap'
import { ordersApi } from '@/lib/api/orders'
import { useAuthStore } from '@/store/authStore'
import { useCustomerDeliveryTracking } from '@/lib/hooks/useDeliveryTracking'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [partnerLat, setPartnerLat] = useState<number>()
  const [partnerLng, setPartnerLng] = useState<number>()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId),
    enabled: !!user && !!orderId,
  })

  const cancelOrder = useMutation({
    mutationFn: () => ordersApi.cancel(orderId),
    onSuccess: () => {
      toast.success('Order cancelled')
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    },
    onError: () => toast.error('Could not cancel order'),
  })

  const showTracking = !!order
    && order.fulfillmentType === 'DELIVERY'
    && ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status)

  useCustomerDeliveryTracking(order?.id, showTracking, (lat, lng) => {
    setPartnerLat(lat)
    setPartnerLng(lng)
  })

  if (!user) {
    return (
      <CustomerShell>
        <p className="text-center py-16 text-gray-500">
          <Link href="/customer/auth" className="text-indigo-600 hover:underline">Sign in</Link> to view this order
        </p>
      </CustomerShell>
    )
  }

  if (isLoading || !order) {
    return (
      <CustomerShell>
        <p className="text-gray-400 animate-pulse">Loading order...</p>
      </CustomerShell>
    )
  }

  const canCancel = order.status === 'PLACED' || order.status === 'CONFIRMED'

  return (
    <CustomerShell>
      <div className="mb-6">
        <Link href="/customer/orders" className="text-sm text-indigo-600 hover:underline">← All orders</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{order.orderNumber}</h1>
        <p className="text-gray-500 text-sm">{order.shopName} · {order.fulfillmentType}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span>{item.productName} × {item.quantity}</span>
                <span>₹{item.totalPrice}</span>
              </div>
            ))}
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.subtotal}</span></div>
              {order.deliveryFee > 0 && <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>₹{order.deliveryFee}</span></div>}
              {order.platformFee != null && order.platformFee > 0 && <div className="flex justify-between"><span className="text-gray-500">Platform fee</span><span>₹{order.platformFee}</span></div>}
              <div className="flex justify-between font-bold"><span>Total</span><span>₹{order.total}</span></div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
            <p className="text-sm text-gray-600">{order.paymentMethod} · {order.paymentStatus}</p>
          </section>

          {canCancel && (
            <button
              type="button"
              onClick={() => cancelOrder.mutate()}
              className="text-sm text-red-600 hover:underline"
            >
              Cancel order
            </button>
          )}
        </div>

        <section className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Order timeline</h2>
          <OrderStatusTimeline history={order.statusHistory} />
        </section>

        {showTracking && (
          <section className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Live delivery tracking</h2>
            <p className="text-sm text-gray-500 mb-4">Your delivery partner&apos;s location updates in real time.</p>
            <DeliveryRouteMap
              customerLat={order.deliveryAddress?.latitude}
              customerLng={order.deliveryAddress?.longitude}
              partnerLat={partnerLat}
              partnerLng={partnerLng}
            />
          </section>
        )}
      </div>
    </CustomerShell>
  )
}
