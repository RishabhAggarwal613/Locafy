# Folder Structure

Locafy is organized as a **monorepo** with two top-level workspaces: `frontend/` (Next.js) and `backend/` (Spring Boot).

---

## Root

```
locafy/
├── frontend/              ← Next.js 14 application
├── backend/               ← Spring Boot 3 application
├── docs/                  ← This documentation
├── docker-compose.yml     ← Local dev orchestration
├── .env.example           ← Environment variable template
├── .gitignore
└── README.md
```

---

## Frontend (`frontend/`)

```
frontend/
├── app/
│   ├── (official)/                    ← Marketing website
│   │   ├── layout.tsx                 ← Official site shell (navbar, footer)
│   │   ├── page.tsx                   ← Home page (3D hero, features, testimonials)
│   │   ├── customer/
│   │   │   └── page.tsx               ← Customer role landing page
│   │   ├── vendor/
│   │   │   └── page.tsx               ← Vendor role landing page
│   │   ├── delivery/
│   │   │   └── page.tsx               ← Delivery role landing page
│   │   └── admin/
│   │       └── page.tsx               ← Admin role landing page
│   │
│   ├── (customer)/                    ← Customer sub-application
│   │   ├── layout.tsx                 ← Customer shell (bottom nav, header)
│   │   ├── page.tsx                   ← Customer landing (hero, categories, shops)
│   │   ├── reels/
│   │   │   └── page.tsx               ← Infinite-scroll reels feed
│   │   ├── search/
│   │   │   └── page.tsx               ← Search + discovery
│   │   ├── shops/
│   │   │   └── [shopId]/
│   │   │       └── page.tsx           ← Shop detail page
│   │   ├── products/
│   │   │   └── [productId]/
│   │   │       └── page.tsx           ← Product detail page
│   │   ├── cart/
│   │   │   └── page.tsx               ← Cart page
│   │   ├── checkout/
│   │   │   └── page.tsx               ← Checkout + Razorpay
│   │   ├── orders/
│   │   │   ├── page.tsx               ← Orders list
│   │   │   └── [orderId]/
│   │   │       └── page.tsx           ← Order detail + tracking
│   │   └── profile/
│   │       └── page.tsx               ← Customer profile
│   │
│   ├── (vendor)/                      ← Vendor sub-application
│   │   ├── layout.tsx                 ← Vendor shell (sidebar nav)
│   │   ├── dashboard/
│   │   │   └── page.tsx               ← Vendor dashboard
│   │   ├── shop/
│   │   │   └── page.tsx               ← Shop profile editor
│   │   ├── products/
│   │   │   ├── page.tsx               ← Product list
│   │   │   ├── new/
│   │   │   │   └── page.tsx           ← Add product
│   │   │   └── [productId]/
│   │   │       └── page.tsx           ← Edit product
│   │   ├── reels/
│   │   │   ├── page.tsx               ← Reel list
│   │   │   └── new/
│   │   │       └── page.tsx           ← Upload reel
│   │   ├── orders/
│   │   │   ├── page.tsx               ← Incoming orders
│   │   │   └── [orderId]/
│   │   │       └── page.tsx           ← Order detail
│   │   ├── history/
│   │   │   └── page.tsx               ← Past orders
│   │   └── finance/
│   │       └── page.tsx               ← Finance dashboard
│   │
│   ├── (delivery)/                    ← Delivery sub-application
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx               ← Delivery dashboard
│   │   ├── orders/
│   │   │   ├── page.tsx               ← Order pool
│   │   │   └── [orderId]/
│   │   │       ├── page.tsx           ← Order detail
│   │   │       └── navigate/
│   │   │           └── page.tsx       ← Mapbox navigation
│   │   ├── history/
│   │   │   └── page.tsx               ← Past deliveries
│   │   └── finance/
│   │       └── page.tsx               ← Earnings
│   │
│   ├── (admin)/                       ← Admin sub-application
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── shops/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   │
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts           ← NextAuth.js handler
│
├── components/
│   ├── official/
│   │   ├── Hero3D.tsx                 ← Three.js 3D hero scene
│   │   ├── FeaturesSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── RolesSection.tsx
│   │   └── OfficialNav.tsx
│   ├── customer/
│   │   ├── ReelCard.tsx               ← Single reel video card
│   │   ├── ReelFeed.tsx               ← Infinite scroll feed
│   │   ├── ShopCard.tsx               ← Shop discovery card
│   │   ├── ProductCard.tsx
│   │   ├── CartItem.tsx
│   │   ├── OrderCard.tsx
│   │   └── LocationSwitcher.tsx
│   ├── vendor/
│   │   ├── VendorSidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ReelUploader.tsx
│   │   ├── OrderTable.tsx
│   │   └── FinanceChart.tsx
│   ├── delivery/
│   │   ├── OrderPoolCard.tsx
│   │   ├── NavigationMap.tsx          ← Mapbox navigation
│   │   └── EarningsCard.tsx
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── ShopTable.tsx
│   │   └── AnalyticsCharts.tsx
│   └── shared/
│       ├── AuthGuard.tsx              ← Role-aware middleware wrapper
│       ├── GoogleSignInButton.tsx
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ui/                        ← Design system primitives
│
├── lib/
│   ├── api/
│   │   ├── client.ts                  ← Axios instance with JWT interceptor
│   │   ├── auth.ts                    ← Auth API calls
│   │   ├── shops.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── reels.ts
│   │   └── search.ts
│   ├── auth.ts                        ← NextAuth.js config (Google provider)
│   ├── mapbox.ts                      ← Mapbox utility helpers
│   ├── razorpay.ts                    ← Razorpay checkout helpers
│   └── utils.ts
│
├── store/
│   ├── authStore.ts                   ← User session, role
│   ├── cartStore.ts                   ← Cart state
│   ├── locationStore.ts               ← Current locality + coordinates
│   └── orderStore.ts                  ← Active order status
│
├── types/
│   ├── user.ts
│   ├── shop.ts
│   ├── product.ts
│   ├── order.ts
│   ├── reel.ts
│   └── api.ts
│
├── middleware.ts                       ← NextAuth route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Backend (`backend/`)

```
backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── locafy/
│       │           ├── LocafyApplication.java
│       │           │
│       │           ├── auth/
│       │           │   ├── controller/
│       │           │   │   └── AuthController.java
│       │           │   ├── service/
│       │           │   │   ├── AuthService.java
│       │           │   │   └── GoogleAuthService.java
│       │           │   ├── dto/
│       │           │   │   ├── LoginRequest.java
│       │           │   │   ├── SignupRequest.java
│       │           │   │   ├── GoogleAuthRequest.java
│       │           │   │   └── AuthResponse.java
│       │           │   └── jwt/
│       │           │       ├── JwtUtil.java
│       │           │       └── JwtAuthFilter.java
│       │           │
│       │           ├── user/
│       │           │   ├── model/
│       │           │   │   └── User.java              ← @Document("users")
│       │           │   ├── repository/
│       │           │   │   └── UserRepository.java
│       │           │   ├── service/
│       │           │   │   └── UserService.java
│       │           │   └── controller/
│       │           │       └── CustomerController.java
│       │           │
│       │           ├── shop/
│       │           │   ├── model/
│       │           │   │   └── Shop.java
│       │           │   ├── repository/
│       │           │   │   └── ShopRepository.java
│       │           │   ├── service/
│       │           │   │   └── ShopService.java
│       │           │   └── controller/
│       │           │       └── ShopController.java
│       │           │
│       │           ├── product/
│       │           │   ├── model/Product.java
│       │           │   ├── repository/ProductRepository.java
│       │           │   ├── service/ProductService.java
│       │           │   └── controller/ProductController.java
│       │           │
│       │           ├── order/
│       │           │   ├── model/Order.java
│       │           │   ├── repository/OrderRepository.java
│       │           │   ├── service/
│       │           │   │   ├── OrderService.java
│       │           │   │   └── OrderStatusService.java
│       │           │   ├── controller/
│       │           │   │   └── OrderController.java
│       │           │   └── websocket/
│       │           │       └── OrderWebSocketHandler.java
│       │           │
│       │           ├── reel/
│       │           │   ├── model/Reel.java
│       │           │   ├── repository/ReelRepository.java
│       │           │   ├── service/ReelService.java
│       │           │   └── controller/ReelController.java
│       │           │
│       │           ├── cart/
│       │           │   ├── model/Cart.java
│       │           │   ├── repository/CartRepository.java
│       │           │   ├── service/CartService.java
│       │           │   └── controller/CartController.java
│       │           │
│       │           ├── search/
│       │           │   ├── service/SearchService.java
│       │           │   └── controller/SearchController.java
│       │           │
│       │           ├── payment/
│       │           │   ├── service/PaymentService.java
│       │           │   └── controller/PaymentController.java
│       │           │
│       │           ├── delivery/
│       │           │   ├── model/DeliveryLocation.java
│       │           │   ├── repository/DeliveryLocationRepository.java
│       │           │   ├── service/DeliveryService.java
│       │           │   └── controller/DeliveryController.java
│       │           │
│       │           ├── vendor/
│       │           │   ├── service/VendorDashboardService.java
│       │           │   └── controller/VendorController.java
│       │           │
│       │           ├── admin/
│       │           │   ├── service/AdminService.java
│       │           │   └── controller/AdminController.java
│       │           │
│       │           ├── notification/
│       │           │   ├── model/Notification.java
│       │           │   ├── repository/NotificationRepository.java
│       │           │   └── service/NotificationService.java
│       │           │
│       │           ├── media/
│       │           │   └── service/CloudinaryService.java
│       │           │
│       │           └── config/
│       │               ├── SecurityConfig.java
│       │               ├── MongoConfig.java
│       │               ├── RedisConfig.java
│       │               ├── WebSocketConfig.java
│       │               └── CorsConfig.java
│       │
│       └── resources/
│           ├── application.yml
│           └── application-prod.yml
│
├── src/test/java/com/locafy/
│   ├── auth/AuthServiceTest.java
│   ├── order/OrderServiceTest.java
│   └── search/SearchServiceTest.java
│
├── Dockerfile
├── pom.xml
└── .env.example
```

---

## Key Configuration Files

### `docker-compose.yml`

Orchestrates MongoDB, Redis, and the Spring Boot app for local development. The Next.js frontend runs separately via `npm run dev`.

### `frontend/middleware.ts`

NextAuth middleware that protects routes by role. Redirects unauthenticated users to the appropriate login page for their route group.

### `frontend/lib/auth.ts`

NextAuth v5 configuration: Google provider setup, JWT callback to embed Locafy role in the session, session callback.

### `backend/src/main/resources/application.yml`

Spring Boot configuration: MongoDB URI, Redis, JWT secret, Cloudinary, Razorpay, Twilio, Mapbox, Google OAuth client credentials.
