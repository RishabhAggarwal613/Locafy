# Admin App

The admin sub-application is isolated in the `(admin)` route group. It provides platform operators with full oversight and control over all users, shops, orders, and platform-level settings.

---

## Entry Point — Login

Admin login is email + password only. **Google OAuth is intentionally disabled for admin accounts.**

**Additional Security:**
- 2-Factor Authentication (TOTP via Google Authenticator or similar)
- All admin actions are audit-logged with timestamp, admin user ID, and action details
- IP allowlist (optional — configurable in `application-prod.yml`)

---

## Layout

Admin app uses a **top navigation bar** + **collapsible left sidebar** layout — similar to SaaS admin dashboards.

**Sidebar Navigation:**
```
Dashboard
Users
  ├── Customers
  ├── Vendors
  └── Delivery Partners
Shops
Products
Orders
Finance
Analytics
Categories
Settings
```

---

## Pages

### Dashboard (`/admin/dashboard`)

High-level platform health at a glance.

**Stats Row:**
- Total active users (by role)
- Shops pending verification
- Orders today
- GMV today (Gross Merchandise Value)
- Active delivery partners online

**Charts:**
- Orders per day — last 30 days (line chart)
- GMV per day — last 30 days (bar chart)
- New user signups by role — last 7 days (stacked bar)

**Pending Actions Queue:**
- Shops awaiting verification (table with quick approve/reject)
- Delivery partner documents awaiting review
- Reported products flagged for moderation

---

### Customer Management (`/admin/users/customers`)

**Table Columns:**
- Name, email, phone, locality, registration date, order count, status (Active / Suspended)

**Filters:**
- Search by name/email/phone
- Filter by status
- Filter by locality

**Actions per customer:**
- View profile (opens detail drawer)
- View order history
- Suspend account (with reason)
- Reinstate account

---

### Vendor Management (`/admin/users/vendors`)

**Table Columns:**
- Shop name, owner name, email, category, locality, verification status, active orders, total GMV, status

**Filters:**
- Verified / Unverified
- Active / Suspended
- Category
- Locality / City

**Actions per vendor:**
- View shop details
- Approve verification (marks shop as verified, unlocks full access)
- Reject verification (with reason — triggers email to vendor)
- Suspend shop (hides from discovery)
- View finance summary
- View all products

**Verification Review:**
- View uploaded GST / trade license documents
- Approve or Reject with a reason message

---

### Delivery Partner Management (`/admin/users/delivery`)

**Table Columns:**
- Name, email, phone, zone, vehicle type, approval status, deliveries completed, earnings, rating, status

**Actions:**
- Approve / reject new delivery partner (with document review)
- View delivery history
- Change assigned zone
- Suspend / reinstate

---

### Shop Management (`/admin/shops`)

Comprehensive view of all shops on the platform.

**Table Columns:**
- Shop name, owner, city, category, products count, orders today, rating, verified status, active status

**Actions:**
- View shop page (same as public shop page)
- Edit shop details (admin override)
- Verify / unverify
- Suspend / activate
- View all products
- View finance

---

### Product Moderation (`/admin/products`)

Products flagged by users or the automated moderation system.

**Flagged Products Table:**
- Product name, shop, category, flag reason, flag count, date flagged

**Actions:**
- View product
- Remove product (hides from catalog, notifies vendor)
- Dismiss flag (mark as reviewed and OK)
- Bulk actions (approve / remove multiple)

---

### Order Management (`/admin/orders`)

Full visibility into all orders on the platform.

**Table Columns:**
- Order number, customer, shop, delivery partner (if assigned), total, payment method, status, date

**Filters:**
- Date range
- Status
- Payment method
- Fulfillment type (Delivery / Pickup)
- City / locality

**Actions:**
- View full order detail
- Override order status (for dispute resolution)
- Issue refund (triggers Razorpay refund API)
- Flag for investigation

---

### Finance Overview (`/admin/finance`)

Platform-wide financial summary.

**Stats:**
- Total GMV (all time, this month, today)
- Platform fee collected (this month)
- Total payouts to vendors
- Total earnings by delivery partners
- Pending payouts

**Payout Management:**
- List of vendor payout requests
- Approve payout → triggers bank transfer
- Delivery partner withdrawal requests

---

### Analytics (`/admin/analytics`)

**User Growth:**
- Line chart: new signups per role per day (last 90 days)

**Order Funnel:**
- Funnel chart: Placed → Confirmed → Delivered (with drop-off percentages)

**Top Shops:**
- Table: shop name, orders, GMV, rating (last 30 days)

**Top Products:**
- Table: product name, shop, orders, revenue (last 30 days)

**Geographic Heatmap:**
- Mapbox heatmap showing order density by locality

**Churn Analysis:**
- Customers with no orders in 30 days
- Vendors with no orders in 7 days (at-risk)

---

### Category Management (`/admin/categories`)

- Hierarchical tree view of all product and shop categories
- Add / edit / delete categories
- Drag-and-drop reordering
- Upload category icon (Cloudinary)
- Activate / deactivate categories

---

### Platform Settings (`/admin/settings`)

- Platform fee percentage (applied to all orders)
- Delivery fee structure (base + per-km rate)
- Allowed delivery radius (global max)
- Razorpay configuration (live/test mode toggle)
- SMS / email notification templates
- Maintenance mode toggle
- Announcement banner (shown to all users on app)

---

## Audit Log

Every admin action is recorded in an audit log:

```json
{
  "adminId": "ObjectId",
  "action": "VENDOR_VERIFIED | USER_SUSPENDED | ORDER_REFUNDED | ...",
  "targetId": "ObjectId",
  "targetType": "USER | SHOP | ORDER | PRODUCT",
  "details": "string (human-readable description)",
  "timestamp": "ISODate",
  "ip": "string"
}
```

Audit logs are queryable by admin, action type, target, and date range. They are stored separately (never deleted) for compliance.
