#!/usr/bin/env node
/** Quick WebSocket/STOMP smoke test — run: cd frontend && node scripts/ws-test.mjs [vendorEmail] [customerEmail] [shopId] [orderId] */
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const BASE = process.env.BASE_URL || 'http://localhost:8080'
const WS = `${BASE}/ws`

function stompConnect({ auth, onConnect }) {
  return new Promise((resolve, reject) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS),
      connectHeaders: auth ? { Authorization: `Bearer ${auth}` } : {},
      reconnectDelay: 0,
      onConnect: () => {
        onConnect(client)
        client.deactivate()
        resolve()
      },
      onStompError: (f) => reject(new Error(f.headers?.message || 'STOMP error')),
      onWebSocketError: (e) => reject(e),
    })
    client.activate()
    setTimeout(() => reject(new Error('WebSocket timeout')), 15000)
  })
}

async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'login failed')
  return data.accessToken
}

async function main() {
  const vendorEmail = process.argv[2]
  const customerEmail = process.argv[3]
  const shopId = process.argv[4]
  const orderId = process.argv[5]
  const password = 'Test1234'

  if (!vendorEmail || !customerEmail || !shopId || !orderId) {
    console.error('Usage: node scripts/ws-test.mjs <vendorEmail> <customerEmail> <shopId> <orderId>')
    process.exit(1)
  }

  console.log('▶ WebSocket smoke test')
  console.log('  SockJS endpoint:', WS)

  await stompConnect({
    onConnect: (c) => {
      c.subscribe('/topic/delivery/pool', () => {})
      console.log('  ✅ Public topic subscribe (/topic/delivery/pool)')
    },
  })

  const vendorToken = await login(vendorEmail, password)
  await stompConnect({
    auth: vendorToken,
    onConnect: (c) => {
      c.subscribe(`/topic/vendor/${shopId}/orders`, () => {})
      console.log('  ✅ Vendor order topic subscribe')
    },
  })

  const customerToken = await login(customerEmail, password)
  await stompConnect({
    auth: customerToken,
    onConnect: (c) => {
      c.subscribe(`/topic/orders/${orderId}`, () => {})
      c.subscribe('/user/queue/notifications', () => {})
      console.log('  ✅ Customer order + notification queue subscribe')
    },
  })

  console.log('✅ All WebSocket subscriptions connected')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
