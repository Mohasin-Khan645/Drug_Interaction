# Multi-stage Production Dockerfile for DrugSafe Web Platform
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install clean dependencies
RUN npm ci

# Copy application source code
COPY . .

# Set build argument for API base URL
ENV VITE_API_BASE_URL=/api
ENV VITE_USE_MOCK_API=false

# Build production SPA
RUN npm run build

# Production web server stage
FROM nginx:1.27-alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

