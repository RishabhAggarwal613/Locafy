'use client'

import { useEffect } from 'react'
import { createStompClient, subscribeJson } from '@/lib/websocket/stompClient'
import type { Order } from '@/types'

export function useOrderStatusUpdates(
  orderId: string | undefined,
  onUpdate: (order: Order) => void,
) {
  useEffect(() => {
    if (!orderId) return

    const client = createStompClient({
      onConnect: (c) => {
        subscribeJson<Order>(c, `/topic/orders/${orderId}`, onUpdate)
      },
    })

    client.activate()
    return () => {
      client.deactivate()
    }
  }, [orderId, onUpdate])
}
