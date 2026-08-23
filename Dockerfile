FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM golang:1.23-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache git ca-certificates
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /paymentsgate ./cmd/server

FROM node:20-alpine AS runtime
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/.next .next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package.json ./

# Copy backend binary and migrations
COPY --from=backend-builder /paymentsgate .
COPY backend/migrations ./migrations

# Install pm2 to run both processes
RUN npm install -g pm2

# Create PM2 ecosystem config
RUN cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "backend",
    script: "/app/paymentsgate",
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "500M",
  }, {
    name: "frontend",
    script: "/app/node_modules/.bin/next",
    args: "start",
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
};
EOF

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pm2-runtime", "ecosystem.config.js"]
