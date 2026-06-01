# Vendor App

> **Implementation status (Phase 4 + 8):** Shop, products, orders, and Reel Studio are built. Finance/history sidebar items still marked "Soon". Paths use `/vendor/*` (not route group `(vendor)`).

The vendor sub-application is isolated under `/vendor`. Vendors are shop owners who list their products, upload reels, manage orders, and track earnings.

---

## Entry Point — Login / Signup

Vendors land on a dedicated auth page with a clean, professional design:

- **Signup flow:**
  1. Email + password registration OR Google OAuth
  2. Phone number entry + OTP verification (Twilio)
  3. Business details form (shop name, category, address, pincode)
  4. Document verification step (GST / trade license upload — admin reviews)
  5. Pending approval state (admin must verify before full access)

- **Login:**
  - Email + password
  - "Continue with Google" button

After login, vendors land on the **Vendor Dashboard**.

---

## Layout

The vendor app uses a **left sidebar navigation** on desktop and a **bottom tab bar** on mobile.

**Sidebar / Nav Links:**
```
Profile
Shop Profile
Products
Reels
Orders  (badge: new orders count)
History
Finance
Logout
```

---

## Pages

### Dashboard (`/vendor/dashboard`)

Summary card widgets at the top:

| Widget | Data Source |
|--------|------------|
| Today's Orders | Orders with status PLACED/CONFIRMED/PREPARING today |
| Today's Revenue | Sum of paid orders for today |
| Pending Orders | Orders awaiting confirmation |
| Top Product Today | Most-ordered product today |

**Charts (below widgets):**
- Orders per day — bar chart (last 7 days)
- Revenue per day — line chart (last 7 days)

**Recent Orders Section:**
- Last 5 orders with status and quick-action buttons (Confirm / Reject)

**Quick Actions:**
- Add Product button
- Upload Reel button

---

### Shop Profile (`/vendor/shop`)

**Editable fields:**
- Shop name
- Description (rich text)
- Categories (multi-select from category taxonomy)
- Phone number
- Email
- Address with map pin picker (Mapbox) to set exact location
- Cover photo upload (Cloudinary — drag & drop)
- Logo upload (Cloudinary)
- Business hours (per day, open/close time, mark as closed)
- Delivery settings: toggle delivery on/off, set delivery radius (km), min order amount
- Pickup settings: toggle pickup on/off

**Shop Status:**
- Active / Paused toggle (pausing hides shop from discovery without deleting)
- Verification badge (shown once admin approves)

---

### Product Manager (`/vendor/products`)

**Product List:**
- Grid or list toggle
- Search and filter (by category, availability)
- Quick stock toggle (In Stock / Out of Stock) inline
- Edit and Delete buttons per product

**Add Product (`/vendor/products/new`):**

Form fields:
- Product name
- Description
- Category (hierarchical selector)
- Price and discounted price
- Unit (piece / kg / litre / pack / etc.)
- Stock quantity
- Images: up to 8 images (drag & drop, Cloudinary upload)
- Tags
- SKU (optional)

**Bulk Upload:**
- Download CSV template
- Upload filled CSV → Spring Boot processes and bulk-creates products

---

### Reel Studio (`/vendor/reels`) ✅

**Built:**
- Reel list with publish / processing / delete
- Upload at `/vendor/reels/new` — video, title, caption, product tag, publish toggle
- Cloudinary HLS transcoding + optional webhook

**(Spec — not built):** Published / Draft / Scheduled tabs, schedule picker.

---

### Orders (`/vendor/orders`)

**Incoming Orders Tab:**
- Real-time updates via WebSocket (`/topic/vendor/:shopId/orders`)
- New order triggers a browser notification + sound alert
- Order cards show: order number, customer initials, items summary, total, time placed

**Order Actions:**
| Status | Available Actions |
|--------|-----------------|
| PLACED | Confirm, Reject (with reason) |
| CONFIRMED | Mark Preparing |
| PREPARING | Mark Ready |
| READY | (waiting for customer pickup or delivery partner) |

**Order Detail Modal:**
- Full item breakdown with quantities
- Customer name (no phone — privacy)
- Fulfillment type: Pickup or Delivery
- Payment method and status
- Notes from customer (if any)

---

### Order History (`/vendor/history`)

- Table of all past orders (paginated)
- Filters: date range, status, fulfillment type
- Export to CSV button
- Click order row → full order detail

---

### Finance Dashboard (`/vendor/finance`)

**Summary Cards:**
- This Week's Earnings
- This Month's Earnings
- Total Earnings (all time)
- Pending Payout (amount awaiting transfer)

**Earnings Chart:**
- Line chart: daily earnings for the past 30 days

**Order Breakdown Table:**
- Per-order: order number, date, total, platform fee, net earnings, payout status

**Payout Section:**
- Bank account details (set in profile)
- Payout history list (date, amount, bank reference, status)
- "Request Payout" button (triggers admin review)

**GST Summary:**
- Monthly GST-applicable turnover
- Downloadable GST report (PDF)
