# Locafy — Documentation

> **Hyperlocal product discovery & ordering platform**
> Browse nearby shops, watch product reels, order with delivery or pickup — all within your locality.

---

## What is Locafy?

Locafy connects customers with shops in their immediate locality. Instead of searching a city-wide marketplace, users set their locality and instantly discover shops, products, and deals within walking or short-driving distance. Vendors list their products and upload short video reels. Delivery partners fulfill orders with real-time GPS navigation. Admins manage the entire platform from a central dashboard.

### Build progress (2026-05-31)

| Done | Phase |
|------|-------|
| ✅ | 1 Foundation · 2 Auth · 3 Official site · 4 Vendor · 5 Customer · 6 Orders · 7 Delivery · 8 Reels |
| 🔄 | 9 Real-time (partial — vendor + delivery WS exist) |
| ⬜ | 10 Admin · 11 Polish |

Repo: [github.com/RishabhAggarwal613/Locafy](https://github.com/RishabhAggarwal613/Locafy) · Branch: `main`

---

## Documentation Index

### Architecture
| File | Description |
|------|-------------|
| [System Overview](./architecture/system-overview.md) | High-level architecture, data flow, and component diagram |
| [Tech Stack](./architecture/tech-stack.md) | Every library and tool used, with rationale |
| [Database Schema](./architecture/database-schema.md) | All 11 MongoDB collections with field definitions |
| [API Reference](./architecture/api-reference.md) | All REST and WebSocket endpoints |
| [Folder Structure](./architecture/folder-structure.md) | Monorepo layout for frontend and backend |

### Sub-Applications
| File | Description |
|------|-------------|
| [Official Website](./apps/official-website.md) | 5-page marketing site with 3D hero |
| [Customer App](./apps/customer-app.md) | Discovery, reels, cart, checkout, orders |
| [Vendor App](./apps/vendor-app.md) | Shop management, products, reels, finance |
| [Delivery App](./apps/delivery-app.md) | Order pool, navigation, earnings |
| [Admin App](./apps/admin-app.md) | Platform management and analytics |

### Features
| File | Description |
|------|-------------|
| [Authentication](./features/authentication.md) | JWT, Google OAuth, OTP, role-based access |
| [Search & Discovery](./features/search.md) | Atlas Search, geo-ranking, autocomplete |
| [Reels](./features/reels.md) | Short video feed, upload, like/save |
| [Orders](./features/orders.md) | Order lifecycle from placement to delivery |
| [Payments](./features/payments.md) | Razorpay checkout, COD, webhooks, payouts |
| [Maps & Navigation](./features/maps-navigation.md) | Mapbox shop discovery and delivery routing |
| [Real-time](./features/real-time.md) | WebSocket order tracking and live updates |

### Integrations
| File | Description |
|------|-------------|
| [Google OAuth](./integrations/google-oauth.md) | One-click Google login setup |
| [Razorpay](./integrations/razorpay.md) | Payment gateway configuration |
| [Cloudinary](./integrations/cloudinary.md) | Image and video CDN setup |
| [Mapbox](./integrations/mapbox.md) | Maps and navigation integration |
| [Twilio](./integrations/twilio.md) | SMS OTP and notifications |

### Deployment
| File | Description |
|------|-------------|
| [Local Setup](./deployment/local-setup.md) | Run the full stack locally with Docker Compose |
| [Docker](./deployment/docker.md) | Dockerfile and Docker Compose configuration |
| [Production](./deployment/production.md) | AWS + Vercel production deployment guide |

### Development
| File | Description |
|------|-------------|
| [Build Phases](./development/build-phases.md) | 11-phase build plan from setup to launch |
| [Environment Variables](./development/env-variables.md) | All required environment variables |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/RishabhAggarwal613/Locafy.git
cd Locafy

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your API keys (see docs/development/env-variables.md)

# 3. Start all services with Docker Compose
docker-compose up -d

# 4. Frontend runs at http://localhost:3000
# 5. Backend API runs at http://localhost:8080
```

See [Local Setup](./deployment/local-setup.md) for detailed instructions.

---

## User Roles

| Role | Description | Entry Point |
|------|-------------|-------------|
| **Customer** | Browse shops, watch reels, place orders | `/customer` |
| **Vendor** | Manage shop, products, reels, orders | `/vendor` |
| **Delivery** | Accept and deliver orders with navigation | `/delivery` |
| **Admin** | Platform-wide management and analytics | `/admin` |

---

## Core Technologies

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Three.js, Framer Motion
- **Backend:** Spring Boot 3 (Java 21), Spring Security, Spring WebSocket
- **Database:** MongoDB Atlas (geospatial), Redis (cache)
- **Search:** MongoDB Atlas Search (Lucene-based)
- **Auth:** JWT + Google OAuth (NextAuth.js v5)
- **Payments:** Razorpay
- **Media:** Cloudinary
- **Maps:** Mapbox GL JS
- **Notifications:** Twilio (SMS/OTP)
