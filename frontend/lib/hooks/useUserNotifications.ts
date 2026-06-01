'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { createStompClient, subscribeJson } from '@/lib/websocket/stompClient'
import { useAuthStore } from '@/store/authStore'

export interface UserNotification {
  type: string
  orderId?: string
  orderNumber?: string
  status?: string
  shopName?: string
  message?: string
}

export function useUserNotifications(onNotification?: (n: UserNotification) => void) {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) return

    const client = createStompClient({
      withAuth: true,
      onConnect: (c) => {
        subscribeJson<UserNotification>(c, '/user/queue/notifications', (payload) => {
          if (payload.message) {
            toast(payload.message, { icon: '📦' })
          }
          onNotification?.(payload)
        })
      },
    })

    client.activate()
    return () => {
      client.deactivate()
    }
  }, [user, onNotification])
}
