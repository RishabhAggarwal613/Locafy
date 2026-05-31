'use client'

import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'

export function useVendorOrderAlerts(shopId?: string, onNewOrder?: () => void) {
  useEffect(() => {
    if (!shopId) return

    const wsUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/ws`
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/vendor/${shopId}/orders`, (message) => {
          try {
            const payload = JSON.parse(message.body)
            if (payload.type === 'NEW_ORDER') {
              toast.success(`New order: ${payload.orderNumber}`, { icon: '🔔' })
              onNewOrder?.()
            }
          } catch {
            // ignore malformed messages
          }
        })
      },
    })

    client.activate()
    return () => {
      client.deactivate()
    }
  }, [shopId, onNewOrder])
}
