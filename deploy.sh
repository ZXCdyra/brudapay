#!/bin/bash

# Скрипт для быстрого деплоя на Railway

set -e

echo "🚀 Начинаю деплой BrudaPay на Railway..."

# Проверка, установлен ли Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен. Установите его:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Проверка входа в Railway
echo "📝 Проверка входа в Railway..."
railway status > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔐 Выполняю вход в Railway..."
    railway login
fi

# Деплой backend
echo ""
echo "📦 Деплой backend..."
cd backend
railway up --detach
echo "✅ Backend деплой начат"

# Деплой frontend
echo ""
echo "🎨 Деплой frontend..."
cd ../frontend
railway up --detach
echo "✅ Frontend деплой начат"

echo ""
echo "🎉 Деплой инициирован!"
echo ""
echo "📋 Просмотр логов:"
echo "   cd backend && railway logs"
echo "   cd frontend && railway logs"
echo ""
echo "🌐 Настройка домена brudapay.ru:"
echo "   1. Войдите в railway.app"
echo "   2. Добавьте домен в настройках frontend сервиса"
echo "   3. Добавьте CNAME запись в Reg.ru"
