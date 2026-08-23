# Stage 1: Build Next.js frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY ../frontend/package*.json ./
RUN npm ci && npm cache clean --force
COPY ../frontend .
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_WS_URL=/ws
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN npm run build

# Stage 2: Build Go backend
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /paymentsgate ./cmd/server

# Stage 3: Production
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=backend-builder /paymentsgate .
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/.next/standalone
COPY migrations ./migrations

EXPOSE 8080

ENV FRONTEND_DIR=./frontend/.next/standalone

CMD ["./paymentsgate"]
