# 🚀 Деплой Telegram Mini App на Zeabur

## 📋 Что такое Zeabur?

**Zeabur** - это облачная платформа для деплоя приложений с бесплатным тарифом:
- ✅ **Бесплатно**: 5 сервисов, 5GB bandwidth/месяц
- ✅ **HTTPS** автоматически
- ✅ **Автодеплой** из GitHub
- ✅ **Работает из РФ**
- ✅ **Простой интерфейс**

## 🎯 Архитектура на Zeabur

```
┌─────────────────┐
│   Telegram      │
│   Mini App      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Zeabur        │
│                 │
│  ┌───────────┐  │
│  │ Frontend  │  │ ← Next.js (порт 8080)
│  │ (Next.js) │  │
│  └───────────┘  │
│         │       │
│  ┌───────────┐  │
│  │  Backend  │  │ ← Go API
│  │   (Go)    │  │
│  └───────────┘  │
│         │       │
│  ┌───────────┐  │
│  │ Postgres  │  │ ← База данных
│  │  (DB)     │  │
│  └───────────┘  │
│         │       │
│  ┌───────────┐  │
│  │  Bot      │  │ ← Telegram Bot
│  │  (Python) │  │
│  └───────────┘  │
└─────────────────┘
```

## 📝 Шаг 1: Подготовка проекта

### 1.1 Создать GitHub репозиторий

```bash
# Инициализируем git (если ещё не сделано)
git init

# Добавляем все файлы
git add .

# Коммитим
git commit -m "Initial commit - Telegram Mini App"

# Создаём репозиторий на GitHub
# https://github.com/new

# Пушим код
git remote add origin https://github.com/YOUR_USERNAME/platega.git
git branch -M main
git push -u origin main
```

### 1.2 Проверить файлы

Убедитесь, что в корне проекта есть:
- ✅ `Dockerfile.zeabur` - Dockerfile для main сервиса
- ✅ `Dockerfile.bot` - Dockerfile для Telegram бота
- ✅ `docker-compose.zeabur.yml` - Docker Compose файл
- ✅ `frontend/` - папка с Next.js
- ✅ `backend/` - папка с Go бэкендом
- ✅ `telegram_bot.py` - файл бота

## 🚀 Шаг 2: Деплой на Zeabur

### 2.1 Создать аккаунт

1. Переходим на [zeabur.com](https://zeabur.com)
2. Регистрируемся через **GitHub**

### 2.2 Создать сервис

1. Нажимаем **Create Service**
2. Выбираем **Import Git Repository**
3. Выбираем ваш репозиторий `platega`
4. Нажимаем **Continue**

### 2.3 Настроить деплой

Zeabur предложит настроить сервисы:

#### Сервис 1: Main App (Backend + Frontend)

**Template:** Docker

**Dockerfile Path:** `Dockerfile.zeabur`

**Port:** `8080`

#### Сервис 2: Telegram Bot

**Template:** Docker

**Dockerfile Path:** `Dockerfile.bot`

#### Сервис 3: PostgreSQL (База данных)

**Template:** PostgreSQL

Zeabur автоматически создаст managed PostgreSQL

### 2.4 Настроить переменные окружения

Нажмите **Configure Variables** для каждого сервиса:

#### Main App переменные:

```bash
# База данных (заполнится автоматически из PostgreSQL сервиса)
DB_USER=paymentsgate
DB_PASSWORD=paymentsgate123
DB_NAME=paymentsgate
DATABASE_URL=postgres://paymentsgate:paymentsgate123@<host>:5432/paymentsgate?sslmode=disable

# Сервер
ENVIRONMENT=production
BASE_URL=https://your-app-name.zeabur.app

# JWT (сгенерируйте свои!)
JWT_ACCESS_SECRET=<сгенерируйте>
JWT_REFRESH_SECRET=<сгенерируйте>

# Шифрование
ENCRYPTION_KEY=<32 символа>

# Telegram
TELEGRAM_BOT_TOKEN=<ваш_токен>
TELEGRAM_DISPUTE_CHAT_ID=<chat_id>
```

#### Telegram Bot переменные:

```bash
TELEGRAM_BOT_TOKEN=<ваш_токен>
BASE_URL=https://your-app-name.zeabur.app
TELEGRAM_DISPUTE_CHAT_ID=<chat_id>
```

### 2.5 Сгенерировать секретные ключи

Откройте терминал на локальной машине:

```bash
# JWT Access Secret (64 символа)
openssl rand -hex 32

# JWT Refresh Secret (64 символа)
openssl rand -hex 32

# Encryption Key (32 символа)
openssl rand -hex 16
```

## 🌐 Шаг 3: Настройка домена

### 3.1 Получить домен Zeabur

После деплоя Zeabur даст вам домен:
```
https://your-app-name.zeabur.app
```

### 3.2 (Опционально) Подключить свой домен

1. В панели Zeabur: **Settings** → **Domains**
2. Добавьте свой домен
3. Настройте DNS запись (CNAME) у вашего регистратора

## 🤖 Шаг 4: Настройка Telegram бота

### 4.1 Создать бота

1. Откройте **@BotFather** в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Получите **Token**

### 4.2 Сохранить токен

Сохраните токен в переменных окружения Zeabur:
```
TELEGRAM_BOT_TOKEN=<your-bot-token>
```

### 4.3 Привязать WebApp

1. Откройте **@BotFather**
2. Отправьте `/setdomain`
3. Выберите вашего бота
4. Введите ваш домен Zeabur:
   ```
   https://your-app-name.zeabur.app
   ```

### 4.4 Настроить команды бота

```
/setcommands
```

Выберите бота, отправьте:
```
start - открыть приложение
help - справка
```

## ✅ Шаг 5: Проверка

### 5.1 Проверить работу

1. **Frontend**: `https://your-app-name.zeabur.app`
2. **API**: `https://your-app-name.zeabur.app/health`
3. **WebSocket**: `wss://your-app-name.zeabur.app/ws`
4. **Telegram Bot**: Откройте бота в Telegram и нажмите `/start`

### 5.2 Посмотреть логи

В панели Zeabur:
- **Service** → **Logs**

## 📋 Полезные команды

### Локальная проверка Docker

```bash
# Сборка образа
docker build -f Dockerfile.zeabur -t paymentsgate .

# Запуск
docker run -p 8080:8080 --env-file .env paymentsgate

# Проверка
curl http://localhost:8080/health
```

### Обновление кода

```bash
# Вносите изменения в GitHub
git add .
git commit -m "Update"
git push

# Zeabur автоматически перезапустит сервисы!
```

## 🔧 Решение проблем

### ❌ Ошибка при сборке Docker

**Проблема**: Не может найти файлы

**Решение**: Проверьте пути в `Dockerfile.zeabur`

### ❌ База данных не подключается

**Проблема**: DATABASE_URL неверный

**Решение**:
1. В Zeabur проверьте переменные PostgreSQL сервиса
2. Убедитесь, что `DATABASE_URL` содержит правильные host/port

### ❌ Telegram бот не отвечает

**Проблема**: Bot не запущен

**Решение**:
1. Проверьте логи сервиса `telegram-bot`
2. Убедитесь, что `TELEGRAM_BOT_TOKEN` правильный
3. Проверьте интернет-соединение (бот должен достучаться до api.telegram.org)

### ❌ WebApp не открывается

**Проблема**: URL не настроен

**Решение**:
1. Убедитесь, что фронтенд доступен: `https://your-app.zeabur.app`
2. Проверьте, что BotFather получил правильный домен

## 💰 Бесплатный лимит Zeabur

- ✅ **5 сервисов** (у нас 3: main, bot, postgres)
- ✅ **5GB bandwidth/месяц**
- ✅ **Автоматический HTTPS**
- ✅ **Автодеплой из GitHub**

## 📞 Поддержка

Если что-то не работает:

1. Проверьте логи в Zeabur dashboard
2. Проверьте переменные окружения
3. Убедитесь, что все сервисы запущены (зелёный статус)
4. Проверьте подключение к базе данных

## 🎉 Готово!

Ваше Telegram Mini App работает!

- 🌐 **WebApp**: `https://your-app.zeabur.app`
- 🤖 **Bot**: `https://t.me/your_bot_username`
- 📊 **Dashboard**: В Telegram боте
