# Tech Stack

Complete list of every technology, library, and tool used in Locafy with version targets and rationale.

---

## Frontend

| Concern | Library / Tool | Version | Rationale |
|---------|---------------|---------|-----------|
| Framework | **Next.js** | 14.x (App Router) | SSR + SSG for SEO on official site; file-based routing per role group |
| Language | **TypeScript** | 5.x | Full type-safety from API response to UI component |
| Styling | **Tailwind CSS** | 3.x | Utility-first; consistent design tokens; minimal CSS bundle |
| 3D Rendering | **Three.js** | 0.165+ | Official site hero 3D scene; WebGL-based product showcase |
| 3D React Binding | **@react-three/fiber** | 8.x | Declarative Three.js inside React components |
| Animations | **Framer Motion** | 11.x | Page transitions, scroll-reveal, micro-interactions |
| Auth (OAuth) | **NextAuth.js** | v5 (Auth.js) | Google OAuth provider; session management; middleware guards |
| State Management | **Zustand** | 4.x | Lightweight global state — cart, user session, locality |
| Server State | **TanStack Query** | v5 | Data fetching, caching, infinite scroll for reels/search |
| Forms | **React Hook Form** | 7.x | Performant form state; pairs with Zod for validation |
| Validation | **Zod** | 3.x | Schema validation on forms and API response types |
| Maps | **Mapbox GL JS** | 3.x | Shop discovery map, delivery navigation |
| React Maps | **react-map-gl** | 7.x | Declarative Mapbox in React |
| Video Player | **hls.js** | 1.x | Reels adaptive HLS playback from Cloudinary (native `<video>` fallback for MP4) |
| HTTP Client | **Axios** | 1.x | API calls with interceptors for JWT injection |
| Payments UI | **Razorpay React SDK** | latest | Razorpay checkout embed |
| Icons | **Lucide React** | latest | Consistent icon set |
| Toast / Alerts | **react-hot-toast** | 2.x | Non-intrusive notifications |
| Date Utilities | **date-fns** | 3.x | Order timestamps, shop hours formatting |

---

## Backend

| Concern | Library / Tool | Version | Rationale |
|---------|---------------|---------|-----------|
| Framework | **Spring Boot** | 3.x | Auto-configured Java microservice; huge ecosystem |
| Language | **Java** | 21 (LTS) | Virtual threads (Project Loom) for high-concurrency WebSocket handling |
| Security | **Spring Security** | 6.x | Filter chain, JWT validation, method-level `@PreAuthorize` |
| OAuth Verification | **google-auth-library-java** | 1.x | Server-side Google ID token verification |
| Data Access | **Spring Data MongoDB** | 4.x | Repository abstraction; aggregation pipeline support |
| WebSocket | **Spring WebSocket + STOMP** | built-in | Real-time order and location push |
| Media Upload | **Cloudinary Java SDK** | 1.x | Product images, reel video upload and transformation |
| Payments | **Razorpay Java SDK** | 1.x | Order creation, payment capture, webhook signature verification |
| Maps / Distance | **Google Maps Java Client** | 2.x | Distance Matrix API for accurate road distance ranking |
| SMS / OTP | **Twilio SDK** | 9.x | Phone OTP on signup and password reset |
| Email | **Spring JavaMailSender** | built-in | Order confirmation and vendor notification emails |
| Caching | **Spring Data Redis + Lettuce** | built-in | Shop listing cache, session blocklist |
| Validation | **Hibernate Validator (Bean Validation 3)** | built-in | DTO validation with `@Valid` |
| JSON | **Jackson** | built-in | ObjectMapper for MongoDB document serialization |
| Scheduling | **Spring `@Scheduled`** | built-in | Earnings reconciliation, stale cart cleanup |
| Logging | **SLF4J + Logback** | built-in | Structured JSON logs for Datadog ingestion |
| Testing | **JUnit 5 + Mockito** | built-in | Unit and integration tests |
| Build Tool | **Maven** | 3.9+ | Dependency management, build lifecycle |

---

## Database

| Store | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Primary DB | **MongoDB Atlas** | 7.x | Document store; geospatial queries; Atlas Search |
| Search Engine | **MongoDB Atlas Search** | (managed) | Lucene-based full-text, fuzzy, autocomplete, geo-combined |
| Cache | **Redis** (Upstash) | 7.x | Session blocklist, shop cache, rate limiting, pub/sub |

### MongoDB Index Strategy

| Collection | Index Type | Fields | Purpose |
|------------|-----------|--------|---------|
| shops | 2dsphere | `location.coordinates` | Geo-radius shop discovery |
| shops | text (Atlas Search) | `name, description, categories` | Full-text search |
| products | text (Atlas Search) | `name, description, category` | Product search |
| deliveryLocations | 2dsphere | `coords` | Live delivery position queries |
| orders | compound | `customerId + status + createdAt` | Customer order history pagination |
| users | unique | `email` | Duplicate account prevention |
| users | unique (sparse) | `googleId` | Google account lookup |

---

## Infrastructure & DevOps

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Containerization | **Docker** | Package Spring Boot app as OCI image |
| Local Orchestration | **Docker Compose** | Run Spring Boot + MongoDB + Redis locally |
| Frontend Hosting | **Vercel** | Next.js edge deployment, automatic preview URLs |
| Backend Hosting | **AWS EC2 (t3.medium)** | Spring Boot Docker container |
| Load Balancer | **AWS ALB** | HTTPS termination, health checks |
| CI/CD | **GitHub Actions** | Build → test → Docker push → EC2 deploy |
| Container Registry | **AWS ECR** | Docker image storage |
| Monitoring | **Datadog** | APM traces, structured logs, uptime monitors |
| Error Tracking | **Sentry** | Frontend JS error capture |

---

## External Services

| Service | Provider | Usage |
|---------|---------|-------|
| OAuth | Google Cloud Platform | Google sign-in for all roles |
| Payments | Razorpay | Online checkout, COD management, vendor payouts |
| Media CDN | Cloudinary | Product images, reel video streaming (HLS) |
| Maps | Mapbox | Customer shop discovery map, delivery navigation |
| Distance | Google Maps Distance Matrix API | Accurate road distance for shop ranking |
| SMS / OTP | Twilio | Phone verification, order SMS alerts |
| Email | SMTP (Gmail / SendGrid) | Transactional emails via Spring JavaMailSender |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **IntelliJ IDEA** | Java/Spring Boot development |
| **VS Code / Cursor** | Next.js frontend development |
| **Postman** | API endpoint testing and documentation |
| **MongoDB Compass** | Visual MongoDB query exploration |
| **Redis Insight** | Redis key inspection and monitoring |
| **ESLint + Prettier** | Frontend code style |
| **Checkstyle** | Java code style |
| **Husky + lint-staged** | Pre-commit hooks |
