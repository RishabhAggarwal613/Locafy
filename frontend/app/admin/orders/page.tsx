'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminShell from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api/admin'
import type { OrderStatus } from '@/types'

const STATUSES: (OrderStatus | undefined)[] = [undefined, 'PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status],
    queryFn: () => adminApi.listOrders(status),
  })

  const overrideStatus = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: OrderStatus }) =>
      adminApi.overrideOrderStatus(id, newStatus, 'Admin override'),
    onSuccess: () => {
      toast.success('Order updated')
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Update failed')
    },
  })

  const refund = useMutation({
    mutationFn: (id: string) => adminApi.refundOrder(id, 'Admin refund'),
    onSuccess: () => {
      toast.success('Refund processed')
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Refund failed')
    },
  })

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-white mb-6">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button key={s ?? 'ALL'} type="button" onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs border ${status === s ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-700 text-gray-400'}`}>
            {s ?? 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading orders...</p>
      ) : !data?.content.length ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {data.content.map((order) => (
            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-white">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.shopName} · {order.paymentMethod} · ₹{order.total}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">{order.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                  <button type="button" onClick={() => overrideStatus.mutate({ id: order.id, newStatus: 'CANCELLED' })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white">
                    Cancel
                  </button>
                )}
                {order.paymentStatus !== 'REFUNDED' && order.status !== 'REFUNDED' && (
                  <button type="button" onClick={() => refund.mutate(order.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                    Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
