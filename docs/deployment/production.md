# Production Deployment

Locafy deploys to:
- **Vercel** — Next.js frontend (global edge CDN)
- **AWS EC2** — Spring Boot backend (Docker container)
- **MongoDB Atlas** — managed cloud database
- **Upstash Redis** — serverless Redis

---

## Frontend — Vercel

### One-time Setup

1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. Set the root directory to `frontend/`
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables in Vercel Dashboard → Project Settings → Environment Variables

### Required Vercel Environment Variables

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
NEXT_PUBLIC_BACKEND_URL=https://api.locafy.in
NEXTAUTH_URL=https://locafy.in          # custom domain only; trustHost handles previews
NEXT_PUBLIC_MAPBOX_TOKEN
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```

See [Vercel Deployment](./vercel.md) for the full setup guide.

### Custom Domain

1. Vercel Dashboard → Domains → Add `locafy.in`
2. Add the CNAME record in your DNS provider:
   ```
   CNAME @ cname.vercel-dns.com
   ```

### Deploy

Every push to the `main` branch triggers an automatic Vercel deployment. Preview deployments are created for every PR.

---

## Backend — AWS EC2

### Infrastructure Overview

```
Internet → Route 53 (api.locafy.in) → AWS ALB (HTTPS:443) → EC2 t3.medium (HTTP:8080)
```

### EC2 Setup (One-time)

```bash
# 1. Launch EC2 t3.medium (Ubuntu 22.04)
# 2. Security Group: allow inbound 8080 from ALB only, 22 from your IP

# 3. Install Docker
sudo apt update && sudo apt install -y docker.io
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Create deployment directory
mkdir -p /home/ubuntu/locafy
```

### ALB Setup

1. Create an **Application Load Balancer** in the same VPC as EC2
2. Listener: HTTPS :443 with SSL certificate (from AWS Certificate Manager)
3. Forward to Target Group → EC2 instance port 8080
4. Health check path: `/actuator/health`

### Route 53 Setup

1. Create A record: `api.locafy.in` → ALB DNS name (ALIAS)

### Deploy Script (CI/CD via GitHub Actions)

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          cd backend
          docker build -t locafy-backend:${{ github.sha }} .

      - name: Push to AWS ECR
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws ecr get-login-password --region ap-south-1 | \
            docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag locafy-backend:${{ github.sha }} ${{ secrets.ECR_REGISTRY }}/locafy-backend:latest
          docker push ${{ secrets.ECR_REGISTRY }}/locafy-backend:latest

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            aws ecr get-login-password --region ap-south-1 | \
              docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
            docker pull ${{ secrets.ECR_REGISTRY }}/locafy-backend:latest
            docker stop locafy-backend || true
            docker rm locafy-backend || true
            docker run -d \
              --name locafy-backend \
              --env-file /home/ubuntu/locafy/.env \
              -p 8080:8080 \
              --restart unless-stopped \
              ${{ secrets.ECR_REGISTRY }}/locafy-backend:latest
```

---

## MongoDB Atlas Setup

1. Create a free/paid cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Database Access → Add user with read/write to `locafy` database
3. Network Access → Add EC2's elastic IP (or `0.0.0.0/0` with strong credentials)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/locafy`
5. Create Atlas Search indexes (see [Database Schema](../architecture/database-schema.md))

---

## Upstash Redis Setup

1. Create a free Redis database at [upstash.com](https://upstash.com)
2. Copy the **Redis URL** and **Password** (TLS enabled by default)

```env
SPRING_REDIS_URL=rediss://default:password@region.upstash.io:6380
```

---

## SSL / HTTPS

- **Frontend (Vercel):** SSL handled automatically by Vercel (Let's Encrypt)
- **Backend (ALB):** Request free certificate from AWS Certificate Manager for `api.locafy.in`

---

## Environment Variables on EC2

```bash
# /home/ubuntu/locafy/.env
SPRING_DATA_MONGODB_URI=mongodb+srv://...
SPRING_REDIS_URL=rediss://...
JWT_SECRET=your_very_long_random_secret
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

GOOGLE_CLIENT_ID=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...
TWILIO_FROM_NUMBER=...
MAPBOX_SECRET_TOKEN=...
FRONTEND_URL=https://locafy.in
```

---

## Production Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] All secrets in environment variables (never in code)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Razorpay switched to **live** keys
- [ ] Cloudinary folder structure set up
- [ ] Google OAuth redirect URIs include production URL
- [ ] Twilio DLT registration complete (for India SMS)
- [ ] Datadog agent installed on EC2 for APM
- [ ] GitHub Actions CI/CD pipeline verified
- [ ] MongoDB Atlas Search indexes created
- [ ] Redis connection TLS enabled
- [ ] Rate limiting configured on all public endpoints
- [ ] CORS configured to allow only `locafy.in` origin
- [ ] Spring Boot Actuator endpoints secured (not publicly accessible)
