# Docker Configuration

---

## `docker-compose.yml` (Root)

```yaml
version: '3.9'

services:
  mongodb:
    image: mongo:7.0
    container_name: locafy-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: locafy
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: locafy-redis
    ports:
      - "6379:6379"
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: locafy-backend
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://mongodb:27017/locafy
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongodb_data:
  redis_data:
```

---

## `backend/Dockerfile`

```dockerfile
# --- Build stage ---
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app
COPY pom.xml .
# Download dependencies first (layer caching)
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Non-root user for security
RUN groupadd -r locafy && useradd -r -g locafy locafy
USER locafy

COPY --from=build /app/target/locafy-*.jar app.jar

EXPOSE 8080

# Enable virtual threads (Project Loom) for high WebSocket concurrency
ENTRYPOINT ["java", \
  "-XX:+UseVirtualThreads", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
```

---

## `frontend/Dockerfile` (For Production Only)

The frontend is deployed to Vercel, but this Dockerfile can be used for self-hosted deployments:

```dockerfile
# --- Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# --- Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# --- Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## Useful Docker Commands

```bash
# Start all services (detached)
docker-compose up -d

# Start specific services only
docker-compose up -d mongodb redis

# View logs
docker-compose logs -f backend
docker-compose logs -f mongodb

# Rebuild after code changes
docker-compose up -d --build backend

# Stop all services
docker-compose down

# Stop and remove volumes (wipes all DB data)
docker-compose down -v

# Open MongoDB shell
docker exec -it locafy-mongodb mongosh locafy

# Open Redis CLI
docker exec -it locafy-redis redis-cli
```

---

## `.dockerignore` (Backend)

```
target/
.git/
*.md
*.env
.mvn/wrapper/maven-wrapper.jar
```

---

## Resource Limits (Production Recommendation)

Add to `docker-compose.yml` for production-like local testing:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        memory: 512M
```
