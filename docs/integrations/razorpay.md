# Razorpay Integration

Locafy uses Razorpay for online payments, refunds, and (optionally) vendor/delivery partner payouts.

---

## Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Dashboard → Settings → API Keys → Generate Key
3. Copy **Key ID** (public) and **Key Secret** (private)
4. For webhooks: Dashboard → Webhooks → Add webhook URL

---

## Maven Dependency

```xml
<dependency>
  <groupId>com.razorpay</groupId>
  <artifactId>razorpay-java</artifactId>
  <version>1.4.3</version>
</dependency>
```

## npm Package (Frontend)

```bash
# Load Razorpay checkout.js via script tag (recommended)
# OR use the unofficial wrapper:
npm install razorpay
```

---

## Payment Flow Summary

```
Customer → Checkout → POST /api/payments/create
                        ↓
                   Spring Boot creates Razorpay order
                        ↓
                   Returns { razorpayOrderId, amount, keyId }
                        ↓
Customer → Razorpay Checkout Modal opens in browser
                        ↓
Customer pays (card / UPI / netbanking / wallet)
                        ↓
Razorpay returns { razorpayOrderId, razorpayPaymentId, razorpaySignature }
                        ↓
Customer → POST /api/payments/verify (signature check)
                        ↓
Spring Boot verifies signature → marks order PAID
                        ↓
Razorpay Webhook → POST /api/payments/webhook (backup confirmation)
```

---

## Spring Boot Configuration

```java
// PaymentService.java
@Service
public class PaymentService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    private RazorpayClient getRazorpayClient() throws RazorpayException {
        return new RazorpayClient(keyId, keySecret);
    }

    public String createOrder(double amountRupees, String receipt) throws RazorpayException {
        JSONObject params = new JSONObject();
        params.put("amount", (int)(amountRupees * 100)); // convert to paise
        params.put("currency", "INR");
        params.put("receipt", receipt);
        params.put("payment_capture", 1); // auto-capture

        Order rzpOrder = getRazorpayClient().orders.create(params);
        return rzpOrder.get("id");
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            String expectedSignature = Utils.getHash(data, keySecret);
            return expectedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    public void processRefund(String paymentId, double amountRupees) throws RazorpayException {
        JSONObject params = new JSONObject();
        params.put("amount", (int)(amountRupees * 100));
        params.put("speed", "normal"); // "optimum" for instant (extra fee)
        getRazorpayClient().payments.refund(paymentId, params);
    }
}
```

---

## Webhook Handler

```java
@PostMapping("/api/payments/webhook")
public ResponseEntity<Void> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("X-Razorpay-Signature") String signature) {

    // Verify webhook signature
    String expectedSignature = Utils.getHash(payload, webhookSecret);
    if (!expectedSignature.equals(signature)) {
        return ResponseEntity.status(400).build();
    }

    JSONObject event = new JSONObject(payload);
    String eventType = event.getString("event");

    switch (eventType) {
        case "payment.captured":
            paymentService.handlePaymentCaptured(event);
            break;
        case "payment.failed":
            paymentService.handlePaymentFailed(event);
            break;
        case "refund.processed":
            paymentService.handleRefundProcessed(event);
            break;
    }

    return ResponseEntity.ok().build();
}
```

---

## Frontend Checkout

```typescript
// Load Razorpay script
useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  document.body.appendChild(script)
}, [])

// Open checkout
const handlePay = async () => {
  // Step 1: Create order on backend
  const { razorpayOrderId, amount } = await paymentsApi.create({ orderId })

  // Step 2: Open Razorpay modal
  const rzp = new (window as any).Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    order_id: razorpayOrderId,
    amount,
    currency: 'INR',
    name: 'Locafy',
    description: `Order ${orderNumber}`,
    prefill: { name, email, contact: phone },
    theme: { color: '#4f46e5' },
    handler: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
      // Step 3: Verify on backend
      await paymentsApi.verify({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      })
      router.push(`/orders/${orderId}?payment=success`)
    },
  })
  rzp.open()
}
```

---

## Environment Variables

```env
# backend
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
```

**Never put `KEY_SECRET` or `WEBHOOK_SECRET` in the frontend.**

---

## Test Mode

Razorpay provides test credentials (`rzp_test_xxx`) and test card numbers:
- Card: `4111 1111 1111 1111`, any future expiry, any CVV
- UPI: `success@razorpay`

Switch between test/live by changing the `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
