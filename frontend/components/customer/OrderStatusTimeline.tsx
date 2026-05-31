'use client'

import type { OrderStatus, StatusHistoryEntry } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Order placed',
  CONFIRMED: 'Confirmed by shop',
  PREPARING: 'Preparing your order',
  READY: 'Ready for pickup/delivery',
  PICKED_UP: 'Picked up',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

export default function OrderStatusTimeline({ history }: { history: StatusHistoryEntry[] }) {
  if (!history?.length) return null

  return (
    <ol className="relative border-l border-gray-200 ml-3 space-y-6">
      {history.map((entry, i) => (
        <li key={`${entry.status}-${i}`} className="ml-6">
          <span className={`absolute -left-1.5 flex h-3 w-3 rounded-full ring-4 ring-white ${
            i === history.length - 1 ? 'bg-indigo-600' : 'bg-gray-300'
          }`} />
          <p className="text-sm font-medium text-gray-900">{STATUS_LABELS[entry.status] || entry.status}</p>
          {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
          <p className="text-xs text-gray-400 mt-0.5">
            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}
