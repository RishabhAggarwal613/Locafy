# Orders

The order lifecycle spans four actors — Customer, Vendor, Delivery Partner, and Admin — each with their own view and actions.

---

## Order Status Flow

```
PLACED
  │
  ├─► CANCELLED  (by customer — before CONFIRMED)
  │
CONFIRMED  (by vendor)
  │
  ├─► CANCELLED  (by vendor — with reason, triggers refund)
  │
PREPARING  (by vendor — "We've started preparing your order")
  │
READY  (by vendor — "Your order is ready")
  │
  ├── [PICKUP] ─────────────► DELIVERED  (customer collects, vendor marks done)
  │
  └── [DELIVERY]
        │
      PICKED_UP  (delivery partner picks up from shop)
        │
      OUT_FOR_DELIVERY  (delivery partner en route)
        │
      DELIVERED  (delivery partner submits photo proof)
        │
        └─► REFUNDED  (if payment refund issued after delivery)
```

---

## Fulfillment Types

### Pickup

1. Customer places order with `fulfillmentType: PICKUP`
2. Vendor confirms and prepares order
3. Vendor marks READY
4. Customer receives notification: "Your order is ready at [Shop Name]"
5. Customer app shows "Navigate to Shop" button (Mapbox directions)
6. Vendor marks DELIVERED when customer collects in person
7. No delivery partner involved

### Delivery

1. Customer places order with `fulfillmentType: DELIVERY` + delivery address
2. Vendor confirms, prepares, marks READY
3. Spring Boot broadcasts order to nearby delivery partners via WebSocket
4. Delivery partner accepts
5. Delivery partner navigates to shop → marks PICKED_UP
6. Delivery partner navigates to customer → marks DELIVERED with photo proof
7. Customer sees live location on map during OUT_FOR_DELIVERY phase

---

## Placing an Order

### Request

```
POST /api/orders
Authorization: Bearer <customer_token>

{
  "shopId": "...",
  "items": [
    { "productId": "...", "quantity": 2 },
    { "productId": "...", "quantity": 1 }
  ],
  "fulfillmentType": "DELIVERY",
  "deliveryAddressId": "...",
  "paymentMethod": "RAZORPAY"
}
```

### Spring Boot Processing

```
1. Validate request (Bean Validation)
2. Verify shop is active and open
3. Verify all products are from the same shop and in stock
4. Calculate prices from database (never trust client prices)
5. Calculate deliveryFee (based on distance)
6. Calculate platformFee (% of subtotal, from platform settings)
7. Create order document with status: PLACED
8. Deduct stock for each product (atomic with optimistic locking)
9. Clear customer cart
10. If RAZORPAY: create Razorpay order → return razorpayOrderId
11. If COD: mark paymentStatus: PENDING → return order
12. Send WebSocket notification to vendor's shop channel
13. Send push notification to vendor
14. Return { order, razorpayOrderId? }
```

---

## Order Notifications (WebSocket)

Every status transition triggers a WebSocket push to all relevant parties:

| Status Change | Notified | Channel |
|--------------|----------|---------|
| PLACED | Vendor | `/topic/vendor/:shopId/orders` |
| CONFIRMED | Customer | `/topic/orders/:orderId` |
| PREPARING | Customer | `/topic/orders/:orderId` |
| READY | Customer | `/topic/orders/:orderId` |
| PICKED_UP | Customer | `/topic/orders/:orderId` |
| OUT_FOR_DELIVERY | Customer (+ live map) | `/topic/orders/:orderId` |
| DELIVERED | Customer, Vendor | `/topic/orders/:orderId` |
| CANCELLED | All parties | `/topic/orders/:orderId` |

---

## Order Cancellation

| Who | When Allowed | Refund |
|-----|-------------|--------|
| Customer | Before CONFIRMED | Full refund if paid |
| Vendor | Before PICKED_UP | Full refund if paid |
| Admin | Anytime | Full or partial refund |

Refund triggers `POST /api/payments/refund` → Razorpay Refund API (5–7 business days to customer).

---

## Order History

**Customer:**
- `GET /api/orders` — paginated, sorted by `createdAt` desc
- Filters: status, date range, shop

**Vendor:**
- `GET /api/orders/vendor` — all orders for their shop
- Filters: status, date range, fulfillment type, payment method

**Delivery Partner:**
- `GET /api/delivery/orders/history` — completed deliveries
- Filters: date range

**Admin:**
- `GET /api/admin/orders` — platform-wide
- All filters + by customer, by vendor, by delivery partner

---

## Order Document (snapshot pattern)

Product names and prices are **snapshotted** at order time. This means if a vendor changes a price later, historical orders are unaffected:

```json
"items": [
  {
    "productId": "...",
    "productName": "Chicken Biryani",  // ← snapshot
    "productImage": "https://...",      // ← snapshot
    "unitPrice": 180,                   // ← snapshot (not live price)
    "quantity": 2,
    "totalPrice": 360
  }
]
```

---

## Status History Audit

Every status change appends to `order.statusHistory`:

```json
"statusHistory": [
  { "status": "PLACED", "timestamp": "2026-05-29T11:00:00Z", "note": "" },
  { "status": "CONFIRMED", "timestamp": "2026-05-29T11:03:00Z", "note": "Confirmed by vendor" },
  { "status": "PREPARING", "timestamp": "2026-05-29T11:15:00Z", "note": "" },
  { "status": "READY", "timestamp": "2026-05-29T11:35:00Z", "note": "" },
  { "status": "PICKED_UP", "timestamp": "2026-05-29T11:42:00Z", "note": "" },
  { "status": "DELIVERED", "timestamp": "2026-05-29T12:05:00Z", "note": "Photo proof uploaded" }
]
```

This powers the order timeline UI in the customer app.
