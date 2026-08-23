FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS frontend-stage
WORKDIR /app
COPY frontend/package.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./.next/static
COPY --from=frontend-builder /app/public ./public
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

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

# Copy frontend build (standalone)
COPY --from=frontend-stage /app .

# Copy backend binary and migrations
COPY --from=backend-builder /paymentsgate .
COPY backend/migrations ./migrations

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start backend in background, then frontend
CMD sh -c './paymentsgate & next start -p 3000'
