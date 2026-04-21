# Руководство по запуску проекта

## Требования
- Ruby 3.1+
- Rails 7.2+
- Node.js 16+
- SQLite3

## Быстрый старт

### 1. Установка зависимостей
```bash
# Установка Ruby gems
bundle install

# Установка Node.js зависимостей
npm install
```

### 2. Настройка базы данных
```bash
# Создание и миграция базы данных
bundle exec rails db:create db:migrate
```

### 3. Запуск серверов
```bash
# Запуск Rails backend (порт 3001)
bundle exec rails server -p 3001

# В отдельном терминале запуск frontend (порт 3000)
cd frontend
npm run dev
```

### 4. Проверка работы
Откройте в браузере:
- **Гостевой доступ**: http://localhost:3000
- **API эндпоинты**: http://localhost:3001/api/events

## Роли и доступ

### Гости (главная страница)
- URL: http://localhost:3000
- Могут просматривать доступные события
- Могут создавать бронирования без регистрации

### Владельцы (панель управления)
- URL: http://localhost:3000/dashboard
- Могут создавать и удалять события
- Могут просматривать все бронирования
- Могут удалять бронирования

## API эндпоинты

### Публичные (для гостей)
- `GET /api/public/events` - список событий
- `GET /api/public/events/:id` - детали события
- `POST /api/public/bookings` - создание бронирования

### Для владельцев
- `GET /api/owner/dashboard` - дашборд
- `POST /api/owner/events` - создание события
- `DELETE /api/owner/events/:id` - удаление события
- `GET /api/owner/bookings` - список бронирований
- `DELETE /api/owner/bookings/:id` - удаление бронирования

### Общие
- `GET /api/available_slots` - проверка доступных слотов

## Тестовые данные
Для проверки работы можно создать тестовое событие:
```bash
bundle exec rails runner "owner = Owner.first || Owner.create!(name: 'Calendar Owner', email: 'owner@example.com'); event = Event.new(name: 'Консультация', description: 'Персональная консультация 30 минут', duration: 30); event.owner = owner; event.save!"
```

## Стоп серверов
Нажмите `Ctrl+C` в каждом терминале или используйте:
```bash
# Найти и убить процессы
pkill -f "rails server"
pkill -f "npm run dev"
```