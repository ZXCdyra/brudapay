# 🚀 Быстрый деплой Telegram Mini App

## 🎯 Варианты деплоя

| Платформа | Бесплатно | HTTPS | Из РФ | Сложность |
|-----------|-----------|-------|-------|-----------|
| **Render.com** ✅ | Да | Да | Да | ⭐ Легко |
| Zeabur | Да | Да | Да | ⭐ Легко |

## ⚡ Быстрый старт (Render.com)

### Шаг 1: База данных (2 минуты)

1. Откройте [ElephantSQL](https://www.elephantsql.com/)
2. Создайте аккаунт → New Server → Tiny (10MB) - БЕСПЛАТНО
3. Скопируйте **URL** (например: `postgres://user:pass@...`)

### Шаг 2: GitHub (2 минуты)

```bash
cd /home/zxc-dyra/Загрузки/platega-main

# Создайте репозиторий на github.com/new
git remote add origin https://github.com/YOUR_USERNAME/platega.git
git branch -M main
git push -u origin main
```

### Шаг 3: Backend на Render (5 минут)

1. Откройте [render.com](https://render.com) → Sign Up через GitHub
2. **New +** → **Web Service**
3. Выберите репозиторий `platega`
4. Настройки:
   - **Name**: `platega-backend`
   - **Dockerfile**: `backend/Dockerfile.render`
   - **Instance Type**: Free
5. Добавьте переменные окружения:
   ```
   SERVER_PORT=8080
   DATABASE_URL=postgres://user:pass@host:port/dbname
   JWT_ACCESS_SECRET=<сгенерируйте>
   JWT_REFRESH_SECRET=<сгенерируйте>
   ENCRYPTION_KEY=<32 символа>
   TELEGRAM_BOT_TOKEN=<токен_от_BotFather>
   ```
6. **Deploy**

### Шаг 4: Frontend на Render (3 минуты)

1. **New +** → **Static Site**
2. Выберите репозиторий `platega`
3. Настройки:
   - **Name**: `platega-frontend`
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.next/standalone`
4. Переменные:
   ```
   NEXT_PUBLIC_API_URL=https://platega-backend.onrender.com
   ```
5. **Deploy**

### Шаг 5: Telegram бот (2 минуты)

1. [@BotFather](https://t.me/BotFather) → `/newbot`
2. Сохраните токен
3. В Render: добавьте `TELEGRAM_BOT_TOKEN` в переменные
4. BotFather: `/setdomain` → укажите URL фронтенда

## 🎉 Готово!

- 🌐 WebApp: `https://platega-frontend.onrender.com`
- 🤖 Bot: `https://t.me/your_bot_username`
- 💰 **Цена: $0/месяц**

## 📖 Подробная инструкция

[deploy/render/DEPLOYMENT_GUIDE.md](deploy/render/DEPLOYMENT_GUIDE.md)
