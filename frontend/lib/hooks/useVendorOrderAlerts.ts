'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { createStompClient, subscribeJson } from '@/lib/websocket/stompClient'
import type { Order } from '@/types'

interface VendorOrderEvent {
  type: string
  orderNumber?: string
  order?: Order
}

export type { VendorOrderEvent }

export function useVendorOrderAlerts(
  shopId?: string,
  onEvent?: (event: VendorOrderEvent) => void,
) {
  useEffect(() => {
    if (!shopId) return

    const client = createStompClient({
      onConnect: (c) => {
        subscribeJson<VendorOrderEvent>(c, `/topic/vendor/${shopId}/orders`, (payload) => {
          if (payload.type === 'NEW_ORDER' && payload.orderNumber) {
            toast.success(`New order: ${payload.orderNumber}`, { icon: '🔔' })
          }
          onEvent?.(payload)
        })
      },
    })

    client.activate()
    return () => {
      client.deactivate()
    }
  }, [shopId, onEvent])
}
