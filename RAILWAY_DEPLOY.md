# Деплой BrudaPay на Railway

## Шаг 1: Подготовка

1. Установите [Railway CLI](https://docs.railway.app/guides/cli) или используйте веб-интерфейс
2. Войдите в аккаунт Railway:
   ```bash
   railway login
   ```

## Шаг 2: Создание проекта

### Вариант A: Через CLI

1. Создайте новый проект:
   ```bash
   railway init
   ```

2. Добавьте сервис базы данных PostgreSQL:
   ```bash
   railway service add PostgreSQL
   ```

3. Добавьте сервис Redis:
   ```bash
   railway service add Redis
   ```

4. Добавьте сервис backend (Go):
   ```bash
   railway link
   # Выберите директорию backend/
   railway deploy
   ```

5. Добавьте сервис frontend (Next.js):
   ```bash
   railway link
   # Выберите директорию frontend/
   railway deploy
   ```

### Вариант B: Через веб-интерфейс

1. Перейдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте сервисы: PostgreSQL, Redis
4. Импортируйте репозиторий GitHub

## Шаг 3: Настройка переменных окружения

### Backend (Go API):
```
DATABASE_URL=<из переменной PostgreSQL>
REDIS_URL=<из переменной Redis>
JWT_ACCESS_SECRET=<сгенерируйте сильный секрет>
JWT_REFRESH_SECRET=<сгенерируйте сильный секрет>
ENCRYPTION_KEY=<32-символьный ключ>
TELEGRAM_BOT_TOKEN=<ваш токен Telegram бота>
TELEGRAM_DISPUTE_CHAT_ID=<ID чата для споров>
SERVER_PORT=8080
ENVIRONMENT=production
BASE_URL=https://brudapay.ru
RATE_LIMIT_RPS=100
```

### Frontend (Next.js):
```
NEXT_PUBLIC_API_URL=https://your-project.railway.app
NEXT_PUBLIC_WS_URL=wss://your-project.railway.app
```

## Шаг 4: Настройка домена

1. В веб-интерфейсе Railway перейдите в ваш проект
2. Выберите сервис frontend
3. Перейдите во вкладку "Settings" → "Domains"
4. Добавьте домен: `brudapay.ru`
5. Добавьте CNAME запись в настройках домена Reg.ru:
   - Тип: CNAME
   - Имя: `@` или `www`
   - Значение: `<vаш-railway-домен>`

## Шаг 5: Деплой

```bash
# Деплой backend
cd backend
railway up

# Деплой frontend
cd ../frontend
railway up
```

## Проверка

- Backend: https://your-project.railway.app/health
- Frontend: https://brudapay.ru
- API: https://brudapay.ru/api/v1

## Мониторинг

```bash
# Посмотреть логи backend
railway logs

# Посмотреть логи frontend
railway logs frontend
```

## Важные заметки

- Railway автоматически запускает миграции при старте
- Убедитесь, что все миграции в `backend/migrations/` выполнены
- SSL/HTTPS настроен автоматически через Railway
- Для production используйте сильные секреты для JWT
