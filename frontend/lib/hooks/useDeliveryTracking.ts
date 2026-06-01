'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { createStompClient, subscribeJson } from '@/lib/websocket/stompClient'

interface PoolEvent {
  type: string
  orderNumber?: string
  deliveryFee?: number
}

export function useDeliveryPoolAlerts(onNewOrder?: () => void) {
  useEffect(() => {
    const client = createStompClient({
      onConnect: (c) => {
        subscribeJson<PoolEvent>(c, '/topic/delivery/pool', (payload) => {
          if (payload.type === 'ORDER_AVAILABLE') {
            toast.success(
              `New delivery: ${payload.orderNumber} · earn ₹${payload.deliveryFee ?? 0}`,
              { icon: '🛵' },
            )
            onNewOrder?.()
          }
        })
      },
    })

    client.activate()
    return () => {
      client.deactivate()
    }
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

interface LocationEvent {
  type: string
  latitude: number
  longitude: number
}

export function useCustomerDeliveryTracking(
  orderId: string | undefined,
  enabled: boolean,
  onLocation: (lat: number, lng: number) => void,
) {
  useEffect(() => {
    if (!orderId || !enabled) return

    const client = createStompClient({
      onConnect: (c) => {
        subscribeJson<LocationEvent>(c, `/topic/delivery/${orderId}`, (payload) => {
          if (payload.type === 'LOCATION_UPDATE') {
            onLocation(payload.latitude, payload.longitude)
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

    return () => {
      client.deactivate()
    }
  }, [orderId, enabled, onLocation])
}
