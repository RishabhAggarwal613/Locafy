'use client'

import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import VendorShell from '@/components/vendor/VendorShell'
import { ordersApi } from '@/lib/api/orders'
import { vendorApi } from '@/lib/api/shops'
import { useVendorOrderAlerts, type VendorOrderEvent } from '@/lib/hooks/useVendorOrderAlerts'
import type { OrderStatus } from '@/types'

const VENDOR_ACTIONS: { status: OrderStatus; label: string }[] = [
  { status: 'CONFIRMED', label: 'Confirm' },
  { status: 'PREPARING', label: 'Start Preparing' },
  { status: 'READY', label: 'Mark Ready' },
  { status: 'DELIVERED', label: 'Mark Delivered (Pickup)' },
]

export default function VendorOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | undefined>()
  const queryClient = useQueryClient()

  const { data: dashboard } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: () => vendorApi.getDashboard(),
  })

  useVendorOrderAlerts(dashboard?.shopId, useCallback((event: VendorOrderEvent) => {
    if (event.type === 'NEW_ORDER' || event.type === 'ORDER_STATUS') {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] })
    }
  }, [queryClient]))

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', filter],
    queryFn: () => ordersApi.listVendor(filter),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order updated')
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Update failed')
    },
  })

  return (
    <VendorShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button type="button" onClick={() => setFilter(undefined)} className={`px-3 py-1.5 rounded-lg text-xs border ${!filter ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200'}`}>All</button>
        {(['PLACED', 'CONFIRMED', 'PREPARING', 'READY'] as OrderStatus[]).map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs border ${filter === s ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200'}`}>{s}</button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading orders...</p>
      ) : !data?.content.length ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {data.content.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.fulfillmentType} · {order.paymentMethod} · ₹{order.total}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{order.status}</span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {order.items.map((i) => (
                  <span key={i.productId} className="mr-3">{i.productName} ×{i.quantity}</span>
                ))}
              </div>
              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <div className="flex flex-wrap gap-2">
                  {VENDOR_ACTIONS.filter((a) => {
                    if (order.fulfillmentType === 'DELIVERY' && a.status === 'DELIVERED') return false
                    return true
                  }).map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: order.id, status: action.status })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </VendorShell>
  )
}
