# Build Phases

Locafy is a large application. This document breaks the build into 11 sequential phases, each with a clear goal and deliverable. Complete each phase fully before moving to the next.

---

## Current Progress (2026-05-31)

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Foundation | ✅ Complete | Monorepo, Docker, MongoDB + Redis |
| 2 — Authentication | ✅ Complete | JWT, Google OAuth, role middleware |
| 3 — Official Website | ✅ Complete | 5 marketing pages + 3D hero |
| 4 — Vendor Core | ✅ Complete | Shop + product CRUD, dashboard |
| 5 — Customer Core | ✅ Complete | Explore, search, map (regex search; Atlas Search deferred) |
| 6 — Cart, Orders, Payments | ✅ Complete | Razorpay + COD, vendor order alerts |
| 7 — Delivery | ✅ Complete | Order pool, GPS, customer live map (no turn-by-turn nav page) |
| 8 — Reels | ✅ Complete | HLS upload, geo feed, like/save, Reel Studio |
| 9 — Real-time | 🔄 Partial | Vendor alerts + delivery GPS done; customer order WS pending |
| 10 — Admin | ⬜ Not started | Dashboard stub only |
| 11 — Polish | ⬜ Not started | — |

**Latest commit on `main`:** Phase 8 reels (`478a5fe`). **Next:** Phase 9 — customer-facing order status WebSocket.

---

## Phase 1 — Foundation ✅

**Goal:** Running monorepo with all services connected.

**Tasks:**
- [x] Create monorepo structure (`frontend/`, `backend/`, `docs/`)
- [x] Initialize Next.js 14 app with TypeScript + Tailwind CSS
- [x] Initialize Spring Boot 3 project (Maven, Java 21)
- [x] Set up `docker-compose.yml` with MongoDB + Redis
- [x] Connect Spring Boot to MongoDB Atlas (test with a ping)
- [x] Connect Spring Boot to Redis
- [x] Set up `.env.example` with all variable names
- [x] Configure CORS in Spring Boot
- [x] Set up Spring Boot Actuator health endpoint
- [x] Configure Next.js route groups (5 groups)

**Deliverable:** `curl http://localhost:8080/actuator/health` returns `{"status":"UP"}`

---

## Phase 2 — Authentication ✅

**Goal:** All 4 roles can sign up, log in, and receive JWTs. Google OAuth works.

**Tasks:**
- [x] JWT utility class (generate access + refresh tokens)
- [x] `JwtAuthFilter` (validate JWT on every request)
- [x] `SecurityConfig` (URL patterns + role-based access)
- [x] `POST /api/auth/signup` — email + password
- [x] `POST /api/auth/login`
- [x] `POST /api/auth/refresh`
- [x] `POST /api/auth/logout` (Redis blocklist)
- [ ] `POST /api/auth/otp/send` + `verify` (Twilio)
- [x] `POST /api/auth/google` + `GoogleAuthService`
- [x] `POST /api/auth/google/link` + `unlink`
- [x] NextAuth.js v5 setup with Google provider
- [x] Next.js middleware route guards per role
- [x] Login / signup pages for all 4 role apps
- [x] `GoogleSignInButton` component
- [x] Zustand `authStore`

**Deliverable:** All roles can register and log in. Google OAuth works.

---

## Phase 3 — Official Marketing Website ✅

**Goal:** 5-page marketing site is live with 3D hero.

**Tasks:**
- [x] Three.js / `@react-three/fiber` hero scene (sphere with distort material)
- [x] Framer Motion page transitions and scroll-reveal animations
- [x] Official Navbar (logo + 5 nav links)
- [x] Home page: hero, features, how it works, roles, testimonials, stats, footer
- [x] Customer role page (`/customer`)
- [x] Vendor role page (`/vendor`)
- [x] Delivery role page (`/delivery`)
- [x] Admin role page (`/admin`)
- [x] SEO metadata for all pages
- [x] Mobile-responsive layout

**Deliverable:** All 5 official site pages are live and responsive.

---

## Phase 4 — Vendor Core ✅

**Goal:** Vendors can manage their shop and products.

**Tasks:**
- [x] `Shop` model + `ShopRepository`
- [x] `POST /api/shops`, `PUT /api/shops/:id`, `GET /api/shops/:id`
- [x] Shop cover/logo image upload (Cloudinary)
- [x] `Product` model + `ProductRepository`
- [x] Full product CRUD endpoints
- [x] Product image upload (Cloudinary, up to 8 images)
- [x] Bulk product upload (CSV)
- [x] Vendor dashboard page (stats cards + recent orders)
- [x] Shop profile edit page (Mapbox pin drop for location)
- [x] Product list page + Add/Edit product forms

**Deliverable:** Vendors can create a shop with products.

---

## Phase 5 — Customer Core ✅

**Goal:** Customers can discover nearby shops and products.

**Tasks:**
- [x] `Category` model + seeded category data
- [x] `GET /api/shops` with geo-radius query (`$geoNear`)
- [ ] MongoDB Atlas Search indexes (`shops_search`, `products_search`)
- [x] `GET /api/search` unified search endpoint
- [ ] `GET /api/search/autocomplete` with Atlas Search autocomplete
- [x] Redis caching for shop listings + search results
- [x] Customer landing page (hero, categories, shop cards)
- [x] Search page (search bar, filters, results)
- [x] Shop detail page
- [x] Product detail page
- [x] Location switcher component + `locationStore`
- [x] Shop discovery map (Mapbox)

**Deliverable:** Customers can find shops and products near them.

---

## Phase 6 — Cart, Orders & Payments ✅

**Goal:** Full end-to-end purchase flow.

**Tasks:**
- [x] `Cart` model + cart CRUD endpoints
- [x] `Order` model + `POST /api/orders` (place order)
- [x] Order status update endpoints (vendor side)
- [x] Razorpay order creation + payment verification
- [x] Razorpay webhook handler
- [x] `Transaction` model + ledger
- [x] COD order flow
- [x] Cart page
- [x] Checkout page (address selector + Razorpay modal)
- [x] Order list + order detail page (status timeline)
- [x] WebSocket vendor order alert

**Deliverable:** Customer can place an order and pay with Razorpay or COD.

---

## Phase 7 — Delivery ✅

**Goal:** Delivery partners can accept and complete deliveries.

**Tasks:**
- [x] Delivery partner signup + zone assignment
- [x] `GET /api/delivery/orders/pool` — available orders in zone
- [x] `PUT /api/orders/:id/accept` — accept an order
- [x] `PUT /api/orders/:id/pickup` + `deliver` status updates
- [x] `DeliveryLocation` model + GPS upsert endpoint
- [x] Delivery dashboard + order pool page
- [ ] Mapbox navigation page (turn-by-turn, two waypoints)
- [x] GPS WebSocket posting (every 5s while navigating)
- [x] Customer live tracking map
- [ ] Photo proof upload on delivery (Cloudinary)
- [x] Delivery history + earnings basic view

**Deliverable:** Full delivery lifecycle from acceptance to delivered.

---

## Phase 8 — Reels ✅

**Goal:** Vendors can upload reels; customers see a geo-ranked feed.

**Tasks:**
- [x] `Reel` model + repository
- [x] Cloudinary video upload with HLS eager transcoding
- [x] Cloudinary webhook for transcoding completion
- [x] `GET /api/reels` cursor-based paginated feed
- [x] Reel scoring/ranking algorithm (geo + engagement + recency)
- [x] `POST /api/reels/:id/like` + `save` (toggle)
- [x] Reel Studio page (vendor: upload, tag product, publish)
- [x] Customer reels feed (full-screen, HLS.js player, infinite scroll)
- [x] Optimistic like/save UI updates
- [x] Saved reels list in profile

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
