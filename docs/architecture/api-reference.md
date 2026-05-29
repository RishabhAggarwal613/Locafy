# API Reference

All backend endpoints are served by Spring Boot 3 at `http://localhost:8080` (local) or `https://api.locafy.in` (production).

Authentication is required on all endpoints unless marked **Public**. Send the JWT in the `Authorization: Bearer <token>` header.

---

## Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | Public | Register with email + password + role |
| POST | `/api/auth/login` | Public | Login, receive access + refresh tokens |
| POST | `/api/auth/google` | Public | Google ID token → upsert user → Locafy JWT |
| POST | `/api/auth/google/link` | Customer/Vendor/Delivery | Link Google to existing account |
| DELETE | `/api/auth/google/unlink` | Customer/Vendor/Delivery | Unlink Google (only if email+pass set) |
| POST | `/api/auth/refresh` | Public (cookie) | Exchange refresh token for new access token |
| POST | `/api/auth/logout` | Any | Invalidate refresh token in Redis blocklist |
| POST | `/api/auth/otp/send` | Public | Send OTP to phone number via Twilio |
| POST | `/api/auth/otp/verify` | Public | Verify OTP, return JWT pair |
| POST | `/api/auth/password/reset` | Public | Send password reset link via email |
| PUT | `/api/auth/password` | Any | Change password (authenticated) |

---

## Customer Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/customers/me` | Customer | Get own profile |
| PUT | `/api/customers/me` | Customer | Update profile (name, phone, avatar) |
| GET | `/api/customers/me/addresses` | Customer | List saved addresses |
| POST | `/api/customers/me/addresses` | Customer | Add a new saved address |
| PUT | `/api/customers/me/addresses/:id` | Customer | Update an address |
| DELETE | `/api/customers/me/addresses/:id` | Customer | Remove an address |
| PUT | `/api/customers/me/location` | Customer | Update current locality/coordinates |

---

## Shop Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shops` | Public | List shops (geo-radius, category, search filter) |
| GET | `/api/shops/:id` | Public | Get shop details |
| GET | `/api/shops/slug/:slug` | Public | Get shop by URL slug |
| GET | `/api/shops/:id/products` | Public | List products for a shop (paginated) |
| GET | `/api/shops/:id/reviews` | Public | List reviews for a shop |
| POST | `/api/shops` | Vendor | Create a new shop |
| PUT | `/api/shops/:id` | Vendor (owner) | Update shop details |
| PUT | `/api/shops/:id/hours` | Vendor (owner) | Update business hours |
| POST | `/api/shops/:id/cover` | Vendor (owner) | Upload cover image (Cloudinary) |
| DELETE | `/api/shops/:id` | Admin | Soft-delete a shop |
| PUT | `/api/shops/:id/verify` | Admin | Mark shop as verified |

**Query Parameters for `GET /api/shops`:**

| Param | Type | Description |
|-------|------|-------------|
| `lat` | float | User latitude |
| `lng` | float | User longitude |
| `radius` | float | Search radius in km (default: 5) |
| `category` | string | Filter by shop category |
| `q` | string | Full-text search query |
| `open` | boolean | Filter only currently open shops |
| `delivery` | boolean | Filter shops with delivery |
| `page` | int | Page number (0-based) |
| `size` | int | Page size (default: 20) |

---

## Product Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products/:id` | Public | Get product details |
| POST | `/api/products` | Vendor | Create a product |
| PUT | `/api/products/:id` | Vendor (owner) | Update product |
| DELETE | `/api/products/:id` | Vendor (owner) | Delete product |
| PUT | `/api/products/:id/stock` | Vendor (owner) | Toggle availability / update stock |
| POST | `/api/products/bulk` | Vendor | Bulk create via CSV upload |
| POST | `/api/products/:id/images` | Vendor (owner) | Upload product images to Cloudinary |

---

## Search Endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/search` | Public | Unified search across products, shops, and categories |
| GET | `/api/search/autocomplete` | Public | Typeahead suggestions |
| GET | `/api/search/categories` | Public | List all categories (for filter UI) |

**Query Parameters for `GET /api/search`:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query |
| `lat` | float | User latitude |
| `lng` | float | User longitude |
| `radius` | float | km radius (default: 10) |
| `type` | `SHOP\|PRODUCT\|ALL` | What to search (default: ALL) |
| `category` | string | Category filter |
| `minPrice` | number | Min price filter |
| `maxPrice` | number | Max price filter |
| `minRating` | float | Minimum shop/product rating |
| `page` | int | Page number |
| `size` | int | Page size |

---

## Reels Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reels` | Public | Paginated reel feed (cursor-based, geo-ranked) |
| GET | `/api/reels/:id` | Public | Get single reel |
| POST | `/api/reels` | Vendor | Upload and create a reel |
| PUT | `/api/reels/:id` | Vendor (owner) | Edit reel metadata |
| DELETE | `/api/reels/:id` | Vendor (owner) | Delete reel |
| POST | `/api/reels/:id/like` | Customer | Like or unlike a reel |
| POST | `/api/reels/:id/save` | Customer | Save or unsave a reel |
| GET | `/api/reels/saved` | Customer | Get saved reels |

**Query Parameters for `GET /api/reels`:**

| Param | Type | Description |
|-------|------|-------------|
| `lat` | float | User latitude (for geo-ranking) |
| `lng` | float | User longitude |
| `cursor` | string | Cursor for next page (ISO timestamp) |
| `size` | int | Page size (default: 10) |

---

## Cart Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cart` | Customer | Get current cart |
| POST | `/api/cart/items` | Customer | Add item to cart |
| PUT | `/api/cart/items/:productId` | Customer | Update item quantity |
| DELETE | `/api/cart/items/:productId` | Customer | Remove item from cart |
| DELETE | `/api/cart` | Customer | Clear entire cart |

---

## Order Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | Customer | Place a new order |
| GET | `/api/orders` | Customer | Get own orders (paginated) |
| GET | `/api/orders/:id` | Customer/Vendor/Delivery | Get order details |
| PUT | `/api/orders/:id/cancel` | Customer | Cancel an order (if PLACED/CONFIRMED) |
| GET | `/api/orders/vendor` | Vendor | Get orders for vendor's shop |
| PUT | `/api/orders/:id/status` | Vendor | Update order status (CONFIRMED/PREPARING/READY) |
| GET | `/api/orders/delivery` | Delivery | Get orders for delivery partner |
| PUT | `/api/orders/:id/accept` | Delivery | Accept an order from pool |
| PUT | `/api/orders/:id/pickup` | Delivery | Mark as PICKED_UP |
| PUT | `/api/orders/:id/deliver` | Delivery | Mark as DELIVERED (with photo proof) |

---

## Payment Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payments/create` | Customer | Create Razorpay order for checkout |
| POST | `/api/payments/verify` | Customer | Verify Razorpay payment signature |
| POST | `/api/payments/webhook` | Public (Razorpay) | Razorpay event webhook receiver |
| GET | `/api/payments/history` | Customer | Customer payment history |

---

## Vendor Dashboard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/vendors/dashboard` | Vendor | Today's summary stats |
| GET | `/api/vendors/finance` | Vendor | Earnings (daily/weekly/monthly) |
| GET | `/api/vendors/finance/payouts` | Vendor | Payout history |
| GET | `/api/vendors/orders/history` | Vendor | Past orders with filters |

---

## Delivery Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/delivery/dashboard` | Delivery | Today's stats and active order |
| GET | `/api/delivery/orders/pool` | Delivery | Available orders in delivery zone |
| GET | `/api/delivery/orders/history` | Delivery | Past completed orders |
| GET | `/api/delivery/finance` | Delivery | Earnings breakdown |
| PUT | `/api/delivery/location` | Delivery | Post current GPS coordinates |

---

## Admin Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users` | Admin | List all users with filters |
| GET | `/api/admin/users/:id` | Admin | Get user details |
| PUT | `/api/admin/users/:id/status` | Admin | Activate / suspend a user |
| GET | `/api/admin/shops` | Admin | List all shops with filters |
| PUT | `/api/admin/shops/:id/verify` | Admin | Verify a shop |
| PUT | `/api/admin/shops/:id/status` | Admin | Activate / suspend a shop |
| GET | `/api/admin/orders` | Admin | All orders platform-wide |
| PUT | `/api/admin/orders/:id/status` | Admin | Override order status |
| GET | `/api/admin/analytics` | Admin | Platform GMV, user counts, funnel |
| GET | `/api/admin/categories` | Admin | Manage category taxonomy |
| POST | `/api/admin/categories` | Admin | Add a category |
| PUT | `/api/admin/categories/:id` | Admin | Update a category |

---

## Review Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reviews` | Customer | Submit a review (requires verified order) |
| GET | `/api/reviews/me` | Customer | Get own submitted reviews |
| DELETE | `/api/reviews/:id` | Admin | Remove a review |

---

## WebSocket Endpoints (STOMP over SockJS)

Connect URL: `ws://api.locafy.in/ws`

| Topic / Destination | Direction | Subscribers | Payload |
|--------------------|-----------|-------------|---------|
| `/topic/orders/{orderId}` | Server → Client | Customer, Vendor, Delivery | `{ status, timestamp, note }` |
| `/topic/delivery/{orderId}` | Server → Client | Customer | `{ lat, lng, heading, speed }` |
| `/app/delivery/location` | Client → Server | Delivery partner | `{ orderId, lat, lng, heading }` |
| `/user/queue/notifications` | Server → Client | Authenticated user | `{ title, body, payload }` |
| `/topic/vendor/{shopId}/orders` | Server → Client | Vendor | New order alert `{ orderId, total }` |

---

## Error Responses

All errors follow a consistent JSON shape:

```json
{
  "timestamp": "2026-05-29T11:45:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Product with id 'abc123' not found",
  "path": "/api/orders"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Validation error or bad request body |
| 401 | Missing or invalid JWT |
| 403 | Valid JWT but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, shop already exists) |
| 422 | Business rule violation (e.g. ordering from closed shop) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
