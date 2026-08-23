#!/bin/bash

# ============================================
# Быстрый скрипт для деплоя на Zeabur
# ============================================
# Запустите этот скрипт и следуйте инструкциям
# ============================================

set -e

echo "🚀 Быстрый деплой Telegram Mini App на Zeabur"
echo "========================================"
echo ""

# Генерация секретных ключей
echo "🔐 Генерация секретных ключей..."
echo ""

JWT_ACCESS=$(openssl rand -hex 32)
JWT_REFRESH=$(openssl rand -hex 32)
ENCRYPTION=$(openssl rand -hex 16)

echo "✅ Сгенерированные ключи (сохраните их!):"
echo ""
echo "JWT_ACCESS_SECRET=$JWT_ACCESS"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH"
echo "ENCRYPTION_KEY=$ENCRYPTION"
echo ""
echo "========================================"
echo ""

# Создание .env файла
echo "📝 Создание .env файла..."
cat > .env <<EOF
# Database
DB_USER=paymentsgate
DB_PASSWORD=paymentsgate
DB_NAME=paymentsgate

# Server
ENVIRONMENT=production
BASE_URL=https://your-app.zeabur.app

# JWT
JWT_ACCESS_SECRET=$JWT_ACCESS
JWT_REFRESH_SECRET=$JWT_REFRESH

# Encryption
ENCRYPTION_KEY=$ENCRYPTION

# Rate Limits
RATE_LIMIT_RPS=100

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_DISPUTE_CHAT_ID=

# Frontend
FRONTEND_URL=https://your-app.zeabur.app
EOF

echo "✅ .env файл создан!"
echo ""

# Проверка git
if [ -d ".git" ]; then
    echo "✅ Git инициализирован"
else
    echo "❌ Git не инициализирован"
    echo "Запустите: git init"
    exit 1
fi

echo ""
echo "========================================="
echo "  📋 Следующие шаги:"
echo "========================================="
echo ""
echo "  1. Создайте репозиторий на GitHub:"
echo "     → https://github.com/new"
echo ""
echo "  2. Запушьте код:"
echo "     git remote add origin https://github.com/YOUR_USERNAME/platega.git"
echo "     git branch -M main"
echo "     git push -u origin main"
echo ""
echo "  3. Деплой на Zeabur:"
echo "     → zeabur.com"
echo "     → Create Service → Import from GitHub"
echo "     → Dockerfile: Dockerfile.zeabur"
echo "     → Port: 8080"
echo ""
echo "  4. Добавьте переменные окружения из .env"
echo ""
echo "  5. Создайте бота в @BotFather"
echo ""
echo "========================================="
