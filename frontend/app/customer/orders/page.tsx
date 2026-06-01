'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import CustomerShell from '@/components/customer/CustomerShell'
import { ordersApi } from '@/lib/api/orders'
import { useAuthStore } from '@/store/authStore'
import { useUserNotifications } from '@/lib/hooks/useUserNotifications'
import type { OrderStatus } from '@/types'

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  PLACED: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-violet-100 text-violet-700',
  READY: 'bg-emerald-100 text-emerald-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useUserNotifications(useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }, [queryClient]))

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
    enabled: !!user,
  })

  if (!user) {
    return (
      <CustomerShell>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Sign in to view orders</p>
          <Link href="/customer/auth" className="text-indigo-600 hover:underline">Sign in →</Link>
        </div>
      </CustomerShell>
    )
  }

  return (
    <CustomerShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading orders...</p>
      ) : !data?.content.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link href="/customer/explore" className="text-indigo-600 hover:underline">Start shopping →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.content.map((order) => (
            <Link
              key={order.id}
              href={`/customer/orders/${order.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{order.shopName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <p className="font-semibold text-gray-900 mt-2">₹{order.total}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CustomerShell>
  )
}
