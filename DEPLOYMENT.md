# DrugSafe - Enterprise 4-Role Portal Production Deployment Guide

This guide describes the end-to-end production deployment process for the **DrugSafe Clinical Medication Safety & 4-Role Portal System**.

---

## 1. System Architecture Overview

The DrugSafe platform is architected as an enterprise-grade clinical decision support system featuring strict zero-trust role segregation across 4 authoritative domains:

```
                  +----------------------------------------------+
                  |           Internet / Clinical Client         |
                  +----------------------------------------------+
                                         |
                                         v
                         +-------------------------------+
                         | Nginx Reverse Proxy (Port 80) |
                         +-------------------------------+
                            /                         \
                           / (SPA Routes & Assets)     \ (/api/* & SSE Streams)
                          v                             v
           +-----------------------------+    +-----------------------------+
           | DrugSafe React 18 SPA       |    | DrugSafe Express API Engine |
           | - /portal/patient/*         |    | - Port 5000                 |
           | - /portal/doctor/*          |    | - Authoritative RBAC & ABAC |
           | - /portal/pharmacist/*      |    | - Resource IDOR Enforcement |
           | - /portal/admin/*           |    | - MediSafe AI RAG Engine    |
           +-----------------------------+    +-----------------------------+
                                                             |
                                                             v
                                              +-----------------------------+
                                              | PostgreSQL 16 (Port 5432)   |
                                              | - Prisma Client ORM         |
                                              | - Persistent PG Data Volume |
                                              +-----------------------------+
```

### Core Security Invariants
- **No UI Role Switching**: Users cannot choose, switch, or elevate roles from the client interface. Roles are authoritatively determined and signed by the backend database.
- **Resource-Level Authorization (IDOR)**: Patients can strictly only view and manage their own medications and records. Cross-patient tampering is blocked at the service layer with `403 Forbidden`.
- **SSE Unbuffered AI Streaming**: Real-time MediSafe AI streaming operates unbuffered (`proxy_buffering off`) through Nginx for responsive clinical consultations.

---

## 2. Containerized Deployment (Recommended)

The easiest and most reliable way to run DrugSafe in production is using Docker and Docker Compose.

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/DrugSafe.git
cd DrugSafe

# Copy production environment templates
cp .env.example .env
cp backend/.env.example backend/.env
```

Review and customize `backend/.env`:
```ini
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://postgres:postgrespassword@postgres:5432/drugsafe?schema=public"
JWT_ACCESS_SECRET="<YOUR-STRONG-RANDOM-32-CHAR-KEY>"
REFRESH_TOKEN_SECRET="<YOUR-STRONG-RANDOM-32-CHAR-KEY>"
CLIENT_URL="http://localhost:3000"
```

### Step 2: Build & Launch Containers
```bash
docker-compose up -d --build
```
This builds and launches three isolated services:
1. `drugsafe-postgres`: PostgreSQL 16 on port 5432.
2. `drugsafe-backend`: Node.js 22 Express backend on port 5000.
3. `drugsafe-frontend`: Nginx Alpine serving compiled SPA and proxying `/api/` on port 80 (and 3000).

### Step 3: Run Database Migrations & Seed Data
```bash
# Generate Prisma Client & apply migrations
docker-compose exec backend npx prisma migrate deploy

# Seed demonstration accounts and clinical database
docker-compose exec backend npm run seed
```

### Step 4: Verify Deployment Health
```bash
curl -i http://localhost/api/health
```
Expected output:
```json
{
  "status": "healthy",
  "apiStatus": "ONLINE",
  "database": "connected",
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 3. Bare-Metal / Manual Production Deployment

### Prerequisites
- Node.js >= 20.x and npm >= 10.x
- PostgreSQL >= 15.x
- Nginx >= 1.24.x
- Process Manager: PM2 (`npm install -g pm2`)

### 1. Database Setup
```sql
CREATE DATABASE drugsafe;
CREATE USER drugsafe_user WITH ENCRYPTED PASSWORD 'StrongSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE drugsafe TO drugsafe_user;
```

### 2. Backend Installation & Service Launch
```bash
cd backend
npm ci --omit=dev
npx prisma migrate deploy
npm run seed

# Start with PM2
pm2 start src/server.js --name "drugsafe-backend" -i max
pm2 save
pm2 startup
```

### 3. Frontend Static Build
```bash
cd ..
npm ci
npm run build
# Compiles production assets into /dist directory
```

### 4. Nginx Configuration
Copy the provided `nginx.conf` or configure your server block:
```nginx
server {
    listen 80;
    server_name drugsafe.hospital.org;

    # Static SPA root
    location / {
        root /var/www/drugsafe/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy with SSE streaming support
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable buffering for MediSafe AI streaming
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 600s;
        chunked_transfer_encoding on;
    }
}
```
Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Production Verification Credentials

The platform is seeded with 4 authoritative user roles for immediate clinical and operational validation:

| Role | Email | Password | Canonical Dashboard URL | Portal Suite Features |
| :--- | :--- | :--- | :--- | :--- |
| **PATIENT** | `patient@example.com` | `Password123!` | `/portal/patient/dashboard` | My Medications, Personal Safety Alerts, Prescription Upload, Food Warnings |
| **DOCTOR** | `doctor@example.com` | `Password123!` | `/portal/doctor/dashboard` | Clinical Review Queue, Patient Panel Triage, Prescription Overrides, Full Charts |
| **PHARMACIST** | `pharmacist@example.com` | `Password123!` | `/portal/pharmacist/dashboard` | Dispensing Verification Queue, High-Risk Rx Checks, NDC Catalog, Formulary |
| **ADMIN** | `admin@example.com` | `Password123!` | `/portal/admin/dashboard` | System Telemetry, User Directory & RBAC, Safety Rule Engine, Audit Trail |

> **Security Note**: In a live clinical production rollout, immediately change default passwords or connect to hospital SAML 2.0 / OIDC Identity Providers.

---

## 5. Automated CI/CD Deployment Verification

Run the full automated test suite and production build check before every deployment:

```bash
# Runs frontend tests, backend tests, and production Vite compilation
npm run deploy:full
```

- **Frontend Vitest Suite**: 15 test files, 92 tests passing.
- **Backend Vitest Suite**: 19 test files, 136 tests passing.
- **Combined Health**: 228 automated tests passing (100% success rate).

---

## 6. Observability & Maintenance

- **Health Probe**: `GET http://localhost/api/health`
- **Interactive OpenAPI Docs**: `GET http://localhost/api/docs`
- **Audit Logs**: Queryable via Admin Portal (`/portal/admin/audit`) or API (`GET /api/admin/audit`).
- **Database Backup**:
  ```bash
  docker-compose exec postgres pg_dump -U postgres drugsafe > drugsafe_backup_$(date +%Y%m%d).sql
  ```

