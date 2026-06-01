'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DeliveryShell from '@/components/delivery/DeliveryShell'
import DeliveryRouteMap from '@/components/delivery/DeliveryRouteMap'
import { deliveryApi } from '@/lib/api/delivery'
import { useDeliveryLocationBroadcast } from '@/lib/hooks/useDeliveryTracking'
import { useOrderStatusUpdates } from '@/lib/hooks/useOrderStatusUpdates'
import type { Order, OrderStatus } from '@/types'

const ACTIONS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'PICKED_UP', label: 'Picked up from shop', hint: 'Confirm you collected the order' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery', hint: 'Heading to customer' },
  { status: 'DELIVERED', label: 'Delivered', hint: 'Complete the delivery' },
]

export default function DeliveryOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const queryClient = useQueryClient()
  const [partnerLat, setPartnerLat] = useState<number>()
  const [partnerLng, setPartnerLng] = useState<number>()

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-order', orderId],
    queryFn: () => deliveryApi.getOrder(orderId),
  })

  const updateStatus = useMutation({
    mutationFn: ({ status, note }: { status: OrderStatus; note?: string }) =>
      deliveryApi.updateStatus(orderId, status, note),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['delivery-order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['delivery-active'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Update failed')
    },
  })

  const order = data?.order
  const trackingActive = order != null && ['READY', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status)

  useOrderStatusUpdates(orderId, useCallback((updated: Order) => {
    queryClient.setQueryData(['delivery-order', orderId], (prev: typeof data) => {
      if (!prev?.order) return prev
      return { ...prev, order: { ...prev.order, ...updated } }
    })
  }, [orderId, queryClient]))

  useDeliveryLocationBroadcast(orderId, trackingActive, (lat, lng) => {
    setPartnerLat(lat)
    setPartnerLng(lng)
  })

  if (isLoading || !data || !order) {
    return (
      <DeliveryShell>
        <p className="text-gray-400 animate-pulse">Loading delivery...</p>
      </DeliveryShell>
    )
  }

  const nextAction = ACTIONS.find((a) => {
    if (order.status === 'READY') return a.status === 'PICKED_UP'
    if (order.status === 'PICKED_UP') return a.status === 'OUT_FOR_DELIVERY'
    if (order.status === 'OUT_FOR_DELIVERY') return a.status === 'DELIVERED'
    return false
  })

  return (
    <DeliveryShell>
      <Link href="/delivery/orders?tab=active" className="text-sm text-amber-600 hover:underline">← Active orders</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{order.orderNumber}</h1>
      <p className="text-gray-500 text-sm mb-6">{order.shopName} · {order.status} · Earn ₹{data.partnerEarning ?? order.deliveryFee}</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <DeliveryRouteMap
          shopLat={data.shopLatitude}
          shopLng={data.shopLongitude}
          customerLat={data.customerLatitude}
          customerLng={data.customerLongitude}
          partnerLat={partnerLat}
          partnerLng={partnerLng}
        />

        <div className="space-y-4">
          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Pickup</h2>
            <p className="text-sm text-gray-600">{data.shopAddressLine ?? order.shopName}</p>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Drop-off</h2>
            {order.deliveryAddress ? (
              <p className="text-sm text-gray-600">
                {order.deliveryAddress.line1}
                {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ''}
                <br />
                {order.deliveryAddress.city} {order.deliveryAddress.pincode}
              </p>
            ) : (
              <p className="text-sm text-gray-400">No address on order</p>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
            {order.items.map((item) => (
              <p key={item.productId} className="text-sm text-gray-600">{item.productName} × {item.quantity}</p>
            ))}
            <p className="text-sm font-medium mt-2">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
          </section>

          {nextAction && (
            <button
              type="button"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ status: nextAction.status, note: nextAction.hint })}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {nextAction.label}
            </button>
          )}

          {order.status === 'DELIVERED' && (
            <p className="text-center text-green-600 font-medium">Delivery completed ✓</p>
          )}
        </div>
      </div>
    </DeliveryShell>
  )
}
