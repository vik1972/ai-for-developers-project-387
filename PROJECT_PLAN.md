# План развития: Превращение приложения в Cal.com-подобный сервис

## 📊 Текущее состояние приложения

**Уже реализовано:**
- ✅ Rails 7.2 API + React 18 + TypeScript + Mantine UI
- ✅ Создание типов событий (название, описание, длительность)
- ✅ Бронирование без регистрации (гостевая модель)
- ✅ Выбор времени через слоты с валидацией занятости
- ✅ Дашборд владельца со статистикой (всего событий, бронирований, предстоящих)
- ✅ Управление событиями и бронированиями (CRUD)
- ✅ SQLite база данных

---

## 🎯 Ключевые функции Cal.com для реализации

### 1. **Профиль владельца (Owner Profile)**
- Публичная страница с уникальным URL (`/:slug` или `/:username`)
- Аватар, имя, описание профиля
- Часовой пояс по умолчанию
- Персональная ссылка для бронирования

### 2. **Настройки доступности (Availability)**
- Рабочие часы по дням недели (пн-пт 9:00-17:00 и т.д.)
- Перерывы (обед 12:00-13:00)
- Буферное время между встречами (before/after)
- Исключения: отпуск, праздники, нерабочие дни
- Разные расписания для разных типов событий

### 3. **Улучшенный выбор времени**
- Календарь на месяц (вместо date input)
- Навигация по неделям/месяцам
- Визуальная индикация дней со свободными слотами
- Выбор часового пояса гостем
- Несколько видов отображения: monthly, weekly, column

### 4. **Детали бронирования**
- Стандартные поля: имя, email, телефон (уже есть)
- Дополнительные поля: компания, заметки
- Локация встречи: Zoom, Google Meet, адрес, телефон
- Кастомные вопросы перед встречей
- Добавление гостей (несколько email через запятую)

### 5. **Управление бронированиями**
- Статусы: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`
- Перенос встречи (reschedule) на другое время
- Отмена с указанием причины
- Массовые действия (bulk actions)
- Фильтры по статусу, дате, типу события

### 6. **Интеграции**
- Google Calendar / Outlook Calendar (OAuth)
- Email-уведомления (подтверждение, напоминания)
- Zoom / Google Meet автоматические ссылки
- Telegram / Slack уведомления для владельца

### 7. **Публичная страница бронирования**
- Красивая многошаговая страница для гостей
- Шаг 1: Выбор типа события
- Шаг 2: Выбор даты (календарь)
- Шаг 3: Выбор времени (сетка слотов)
- Шаг 4: Заполнение формы
- Шаг 5: Подтверждение с деталями

### 8. **Дополнительные Cal.com-фичи**
- Round-robin (распределение между несколькими людьми)
- Групповые события (несколько участников одновременно)
- Collective events (встреча только когда все свободны)
- Secret events (только по прямой ссылке)
- Депозиты / оплата (Stripe интеграция)
- Workflow автоматизация (триггеры и действия)

---

## 🚀 Фазы реализации

### Фаза 1: Основной UX и Профиль (Высокий приоритет)

#### 1.1 Расширение модели Owner
```ruby
# Новые поля в таблице owners
- slug: string (уникальный URL, indexed)
- avatar_url: string
- bio: text
- timezone: string (по умолчанию 'Europe/Moscow')
- working_hours: jsonb (расписание по дням недели)
- is_public: boolean (default: true)
```

**Задачи:**
- [ ] Миграция базы данных
- [ ] API для получения публичного профиля
- [ ] Компонент `PublicProfile` (React)
- [ ] Валидация уникальности slug

#### 1.2 Публичная страница владельца (`/:slug`)
**Макет:**
```
┌─────────────────────────────────────┐
│  [Avatar 80x80]                     │
│  Имя Владельца                      │
│  Описание профиля...                │
│  🕐 Europe/Moscow                   │
│                                      │
│  ┌─────────────────────────────┐     │
│  │ Доступные типы встреч:      │     │
│  │ ┌─────┐ ┌─────┐ ┌─────┐    │     │
│  │ │30min│ │60min│ │90min│    │     │
│  │ │ 💼  │ │ 📞  │ │ ☕  │    │     │
│  │ └─────┘ └─────┘ └─────┘    │     │
│  └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

**Задачи:**
- [ ] Создать route `/:slug` в React Router
- [ ] Компонент `PublicProfilePage`
- [ ] Отображение списка событий владельца
- [ ] Переход к бронированию при клике на событие

#### 1.3 Улучшенный календарь выбора даты
**Заменить:**
- ❌ Старый: `<input type="date">`
- ✅ Новый: `@mantine/dates` Calendar или кастомный компонент

**Функции:**
- Отображение месяца целиком
- Навигация вперёд/назад по месяцам
- Подсветка дней со свободными слотами (зелёный)
- Блокировка дней без слотов или исключений
- Выбор часового пояса гостем

**Задачи:**
- [ ] Установить `@mantine/dates`
- [ ] Создать компонент `BookingCalendar`
- [ ] Интеграция с API available_slots
- [ ] Визуальная индикация доступности

#### 1.4 Многошаговый процесс бронирования (Booking Wizard)
```
Шаг 1: Выбор события (если не выбрано на публичной странице)
Шаг 2: Выбор даты (календарь)
Шаг 3: Выбор времени (сетка слотов)
Шаг 4: Форма данных (имя, email, телефон, доп. поля)
Шаг 5: Подтверждение (превью + кнопка "Забронировать")
Шаг 6: Success page (детали бронирования, ссылка на календарь)
```

**Задачи:**
- [ ] Создать `BookingWizard` компонент
- [ ] State management для шагов (React Context или Zustand)
- [ ] Progress indicator (шаги 1-5)
- [ ] Валидация на каждом шаге
- [ ] Анимации переходов между шагами

---

### Фаза 2: Настройки доступности (Средний приоритет)

#### 2.1 Модель Availability и исключения
```ruby
# Новая таблица availability_schedules
t.string :name
 t.jsonb :schedule  # { mon: { start: "09:00", end: "17:00", enabled: true }, ... }
t.references :owner
t.boolean :is_default

# Новая таблица availability_exceptions  
t.references :owner
t.date :date
t.boolean :is_available  # false = полный выходной
t.jsonb :available_slots # ["09:00", "09:30", ...] или null если is_available=false
t.text :reason  # "Отпуск", "Праздник"
```

**Задачи:**
- [ ] Миграции для availability_schedules и availability_exceptions
- [ ] API для CRUD расписаний
- [ ] API для CRUD исключений
-n- [ ] Логика применения: default schedule + exceptions

#### 2.2 UI для настройки доступности
**Страница в дашборде: `/dashboard/availability`**

**Компоненты:**
- `AvailabilityEditor` - редактирование дней недели
- `ExceptionCalendar` - календарь с исключениями
- `TimeRangeInput` - выбор времени (с/до)
- `BufferSettings` - настройка буферного времени

**Задачи:**
- [ ] Создать страницу настроек доступности
- [ ] UI для установки рабочих часов по дням
- [ ] UI для добавления исключений (драг-н-дроп календарь)
- [ ] Предпросмотр доступности

#### 2.3 Применение availability к слотам
**Логика генерации слотов:**
```ruby
def generate_slots(date, event_duration)
  schedule = get_schedule_for_date(date)
  exceptions = get_exceptions_for_date(date)
  
  return [] if exceptions.any? { |e| !e.is_available }
  
  slots = []
  current_time = schedule.start_time
  
  while current_time + event_duration <= schedule.end_time
    slot_end = current_time + event_duration
    
    # Проверка на существующие бронирования
    unless booking_exists?(date, current_time, slot_end)
      slots << current_time
    end
    
    current_time += event_duration.minutes
  end
  
  slots
end
```

**Задачи:**
- [ ] Обновить `AvailableSlotsController`
- [ ] Интеграция с AvailabilitySchedule
- [ ] Учёт buffer_before/buffer_after
- [ ] Учёт часового пояса

---

### Фаза 3: Улучшенное управление бронированиями (Средний приоритет)

#### 3.1 Расширение модели Booking
```ruby
# Новые поля в таблице bookings
t.string :status, default: 'confirmed'  # pending, confirmed, cancelled, completed, no_show
t.string :guest_name
t.string :guest_email
t.string :guest_phone
t.string :location_type  # zoom, google_meet, phone, address
t.string :location_url
t.text :notes
t.datetime :cancelled_at
t.text :cancellation_reason
t.datetime :rescheduled_from  # оригинальное время при переносе
t.integer :guests_count, default: 1
t.jsonb :custom_fields  # { company: "Acme", notes: "..." }
```

**Задачи:**
- [ ] Миграции для новых полей
- [ ] Обновить валидации
- [ ] Обновить сериализаторы JSON

#### 3.2 Статусы и жизненный цикл бронирования
```
confirmed → completed (после времени встречи)
confirmed → cancelled (гость или владелец отменил)
confirmed → no_show (владелец отметил)
confirmed → rescheduled (перенос на новое время)
```

**API эндпоинты:**
```
POST   /api/bookings/:id/cancel     # отмена с причиной
POST   /api/bookings/:id/reschedule # перенос на новый slot
PATCH  /api/bookings/:id/status     # изменение статуса
```

**Задачи:**
- [ ] Добавить статусную модель (state machine или enum)
- [ ] Эндпоинты для отмены и переноса
- [ ] Валидации переходов статусов

#### 3.3 Улучшенный дашборд бронирований
**Виды:**
- 📅 **Calendar View** - календарь с встречами (как Google Calendar)
- 📋 **List View** - таблица с фильтрами и сортировкой

**Фильтры:**
- По статусу: предстоящие, прошедшие, отменённые
- По дате: сегодня, неделя, месяц, кастомный период
- По типу события
- Поиск по имени гостя/email

**Быстрые действия:**
- Подтвердить/Отменить (inline)
- Перенести (модалка с календарём)
- Отправить email повторно
- Скопировать ссылку на встречу

**Задачи:**
- [ ] Создать `BookingsCalendarView` компонент
- [ ] Создать `BookingsListView` компонент
- [ ] Переключатель вида (Toggle)
- [ ] Фильтры и поиск
- [ ] Bulk actions (выбор нескольких бронирований)

---

### Фаза 4: Интеграции и Уведомления (Низкий приоритет)

#### 4.1 Email-уведомления
**Шаблоны:**
- Бронирование создано (гость + владелец)
- Напоминание за 24 часа
- Напоминание за 1 час
- Бронирование отменено
- Бронирование перенесено

**Технологии:**
- ActionMailer (Rails)
- Letter Opener (dev)
- SendGrid / Mailgun / SMTP (prod)

**Задачи:**
- [ ] Настроить ActionMailer
- [ ] Создать email шаблоны (HTML + text)
- [ ] Фоновые джобы (Active Job + Solid Queue)
- [ ] Логика триггеров (создание, отмена, напоминания)

#### 4.2 Google Calendar интеграция
**OAuth2 Flow:**
```
1. Владелец нажимает "Подключить Google Calendar"
2. OAuth consent screen Google
3. Получаем access_token + refresh_token
4. Сохраняем токены в owner.google_calendar_token
5. Используем Google Calendar API для:
   - Чтения занятости (free/busy)
   - Создания событий при бронировании
   - Обновления/удаления при отмене
```

**Задачи:**
- [ ] Google Cloud Console setup (OAuth credentials)
- [ ] Эндпоинты OAuth callback
- [ ] Сервис для Google Calendar API
- [ ] Синхронизация занятости
- [ ] Создание событий в Google Calendar

#### 4.3 Видео-конференции
**Zoom:**
- OAuth интеграция
- Автоматическое создание meeting при бронировании
- Сохранение join_url в booking.location_url

**Google Meet:**
- Создание через Google Calendar API
- Автоматическая генерация ссылки

**Задачи:**
- [ ] Zoom OAuth интеграция
- [ ] Сервис для создания meetings
- [ ] Настройка в типе события (автогенерация ссылки)

---

## 🎨 Интерфейсные улучшения (UI/UX)

### Цветовая схема (как в Cal.com)
```css
/* Primary */
--color-primary: #111827;      /* Чёрно-синий */
--color-accent: #f97316;      /* Оранжевый */
--color-success: #22c55e;     /* Зелёный */
--color-warning: #eab308;     /* Жёлтый */
--color-danger: #ef4444;      /* Красный */

/* Backgrounds */
--bg-page: #f9fafb;
--bg-card: #ffffff;
--bg-hover: #f3f4f6;

/* Text */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-muted: #9ca3af;
```

### Компоненты дизайн-системы
- **Cards**: border-radius 12px, box-shadow `0 1px 3px rgba(0,0,0,0.1)`
- **Buttons**: border-radius 8px, hover: darken 10%
- **Inputs**: border-radius 8px, focus: ring 2px primary
- **Calendar**: чистый дизайн, текущий день выделен
- **Modals**: backdrop blur, slide-up animation

### Адаптивность
- Mobile-first подход
- breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly элементы (минимум 44x44px)

---

## 🛠 Технический стек и библиотеки

### Backend (Rails)
- **База данных**: SQLite (dev) → PostgreSQL (prod)
- **Аутентификация**: JWT или Devise Token Auth (если нужна)
- **Фоновые задачи**: Active Job + Solid Queue
- **Email**: ActionMailer + SendGrid/Mailgun
- **OAuth**: OmniAuth (Google, Zoom)
- **API**: Jbuilder или ActiveModel::Serializers

### Frontend (React)
- **UI библиотека**: Mantine (уже используется) + @mantine/dates
- **Состояние**: Zustand (легче Redux) или React Context
- **Формы**: @mantine/form (уже есть)
- **Запросы**: React Query (уже есть)
- **Маршрутизация**: React Router (уже есть)
- **Иконки**: Lucide React (уже есть)
- **Даты**: date-fns или dayjs

### Новые пакеты для установки
```bash
# Frontend
cd frontend && npm install @mantine/dates @mantine/modals zustand dayjs

# Backend
gem 'omniauth-google-oauth2'
gem 'omniauth-zoom'
gem 'google-api-client'
gem 'httparty'
gem 'solid_queue'
gem 'whenever'  # cron jobs для напоминаний
```

---

## 📋 API Endpoints (новые)

### Public API
```
GET    /api/public/:slug                    # публичный профиль владельца
GET    /api/public/:slug/events             # события владельца
GET    /api/public/:slug/availability       # доступность на диапазон дат
```

### Owner API
```
GET    /api/owner/profile                   # текущий профиль
PUT    /api/owner/profile                   # обновление профиля

GET    /api/owner/availability/schedules    # список расписаний
POST   /api/owner/availability/schedules    # создать расписание
PUT    /api/owner/availability/schedules/:id
DELETE /api/owner/availability/schedules/:id

GET    /api/owner/availability/exceptions   # исключения
POST   /api/owner/availability/exceptions   # добавить исключение
DELETE /api/owner/availability/exceptions/:id

GET    /api/owner/calendar/integrations     # подключённые календари
POST   /api/owner/calendar/connect          # начать OAuth flow
DELETE /api/owner/calendar/disconnect       # отключить
```

### Bookings API
```
GET    /api/bookings                        # список с фильтрами
POST   /api/bookings                        # создать
GET    /api/bookings/:id                    # детали
POST   /api/bookings/:id/cancel             # отменить
POST   /api/bookings/:id/reschedule         # перенести
PATCH  /api/bookings/:id/status             # обновить статус
```

---

## 📅 Roadmap и приоритеты

### Sprint 1 (1-2 недели): Фаза 1 - Основа
- [ ] Расширение модели Owner (slug, аватар, bio, timezone)
- [ ] Публичная страница владельца (`/:slug`)
- [ ] Улучшенный календарь (@mantine/dates)
- [ ] Многошаговый wizard бронирования

### Sprint 2 (2-3 недели): Фаза 2 - Доступность
- [ ] Таблицы AvailabilitySchedule и AvailabilityException
- [ ] UI для настройки рабочих часов
- [ ] Логика применения availability к слотам
- [ ] Обновление available_slots API

### Sprint 3 (2 недели): Фаза 3 - Управление
- [ ] Расширение Booking (статусы, location, guests)
- [ ] Новый дашборд бронирований (список + календарь)
- [ ] Функции отмены и переноса
- [ ] Фильтры и bulk actions

### Sprint 4 (2-3 недели): Фаза 4 - Интеграции
- [ ] Email-уведомления (ActionMailer)
- [ ] Напоминания (cron jobs)
- [ ] Google Calendar OAuth
- [ ] Zoom/Google Meet интеграция

---

## ⚠️ Вопросы для обсуждения

1. **Аутентификация**: Сейчас нет auth. Нужен ли login для владельца или оставляем pre-seeded owner?
2. **База данных**: Оставляем SQLite или переходим на PostgreSQL для продакшена?
3. **Интеграции**: Какие обязательны для MVP? (Email → Google Calendar → Zoom)
4. **Оплаты**: Нужна интеграция Stripe для платных встреч?
5. **Мультиязычность**: Только русский или добавить i18n с английским?
6. **Мобильное приложение**: В будущем или только web?

---

## 🔗 Полезные ресурсы

- **Cal.com Docs**: https://cal.com/docs
- **Cal.com GitHub**: https://github.com/calcom/cal.com
- **Mantine UI Docs**: https://mantine.dev
- **Rails Guides**: https://guides.rubyonrails.org

---

## 📊 Метрики успеха

- [ ] Время бронирования < 30 секунд (от выбора события до подтверждения)
- [ ] Все основные действия на дашборде доступны за 2 клика
- [ ] Mobile-friendly (работает на телефоне без проблем)
- [ ] 100% функционал доступен без регистрации (гостевая модель)

---

*Документ создан: 2026-04-09*
*Последнее обновление: 2026-04-09*
*Версия: 1.0*
