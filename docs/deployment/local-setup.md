# Local Development Setup

This guide walks you through running the complete Locafy stack locally.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java JDK | 21 | [adoptium.net](https://adoptium.net) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Maven | 3.9+ | `brew install maven` / [maven.apache.org](https://maven.apache.org) |
| Docker + Docker Compose | Latest | [docker.com](https://docker.com) |
| Git | Any | pre-installed on most systems |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/locafy.git
cd locafy
```

---

## Step 2 — Set Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all required values. See [Environment Variables](../development/env-variables.md) for the complete list.

At minimum for local development, you need:
- MongoDB Atlas connection string (or use the local Docker MongoDB — see below)
- Google OAuth Client ID + Secret
- Razorpay test keys
- Cloudinary credentials
- Mapbox public token
- Twilio credentials (or skip SMS for local testing)

### Using Local MongoDB (Docker)

If you don't want to set up MongoDB Atlas for local dev, the Docker Compose file includes a local MongoDB container. Set:

```env
MONGODB_URI=mongodb://localhost:27017/locafy
```

---

## Step 3 — Start Infrastructure (MongoDB + Redis)

```bash
docker-compose up -d mongodb redis
```

This starts:
- MongoDB on port `27017`
- Redis on port `6379`

Verify they're running:

```bash
docker-compose ps
```

---

## Step 4 — Start the Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

To verify: `curl http://localhost:8080/actuator/health`

Expected response: `{"status":"UP"}`

---

## Step 5 — Start the Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Step 6 — Verify Everything Works

Open your browser and navigate to:

| URL | Expected |
|-----|----------|
| `http://localhost:3000` | Official marketing site home page |
| `http://localhost:3000/customer` | Customer role marketing page |
| `http://localhost:3000/vendor` | Vendor role marketing page |
| `http://localhost:8080/actuator/health` | `{"status":"UP"}` |

---

## Running All Services Together

For convenience, you can run the Spring Boot app inside Docker too:

```bash
# Build and start everything
docker-compose up --build

# Or detached (background)
docker-compose up -d --build
```

Then just start the Next.js dev server separately:

```bash
cd frontend && npm run dev
```

---

## Common Issues

### Port 8080 already in use

```bash
lsof -i :8080
kill -9 <PID>
```

Or change the Spring Boot port in `backend/src/main/resources/application.yml`:

```yaml
server:
  port: 8081
```

And update `BACKEND_URL` in `frontend/.env.local` to match.

### MongoDB connection refused

Ensure Docker is running and the container is up:

```bash
docker-compose up -d mongodb
docker logs locafy-mongodb
```

### Next.js hot reload not working

```bash
cd frontend
rm -rf .next
npm run dev
```

### Google OAuth redirect_uri_mismatch

Add `http://localhost:3000/api/auth/callback/google` to the Authorized redirect URIs in Google Cloud Console.

---

## Seed Data (Optional)

To quickly populate the database with sample shops, products, and categories:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=seed
```

This runs the seed profile which inserts sample data defined in `src/main/resources/seed-data.json`.
