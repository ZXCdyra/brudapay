#!/bin/bash

# ============================================
# Oracle Cloud Free - Установка Telegram Mini App
# ============================================
# Этот скрипт автоматически настроит сервер для запуска приложения
# ============================================

set -e

echo "🚀 Начало установки..."

# ============================================
# 1. Обновление системы
# ============================================
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# ============================================
# 2. Установка Docker и Docker Compose
# ============================================
echo "🐳 Установка Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Установка Docker Compose plugin
echo "📦 Установка Docker Compose..."
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Добавляем текущего пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# ============================================
# 3. Установка Nginx
# ============================================
echo "🌐 Установка Nginx..."
sudo apt install -y nginx

# ============================================
# 4. Установка Certbot для HTTPS
# ============================================
echo "🔒 Установка Certbot (HTTPS)..."
sudo apt install -y certbot python3-certbot-nginx

# ============================================
# 5. Настройка файрвола (UFW)
# ============================================
echo "🛡️  Настройка файрвола..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# ============================================
# 6. Создание директории для приложения
# ============================================
echo "📁 Создание директории приложения..."
APP_DIR="/opt/paymentsgate"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

echo ""
echo "========================================="
echo "  ✅ Система готова!"
echo "========================================="
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "  1. Скопируйте файлы проекта:"
echo "     scp -r /path/to/platega-main $USER@YOUR_SERVER_IP:/opt/paymentsgate/"
echo ""
echo "  2. Подключитесь к серверу:"
echo "     ssh $USER@YOUR_SERVER_IP"
echo ""
echo "  3. Перейдите в директорию:"
echo "     cd /opt/paymentsgate/platega-main"
echo ""
echo "  4. Настройте .env.production (см. инструкцию)"
echo ""
echo "  5. Запустите приложение:"
echo "     docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "  6. Настройте домен и HTTPS:"
echo "     sudo certbot --nginx -d yourdomain.com"
echo ""
echo "========================================="
