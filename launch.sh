#!/bin/bash
# Запуск Telegram WebApp локально

set -e

echo "🚀 Запуск Telegram WebApp..."

# 1. Запускаем postgres если не запущен
if ! docker ps --filter "name=pg-paymentsgate" --format '{{.Names}}' | grep -q pg-paymentsgate; then
    echo "🐘 Запуск PostgreSQL..."
    docker compose up -d postgres
    sleep 3
fi

# 2. Запускаем бэкенд (с фронтендом)
echo "🔧 Сборка бэкенда..."
cd backend
CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/server ./cmd/server
echo "✅ Бэкенд собран"

# Запускаем в фоне
echo "🚀 Запуск бэкенда на :8080..."
./bin/server &
BACKEND_PID=$!
sleep 2

# 3. Запускаем telegram бота
echo "🤖 Запуск telegram бота..."
cd ..
pip install python-telegram-bot --quiet 2>/dev/null || true
python3 telegram_bot.py &
BOT_PID=$!

echo ""
echo "========================================="
echo "  ✅ Всё запущено!"
echo "========================================="
echo ""
echo "  🌐 Frontend:  http://localhost:8080"
echo "  🔧 Backend:   http://localhost:8080"
echo "  🤖 Bot Token: $TELEGRAM_BOT_TOKEN"
echo ""
echo "  Открой бота в Telegram:"
echo "  → https://t.me/"
echo "  → Найди своего бота"
echo "  → Нажми /start"
echo "========================================="

# Сохраним PID для остановки
echo "$BACKEND_PID" > /tmp/platega-backend.pid
echo "$BOT_PID" > /tmp/platega-bot.pid

# Остановим при нажатии Ctrl+C
trap "kill $BACKEND_PID $BOT_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
