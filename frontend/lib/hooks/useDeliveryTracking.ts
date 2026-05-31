'use client'

import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'

export function useDeliveryPoolAlerts(onNewOrder?: () => void) {
  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/ws`
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/delivery/pool', (message) => {
          try {
            const payload = JSON.parse(message.body)
            if (payload.type === 'ORDER_AVAILABLE') {
              toast.success(`New delivery: ${payload.orderNumber} · earn ₹${payload.deliveryFee}`, { icon: '🛵' })
              onNewOrder?.()
            }
          } catch {
            // ignore
          }
        })
      },
    })
    client.activate()
    return () => { client.deactivate() }
  }, [onNewOrder])
}

export function useDeliveryLocationBroadcast(
  orderId: string | undefined,
  enabled: boolean,
  onLocation?: (lat: number, lng: number) => void,
) {
  useEffect(() => {
    if (!orderId || !enabled || !navigator.geolocation) return

    const postLocation = async (lat: number, lng: number) => {
      onLocation?.(lat, lng)
      try {
        const { deliveryApi } = await import('@/lib/api/delivery')
        await deliveryApi.postLocation(orderId, lat, lng)
      } catch {
        // ignore transient errors
      }
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => postLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [orderId, enabled, onLocation])
}

export function useCustomerDeliveryTracking(
  orderId: string | undefined,
  enabled: boolean,
  onLocation: (lat: number, lng: number) => void,
) {
  useEffect(() => {
    if (!orderId || !enabled) return

    const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/ws`
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/delivery/${orderId}`, (message) => {
          try {
            const payload = JSON.parse(message.body)
            if (payload.type === 'LOCATION_UPDATE') {
              onLocation(payload.latitude, payload.longitude)
            }
          } catch {
            // ignore
          }
        })
      },
    })

    client.activate()

    import('@/lib/api/delivery').then(({ deliveryApi }) => {
      deliveryApi.getOrderLocation(orderId).then((loc) => {
        onLocation(loc.latitude, loc.longitude)
      }).catch(() => {})
    })

    return () => { client.deactivate() }
  }, [orderId, enabled, onLocation])
}
