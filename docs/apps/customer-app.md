# Customer App

The customer sub-application lives at the `/` route of the Next.js app (after login) and is isolated in the `(customer)` route group. It is the primary consumer-facing interface of Locafy.

---

## Entry Point — Landing Page

Before login, the customer landing page is a public page showing:

**Hero Section**
- Search bar with locality pre-filled ("Showing results near: *Koramangala*")
- Location switcher button — opens a locality selector modal
- Headline: *"Discover shops around you"*
- CTA: "Sign in to Order" / "Browse Shops"

**Latest Products Carousel**
- Horizontal scroll of recently added products from nearby shops
- Each card: product image, name, price, shop name
- Powered by `GET /api/products?lat=...&lng=...&sort=recent`

**Product Categories Grid**
- All top-level categories (Food, Groceries, Electronics, Fashion, etc.)
- Click to search with that category pre-selected

**Nearby Shop Cards**
- Cards sorted by distance (nearest first)
- Each card shows: shop cover image, name, category badges, distance, rating, open/closed status
- Powered by `GET /api/shops?lat=...&lng=...&radius=3`

**Auth Prompt Banner**
- Sticky bottom banner for unauthenticated users: "Sign in to add to cart and order"

---

## Authentication

Routes for login and signup:
- `/auth/login` — email+password login or Google OAuth button
- `/auth/signup` — role selection → fill details → OTP verification

After login, the user is redirected back to the landing page with the full navbar unlocked.

**Navbar (after login):**
```
[ Locafy Logo ]  [ Search ]  Reels  Cart(2)  Orders  Profile  [ Location: Koramangala ▼ ]
```

---

## Pages

### Reels Feed (`/reels`)

The reels page is a full-screen, vertically scrollable feed of short product videos — similar to Instagram Reels or TikTok, but every reel is a product showcase from a local vendor.

**Behaviour:**
- Full-viewport video card takes up the entire screen
- Swipe/scroll up loads the next reel
- Infinite scroll via TanStack Query infinite query (`GET /api/reels?cursor=...&lat=...`)
- Videos use HLS.js for adaptive bitrate streaming from Cloudinary

**Controls on each reel:**
- **Like** — heart icon, optimistic update, calls `POST /api/reels/:id/like`
- **Save** — bookmark icon, saves to customer's saved list
- **View Product** — taps to the product detail page `/products/:id`
- **View Shop** — taps to the shop page `/shops/:shopId`
- **Share** — native share API

**Reel metadata overlay:**
- Shop name + avatar (bottom left)
- Product name and price (bottom center)
- Like / save counts

---

### Search & Discovery (`/search`)

The search page is the primary discovery interface.

**Search Bar**
- Real-time autocomplete via `GET /api/search/autocomplete?q=...`
- Recent searches stored in localStorage
- Voice search via Web Speech API

**Search Modes:**
| Mode | What it searches |
|------|-----------------|
| Default (ALL) | Products + shops combined |
| Products | Only products across all nearby shops |
| Shops | Only shop names and categories |
| Category | Browse by category tree |

**Filters Panel (slide-in drawer):**
- Distance radius (1km / 3km / 5km / 10km / Custom)
- Category multi-select
- Price range slider (for product search)
- Min rating (1–5 stars)
- Open now toggle
- Delivery available toggle

**Results Layout:**

*Shop Results* — cards showing:
- Cover image
- Shop name
- Category badges
- Distance (e.g., "1.2 km away")
- Rating + review count
- Open/Closed status
- Delivery badge (if delivery available)

Clicking a shop card → navigates to `/shops/:shopId`

*Product Results* — cards showing:
- Product image
- Name and price
- Shop name + distance
- Add to Cart button

---

### Shop Page (`/shops/:shopId`)

Full detail page for a vendor's shop.

**Shop Header:**
- Cover banner image
- Shop logo, name, category
- Rating with star display and review count
- Address with "Get Directions" link (opens Google Maps)
- Business hours (today highlighted, full week expandable)
- Distance from user's current location
- Open/Closed badge
- Delivery info (available / not available, min order, radius)

**Product Listing:**
- Category tabs to filter products by subcategory
- Products shown as grid cards
- Search within shop
- Each product card: image, name, price, discounted price (if any), Add to Cart

**Reviews Section:**
- Recent reviews with star rating, reviewer name, and date
- "View All Reviews" expands the list

---

### Product Page (`/products/:productId`)

Full detail page for a single product.

**Product Images:**
- Full-width image carousel with thumbnails
- Zoom on tap (mobile) / hover (desktop)

**Product Details:**
- Name, price, discounted price with savings badge
- Category and tags
- Description (markdown rendered)
- Stock status: *"In Stock (15 left)"* / *"Out of Stock"*
- Unit (per kg / per piece / per litre)
- Shop name link → shop page

**Actions:**
- **Add to Cart** — adds to cart, shows quantity stepper if already in cart
- **Buy Now** — adds to cart and redirects directly to checkout

**Related Products:**
- Horizontal scroll of other products from the same shop

---

### Cart (`/cart`)

**Cart Contents:**
- List of items with product image, name, quantity stepper, price
- Remove item button
- Subtotal per item

**Cart Summary:**
- Subtotal
- Delivery fee (if delivery selected)
- Platform fee
- Total

**Fulfillment Toggle:**
- **Pickup** — customer collects from shop. Shows estimated ready time.
- **Delivery** — home delivery. Shows estimated delivery time.

**Proceed Options:**
- → Checkout page

---

### Checkout (`/checkout`)

**Delivery Address:**
- Dropdown of saved addresses
- "Add New Address" form with map pin picker (Mapbox)

**Payment Method:**
- Cash on Delivery (COD)
- Pay Online → opens Razorpay checkout modal

**Order Summary:**
- Final itemized summary before placing

**Place Order:**
- Calls `POST /api/orders`
- On success: redirects to order confirmation page

---

### Orders (`/orders`)

**Orders List:**
- Grouped by status: Active, Past
- Each order card: order number, shop name, total, status badge, date
- Click → order detail

**Order Detail (`/orders/:orderId`):**
- Full order breakdown (items, prices)
- Status timeline (Placed → Confirmed → Preparing → Ready → Picked Up → Delivered)
- Real-time status updates via WebSocket (`/topic/orders/:orderId`)
- Live delivery map (Mapbox) when status is OUT_FOR_DELIVERY
- "Navigate to Shop" button for pickup orders (when status is READY)
- "Rate & Review" button after delivery

---

### Profile (`/profile`)

- Personal info: name, email, phone, avatar (upload to Cloudinary)
- Saved addresses (add / edit / delete)
- Location preferences
- Notification settings (SMS, email, push)
- Order history quick link
- Account settings: change password, link/unlink Google
- Logout

---

## Location Switcher

Available on all customer pages via the navbar.

**Features:**
- Shows current locality name
- Click to open modal with:
  - Search locality by name or pincode
  - Use current GPS location (browser geolocation API)
  - Radius selector (1km / 3km / 5km / 10km)
- On change: updates Zustand `locationStore`, re-fetches all location-dependent queries via TanStack Query's `queryKey` invalidation

---

## State Management

| Store | Contents |
|-------|---------|
| `authStore` | User profile, JWT, role |
| `cartStore` | Cart items, subtotal, shop context |
| `locationStore` | Current locality name, lat/lng, radius |
| `orderStore` | Active order IDs, WebSocket subscription state |
