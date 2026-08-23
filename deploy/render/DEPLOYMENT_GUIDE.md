# 🚀 Деплой Telegram Mini App на Render.com

## 📋 Бесплатный тариф Render

- ✅ **Static Site**: Бесконечно (фронтенд)
- ✅ **Web Service**: 750 часов/месяц (бэкенд)
- ✅ **Автоматический HTTPS**
- ✅ **GitHub автодеплой**
- ⚠️ **База данных**: своя (ElephantSQL/Supabase бесплатно)

## 🎯 Архитектура

```
┌─────────────────┐
│   Telegram      │
│   Mini App      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Render.com    │
│                 │
│  ┌───────────┐  │
│  │ Frontend  │  │ ← Static Site (бесплатно)
│  │  Next.js  │  │   Порт: 10000
│  └───────────┘  │
│         │       │
│  ┌───────────┐  │
│  │  Backend  │  │ ← Go API + Telegram Bot
│  │  (Go)     │  │   Порт: 8080
│  │  + Bot    │  │   750 часов/мес
│  └───────────┘  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  ElephantSQL    │
│  (PostgreSQL)   │ ← 10MB бесплатно
└─────────────────┘
```

## 📝 Шаг 1: Подготовка

### 1.1 Бесплатная база данных

1. Откройте [ElephantSQL](https://www.elephantsql.com/)
2. Создайте аккаунт
3. Создайте новый сервер:
   - **Plan**: Tiny (10MB) - БЕСПЛАТНО
   - **Name**: platega-db
4. Скопируйте **URL** (выглядит как `postgres://...`)

Или используйте [Supabase](https://supabase.com/) (500MB бесплатно)

### 1.2 Создать репозиторий на GitHub

Если ещё не сделали:

```bash
cd /home/zxc-dyra/Загрузки/platega-main

# Создайте репозиторий на github.com/new
# Затем:
git remote add origin https://github.com/YOUR_USERNAME/platega.git
git branch -M main
git push -u origin main
```

## 🚀 Шаг 2: Деплой Backend

### 2.1 Создать аккаунт

1. Откройте [render.com](https://render.com)
2. Нажмите **Get Started for Free**
3. Войдите через **GitHub**

### 2.2 Создать Web Service

1. В dashboard нажмите **New +** → **Web Service**
2. Выберите **Private** или **Public** репозиторий `platega`
3. Нажмите **Create**

### 2.3 Настроить сервис

Заполните форму:

- **Name**: `platega-backend`
- **Region**: Oregon (ближе к Европе)
- **Branch**: `main`
- **Root Directory**: `/` (корень)
- **Runtime**: `Docker`
- **Build Command**: `docker build -f backend/Dockerfile.render -t backend .`
- **Start Command**: `./entrypoint.sh`
- **Dockerfile**: `backend/Dockerfile.render`
- **Instance Type**: `Free`

### 2.4 Добавить переменные окружения

Нажмите **Environment Variables** и добавьте:

```bash
# Порт
SERVER_PORT=8080
PORT=8080
ENVIRONMENT=production
NODE_ENV=production

# База данных (URL от ElephantSQL/Supabase)
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require

# JWT (сгенерируйте свои!)
JWT_ACCESS_SECRET=your-jwt-access-secret-64-chars
JWT_REFRESH_SECRET=your-jwt-refresh-secret-64-chars

# Шифрование (ровно 32 символа)
ENCRYPTION_KEY=your-32-byte-key-here

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:AAFGIU82dioCYn1BgbuNrLDytbK7_xjOvhA
TELEGRAM_DISPUTE_CHAT_ID=

# Rate Limits
RATE_LIMIT_RPS=100
```

### 2.5 Сгенерировать ключи

```bash
# JWT Access Secret (64 символа)
openssl rand -hex 32

# JWT Refresh Secret (64 символа)
openssl rand -hex 32

# Encryption Key (32 символа)
openssl rand -hex 16
```

### 2.6 Deploy

Нажмите **Deploy Web Service**

Render начнёт сборку (5-10 минут). Следите за логами.

## 🎨 Шаг 3: Деплой Frontend

### 3.1 Создать Static Site

1. В dashboard нажмите **New +** → **Static Site**
2. Выберите репозиторий `platega`
3. Настройте:

- **Name**: `platega-frontend`
- **Branch**: `main`
- **Root Directory**: `/frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `/frontend/.next/standalone` и `/frontend/public`

### 3.2 Переменные окружения

```bash
NEXT_PUBLIC_API_URL=https://platega-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://platega-backend.onrender.com
```

### 3.3 Deploy

Нажмите **Deploy Static Site**

## 🤖 Шаг 4: Настройка Telegram бота

### 4.1 Создать бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Получите **Token**

### 4.2 Добавить токен в Render

1. Вернитесь в **Backend Service** → **Environment**
2. Добавьте:
   ```
   TELEGRAM_BOT_TOKEN=<ваш_токен>
   ```
3. Нажмите **Save**
4. Render автоматически перезапустит сервис

### 4.3 Привязать WebApp

1. В [@BotFather](https://t.me/BotFather) отправьте `/setdomain`
2. Выберите вашего бота
3. Введите URL фронтенда:
   ```
   https://platega-frontend.onrender.com
   ```

## ✅ Шаг 5: Проверка

### 5.1 Проверить работу

- **Frontend**: `https://platega-frontend.onrender.com`
- **Backend API**: `https://platega-backend.onrender.com/health`
- **WebSocket**: `wss://platega-backend.onrender.com/ws`
- **Telegram Bot**: Откройте бота → `/start`

### 5.2 Посмотреть логи

В dashboard Render:
- Нажмите на сервис
- Перейдите на вкладку **Logs**

## 📋 Полезные команды

### Локальная проверка Docker

```bash
# Сборка backend
docker build -f backend/Dockerfile.render -t platega-backend .

# Сборка frontend
docker build -f frontend/Dockerfile.render -t platega-frontend ./frontend
```

### Обновление кода

```bash
# Вносите изменения в GitHub
git add .
git commit -m "Update"
git push

# Render автоматически обновит сервисы!
```

## 🔧 Решение проблем

### ❌ Backend не запускается

**Проблема**: Ошибка базы данных

**Решение**:
1. Проверьте `DATABASE_URL` в переменных окружения
2. Убедитесь, что ElephantSQL сервер активен
3. Проверьте логи: **Backend Service** → **Logs**

### ❌ Telegram бот не отвечает

**Проблема**: Бот не запущен

**Решение**:
1. Проверьте логи на наличие ошибок подключения
2. Убедитесь, что `TELEGRAM_BOT_TOKEN` правильный
3. Проверьте, что сервер может достучаться до `api.telegram.org`

### ❌ Frontend не загружается

**Проблема**: Next.js ошибка сборки

**Решение**:
1. Проверьте логи сборки
2. Убедитесь, что `NEXT_PUBLIC_API_URL` правильный
3. Проверьте `next.config.ts` - должен быть `output: 'standalone'`

### ❌ Backend просылается (cold start)

**Проблема**: На бесплатном тарифе сервис "спит" после 15 минут неактивности

**Решение**:
1. Используйте **UptimeRobot** (бесплатно) для мониторинга
2. Отправляйте запрос на `/health` каждые 10 минут
3. Илиconsider paid plan ($7/мес)

## 💰 Стоимость

| Сервис | Цена |
|--------|------|
| Frontend (Static) | ✅ БЕСПЛАТНО |
| Backend (Web Service) | ✅ 750 часов/месяц бесплатно |
| ElephantSQL (DB) | ✅ 10MB бесплатно |
| **Итого** | **$0/мес** |

## ⚠️ Ограничения бесплатного тарифа

- Backend "спит" после 15 минут неактивности (первый запрос 30 секунд)
- 512MB RAM
- Нет гарантии uptime
- Для продакшена рекомендуется платный план ($7/мес)

## 🎉 Готово!

Ваше Telegram Mini App работает на Render.com!

- 🌐 **WebApp**: `https://platega-frontend.onrender.com`
- 🤖 **Bot**: `https://t.me/your_bot_username`
- 📊 **API**: `https://platega-backend.onrender.com`
