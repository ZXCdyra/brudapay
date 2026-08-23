# 🚀 Быстрый старт: Деплой на Render.com с Supabase

## 💰 Стоимость: $0/месяц

- Frontend: ✅ БЕСПЛАТНО (Static Site)
- Backend: ✅ 750 часов/месяц (Free)
- Supabase (PostgreSQL): ✅ 500MB БЕСПЛАТНО

---

## 📋 ШАГ 1: Создать Supabase базу (2 минуты)

1. Открой [supabase.com](https://supabase.com)
2. Нажми **Start your project**
3. Создай организацию (любое название)
4. Нажми **New project**
5. Заполни:
   - **Name**: `platega`
   - **Region**: Choose closest (Europe - Frankfurt или US West)
   - **Database Password**: ✅ **СКОПИРУЙ И СОХРАНИ** (не покажется снова!)
   - **Project Plan**: ✅ **Free**
6. Нажми **Create new project**

Подожди 2-3 минуты пока создастся.

7. Скопируй **Database URL** (Settings → Database → Connection String):
   ```
   postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-eu-west-1.pooler.supabase.com:5432/postgres
   ```

---

## 📋 ШАГ 2: Создать бота в Telegram (2 минуты)

1. Открой [@BotFather](https://t.me/BotFather) в Telegram
2. Отправь `/newbot`
3. Придумай имя: `Platega Bot`
4. Придумай username: `platega_payment_bot` (должен заканчиваться на `bot`)
5. **Скопируй TOKEN** (выдаст сразу после создания)
6. В Render: добавь переменную `TELEGRAM_BOT_TOKEN=<токен>`

---

## 📋 ШАГ 3: Сгенерировать секретные ключи (1 минута)

Открой терминал и выполни:

```bash
# JWT Access Secret
openssl rand -hex 32

# JWT Refresh Secret
openssl rand -hex 32

# Encryption Key (32 символа)
openssl rand -hex 16
```

Скопируй результаты!

---

## 📋 ШАГ 4: Backend на Render (5 минут)

1. Открой [render.com](https://render.com)
2. **Sign Up** через GitHub (ZXCdyra)
3. Нажми **New +** → **Web Service**
4. Выбери репозиторий **ZXCdyra/brudapay**
5. Настрой:

### General
- **Name**: `platega-backend`
- **Region**: Oregon
- **Branch**: `main`
- **Root Directory**: `/`

### Build & Deploy
- **Runtime**: Docker
- **Dockerfile**: `backend/Dockerfile.render`
- **Build Command**: `docker build -f backend/Dockerfile.render -t backend .`
- **Start Command**: `./entrypoint.sh`

### Instances
- **Instance Type**: **Free**

### Environment Variables (Добавь все!):

```bash
SERVER_PORT=8080
PORT=8080
ENVIRONMENT=production
NODE_ENV=production

# База данных (от Supabase)
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require

# JWT (от шага 3)
JWT_ACCESS_SECRET=<сгенерированный_ключ>
JWT_REFRESH_SECRET=<сгенерированный_ключ>

# Шифрование
ENCRYPTION_KEY=<32_символа>

# Telegram
TELEGRAM_BOT_TOKEN=<токен_от_BotFather>
TELEGRAM_DISPUTE_CHAT_ID=

# Rate Limits
RATE_LIMIT_RPS=100
```

6. Нажми **Deploy Web Service**

⏱ Ожидание: 5-10 минут (первый билд)

---

## 📋 ШАГ 5: Frontend на Render (3 минуты)

1. В dashboard Render: **New +** → **Static Site**
2. Выбери **ZXCdyra/brudapay**
3. Настрой:

### General
- **Name**: `platega-frontend`
- **Branch**: `main`

### Build
- **Root Directory**: `/frontend`
- **Framework**: Next.js
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `.next/standalone`

### Environment Variables:
```bash
NEXT_PUBLIC_API_URL=https://platega-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://platega-backend.onrender.com
```

4. Нажми **Deploy Static Site**

---

## ✅ ШАГ 6: Проверка (1 минута)

После деплоя (5-10 минут):

### Frontend:
```
https://platega-frontend.onrender.com
```

### Backend:
```
https://platega-backend.onrender.com/health
```

### Telegram Bot:
1. Открой своего бота в Telegram
2. Нажми `/start`
3. Должна появиться кнопка "🚀 Открыть приложение"

---

## 🎯 Привязка WebApp к боту

1. Открой [@BotFather](https://t.me/BotFather)
2. Отправь `/setdomain`
3. Выбери своего бота
4. Введи URL фронтенда:
   ```
   https://platega-frontend.onrender.com
   ```

---

## 💡 Полезная информация

### Логи в Render:
- Backend: **Dashboard** → **platega-backend** → **Logs**
- Frontend: **Dashboard** → **platega-frontend** → **Logs**

### Supabase Dashboard:
- [supabase.com/dashboard](https://supabase.com/dashboard)
- **Project** → **platega**
- Здесь видишь таблицы и данные

### Переменные окружения:
- Backend: **Dashboard** → **platega-backend** → **Environment**
- Frontend: **Dashboard** → **platega-frontend** → **Environment**

---

## 🆘 Решение проблем

### Backend не запускается

**Проверь:**
1. `DATABASE_URL` - правильный ли URL от Supabase?
2. Логи в Render - какая ошибка?
3. Убедись, что Supabase проект создан (статус **Running**)

### Ошибка "ECONNREFUSED" или "timeout"

**Решение:**
```
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Убедись, что `sslmode=require` (Supabase требует SSL!)

### Telegram бот не отвечает

**Проверь:**
1. `TELEGRAM_BOT_TOKEN` - правильный ли токен?
2. Логи бэкенда - есть ли ошибка подключения?
3. Убедись, что сервис запущен (зелёный статус)

### Frontend показывает ошибку 500

**Проверь:**
1. `NEXT_PUBLIC_API_URL` - правильный ли URL бэкенда?
2. Логи фронтенда
3. Убедись, что бэкенд уже запущен и работает

---

## 📊 Мониторинг

### Supabase (База данных):
- [supabase.com/dashboard](https://supabase.com/dashboard)
- **Usage** → проверь сколько used

### Render (Сервисы):
- **Dashboard** → статус сервисов
- **Metrics** → нагрузка CPU/RAM

---

## 💰 Стоимость

| Сервис | Размер | Цена |
|--------|--------|------|
| Render Frontend | Static | ✅ FREE |
| Render Backend | Web Service | ✅ FREE (750 часов) |
| Supabase | PostgreSQL | ✅ FREE (500MB) |
| **Итого** | | **$0/месяц** |

---

## 🎉 Готово!

Твоё Telegram Mini App работает полностью бесплатно!

- 🌐 **WebApp**: `https://platega-frontend.onrender.com`
- 🤖 **Bot**: `https://t.me/your_bot_username`
- 💾 **Database**: Supabase (500MB free)
- 💰 **Цена**: $0/месяц
