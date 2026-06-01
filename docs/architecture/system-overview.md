# System Overview

## Architecture Pattern

Locafy follows a **monorepo full-stack architecture** with a clear separation between the Next.js frontend and Spring Boot backend. The two communicate over HTTP/REST for standard requests and WebSocket (STOMP) for real-time events.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Official    │ │ Customer │ │  Vendor  │ │  Delivery /   │  │
│  │ Website     │ │   App    │ │   App    │ │  Admin App    │  │
│  │ (Next.js)   │ │(Next.js) │ │(Next.js) │ │  (Next.js)    │  │
│  └─────────────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │
└───────────────────────┼─────────────┼───────────────┼──────────┘
                        │  REST/HTTPS │               │ WebSocket
┌───────────────────────▼─────────────▼───────────────▼──────────┐
│                      API GATEWAY LAYER                          │
│              Spring Boot 3 (Java 21) — Port 8080                │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Auth    │ │ Customer │ │  Vendor  │ │ Order / Delivery  │  │
│  │Controller│ │Controller│ │Controller│ │    Controller     │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
│       │            │            │                 │             │
│  ┌────▼────────────▼────────────▼─────────────────▼──────────┐ │
│  │              Service Layer (Business Logic)                │ │
│  │  AuthService │ ShopService │ OrderService │ SearchService  │ │
│  └────────────────────────────┬───────────────────────────────┘ │
│                               │                                 │
│  ┌────────────────────────────▼───────────────────────────────┐ │
│  │              Spring Data MongoDB Repositories               │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        DATA LAYER                               │
│                                                                 │
│  ┌──────────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  MongoDB Atlas   │   │  Redis Cache │   │   Cloudinary   │  │
│  │  (Primary DB)    │   │  (Sessions,  │   │  (Images/Video │  │
│  │  Geospatial idx  │   │   Listings)  │   │   CDN/HLS)     │  │
│  └──────────────────┘   └──────────────┘   └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  Razorpay │ Google OAuth │ Google Maps API │ Twilio │ Mapbox    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### Frontend (Next.js 14 — Vercel)

The frontend is a single Next.js application using **App Router route groups** to isolate each sub-application:

| Route Group | Sub-Application | Description |
|-------------|-----------------|-------------|
| `(official)` | Marketing website | 3D hero, role pages, SEO landing |
| `customer/` | Customer app | Discovery, reels, orders, cart |
| `vendor/` | Vendor app | Shop dashboard, product and reel management |
| `delivery/` | Delivery app | Order pool, Mapbox navigation |
| `admin/` | Admin app | Platform management dashboard |

Each route group has its own layout, authentication guard (Next.js middleware), and Zustand store slice. There are zero shared routes between roles — a vendor cannot accidentally access a customer page.

### Backend (Spring Boot 3 — AWS EC2)

The Spring Boot application exposes:
- **REST API** — standard CRUD and business logic endpoints
- **WebSocket broker** — real-time order status and delivery location pushed to clients
- **Scheduled jobs** — earnings reconciliation, cache warming, stale cart cleanup

Spring Security handles all request filtering. Each endpoint is annotated with `@PreAuthorize` to enforce role-based access at the method level, in addition to the URL-pattern security configuration.

### MongoDB Atlas

- Primary document store for all persistent data
- **2dsphere geospatial index** on `shops.location` and `deliveryLocations.coords`
- **Atlas Search index** on products, shops, and categories for full-text + fuzzy search
- **Aggregation pipelines** used for finance dashboards, order analytics, and geo-ranked shop listings

### Redis (Upstash)

- JWT refresh token blocklist (instant logout/ban)
- Shop listing cache per locality (TTL: 10 minutes)
- Search result cache per (query, location) key (TTL: 5 minutes)
- Real-time delivery location pub/sub channel

### Cloudinary

- Product and shop images (transformed on-the-fly via URL params)
- Reel video upload → automatic adaptive HLS transcoding for smooth mobile streaming
- Vendor profile and cover images

---

## Request Lifecycle

### Standard REST Request

```
Browser/App
  → NextAuth middleware (verify session)
  → Next.js API route or direct fetch to Spring Boot
  → Spring Security JWT filter (verify + extract role)
  → Spring MVC Controller
  → Service Layer (business logic)
  → Spring Data MongoDB Repository
  → MongoDB Atlas
  ← JSON response
```

### Real-time Order Status Update

```
Vendor marks order "READY"
  → PUT /api/orders/:id/status (Spring Boot)
  → OrderService updates MongoDB
  → OrderService publishes to STOMP topic /topic/orders/:orderId
  → Spring WebSocket broker broadcasts
  → Customer browser (subscribed to topic) receives push
  → Zustand order store updated
  → UI reflects new status instantly
```

### Google OAuth Login

```
User clicks "Continue with Google"
  → NextAuth.js initiates OAuth flow
  → Google OAuth consent screen
  → Google returns ID token to NextAuth callback
  → NextAuth sends ID token to POST /api/auth/google
  → Spring Boot verifies token (Google SDK)
  → User upserted in MongoDB
  → Locafy JWT pair issued
  → NextAuth session set
  → Client redirected to role-appropriate dashboard
```

---

## Deployment Architecture

```
                    Internet
                       │
              ┌────────▼────────┐
              │   Vercel CDN    │  ← Next.js frontend (edge network)
              │  (Global Edge)  │
              └────────┬────────┘
                       │ API calls (HTTPS)
              ┌────────▼────────┐
              │  AWS ALB        │  ← HTTPS termination, load balancing
              │  (Port 443)     │
              └────────┬────────┘
                       │
         ┌─────────────▼─────────────┐
         │   AWS EC2 (Spring Boot)   │
         │   Port 8080               │
         │   Docker container        │
         └───┬──────────┬────────────┘
             │          │
   ┌─────────▼──┐  ┌────▼────────────┐
   │ MongoDB    │  │ Redis (Upstash) │
   │ Atlas      │  │ Cloud Redis     │
   └────────────┘  └─────────────────┘
```

---

## Security Overview

| Concern | Approach |
|---------|----------|
| Authentication | JWT (access 15 min + refresh 7 days in HttpOnly cookie) |
| OAuth | Google ID token verified server-side via Google SDK |
| Authorization | Spring Security `@PreAuthorize` with role enum |
| Token revocation | Redis blocklist — instant on logout/ban |
| CORS | Spring Boot allows only Vercel frontend origin |
| HTTPS | AWS ALB handles TLS termination; EC2 speaks HTTP internally |
| Secrets | All keys in environment variables; never committed to git |
| Rate limiting | Spring Boot + Redis token bucket per IP |
| Input validation | Bean Validation (`@Valid`) on all DTOs + Zod on frontend |
