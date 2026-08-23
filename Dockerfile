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

FROM nginx:alpine
COPY --from=frontend-builder /app/.next /app/.next
COPY --from=frontend-builder /app/public /app/public
COPY --from=frontend-builder /app/package.json /app/package.json

# Copy backend binary
COPY --from=backend-builder /paymentsgate /app/paymentsgate
COPY backend/migrations /app/migrations

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Create startup script
RUN echo '#!/bin/sh\n/app/paymentsgate &\nnginx -g "daemon off;"' > /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 80

CMD ["/app/start.sh"]
