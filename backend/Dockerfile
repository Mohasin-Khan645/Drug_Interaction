# Production Dockerfile for DrugSafe Backend
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma binary generation on Alpine Linux
RUN apk add --no-cache openssl

# Copy dependency specifications
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (clean install inside Linux container)
RUN npm ci

# Copy application source (excluding node_modules via .dockerignore)
COPY . .

# Generate Prisma Client for linux-musl runtime
RUN npx prisma generate

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma engine on Alpine
RUN apk add --no-cache openssl

# Copy files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
