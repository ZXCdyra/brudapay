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

# Copy frontend standalone build
COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./.next/static
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/public ./public

# Copy backend binary and migrations
COPY --from=backend-builder /paymentsgate .
COPY backend/migrations ./migrations

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start backend on 8080 in background, then frontend on 3000
CMD ["sh", "-c", "pkill -f paymentsgate 2>/dev/null; ./paymentsgate & sleep 3 && node server.js"]
