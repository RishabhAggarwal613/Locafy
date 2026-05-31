# Environment Variables

All environment variables required to run Locafy. Copy `.env.example` to `.env` and fill in the values.

---

## Backend (`backend/.env`)

### Database

| Variable | Example | Description |
|----------|---------|-------------|
| `SPRING_DATA_MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/locafy` | MongoDB Atlas connection string |
| `SPRING_REDIS_HOST` | `localhost` | Redis host (local) |
| `SPRING_REDIS_PORT` | `6379` | Redis port |
| `SPRING_REDIS_URL` | `rediss://default:pass@host:6380` | Full Redis URL (Upstash production) |

### JWT

| Variable | Example | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `super_long_random_base64_string_min_256_bits` | HMAC secret for signing JWTs |
| `JWT_ACCESS_EXPIRY` | `900` | Access token TTL in seconds (15 min) |
| `JWT_REFRESH_EXPIRY` | `604800` | Refresh token TTL in seconds (7 days) |

### Google OAuth

| Variable | Example | Description |
|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | Google OAuth client ID (same as frontend) |

### Cloudinary

| Variable | Example | Description |
|----------|---------|-------------|
| `CLOUDINARY_CLOUD_NAME` | `locafy` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API secret |
| `CLOUDINARY_WEBHOOK_URL` | `https://api.locafy.in/api/reels/cloudinary-notify` | Webhook URL for reel transcoding complete |

### Razorpay

| Variable | Example | Description |
|----------|---------|-------------|
| `RAZORPAY_KEY_ID` | `rzp_test_xxxx` | Razorpay key ID (`rzp_live_xxxx` in production) |
| `RAZORPAY_KEY_SECRET` | `your_key_secret` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | `your_webhook_secret` | For verifying Razorpay webhook signatures |

### Twilio

| Variable | Example | Description |
|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | `your_auth_token` | Twilio auth token |
| `TWILIO_VERIFY_SERVICE_SID` | `VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Twilio Verify service SID |
| `TWILIO_FROM_NUMBER` | `+14155xxxxxx` | Twilio phone number |

### Google Maps

| Variable | Example | Description |
|----------|---------|-------------|
| `GOOGLE_MAPS_API_KEY` | `AIzaSyxxxx` | Google Maps API key (for Distance Matrix) |

### Email

| Variable | Example | Description |
|----------|---------|-------------|
| `MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | `noreply@locafy.in` | SMTP username |
| `MAIL_PASSWORD` | `app_password` | SMTP password (Gmail App Password) |

### App Config

| Variable | Example | Description |
|----------|---------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `SERVER_PORT` | `8080` | Spring Boot server port |
| `PLATFORM_FEE_PERCENT` | `10` | Platform fee percentage per order |

---

## Frontend (`frontend/.env.local`)

### NextAuth (Google OAuth)

| Variable | Example | Description |
|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `your_client_secret` | Google OAuth client secret |
| `NEXTAUTH_SECRET` | `random_32_char_string` | NextAuth encryption secret (run: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` | Base URL for NextAuth callbacks |

### Backend

| Variable | Example | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://localhost:8080` | Spring Boot API base URL (server-side fetches) |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8080` | API base URL (client-side fetches) |

### Mapbox

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `pk.eyJ1IjoibG9jYWZ5...` | Mapbox public token — **required** for `/customer/map`, `/delivery/orders/[id]`, and live tracking on `/customer/orders/[id]`. Set in `frontend/.env.local` only. |

### Razorpay

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_xxxx` | Razorpay public key ID |

### Cloudinary

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `locafy` | Cloudinary cloud name (for URL construction) |

---

## `.env.example` (Root — Template)

```env
# ─── Backend ──────────────────────────────────────────────────────────────────

# Database
SPRING_DATA_MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/locafy
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379

# JWT
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET_MIN_256_BITS
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=locafy
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET

# Razorpay
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=YOUR_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+14155xxxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyYOUR_KEY

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@locafy.in
MAIL_PASSWORD=YOUR_APP_PASSWORD

# App
FRONTEND_URL=http://localhost:3000
SERVER_PORT=8080
PLATFORM_FEE_PERCENT=10

# ─── Frontend ─────────────────────────────────────────────────────────────────

# NextAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
NEXTAUTH_SECRET=REPLACE_WITH_OPENSSL_RAND_OUTPUT
NEXTAUTH_URL=http://localhost:3000

# API
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiWU9VUl9VU0VSTkFNRS...

# Razorpay (public key only)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID

# Cloudinary (public cloud name only)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=locafy
```

---

## Generating `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

## Generating `JWT_SECRET`

```bash
openssl rand -base64 64
```

Both should be kept secret and never committed to git. Add `.env` and `.env.local` to `.gitignore`.
