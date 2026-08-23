# 📝 Инструкция: Создание репозитория GitHub и деплой на Zeabur

## Шаг 1: Создание репозитория на GitHub

1. Откройте [github.com/new](https://github.com/new)
2. Войдите в аккаунт (или создайте)
3. Заполните:
   - **Repository name**: `platega` (или любое другое)
   - **Description**: `PaymentsGate - Telegram Mini App`
   - Выберите **Public** или **Private**
   - **НЕ** ставьте галочки на "Add README", ".gitignore", "License"
4. Нажмите **Create repository**

## Шаг 2: Подключение локального репозитория

После создания репозитория, GitHub покажет команду. Но вы можете использовать эти:

```bash
# Перейдите в папку проекта
cd /home/zxc-dyra/Загрузки/platega-main

# Добавьте удалённый репозиторий (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/platega.git

# Если уже есть origin, обновите его
git remote set-url origin https://github.com/YOUR_USERNAME/platega.git

# Создайте главную ветку
git branch -M main

# Запушьте код
git push -u origin main
```

## Шаг 3: Проверка пуша

Откройте [github.com/YOUR_USERNAME/platega](https://github.com/YOUR_USERNAME/platega)

Убедитесь, что все файлы на месте:
- ✅ `Dockerfile.zeabur`
- ✅ `Dockerfile.bot`
- ✅ `docker-compose.zeabur.yml`
- ✅ `frontend/`
- ✅ `backend/`
- ✅ `deploy/zeabur/DEPLOYMENT_GUIDE.md`

## Шаг 4: Деплой на Zeabur

1. Откройте [zeabur.com](https://zeabur.com)
2. Нажмите **Sign Up** (через GitHub)
3. Нажмите **Create Service**
4. Выберите **Import Git Repository**
5. Найдите ваш репозиторий `platega`
6. Нажмите **Install & Deploy**

## Шаг 5: Настройка сервиса в Zeabur

### Сервис 1: Main App

Zeabur предложит настроить сервис. Выберите:

- **Template**: Docker
- **Dockerfile Path**: `Dockerfile.zeabur`
- **Port**: `8080`

### Сервис 2: PostgreSQL (База данных)

- Нажмите **Add Service** → **Database** → **PostgreSQL**
- Zeabur автоматически создаст базу данных

### Сервис 3: Telegram Bot

- Нажмите **Add Service** → **Docker**
- **Dockerfile Path**: `Dockerfile.bot`

## Шаг 6: Переменные окружения

Нажмите на сервис → **Variables** и добавьте:

### Для Main App:

```bash
DB_USER=paymentsgate
DB_PASSWORD=paymentsgate
DB_NAME=paymentsgate
ENVIRONMENT=production
BASE_URL=https://your-app-name.zeabur.app
JWT_ACCESS_SECRET=<сгенерируйте>
JWT_REFRESH_SECRET=<сгенерируйте>
ENCRYPTION_KEY=<сгенерируйте>
RATE_LIMIT_RPS=100
TELEGRAM_BOT_TOKEN=<ваш_токен>
TELEGRAM_DISPUTE_CHAT_ID=
```

**Сгенерировать ключи:**
```bash
openssl rand -hex 32  # JWT Access
openssl rand -hex 32  # JWT Refresh
openssl rand -hex 16  # Encryption
```

### Для Telegram Bot:

```bash
TELEGRAM_BOT_TOKEN=<ваш_токен>
BASE_URL=https://your-app-name.zeabur.app
TELEGRAM_DISPUTE_CHAT_ID=
```

## Шаг 7: Подключить базу данных

1. Нажмите на сервис PostgreSQL
2. Скопируйте **Host**, **Port**, **Username**, **Password**
3. В Main App переменных:
   ```
   DATABASE_URL=postgres://username:password@host:port/paymentsgate?sslmode=disable
   ```

## Шаг 8: Завершение деплоя

1. Нажмите **Deploy**
2. Подождите 2-5 минут
3. Zeabur даст вам URL: `https://your-app-name.zeabur.app`

## Шаг 9: Настройка Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Создайте бота: `/newbot`
3. Получите токен
4. Сохраните токен в переменных Zeabur
5. Привяжите WebApp:
   ```
   /setdomain
   ```
6. Выберите вашего бота
7. Введите: `https://your-app-name.zeabur.app`

## 🎉 Готово!

Проверьте:
- 🌐 WebApp: `https://your-app-name.zeabur.app`
- 🤖 Bot в Telegram: `/start`
- 📊 API: `https://your-app-name.zeabur.app/health`
