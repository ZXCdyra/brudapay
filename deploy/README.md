# 🚀 Деплой Telegram Mini App

## Варианты деплоя

### 🆓 Бесплатные

| Платформа | Бесплатно | HTTPS | Из РФ | Сложность |
|-----------|-----------|-------|-------|-----------|
| **Zeabur** ✅ | 5 сервисов | Да | Да | ⭐ Легко |
| Render | 1 сервис | Да | ❌ Нет | ⭐⭐ Средне |
| Fly.io | 3 VM | Да | Да | ⭐⭐⭐ Сложно |

### 💰 Платные (дешёвые)

| Платформа | Цена | Из РФ |
|-----------|------|-------|
| Hetzner Cloud | €4.45/мес | Да |
| DigitalOcean | $4/мес | Да |

## Быстрый старт

### 1. Zeabur (Рекомендуется)

```bash
# 1. Создайте репозиторий на GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 2. Импорт в Zeabur
# → zeabur.com
# → Create Service → Import from GitHub
# → Выберите репозиторий

# 3. Настройте переменные окружения
# → Dockerfile: Dockerfile.zeabur
# → Port: 8080
# → Добавьте переменные из .env.zeabur.example

# 4. Готово! Получите URL
```

📖 **Полная инструкция**: [deploy/zeabur/DEPLOYMENT_GUIDE.md](deploy/zeabur/DEPLOYMENT_GUIDE.md)

## Файлы для деплоя

```
platega-main/
├── Dockerfile.zeabur          # Dockerfile для main сервиса
├── Dockerfile.bot             # Dockerfile для Telegram бота
├── docker-compose.zeabur.yml  # Docker Compose для Zeabur
├── .env.zeabur.example        # Шаблон переменных окружения
└── deploy/
    ├── zeabur/
    │   └── DEPLOYMENT_GUIDE.md  # Инструкция по Zeabur
    └── oracle-cloud/            # (альтернатива)
        └── DEPLOYMENT_GUIDE.md
```

## Переменные окружения

Обязательно настройте:

```bash
# База данных
DB_USER=paymentsgate
DB_PASSWORD=<сильный_пароль>
DB_NAME=paymentsgate

# JWT (сгенерируйте свои!)
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>

# Шифрование (32 символа!)
ENCRYPTION_KEY=<openssl rand -hex 16>

# Telegram
TELEGRAM_BOT_TOKEN=<токен_от_BotFather>
TELEGRAM_DISPUTE_CHAT_ID=<chat_id>

# Домен (заполнится после деплоя)
BASE_URL=https://your-app.zeabur.app
```

## Архитектура

```
Telegram User
     │
     ▼
┌─────────────┐
│ Zeabur      │
│             │
│ ┌────────┐  │
│ │Frontend│  │ ← Next.js (React)
│ │ :8080  │  │
│ └────────┘  │
│     │       │
│ ┌────────┐  │
│ │Backend │  │ ← Go API
│ │ :8080  │  │
│ └────────┘  │
│     │       │
│ ┌────────┐  │
│ │ Postgres│ │ ← База данных
│ └────────┘  │
│     │       │
│ ┌────────┐  │
│ │  Bot   │  │ ← Python (python-telegram-bot)
│ └────────┘  │
└─────────────┘
```

## Мониторинг

- **Логи**: Zeabur Dashboard → Service → Logs
- **Метрики**: Zeabur Dashboard → Metrics
- **Домен**: Zeabur Dashboard → Settings → Domains

## Обновление кода

```bash
# Просто пушните в GitHub
git add .
git commit -m "Update"
git push

# Zeabur автоматически перезапустит сервисы!
```
