# Locafy Frontend

Next.js 14 App Router — customer, vendor, delivery, admin, and marketing site.

## Local development

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local — see docs/development/env-variables.md
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port Next.js picks).

## Deploy on Vercel

This app is configured for Vercel monorepo deployment:

1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variables from `.env.example`
4. Deploy

Full guide: [docs/deployment/vercel.md](../docs/deployment/vercel.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build (checks env on Vercel) |
| `npm run lint` | ESLint |
| `npm run check-env` | Validate required env vars locally |

## Structure

```
app/
  (official)/     Marketing site → /
  customer/       Customer app → /customer/*
  vendor/         Vendor app → /vendor/*
  delivery/       Delivery app → /delivery/*
  admin/          Admin app → /admin/*
components/       UI by role
lib/api/          Axios API clients
lib/websocket/    STOMP real-time client
store/            Zustand (auth, cart, location)
```
