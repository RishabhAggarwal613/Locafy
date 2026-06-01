import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAccessToken, getWsUrl } from './auth'

const MIN_RECONNECT_MS = 1000
const MAX_RECONNECT_MS = 30000

export interface StompClientOptions {
  /** Pass JWT on CONNECT for user-specific queues (`/user/queue/notifications`). */
  withAuth?: boolean
  onConnect?: (client: Client) => void
}

export function createStompClient(options: StompClientOptions = {}): Client {
  let reconnectDelay = MIN_RECONNECT_MS

  const client = new Client({
    webSocketFactory: () => new SockJS(getWsUrl()) as WebSocket,
    reconnectDelay: MIN_RECONNECT_MS,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectHeaders: options.withAuth
      ? buildAuthHeaders()
      : undefined,
    onConnect: () => {
      reconnectDelay = MIN_RECONNECT_MS
      client.reconnectDelay = MIN_RECONNECT_MS
      options.onConnect?.(client)
    },
    onWebSocketClose: () => {
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_MS)
      client.reconnectDelay = reconnectDelay
    },
    onStompError: () => {
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_MS)
      client.reconnectDelay = reconnectDelay
    },
  })

  return client
}

function buildAuthHeaders(): Record<string, string> {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function subscribeJson<T>(
  client: Client,
  destination: string,
  handler: (payload: T) => void,
): StompSubscription {
  return client.subscribe(destination, (message) => {
    try {
      handler(JSON.parse(message.body) as T)
    } catch {
      // ignore malformed payloads
    }
  })
}
