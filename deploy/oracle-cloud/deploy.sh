#!/bin/bash

# ============================================
# Скрипт деплоя приложения на сервер
# ============================================

set -e

echo "🚀 Деплой Telegram Mini App..."

# ============================================
# 1. Проверка переменных окружения
# ============================================
if [ -z "$DOMAIN" ]; then
    echo "❌ Укажите домен: export DOMAIN=yourdomain.com"
    exit 1
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Укажите токен бота: export TELEGRAM_BOT_TOKEN=your_token"
    exit 1
fi

# ============================================
# 2. Генерация .env.production
# ============================================
echo "📝 Генерация .env.production..."

cat > .env.production <<EOF
# Database
DB_USER=paymentsgate
DB_PASSWORD=paymentsgate
DB_NAME=paymentsgate

# Server
ENVIRONMENT=production
BASE_URL=https://$DOMAIN

# JWT Secrets (сгенерируйте свои!)
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Encryption (32 символа!)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Rate Limits
RATE_LIMIT_RPS=100

# Telegram Bot
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
TELEGRAM_DISPUTE_CHAT_ID=

# Frontend
FRONTEND_URL=https://$DOMAIN
EOF

echo "✅ .env.production создан"

# ============================================
# 3. Запуск Docker Compose
# ============================================
echo "🐳 Запуск Docker Compose..."

docker-compose -f docker-compose.production.yml up -d --build

echo ""
echo "========================================="
echo "  ✅ Приложение запущено!"
echo "========================================="
echo ""
echo "  🌐 WebApp URL: https://$DOMAIN"
echo "  🔧 API URL: https://$DOMAIN/api"
echo ""
echo "  📋 Следующие шаги:"
echo ""
echo "  1. Настройте домен в DNS (A запись на IP сервера)"
echo "  2. Получите HTTPS сертификат:"
echo "     sudo certbot --nginx -d $DOMAIN"
echo ""
echo "  3. Обновите URL в Telegram боте:"
echo "     → @BotFather"
echo "     → /setdomain"
echo "     → Укажите: $DOMAIN"
echo ""
echo "========================================="
