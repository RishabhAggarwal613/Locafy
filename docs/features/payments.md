# Payments

Locafy supports two payment methods: **Razorpay online payment** and **Cash on Delivery (COD)**. Vendor payouts and delivery partner earnings are tracked separately.

---

## Payment Methods

| Method | Flow | Settlement |
|--------|------|-----------|
| Razorpay | Customer pays online at checkout | Instant (after webhook) |
| COD | Customer pays cash on delivery/pickup | Marked manually by vendor |

---

## Razorpay Integration Flow

### Step 1 — Create Razorpay Order (Backend)

When the customer confirms checkout with "Pay Online":

```
POST /api/payments/create
Authorization: Bearer <customer_token>
Body: { orderId: "<locafy_order_id>" }

Spring Boot:
1. Fetch Locafy order from MongoDB
2. Call Razorpay Orders API:
   RazorpayClient client = new RazorpayClient(KEY_ID, KEY_SECRET);
   JSONObject params = new JSONObject();
   params.put("amount", order.getTotal() * 100); // paise
   params.put("currency", "INR");
   params.put("receipt", order.getOrderNumber());
   Order rzpOrder = client.orders.create(params);

3. Store rzpOrder.id in Locafy order document
4. Return { razorpayOrderId, amount, currency, keyId }
```

### Step 2 — Razorpay Checkout (Frontend)

```typescript
// lib/razorpay.ts
const openRazorpayCheckout = (options: RazorpayOptions) => {
  const rzp = new window.Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    order_id: options.razorpayOrderId,
    amount: options.amount,
    currency: 'INR',
    name: 'Locafy',
    description: `Order ${options.orderNumber}`,
    image: '/logo.png',
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone,
    },
    handler: async (response) => {
      // Step 3: verify payment on backend
      await verifyPayment(response)
    },
    modal: {
      ondismiss: () => setPaymentCancelled(true),
    },
  })
  rzp.open()
}
```

### Step 3 — Verify Payment (Backend)

```
POST /api/payments/verify
Body: {
  razorpayOrderId: "order_xxx",
  razorpayPaymentId: "pay_xxx",
  razorpaySignature: "abc123..."
}

Spring Boot:
1. Reconstruct expected signature:
   String data = razorpayOrderId + "|" + razorpayPaymentId;
   String expectedSignature = hmacSHA256(data, KEY_SECRET);

2. Compare with received signature (constant-time comparison)
3. If valid:
   a. Update Locafy order: paymentStatus = PAID, razorpayPaymentId = ...
   b. Create transaction document in `transactions` collection
   c. Trigger order processing (notify vendor via WebSocket)
4. If invalid: return 400 error
```

### Step 4 — Razorpay Webhook (Backup)

```
POST /api/payments/webhook
(called by Razorpay server, NOT the frontend)

Headers: X-Razorpay-Signature: <hmac>

Spring Boot:
1. Verify webhook signature using webhook secret
2. Parse event type: payment.captured / payment.failed / refund.processed
3. Update order and transaction documents accordingly
4. This is the fallback — handles cases where the user closed the browser
   before the frontend could call /verify
```

---

## COD Flow

```
1. Customer selects COD at checkout
2. POST /api/orders — order created with paymentMethod: COD, paymentStatus: PENDING
3. Vendor receives order normally
4. On delivery/pickup:
   - Vendor marks order DELIVERED (for pickup)
   - Delivery partner marks order DELIVERED (for delivery)
5. Order paymentStatus updated to PAID
6. No Razorpay involved
```

---

## Refunds

```
POST /api/payments/refund   (Admin or system-triggered)
Body: { orderId, amount?, reason }

1. Fetch transaction for the order
2. Call Razorpay Refund API:
   client.payments.refund(paymentId, { amount: amountInPaise })

3. Update transaction document: status = REFUNDED
4. Update order: paymentStatus = REFUNDED, status = REFUNDED
5. Notify customer via WebSocket + email

Note: COD orders cannot be refunded via Razorpay.
      Admin manually tracks COD refunds.
```

---

## Vendor Payouts

Vendors do not receive money directly via Razorpay at order time. Locafy collects the full payment and transfers vendor earnings periodically.

**Earnings Calculation (per order):**

```
vendorEarnings = subtotal - platformFeeAmount
platformFeeAmount = subtotal * platformFeePercent  (e.g. 10%)
deliveryFee = not included in vendor earnings (goes to delivery partner)
```

**Payout Process:**
1. Vendor requests payout from finance dashboard
2. Admin reviews and approves in admin panel
3. Spring Boot calls bank transfer API (or admin does manual NEFT/UPI)
4. Transaction document created with type: VENDOR_PAYOUT
5. Vendor notified via email + in-app notification

**Payout Frequency:** Weekly (or on-demand above ₹1,000 minimum)

---

## Delivery Partner Earnings

Each delivery order earns the partner:

```
deliveryEarning = basePay + (distanceKm * perKmRate) + tip (if any)
```

Platform settings define `basePay` and `perKmRate`. Earnings are credited to the partner's wallet in the `transactions` collection after `DELIVERED` status is set.

**Withdrawal:**
- Partner withdraws from finance page
- Instant UPI transfer (via Razorpay Payout API or manual)
- Bank transfer next business day

---

## Transaction Document Reference

```json
{
  "type": "PAYMENT",
  "orderId": "...",
  "amount": 340,
  "currency": "INR",
  "method": "RAZORPAY",
  "status": "SUCCESS",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "platformFeeAmount": 34,
  "vendorId": "...",
  "createdAt": "..."
}
```

---

## Security

- **Signature verification** on every Razorpay payment (HMAC-SHA256)
- **Webhook signature verification** using separate webhook secret
- **Amount validated server-side** — client-sent amount is never trusted
- **Idempotency** — duplicate webhook events are de-duplicated via `razorpayPaymentId` unique check
- **Razorpay keys** stored only in environment variables, never in frontend code (only public key in Next.js)
