# Build Phases

Locafy is a large application. This document breaks the build into 11 sequential phases, each with a clear goal and deliverable. Complete each phase fully before moving to the next.

---

## Phase 1 — Foundation

**Goal:** Running monorepo with all services connected.

**Tasks:**
- [ ] Create monorepo structure (`frontend/`, `backend/`, `docs/`)
- [ ] Initialize Next.js 14 app with TypeScript + Tailwind CSS
- [ ] Initialize Spring Boot 3 project (Maven, Java 21)
- [ ] Set up `docker-compose.yml` with MongoDB + Redis
- [ ] Connect Spring Boot to MongoDB Atlas (test with a ping)
- [ ] Connect Spring Boot to Redis
- [ ] Set up `.env.example` with all variable names
- [ ] Configure CORS in Spring Boot
- [ ] Set up Spring Boot Actuator health endpoint
- [ ] Configure Next.js route groups (5 groups)

**Deliverable:** `curl http://localhost:8080/actuator/health` returns `{"status":"UP"}`

---

## Phase 2 — Authentication

**Goal:** All 4 roles can sign up, log in, and receive JWTs. Google OAuth works.

**Tasks:**
- [ ] JWT utility class (generate access + refresh tokens)
- [ ] `JwtAuthFilter` (validate JWT on every request)
- [ ] `SecurityConfig` (URL patterns + role-based access)
- [ ] `POST /api/auth/signup` — email + password
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/refresh`
- [ ] `POST /api/auth/logout` (Redis blocklist)
- [ ] `POST /api/auth/otp/send` + `verify` (Twilio)
- [ ] `POST /api/auth/google` + `GoogleAuthService`
- [ ] `POST /api/auth/google/link` + `unlink`
- [ ] NextAuth.js v5 setup with Google provider
- [ ] Next.js middleware route guards per role
- [ ] Login / signup pages for all 4 role apps
- [ ] `GoogleSignInButton` component
- [ ] Zustand `authStore`

**Deliverable:** All roles can register and log in. Google OAuth works.

---

## Phase 3 — Official Marketing Website

**Goal:** 5-page marketing site is live with 3D hero.

**Tasks:**
- [ ] Three.js / `@react-three/fiber` hero scene (sphere with distort material)
- [ ] Framer Motion page transitions and scroll-reveal animations
- [ ] Official Navbar (logo + 5 nav links)
- [ ] Home page: hero, features, how it works, roles, testimonials, stats, footer
- [ ] Customer role page (`/customer`)
- [ ] Vendor role page (`/vendor`)
- [ ] Delivery role page (`/delivery`)
- [ ] Admin role page (`/admin`)
- [ ] SEO metadata for all pages
- [ ] Mobile-responsive layout

**Deliverable:** All 5 official site pages are live and responsive.

---

## Phase 4 — Vendor Core

**Goal:** Vendors can manage their shop and products.

**Tasks:**
- [ ] `Shop` model + `ShopRepository`
- [ ] `POST /api/shops`, `PUT /api/shops/:id`, `GET /api/shops/:id`
- [ ] Shop cover/logo image upload (Cloudinary)
- [ ] `Product` model + `ProductRepository`
- [ ] Full product CRUD endpoints
- [ ] Product image upload (Cloudinary, up to 8 images)
- [ ] Bulk product upload (CSV)
- [ ] Vendor dashboard page (stats cards + recent orders)
- [ ] Shop profile edit page (Mapbox pin drop for location)
- [ ] Product list page + Add/Edit product forms

**Deliverable:** Vendors can create a shop with products.

---

## Phase 5 — Customer Core

**Goal:** Customers can discover nearby shops and products.

**Tasks:**
- [ ] `Category` model + seeded category data
- [ ] `GET /api/shops` with geo-radius query (`$geoNear`)
- [ ] MongoDB Atlas Search indexes (`shops_search`, `products_search`)
- [ ] `GET /api/search` unified search endpoint
- [ ] `GET /api/search/autocomplete` with Atlas Search autocomplete
- [ ] Redis caching for shop listings + search results
- [ ] Customer landing page (hero, categories, shop cards)
- [ ] Search page (search bar, filters, results)
- [ ] Shop detail page
- [ ] Product detail page
- [ ] Location switcher component + `locationStore`
- [ ] Shop discovery map (Mapbox)

**Deliverable:** Customers can find shops and products near them.

---

## Phase 6 — Cart, Orders & Payments

**Goal:** Full end-to-end purchase flow.

**Tasks:**
- [ ] `Cart` model + cart CRUD endpoints
- [ ] `Order` model + `POST /api/orders` (place order)
- [ ] Order status update endpoints (vendor side)
- [ ] Razorpay order creation + payment verification
- [ ] Razorpay webhook handler
- [ ] `Transaction` model + ledger
- [ ] COD order flow
- [ ] Cart page
- [ ] Checkout page (address selector + Razorpay modal)
- [ ] Order list + order detail page (status timeline)
- [ ] WebSocket vendor order alert

**Deliverable:** Customer can place an order and pay with Razorpay or COD.

---

## Phase 7 — Delivery

**Goal:** Delivery partners can accept and complete deliveries.

**Tasks:**
- [ ] Delivery partner signup + zone assignment
- [ ] `GET /api/delivery/orders/pool` — available orders in zone
- [ ] `PUT /api/orders/:id/accept` — accept an order
- [ ] `PUT /api/orders/:id/pickup` + `deliver` status updates
- [ ] `DeliveryLocation` model + GPS upsert endpoint
- [ ] Delivery dashboard + order pool page
- [ ] Mapbox navigation page (turn-by-turn, two waypoints)
- [ ] GPS WebSocket posting (every 5s while navigating)
- [ ] Customer live tracking map
- [ ] Photo proof upload on delivery (Cloudinary)
- [ ] Delivery history + earnings basic view

**Deliverable:** Full delivery lifecycle from acceptance to delivered.

---

## Phase 8 — Reels

**Goal:** Vendors can upload reels; customers see a geo-ranked feed.

**Tasks:**
- [ ] `Reel` model + repository
- [ ] Cloudinary video upload with HLS eager transcoding
- [ ] Cloudinary webhook for transcoding completion
- [ ] `GET /api/reels` cursor-based paginated feed
- [ ] Reel scoring/ranking algorithm (geo + engagement + recency)
- [ ] `POST /api/reels/:id/like` + `save` (toggle)
- [ ] Reel Studio page (vendor: upload, tag product, publish)
- [ ] Customer reels feed (full-screen, HLS.js player, infinite scroll)
- [ ] Optimistic like/save UI updates
- [ ] Saved reels list in profile

**Deliverable:** Reels are live from upload to customer viewing.

---

## Phase 9 — Real-time

**Goal:** All order status updates and delivery tracking are live via WebSocket.

**Tasks:**
- [ ] Spring WebSocket + STOMP configuration
- [ ] Order status WebSocket broadcast on every status change
- [ ] Vendor new order WebSocket alert
- [ ] Delivery location WebSocket relay (delivery → customer)
- [ ] User notification WebSocket queue
- [ ] Frontend `@stomp/stompjs` client setup
- [ ] Customer order tracking page with live map
- [ ] Reconnection handling (exponential backoff)
- [ ] Redis pub/sub broker relay (for multi-instance scaling)

**Deliverable:** Order status and delivery location update in real-time without page refresh.

---

## Phase 10 — Admin Dashboard

**Goal:** Admin has full platform control.

**Tasks:**
- [ ] Admin-only security (`hasRole('ADMIN')`)
- [ ] `GET /api/admin/users` + status update
- [ ] `GET /api/admin/shops` + verify/suspend
- [ ] `GET /api/admin/orders` + status override + refund
- [ ] `POST/PUT /api/admin/categories`
- [ ] Admin analytics aggregation endpoint
- [ ] Admin dashboard page (summary stats, pending actions)
- [ ] Customer, vendor, delivery partner management tables
- [ ] Order oversight table
- [ ] Product moderation queue
- [ ] Platform settings page (fee %, delivery config)
- [ ] Audit log model + recording on every admin action

**Deliverable:** Admins can manage the entire platform.

---

## Phase 11 — Polish & Production Readiness

**Goal:** App is production-ready.

**Tasks:**
- [ ] Push notifications (browser Web Push API)
- [ ] Email notifications (JavaMailSender — order confirmation, etc.)
- [ ] SMS notifications (Twilio — all order events)
- [ ] Finance dashboards (vendor + delivery partner)
- [ ] Review and rating system
- [ ] Admin analytics charts (GMV, funnels, heatmap)
- [ ] Earnings calculation + payout flow
- [ ] Error boundaries + loading states throughout frontend
- [ ] Spring Boot error handling + global exception handler
- [ ] Rate limiting on all public endpoints
- [ ] Sentry frontend error tracking
- [ ] Datadog APM integration (Spring Boot)
- [ ] Performance: Redis cache warming, query optimization
- [ ] Mobile responsiveness pass on all pages
- [ ] GitHub Actions CI/CD pipeline
- [ ] Production deployment to Vercel + EC2
- [ ] Production checklist completion (see [production.md](../deployment/production.md))

**Deliverable:** Locafy is live at locafy.in.

---

## Estimated Timeline

| Phase | Estimated Effort |
|-------|-----------------|
| 1 — Foundation | 1–2 days |
| 2 — Authentication | 3–4 days |
| 3 — Official Website | 3–5 days |
| 4 — Vendor Core | 4–5 days |
| 5 — Customer Core | 4–6 days |
| 6 — Cart, Orders, Payments | 5–7 days |
| 7 — Delivery | 4–6 days |
| 8 — Reels | 3–5 days |
| 9 — Real-time | 2–3 days |
| 10 — Admin | 4–5 days |
| 11 — Polish | 5–7 days |
| **Total** | **~7–10 weeks** |
