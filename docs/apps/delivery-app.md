# Delivery App

The delivery partner sub-application is isolated in the `(delivery)` route group. Delivery partners accept orders, navigate to shops and customers, and track their earnings.

---

## Entry Point — Login / Signup

**Signup Flow:**
1. Email + password or Google OAuth
2. Phone OTP verification
3. Personal details: name, address, ID proof upload (Aadhaar / DL)
4. Vehicle type selection: Bicycle / Motorcycle / Car
5. Zone selection: choose the locality/area they want to deliver in
6. Admin approval required before first delivery

**Login:**
- Email + password or Google OAuth

After login, delivery partner lands on the **Delivery Dashboard**.

---

## Layout

Mobile-first design with bottom tab navigation:

```
[ Dashboard ]  [ Orders ]  [ History ]  [ Finance ]  [ Profile ]
```

---

## Pages

### Dashboard (`/delivery/dashboard`)

**Active Order Card** (if an order is accepted):
- Prominent full-width card showing current order
- Order number, shop name, customer locality
- Status: "Go to Shop" or "Out for Delivery"
- Quick navigation button → `/delivery/orders/:orderId/navigate`

**Today's Stats Row:**
- Deliveries completed today
- Earnings today
- Distance covered today (km)

**Availability Toggle:**
- Green "Online" / Red "Offline" switch
- When offline, partner does not appear in the order pool

---

### Order Pool (`/delivery/orders`)

A list of unassigned orders available for pickup in the delivery partner's zone.

**Order Pool Card shows:**
- Order number
- Shop name + distance from current location (km)
- Customer drop-off locality
- Estimated earnings for this delivery
- Estimated time (pickup + drop)
- "Accept" button

**Accept flow:**
1. Tap "Accept" → `PUT /api/orders/:id/accept`
2. Order locked to this partner (other partners no longer see it)
3. Redirected to Order Detail page
4. Navigation can be started from there

**Refresh Behaviour:**
- Pool auto-refreshes every 15 seconds
- WebSocket push when new order available in zone

---

### Order Detail + Navigation (`/delivery/orders/:orderId`)

**Two-phase navigation:**

**Phase 1 — Go to Shop:**
- Shop name, address, phone
- Map showing delivery partner's current location and shop pin
- "Start Navigation" button → opens `/delivery/orders/:orderId/navigate` with shop as destination
- "Picked Up" button → marks order PICKED_UP, transitions to Phase 2

**Phase 2 — Go to Customer:**
- Customer address (no phone — privacy)
- Map showing current location and customer drop pin
- "Start Navigation" button → opens navigation page with customer address
- "Mark Delivered" button → opens proof-of-delivery flow

**Proof of Delivery:**
- Camera opens to take a photo
- Photo uploaded to Cloudinary
- Confirms delivery → order marked DELIVERED
- Earnings credited to partner's account

---

### Navigation Page (`/delivery/orders/:orderId/navigate`)

Full-screen Mapbox navigation view.

**Features:**
- Turn-by-turn directions (Mapbox Directions API)
- ETA display
- Distance remaining
- Current speed
- Re-routing on deviation

**GPS Location Streaming:**
- Device GPS posted to `/app/delivery/location` (WebSocket) every 5 seconds
- Spring Boot relays to customer's tracking page via `/topic/delivery/:orderId`

**Waypoints:**
- Waypoint 1: Vendor shop (Phase 1)
- Waypoint 2: Customer drop address (Phase 2)

---

### Past Orders / History (`/delivery/history`)

- Table of completed deliveries
- Date, shop, drop locality, distance, earnings, time taken
- Paginated with date range filter

---

### Finance (`/delivery/finance`)

**Summary Cards:**
- Today's Earnings
- This Week's Earnings
- This Month's Earnings
- Total Lifetime Earnings

**Earnings Chart:**
- Bar chart: daily earnings for the last 30 days

**Per-Delivery Breakdown Table:**
- Order number, date, distance, base pay, distance bonus, tip (if applicable), total

**Withdrawal Section:**
- UPI ID or bank account setup in profile
- Available balance
- "Withdraw" button (instant UPI or next-day bank transfer)
- Withdrawal history

---

### Profile (`/delivery/profile`)

- Personal details: name, phone, email, avatar
- Vehicle details: type, registration number
- ID documents: view uploaded / re-upload if expired
- Bank / UPI details for payouts
- Delivery zones: view and change zone
- Ratings received from customers (average + per-delivery)
- Link/unlink Google account
- Change password
- Logout

---

## Real-time Integration

| Event | Trigger | Channel |
|-------|---------|---------|
| New order in pool | Any order confirmed in zone | WebSocket push |
| Order accepted confirmation | Partner accepts | REST response |
| GPS location update | Every 5 seconds while navigating | WebSocket send to server |
| Order status broadcast | Partner marks picked up / delivered | WebSocket broadcast to customer |

---

## Offline Handling

The delivery app is designed to handle intermittent mobile data:

- GPS coordinates are buffered locally and sent in batch when connection resumes
- Order details are cached in TanStack Query for 30 minutes (can navigate without data)
- Navigation falls back to Mapbox offline tiles (pre-downloaded for the zone)
