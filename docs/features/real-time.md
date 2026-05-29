# Real-time Features

Locafy uses **Spring WebSocket with STOMP protocol** over SockJS for all real-time updates. This powers live order tracking, vendor order alerts, and delivery location streaming.

---

## WebSocket Architecture

```
Next.js Frontend
  ↕ SockJS / STOMP
Spring Boot WebSocket Broker (STOMP)
  ↕ Redis Pub/Sub
(Multi-instance: orders broadcast to all server instances)
```

**Connection URL:** `ws://api.locafy.in/ws` (SockJS fallback: long-polling)

---

## Spring Boot Configuration

```java
// WebSocketConfig.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("https://locafy.in")
                .withSockJS();
    }
}
```

---

## Frontend Connection

```typescript
// lib/websocket.ts
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

export function createStompClient(token: string) {
  return new Client({
    webSocketFactory: () => new SockJS('https://api.locafy.in/ws'),
    connectHeaders: { Authorization: `Bearer ${token}` },
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    reconnectDelay: 5000,
  })
}
```

---

## Real-time Channels

### 1. Order Status Updates

**Who subscribes:** Customer, Vendor, Delivery partner (all on the same order page)

```typescript
// Subscribe to order updates
client.subscribe(`/topic/orders/${orderId}`, (message) => {
  const update = JSON.parse(message.body)
  // { status: 'CONFIRMED', timestamp: '...', note: '...' }
  orderStore.updateStatus(orderId, update.status)
})
```

**Spring Boot publisher:**

```java
// OrderService.java
@Autowired
private SimpMessagingTemplate messagingTemplate;

public void updateOrderStatus(String orderId, OrderStatus newStatus, String note) {
    order.setStatus(newStatus);
    orderRepository.save(order);

    // Broadcast to all subscribers of this order topic
    messagingTemplate.convertAndSend(
        "/topic/orders/" + orderId,
        new OrderStatusUpdate(newStatus, LocalDateTime.now(), note)
    );
}
```

---

### 2. New Order Alert (Vendor)

**Who subscribes:** Vendor, subscribed to their shop's topic

```typescript
// Vendor dashboard — subscribe to incoming orders
client.subscribe(`/topic/vendor/${shopId}/orders`, (message) => {
  const newOrder = JSON.parse(message.body)
  // Play notification sound
  orderNotificationSound.play()
  // Show browser notification
  new Notification(`New order #${newOrder.orderNumber}`, { body: `₹${newOrder.total}` })
  // Update order list
  queryClient.invalidateQueries(['vendor', 'orders'])
})
```

**Spring Boot publishes to vendor topic when:**
- A new order is placed (`POST /api/orders`)

---

### 3. Delivery Location Stream

**Who sends:** Delivery partner (from navigation page)

```typescript
// Delivery partner sends GPS every 5 seconds
const intervalId = setInterval(() => {
  if (stompClient.connected) {
    stompClient.publish({
      destination: '/app/delivery/location',
      body: JSON.stringify({
        orderId,
        lat: position.latitude,
        lng: position.longitude,
        heading: position.heading,
        speed: position.speed,
      }),
    })
  }
}, 5000)
```

**Spring Boot receives and relays:**

```java
@MessageMapping("/delivery/location")
public void receiveDeliveryLocation(DeliveryLocationDto dto, Principal principal) {
    // Save to MongoDB (upsert)
    deliveryLocationService.upsert(principal.getName(), dto);

    // Broadcast to customer tracking this order
    messagingTemplate.convertAndSend(
        "/topic/delivery/" + dto.getOrderId(),
        new DeliveryLocationEvent(dto.getLat(), dto.getLng(), dto.getHeading())
    );
}
```

**Who subscribes:** Customer on the order tracking page

```typescript
client.subscribe(`/topic/delivery/${orderId}`, (message) => {
  const { lat, lng, heading } = JSON.parse(message.body)
  setDeliveryPin({ lat, lng, heading })
})
```

---

### 4. User-specific Notifications

For targeted notifications to a single user (e.g. "Your order has been accepted"):

```java
// Spring Boot — send to specific user
messagingTemplate.convertAndSendToUser(
    userId,
    "/queue/notifications",
    new NotificationEvent("Your order is confirmed!", orderId)
);
```

```typescript
// Frontend — subscribe to own notification queue
client.subscribe('/user/queue/notifications', (message) => {
  const notification = JSON.parse(message.body)
  toast.success(notification.title)
})
```

---

## Connection Lifecycle Management

### React Hook

```typescript
// store/orderStore.ts — WebSocket connection hook
export function useOrderTracking(orderId: string) {
  const { accessToken } = useAuthStore()
  const client = useRef<Client | null>(null)

  useEffect(() => {
    client.current = createStompClient(accessToken)

    client.current.onConnect = () => {
      client.current!.subscribe(`/topic/orders/${orderId}`, handleOrderUpdate)
      client.current!.subscribe(`/user/queue/notifications`, handleNotification)
    }

    client.current.activate()

    return () => {
      client.current?.deactivate()
    }
  }, [orderId])
}
```

### Reconnection

`@stomp/stompjs` has built-in reconnection with exponential backoff. The `reconnectDelay: 5000` means it tries again every 5 seconds after a disconnect. The subscription is re-established on reconnect via the `onConnect` callback.

---

## Scaling Consideration

In a multi-instance deployment (multiple EC2 instances), the in-memory STOMP broker must be replaced with a **Redis Pub/Sub broker**:

```java
// For production multi-instance: use Redis STOMP relay
config.enableStompBrokerRelay("/topic", "/queue")
      .setRelayHost(redisHost)
      .setRelayPort(6379);
```

This ensures a message published on Instance A reaches a client connected to Instance B.
