#!/bin/bash
# ============================================
# Entry point для Render
# Запускает бэкенд и Telegram бота
# ============================================

set -e

echo "🚀 Запуск Backend API..."

# Запускаем бэкенд в фоне
/app/paymentsgate &
BACKEND_PID=$!

echo "⏳ Ожидание запуска бэкенда..."
sleep 3

echo "🤖 Запуск Telegram Bot..."

# Запускаем Telegram бота в фоне
python3 telegram_bot.py &
BOT_PID=$!

echo "✅ Все сервисы запущены!"
echo "   - Backend API: PID $BACKEND_PID"
echo "   - Telegram Bot: PID $BOT_PID"

# Функция остановки
cleanup() {
    echo ""
    echo "🛑 Остановка сервисов..."
    kill $BACKEND_PID 2>/dev/null
    kill $BOT_PID 2>/dev/null
    wait
    echo "✅ Остановлено"
    exit 0
}

# Обрабатываем сигналы остановки
trap cleanup SIGTERM SIGINT

# Ждём процессы
wait
