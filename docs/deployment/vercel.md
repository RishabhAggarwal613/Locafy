# Vercel Deployment — Locafy Frontend

Deploy the Next.js app from the `frontend/` directory. The backend stays on AWS EC2 (or local) — Vercel only hosts the frontend.

---

## Prerequisites

- GitHub repo connected to [vercel.com](https://vercel.com)
- Spring Boot API reachable over HTTPS (e.g. `https://api.locafy.in`)
- Google OAuth client with production redirect URIs
- Backend `FRONTEND_URL` includes your Vercel URL(s) — comma-separated for previews:

```env
FRONTEND_URL=https://locafy.in,https://locafy.vercel.app,https://locafy-*.vercel.app
```

> **Note:** Spring CORS uses exact origin matching. For preview deploys, add each preview URL to `FRONTEND_URL` on the backend, or use a wildcard-friendly proxy. Production custom domain + main `*.vercel.app` URL is usually enough.

---

## One-time Vercel setup

### 1. Import project

1. [vercel.com/new](https://vercel.com/new) → Import `Locafy` from GitHub
2. **Root Directory:** `frontend` (required — monorepo)
3. **Framework:** Next.js (auto-detected)
4. **Build Command:** `npm run build` (default)
5. **Install Command:** `npm ci` (default)

`frontend/vercel.json` is already configured.

### 2. Environment variables

Vercel → **Project → Settings → Environment Variables**. Add for **Production**, **Preview**, and **Development**:

| Variable | Required | Example (production) |
|----------|----------|----------------------|
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Yes | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google Cloud secret |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | `https://api.locafy.in` |
| `NEXTAUTH_URL` | Custom domain only | `https://locafy.in` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Maps / tracking | `pk.eyJ...` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Online payments | `rzp_test_...` or `rzp_live_...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Media URLs | `locafy` |

See `frontend/.env.example` for the full list.

Builds on Vercel **fail fast** if required vars are missing (`scripts/check-env.mjs`).

### 3. Google OAuth redirect URIs

In [Google Cloud Console](https://console.cloud.google.com/) → Credentials → OAuth client:

```
https://locafy.in/api/auth/callback/google
https://YOUR-PROJECT.vercel.app/api/auth/callback/google
```

Add each preview/production URL you use.

### 4. Backend CORS

On EC2 / backend `.env`:

```env
FRONTEND_URL=https://locafy.in,https://YOUR-PROJECT.vercel.app
```

Restart the backend after changing.

### 5. Custom domain (optional)

Vercel → **Domains** → Add `locafy.in` and `www.locafy.in`.

DNS (example):

```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

Set `NEXTAUTH_URL=https://locafy.in` in Vercel production env.

---

## Deploy

| Trigger | Result |
|---------|--------|
| Push to `main` | Production deployment |
| Pull request | Preview deployment (`*.vercel.app`) |

No GitHub Action needed — Vercel watches the repo directly.

---

## Verify deployment

1. Open the Vercel deployment URL — marketing home loads
2. `/customer/explore` — shop discovery (needs backend + MongoDB)
3. `/customer/auth` — email login + Google sign-in
4. Browser devtools → Network — API calls go to `NEXT_PUBLIC_BACKEND_URL`, not `localhost`
5. Favicon / app icon visible in tab

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails: missing env | Add required vars in Vercel dashboard |
| Google login redirect error | Add exact callback URL to Google OAuth client |
| API CORS error | Add frontend URL to backend `FRONTEND_URL` |
| Cookies / auth not persisting | Backend must use HTTPS; `withCredentials` needs matching CORS |
| Maps blank | Set `NEXT_PUBLIC_MAPBOX_TOKEN` |
| WebSocket not connecting | `NEXT_PUBLIC_BACKEND_URL` must be HTTPS; backend `/ws` must be reachable |

---

## Local parity check

```bash
cd frontend
cp .env.example .env.local
# fill in values
npm run dev
```

Simulate Vercel env check:

```bash
CHECK_ENV=1 npm run check-env
```
