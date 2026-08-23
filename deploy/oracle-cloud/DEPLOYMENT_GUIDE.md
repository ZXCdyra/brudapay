# 🚀 Деплой на Oracle Cloud Free

## 📋 Требования

- Аккаунт Oracle Cloud (бесплатный тариф)
- Доменное имя (опционально, можно использовать IP)
- SSH доступ к серверу

## 🎯 Бесплатные ресурсы Oracle Cloud

- **2 VM экземпляра** AMD Base
- **До 6GB RAM** на экземпляр
- **200GB** сетевого трафика в месяц
- **Бесплатно навсегда!**

## 📝 Шаг 1: Создание VM на Oracle Cloud

1. Войдите в [Oracle Cloud Console](https://cloud.oracle.com/)
2. Перейдите в **Compute** → **Instances**
3. Нажмите **Create Instance**
4. Заполните:
   - **Name**: paymentsgate
   - **Availability Domain**: любой
   - **Image**: Ubuntu 22.04 или Oracle Linux 8
   - **Shape**: VM.Standard.E2.1.Micro (Free Tier)
   - **Shape**: VM.Standard.A1.Flex (ARM, бесплатно до 4 OCPU, 24GB RAM)
5. Настройте сеть:
   - Добавьте правила файрвола: **SSH (22)**, **HTTP (80)**, **HTTPS (443)**
6. Создайте ключ SSH или используйте существующий
7. Нажмите **Create**

## 🔑 Шаг 2: Подключение к серверу

```bash
# Подключитесь к серверу
ssh -i /path/to/private_key ubuntu@YOUR_SERVER_IP

# Или для Oracle Linux
ssh -i /path/to/private_key opc@YOUR_SERVER_IP
```

## 📦 Шаг 3: Установка необходимых пакетов

На сервере выполните:

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Установка Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Установка Nginx
sudo apt install -y nginx

# Установка Certbot (для HTTPS)
sudo apt install -y certbot python3-certbot-nginx

# Настройка файрвола
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 🚀 Шаг 4: Загрузка проекта

```bash
# На локальном компьютере
cd /path/to/platega-main

# Скопируйте файлы на сервер
scp -r -i /path/to/private_key ./* ubuntu@YOUR_SERVER_IP:/opt/paymentsgate/

# Подключитесь к серверу
ssh -i /path/to/private_key ubuntu@YOUR_SERVER_IP
cd /opt/paymentsgate
```

## ⚙️ Шаг 5: Настройка переменных окружения

Создайте файл `.env.production`:

```bash
nano .env.production
```

Содержимое:

```ini
# Database
DB_USER=paymentsgate
DB_PASSWORD=paymentsgate
DB_NAME=paymentsgate

# Server
ENVIRONMENT=production
BASE_URL=https://yourdomain.com

# JWT Secrets (сгенерируйте свои!)
JWT_ACCESS_SECRET=<сгенерируйте>
JWT_REFRESH_SECRET=<сгенерируйте>

# Encryption (ровно 32 символа)
ENCRYPTION_KEY=<сгенерируйте>

# Rate Limits
RATE_LIMIT_RPS=100

# Telegram Bot
TELEGRAM_BOT_TOKEN=<ваш_токен_бота>
TELEGRAM_DISPUTE_CHAT_ID=<chat_id>

# Frontend
FRONTEND_URL=https://yourdomain.com
```

**Сгенерируйте секретные ключи:**

```bash
# JWT Access Secret
openssl rand -hex 32

# JWT Refresh Secret
openssl rand -hex 32

# Encryption Key (32 символа)
openssl rand -hex 16
```

## 🐳 Шаг 6: Запуск приложения

```bash
# Соберите и запустите
docker-compose -f docker-compose.oracle.yml up -d --build

# Проверьте статус
docker-compose ps

# Проверьте логи
docker-compose logs -f
```

## 🔒 Шаг 7: Настройка HTTPS (если есть домен)

```bash
# Настройте DNS (A запись) на IP вашего сервера

# Получите SSL сертификат
sudo certbot --nginx -d yourdomain.com

# Следуйте инструкциям Certbot
# Нажмите 2 для редиректа на HTTPS
```

## 🤖 Шаг 8: Настройка Telegram бота

1. Откройте **@BotFather** в Telegram
2. Создайте нового бота: `/newbot`
3. Получите токен и сохраните в `.env.production`
4. Привяжите WebApp:
   - `/setdomain`
   - Выберите вашего бота
   - Укажите: `https://yourdomain.com`

## 📋 Полезные команды

```bash
# Перезапустить приложение
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml up -d

# Посмотреть логи
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Обновить проект
git pull
docker-compose -f docker-compose.oracle.yml up -d --build

# Создать бэкап базы данных
docker exec pg-paymentsgate pg_dump -U paymentsgate paymentsgate > backup.sql

# Восстановить базу данных
docker exec -i pg-paymentsgate psql -U paymentsgate paymentsgate < backup.sql
```

## 🔍 Проверка работоспособности

- **WebApp**: `https://yourdomain.com`
- **API**: `https://yourdomain.com/api/v1/auth/login`
- **Health Check**: `https://yourdomain.com/health`
- **WebSocket**: `wss://yourdomain.com/ws`

## ⚠️ Важные заметки

1. **Безопасность**:
   - Измените стандартные пароли базы данных
   - Используйте сильные JWT секреты
   - Отключите вход по паролю SSH (используйте ключи)

2. **Производительность**:
   - Включите gzip сжатие (уже настроено в Nginx)
   - Используйте Redis для кэширования (опционально)
   - Настройте автообновление образов Docker

3. **Мониторинг**:
   - Следите за использованием CPU и RAM в Oracle Cloud Console
   - Настройте алерты при превышении лимитов

## 🆘 Решение проблем

**Приложение не запускается:**
```bash
# Проверьте логи
docker-compose logs backend

# Перезапустите
docker-compose restart
```

**Проблемы с базой данных:**
```bash
# Проверьте подключение
docker exec -it pg-paymentsgate psql -U paymentsgate -d paymentsgate

# Сбросьте миграции
docker exec -it api-paymentsgate ./paymentsgate migrate down
docker exec -it api-paymentsgate ./paymentsgate migrate up
```

**HTTPS не работает:**
```bash
# Проверьте сертификат
certbot certificates

# Обновите сертификат
sudo certbot renew --force-renewal
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи Docker: `docker-compose logs`
2. Проверьте статус сервисов: `docker-compose ps`
3. Убедитесь, что порты 80, 443, 22 открыты в файрволе
4. Проверьте подключение к базе данных
