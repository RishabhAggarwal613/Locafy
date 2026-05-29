# Database Schema

Locafy uses **MongoDB Atlas** as its primary database. All data is stored as JSON documents. This page documents every collection, its fields, types, and relationships.

---

## Collections Overview

| Collection | Documents Contain | Approximate Size |
|------------|-------------------|-----------------|
| `users` | All 4 roles (unified with `role` field) | 1 doc per user |
| `shops` | Vendor shop profiles + geo location | 1 doc per shop |
| `products` | Product catalog items per shop | Many per shop |
| `orders` | Full order lifecycle | 1 doc per order |
| `reels` | Short product video metadata | Many per vendor |
| `carts` | Active customer carts (1 per customer) | 1 doc per customer |
| `categories` | Taxonomy of product/shop categories | Small, relatively static |
| `reviews` | Customer reviews for shops and products | Many per shop/product |
| `notifications` | In-app and push notification queue | Many per user |
| `transactions` | Payment and payout ledger | 1 per payment event |
| `deliveryLocations` | Live delivery GPS positions | 1 per active delivery |

---

## Collection Schemas

### `users`

```json
{
  "_id": "ObjectId",
  "email": "string (unique, indexed)",
  "passwordHash": "string | null",
  "googleId": "string | null (unique sparse index)",
  "authProvider": "EMAIL | GOOGLE | BOTH",
  "role": "CUSTOMER | VENDOR | DELIVERY | ADMIN",
  "name": "string",
  "phone": "string | null",
  "avatarUrl": "string (Cloudinary URL)",
  "isVerified": "boolean",
  "isActive": "boolean",
  "locality": {
    "name": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "coordinates": { "type": "Point", "coordinates": ["lng", "lat"] }
  },
  "savedAddresses": [
    {
      "label": "Home | Work | Other",
      "line1": "string",
      "line2": "string",
      "city": "string",
      "pincode": "string",
      "coordinates": { "type": "Point", "coordinates": ["lng", "lat"] }
    }
  ],
  "notificationPrefs": {
    "sms": "boolean",
    "email": "boolean",
    "push": "boolean"
  },
  "createdAt": "ISODate",
  "updatedAt": "ISODate",
  "lastLoginAt": "ISODate"
}
```

**Indexes:**
- `email` — unique
- `googleId` — unique sparse (only for Google users)
- `role` — for admin queries
- `locality.coordinates` — 2dsphere (if customer location stored here)

---

### `shops`

```json
{
  "_id": "ObjectId",
  "ownerId": "ObjectId (ref: users)",
  "name": "string",
  "slug": "string (unique, URL-safe)",
  "description": "string",
  "coverImageUrl": "string (Cloudinary)",
  "logoUrl": "string (Cloudinary)",
  "phone": "string",
  "email": "string",
  "categories": ["string"],
  "tags": ["string"],
  "address": {
    "line1": "string",
    "line2": "string",
    "city": "string",
    "state": "string",
    "pincode": "string"
  },
  "location": {
    "type": "Point",
    "coordinates": ["lng", "lat"]
  },
  "businessHours": [
    {
      "day": "MON | TUE | WED | THU | FRI | SAT | SUN",
      "openTime": "HH:MM",
      "closeTime": "HH:MM",
      "isClosed": "boolean"
    }
  ],
  "isOpen": "boolean (computed, cached)",
  "isActive": "boolean (admin-controlled)",
  "isVerified": "boolean (admin-approved)",
  "rating": "number (0–5, computed average)",
  "reviewCount": "number",
  "deliveryAvailable": "boolean",
  "pickupAvailable": "boolean",
  "minOrderAmount": "number",
  "deliveryRadius": "number (km)",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `location` — 2dsphere (primary geo discovery index)
- `ownerId` — for vendor's own shop lookup
- `slug` — unique
- `categories` — multikey index for category filtering
- Atlas Search index on `name, description, categories, tags`

---

### `products`

```json
{
  "_id": "ObjectId",
  "shopId": "ObjectId (ref: shops)",
  "vendorId": "ObjectId (ref: users)",
  "name": "string",
  "description": "string",
  "price": "number",
  "discountedPrice": "number | null",
  "images": ["string (Cloudinary URLs)"],
  "category": "string",
  "subCategory": "string",
  "tags": ["string"],
  "stock": "number",
  "isAvailable": "boolean",
  "unit": "kg | piece | litre | pack | etc.",
  "weight": "number | null",
  "sku": "string | null",
  "rating": "number (0–5)",
  "reviewCount": "number",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `shopId` — for shop's product listing
- `category` — for category filter
- `isAvailable` — for quick in-stock queries
- Atlas Search index on `name, description, category, tags`

---

### `orders`

```json
{
  "_id": "ObjectId",
  "orderNumber": "string (human-readable, e.g. LOC-20260529-001)",
  "customerId": "ObjectId (ref: users)",
  "shopId": "ObjectId (ref: shops)",
  "vendorId": "ObjectId (ref: users)",
  "deliveryPartnerId": "ObjectId | null (ref: users)",
  "items": [
    {
      "productId": "ObjectId (ref: products)",
      "productName": "string (snapshot)",
      "productImage": "string (snapshot)",
      "quantity": "number",
      "unitPrice": "number (snapshot)",
      "totalPrice": "number"
    }
  ],
  "subtotal": "number",
  "deliveryFee": "number",
  "platformFee": "number",
  "discount": "number",
  "total": "number",
  "fulfillmentType": "DELIVERY | PICKUP",
  "status": "PLACED | CONFIRMED | PREPARING | READY | PICKED_UP | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | REFUNDED",
  "paymentMethod": "COD | RAZORPAY",
  "paymentStatus": "PENDING | PAID | FAILED | REFUNDED",
  "razorpayOrderId": "string | null",
  "razorpayPaymentId": "string | null",
  "deliveryAddress": {
    "line1": "string",
    "city": "string",
    "pincode": "string",
    "coordinates": { "type": "Point", "coordinates": ["lng", "lat"] }
  },
  "statusHistory": [
    { "status": "string", "timestamp": "ISODate", "note": "string" }
  ],
  "estimatedDeliveryTime": "ISODate | null",
  "deliveredAt": "ISODate | null",
  "cancelReason": "string | null",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `customerId + createdAt` — customer order history
- `shopId + status` — vendor order management
- `deliveryPartnerId + status` — delivery partner orders
- `orderNumber` — unique
- `razorpayOrderId` — for payment webhook lookup

---

### `reels`

```json
{
  "_id": "ObjectId",
  "vendorId": "ObjectId (ref: users)",
  "shopId": "ObjectId (ref: shops)",
  "productId": "ObjectId | null (ref: products)",
  "title": "string",
  "description": "string",
  "videoUrl": "string (Cloudinary HLS master URL)",
  "thumbnailUrl": "string (Cloudinary auto-generated)",
  "duration": "number (seconds)",
  "shopLocation": {
    "type": "Point",
    "coordinates": ["lng", "lat"]
  },
  "likes": "number",
  "saves": "number",
  "views": "number",
  "likedBy": ["ObjectId"],
  "savedBy": ["ObjectId"],
  "isPublished": "boolean",
  "publishedAt": "ISODate | null",
  "createdAt": "ISODate"
}
```

**Indexes:**
- `shopId` — vendor's reel dashboard
- `shopLocation` — 2dsphere (for geo-ranked reel feed)
- `publishedAt` — sort by recency
- `productId` — link reel to product page

---

### `carts`

```json
{
  "_id": "ObjectId",
  "customerId": "ObjectId (ref: users, unique)",
  "shopId": "ObjectId | null (cart is single-shop)",
  "items": [
    {
      "productId": "ObjectId (ref: products)",
      "productName": "string",
      "productImage": "string",
      "unitPrice": "number",
      "quantity": "number",
      "totalPrice": "number"
    }
  ],
  "subtotal": "number",
  "updatedAt": "ISODate"
}
```

**Note:** A cart is limited to items from one shop at a time (common hyperlocal pattern). Adding from a different shop prompts to clear the current cart.

---

### `categories`

```json
{
  "_id": "ObjectId",
  "name": "string",
  "slug": "string (unique)",
  "icon": "string (Cloudinary URL or icon name)",
  "parentCategory": "ObjectId | null",
  "type": "PRODUCT | SHOP",
  "displayOrder": "number",
  "isActive": "boolean"
}
```

---

### `reviews`

```json
{
  "_id": "ObjectId",
  "authorId": "ObjectId (ref: users)",
  "targetId": "ObjectId (shop or product _id)",
  "targetType": "SHOP | PRODUCT",
  "orderId": "ObjectId (ref: orders, ensures verified purchase)",
  "rating": "number (1–5)",
  "title": "string",
  "body": "string",
  "images": ["string (Cloudinary)"],
  "isVerifiedPurchase": "boolean",
  "isVisible": "boolean (admin can hide)",
  "createdAt": "ISODate"
}
```

**Indexes:**
- `targetId + targetType` — fetch all reviews for a shop/product
- `authorId` — customer's own reviews
- `orderId` — unique (1 review per order item)

---

### `notifications`

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "type": "ORDER_UPDATE | NEW_ORDER | PROMO | SYSTEM | DELIVERY_UPDATE",
  "title": "string",
  "body": "string",
  "payload": {
    "orderId": "ObjectId | null",
    "shopId": "ObjectId | null",
    "deepLink": "string | null"
  },
  "isRead": "boolean",
  "sentAt": "ISODate",
  "readAt": "ISODate | null"
}
```

---

### `transactions`

```json
{
  "_id": "ObjectId",
  "orderId": "ObjectId (ref: orders)",
  "type": "PAYMENT | REFUND | VENDOR_PAYOUT | DELIVERY_EARNING",
  "amount": "number",
  "currency": "INR",
  "method": "COD | RAZORPAY | UPI | BANK_TRANSFER",
  "status": "PENDING | SUCCESS | FAILED",
  "razorpayOrderId": "string | null",
  "razorpayPaymentId": "string | null",
  "razorpaySignature": "string | null",
  "vendorId": "ObjectId | null",
  "deliveryPartnerId": "ObjectId | null",
  "platformFeeAmount": "number",
  "createdAt": "ISODate",
  "settledAt": "ISODate | null"
}
```

---

### `deliveryLocations`

```json
{
  "_id": "ObjectId",
  "deliveryPartnerId": "ObjectId (ref: users)",
  "orderId": "ObjectId (ref: orders)",
  "coords": {
    "type": "Point",
    "coordinates": ["lng", "lat"]
  },
  "heading": "number (degrees, 0–360)",
  "speed": "number (km/h)",
  "accuracy": "number (metres)",
  "timestamp": "ISODate"
}
```

**Note:** This collection is high-write. Documents are upserted every 5 seconds per active delivery. Old entries (> 24 hours) are cleaned by a scheduled job. The `coords` field has a 2dsphere index for nearest-delivery queries.

---

## Relationships Summary

```
users (VENDOR) ──── 1:1 ──── shops
shops ──────────── 1:N ──── products
shops ──────────── 1:N ──── reels
users (CUSTOMER) ── 1:1 ──── carts
users (CUSTOMER) ── 1:N ──── orders
orders ─────────── N:1 ──── shops
orders ─────────── N:1 ──── users (DELIVERY)
orders ─────────── 1:N ──── transactions
users ──────────── 1:N ──── reviews  ──── N:1 ──── shops | products
users ──────────── 1:N ──── notifications
users (DELIVERY) ── 1:N ──── deliveryLocations
```
