# ai-for-developers-project-386
## Описание приложения
В проекте есть две роли: владелец календаря и гости.

В этом проекте нет регистрации и авторизации. Владелец календаря — один заранее заданный профиль. Гость бронирует слоты без создания аккаунта и без входа в систему.

### Владелец календаря может:
    - Создавать типы событий.
    - Для каждого типа события задает id, название, описание и длительность в минутах.
    - Просматривает страницу предстоящих встреч, где в одном списке показаны бронирования всех типов событий.

### Гость:
    - Может посмотреть страницу с видами брони, где доступно название, описание и длительность.
    - Выбирает тип события, открывает календарь и выбирает свободный слот.
    - Создает бронирование на выбранный слот.

### Правило занятости:
     - На одно и то же время нельзя создать две записи, даже если это разные типы событий.

## Деплой

Приложение развернуто на Render: https://calendar-booking-app-6f0s.onrender.com

### Docker

Приложение упаковано в Docker-контейнер с помощью multi-stage Dockerfile:
- Node.js 20 — сборка React фронтенда
- Ruby 3.3.6 — Rails API backend
- PostgreSQL база данных (Render предоставляет free tier PostgreSQL)

### Переменные окружения

- `PORT` — порт, на котором запускается приложение (устанавливается Render автоматически)
- `RAILS_ENV=production` — режим production
- `SECRET_KEY_BASE` — секретный ключ Rails (генерируется автоматически)
- `RAILS_LOG_LEVEL=info` — уровень логирования

## 🚀 Деплой на Render

### Способ 1: Blueprint (рекомендуется)

1. Перейдите на [Render Blueprint](https://dashboard.render.com/blueprints/new?repo=https://github.com/vik1972/ai-for-developers-project-386)
2. Нажмите **"Connect"** и **"Apply"**
3. Render автоматически создаст сервис с настройками из `render.yaml`

### Способ 2: Ручная настройка

1. Сначала создайте **PostgreSQL Database**:
   - На [Render Dashboard](https://dashboard.render.com) нажмите **"New +" → "PostgreSQL"**
   - **Name**: `calendar-booking-db`
   - **Plan**: `Free`
   - Сохраните **Internal Connection String**

2. На [Render Dashboard](https://dashboard.render.com) нажмите **"New +" → "Web Service"**
3. Выберите GitHub репозиторий `vik1972/ai-for-developers-project-386`
4. Настройки:
   - **Name**: `calendar-booking-app`
   - **Runtime**: `Docker`
   - **Branch**: `main`
   - **Plan**: `Free`
   - **Health Check Path**: `/up`
5. Добавьте переменную окружения **DATABASE_URL**:
   - Key: `DATABASE_URL`
   - Value: Internal Connection String из шага 1
6. Нажмите **"Create Web Service"**

### Способ 3: Render CLI (локально)

```bash
# Установка Render CLI
curl -fsSL https://raw.githubusercontent.com/render-oss/render-cli/main/install.sh | bash

# Авторизация
render login

# Деплой через Blueprint
./bin/deploy-render
```

### Автоматический деплой через GitHub Actions

При пуше в `main` ветку автоматически запускается деплой (требуется настройка `RENDER_DEPLOY_HOOK_URL` в GitHub Secrets).

### Настройка автодеплоя

1. После первого ручного деплоя, получите **Deploy Hook URL** в настройках сервиса на Render
2. Добавьте его в GitHub репозиторий: **Settings → Secrets → New repository secret**
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: ваш Deploy Hook URL с Render
3. Теперь каждый пуш в `main` будет автоматически деплоиться

### Проверка деплоя

- **Health Check**: `https://calendar-booking-app-6f0s.onrender.com/up`
- **API Events**: `https://calendar-booking-app-6f0s.onrender.com/api/public/events`
- **Dashboard**: https://dashboard.render.com
- **Логи**: В разделе "Logs" на Render Dashboard

### Локальный запуск Docker

```bash
# Сборка образа
docker build -t calendar-app .

# Запуск контейнера
docker run -p 3000:3000 -e PORT=3000 calendar-app
```

