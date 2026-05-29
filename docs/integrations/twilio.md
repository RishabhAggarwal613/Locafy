# Twilio Integration

Twilio is used for **SMS-based OTP verification** during signup and password reset, and for **order notification SMS** sent to customers, vendors, and delivery partners.

---

## Setup

1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Get a Twilio phone number (or use Alphanumeric Sender ID for India)
3. Dashboard → Account Info → copy **Account SID** and **Auth Token**
4. For OTP: use Twilio Verify Service (recommended over manual OTP)

---

## Maven Dependency

```xml
<dependency>
  <groupId>com.twilio.sdk</groupId>
  <artifactId>twilio</artifactId>
  <version>9.14.0</version>
</dependency>
```

---

## Twilio Service (`TwilioService.java`)

```java
@Service
public class TwilioService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.verify-service-sid}")
    private String verifyServiceSid;

    @Value("${twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    // Send OTP via Twilio Verify
    public void sendOtp(String phoneNumber) {
        Verification.creator(verifyServiceSid, phoneNumber, "sms").create();
    }

    // Verify OTP
    public boolean verifyOtp(String phoneNumber, String code) {
        VerificationCheck check = VerificationCheck.creator(verifyServiceSid)
            .setTo(phoneNumber)
            .setCode(code)
            .create();
        return "approved".equals(check.getStatus().toString());
    }

    // Send raw SMS (for order notifications)
    public void sendSms(String to, String message) {
        Message.creator(new PhoneNumber(to), new PhoneNumber(fromNumber), message).create();
    }
}
```

---

## OTP Flow

### Send OTP

```
POST /api/auth/otp/send
Body: { phone: "+919876543210" }

1. Validate phone format
2. Rate limit: max 3 OTP requests per phone per 10 minutes (Redis)
3. Call twilioService.sendOtp(phone)
4. Return { message: "OTP sent" }
```

### Verify OTP

```
POST /api/auth/otp/verify
Body: { phone: "+919876543210", otp: "123456" }

1. Call twilioService.verifyOtp(phone, otp)
2. If approved: mark user.isVerified = true
3. Issue JWT pair
4. Return { accessToken, user }
```

**Why Twilio Verify?**
Twilio Verify manages OTP generation, SMS delivery, expiry (10 min), and attempt limiting automatically. This avoids storing OTPs in Redis manually.

---

## Order Notification SMS

SMS notifications are triggered asynchronously (non-blocking) using Spring's `@Async`:

```java
@Service
public class NotificationService {

    @Async
    public void notifyCustomerOrderConfirmed(Order order, User customer) {
        String message = String.format(
            "Hi %s! Your order #%s from %s has been confirmed. Estimated ready time: %s. - Locafy",
            customer.getName(),
            order.getOrderNumber(),
            order.getShopName(),
            order.getEstimatedReadyTime()
        );
        twilioService.sendSms(customer.getPhone(), message);
    }

    @Async
    public void notifyCustomerOrderDelivered(Order order, User customer) {
        String message = String.format(
            "Order #%s delivered! Rate your experience at locafy.in/orders/%s. - Locafy",
            order.getOrderNumber(), order.getId()
        );
        twilioService.sendSms(customer.getPhone(), message);
    }

    @Async
    public void notifyVendorNewOrder(Order order, User vendor) {
        String message = String.format(
            "New order #%s received! Total: ₹%s. Login to confirm. - Locafy",
            order.getOrderNumber(), order.getTotal()
        );
        twilioService.sendSms(vendor.getPhone(), message);
    }
}
```

---

## SMS Templates by Event

| Event | Recipient | Message Template |
|-------|----------|-----------------|
| Signup OTP | New user | OTP via Twilio Verify (auto-formatted) |
| Password reset OTP | Any user | OTP via Twilio Verify |
| Order placed | Vendor | "New order #X received. ₹Y. Login to confirm." |
| Order confirmed | Customer | "Order #X confirmed. Ready by ~HH:MM." |
| Order ready (pickup) | Customer | "Order #X is ready! Come pick it up at [Shop]." |
| Delivery picked up | Customer | "Your order #X is on the way!" |
| Order delivered | Customer | "Order #X delivered! Tap to rate." |
| Order cancelled | Customer | "Order #X cancelled. Refund in 5–7 days." |

---

## Rate Limiting

OTP send requests are rate-limited in Redis to prevent abuse:

```java
// OTP rate limiting — max 3 sends per phone per 10 minutes
String key = "otp:rate:" + phone;
Long count = redisTemplate.opsForValue().increment(key);
if (count == 1) {
    redisTemplate.expire(key, 10, TimeUnit.MINUTES);
}
if (count > 3) {
    throw new TooManyRequestsException("Too many OTP requests. Try again in 10 minutes.");
}
```

---

## Environment Variables

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+1415xxxxxxx
```

---

## India Compliance Note

For SMS in India, TRAI regulations require DLT (Distributed Ledger Technology) registration:

1. Register your business entity on any DLT platform (e.g., BSNL, Vodafone, Jio)
2. Register your SMS header (sender ID, e.g., "LOCAFY")
3. Register each SMS template you plan to use
4. Add the approved Template ID to each message via Twilio's `StatusCallback` or via Twilio's India DLT support

Twilio has India DLT support — see [Twilio India DLT docs](https://help.twilio.com/articles/360038172934).
