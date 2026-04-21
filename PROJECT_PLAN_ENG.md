# Development Plan: Transforming the App into a Cal.com-like Service

## 📊 Current Application State

**Already Implemented:**
- ✅ Rails 7.2 API + React 18 + TypeScript + Mantine UI
- ✅ Event type creation (name, description, duration)
- ✅ Booking without registration (guest model)
- ✅ Time selection via slots with occupancy validation
- ✅ Owner dashboard with statistics (total events, bookings, upcoming)
- ✅ Event and booking management (CRUD)
- ✅ SQLite database

---

## 🎯 Key Cal.com Features to Implement

### 1. **Owner Profile**
- Public page with unique URL (`/:slug` or `/:username`)
- Avatar, name, profile description
- Default timezone
- Personal booking link

### 2. **Availability Settings**
- Working hours by day of week (mon-fri 9:00-17:00, etc.)
- Breaks (lunch 12:00-13:00)
- Buffer time between meetings (before/after)
- Exceptions: vacation, holidays, non-working days
- Different schedules for different event types

### 3. **Enhanced Time Selection**
- Month calendar (instead of date input)
- Week/month navigation
- Visual indication of days with available slots
- Guest timezone selection
- Multiple view types: monthly, weekly, column

### 4. **Booking Details**
- Standard fields: name, email, phone (already exists)
- Additional fields: company, notes
- Meeting location: Zoom, Google Meet, address, phone
- Custom questions before meeting
- Add guests (multiple emails separated by comma)

### 5. **Booking Management**
- Statuses: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`
- Reschedule meeting to different time
- Cancel with reason
- Bulk actions
- Filters by status, date, event type

### 6. **Integrations**
- Google Calendar / Outlook Calendar (OAuth)
- Email notifications (confirmation, reminders)
- Zoom / Google Meet automatic links
- Telegram / Slack notifications for owner

### 7. **Public Booking Page**
- Beautiful multi-step page for guests
- Step 1: Select event type
- Step 2: Select date (calendar)
- Step 3: Select time (slots grid)
- Step 4: Fill out form
- Step 5: Confirmation with details

### 8. **Additional Cal.com Features**
- Round-robin (distribution among multiple people)
- Group events (several participants simultaneously)
- Collective events (meeting only when everyone is free)
- Secret events (only via direct link)
- Deposits / payment (Stripe integration)
- Workflow automation (triggers and actions)

---

## 🚀 Implementation Phases

### Phase 1: Core UX and Profile (High Priority)

#### 1.1 Extend Owner Model
```ruby
# New fields in owners table
- slug: string (unique URL, indexed)
- avatar_url: string
- bio: text
- timezone: string (default 'Europe/Moscow')
- working_hours: jsonb (schedule by day of week)
- is_public: boolean (default: true)
```

**Tasks:**
- [ ] Database migration
- [ ] API for getting public profile
- [ ] `PublicProfile` component (React)
- [ ] Slug uniqueness validation

#### 1.2 Public Owner Page (`/:slug`)
**Layout:**
```
┌─────────────────────────────────────┐
│  [Avatar 80x80]                     │
│  Owner Name                         │
│  Profile description...            │
│  🕐 Europe/Moscow                   │
│                                      │
│  ┌─────────────────────────────┐     │
│  │ Available event types:      │     │
│  │ ┌─────┐ ┌─────┐ ┌─────┐    │     │
│  │ │30min│ ���60min│ │90min│    │     │
│  │ │ 💼  │ │ 📞  │ │ ☕  │    │     │
│  │ └─────┘ └─────┘ └─────┘    │     │
│  └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

**Tasks:**
- [ ] Create route `/:slug` in React Router
- [ ] `PublicProfilePage` component
- [ ] Display owner's events list
- [ ] Navigate to booking on event click

#### 1.3 Enhanced Date Selection Calendar
**Replace:**
- ❌ Old: `<input type="date">`
- ✅ New: `@mantine/dates` Calendar or custom component

**Features:**
- Full month display
- Forward/back month navigation
- Highlight days with available slots (green)
- Block days without slots or exceptions
- Guest timezone selection

**Tasks:**
- [ ] Install `@mantine/dates`
- [ ] Create `BookingCalendar` component
- [ ] Integrate with available_slots API
- [ ] Visual availability indication

#### 1.4 Multi-step Booking Process (Booking Wizard)
```
Step 1: Select event (if not selected on public page)
Step 2: Select date (calendar)
Step 3: Select time (slots grid)
Step 4: Data form (name, email, phone, additional fields)
Step 5: Confirmation (preview + "Book" button)
Step 6: Success page (booking details, calendar link)
```

**Tasks:**
- [ ] Create `BookingWizard` component
- [ ] State management for steps (React Context or Zustand)
- [ ] Progress indicator (steps 1-5)
- [ ] Validation at each step
- [ ] Step transition animations

---

### Phase 2: Availability Settings (Medium Priority)

#### 2.1 Availability Model and Exceptions
```ruby
# New availability_schedules table
t.string :name
t.jsonb :schedule  # { mon: { start: "09:00", end: "17:00", enabled: true }, ... }
t.references :owner
t.boolean :is_default

# New availability_exceptions table
t.references :owner
t.date :date
t.boolean :is_available  # false = full day off
t.jsonb :available_slots # ["09:00", "09:30", ...] or null if is_available=false
t.text :reason  # "Vacation", "Holiday"
```

**Tasks:**
- [ ] Migrations for availability_schedules and availability_exceptions
- [ ] API for CRUD schedules
- [ ] API for CRUD exceptions
- [ ] Application logic: default schedule + exceptions

#### 2.2 Availability Settings UI
**Dashboard page: `/dashboard/availability`**

**Components:**
- `AvailabilityEditor` - edit days of week
- `ExceptionCalendar` - calendar with exceptions
- `TimeRangeInput` - time selection (from/to)
- `BufferSettings` - buffer time settings

**Tasks:**
- [ ] Create availability settings page
- [ ] UI for setting working hours by day
- [ ] UI for adding exceptions (drag-and-drop calendar)
- [ ] Availability preview

#### 2.3 Apply Availability to Slots
**Slot generation logic:**
```ruby
def generate_slots(date, event_duration)
  schedule = get_schedule_for_date(date)
  exceptions = get_exceptions_for_date(date)
  
  return [] if exceptions.any? { |e| !e.is_available }
  
  slots = []
  current_time = schedule.start_time
  
  while current_time + event_duration <= schedule.end_time
    slot_end = current_time + event_duration
    
    # Check for existing bookings
    unless booking_exists?(date, current_time, slot_end)
      slots << current_time
    end
    
    current_time += event_duration.minutes
  end
  
  slots
end
```

**Tasks:**
- [ ] Update `AvailableSlotsController`
- [ ] Integrate with AvailabilitySchedule
- [ ] Account for buffer_before/buffer_after
- [ ] Account for timezone

---

### Phase 3: Enhanced Booking Management (Medium Priority)

#### 3.1 Extend Booking Model
```ruby
# New fields in bookings table
t.string :status, default: 'confirmed'  # pending, confirmed, cancelled, completed, no_show
t.string :guest_name
t.string :guest_email
t.string :guest_phone
t.string :location_type  # zoom, google_meet, phone, address
t.string :location_url
t.text :notes
t.datetime :cancelled_at
t.text :cancellation_reason
t.datetime :rescheduled_from  # original time on reschedule
t.integer :guests_count, default: 1
t.jsonb :custom_fields  # { company: "Acme", notes: "..." }
```

**Tasks:**
- [ ] Migrations for new fields
- [ ] Update validations
- [ ] Update JSON serializers

#### 3.2 Statuses and Booking Lifecycle
```
confirmed → completed (after meeting time)
confirmed → cancelled (guest or owner cancelled)
confirmed → no_show (owner marked)
confirmed → rescheduled (reschedule to new time)
```

**API endpoints:**
```
POST   /api/bookings/:id/cancel     # cancel with reason
POST   /api/bookings/:id/reschedule # reschedule to new slot
PATCH  /api/bookings/:id/status     # update status
```

**Tasks:**
- [ ] Add status model (state machine or enum)
- [ ] Endpoints for cancel and reschedule
- [ ] Status transition validations

#### 3.3 Enhanced Bookings Dashboard
**Views:**
- 📅 **Calendar View** - calendar with meetings (like Google Calendar)
- 📋 **List View** - table with filters and sorting

**Filters:**
- By status: upcoming, past, cancelled
- By date: today, week, month, custom period
- By event type
- Search by guest name/email

**Quick actions:**
- Confirm/Cancel (inline)
- Reschedule (modal with calendar)
- Resend email
- Copy meeting link

**Tasks:**
- [ ] Create `BookingsCalendarView` component
- [ ] Create `BookingsListView` component
- [ ] View toggle
- [ ] Filters and search
- [ ] Bulk actions (select multiple bookings)

---

### Phase 4: Integrations and Notifications (Low Priority)

#### 4.1 Email Notifications
**Templates:**
- Booking created (guest + owner)
- Reminder 24 hours before
- Reminder 1 hour before
- Booking cancelled
- Booking rescheduled

**Technologies:**
- ActionMailer (Rails)
- Letter Opener (dev)
- SendGrid / Mailgun / SMTP (prod)

**Tasks:**
- [ ] Configure ActionMailer
- [ ] Create email templates (HTML + text)
- [ ] Background jobs (Active Job + Solid Queue)
- [ ] Trigger logic (create, cancel, reminders)

#### 4.2 Google Calendar Integration
**OAuth2 Flow:**
```
1. Owner clicks "Connect Google Calendar"
2. Google OAuth consent screen
3. Get access_token + refresh_token
4. Save tokens in owner.google_calendar_token
5. Use Google Calendar API for:
   - Read availability (free/busy)
   - Create events on booking
   - Update/delete on cancel
```

**Tasks:**
- [ ] Google Cloud Console setup (OAuth credentials)
- [ ] OAuth callback endpoints
- [ ] Google Calendar API service
- [ ] Availability synchronization
- [ ] Create events in Google Calendar

#### 4.3 Video Conferencing
**Zoom:**
- OAuth integration
- Automatic meeting creation on booking
- Save join_url in booking.location_url

**Google Meet:**
- Create via Google Calendar API
- Automatic link generation

**Tasks:**
- [ ] Zoom OAuth integration
- [ ] Meeting creation service
- [ ] Configure in event type (auto-generate link)

---

## 🎨 UI/UX Improvements

### Color Scheme (like Cal.com)
```css
/* Primary */
--color-primary: #111827;      /* Black-blue */
--color-accent: #f97316;      /* Orange */
--color-success: #22c55e;     /* Green */
--color-warning: #eab308;     /* Yellow */
--color-danger: #ef4444;      /* Red */

/* Backgrounds */
--bg-page: #f9fafb;
--bg-card: #ffffff;
--bg-hover: #f3f4f6;

/* Text */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-muted: #9ca3af;
```

### Design System Components
- **Cards**: border-radius 12px, box-shadow `0 1px 3px rgba(0,0,0,0.1)`
- **Buttons**: border-radius 8px, hover: darken 10%
- **Inputs**: border-radius 8px, focus: ring 2px primary
- **Calendar**: clean design, current day highlighted
- **Modals**: backdrop blur, slide-up animation

### Responsiveness
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly elements (minimum 44x44px)

---

## 🛠 Tech Stack and Libraries

### Backend (Rails)
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **Authentication**: JWT or Devise Token Auth (if needed)
- **Background jobs**: Active Job + Solid Queue
- **Email**: ActionMailer + SendGrid/Mailgun
- **OAuth**: OmniAuth (Google, Zoom)
- **API**: Jbuilder or ActiveModel::Serializers

### Frontend (React)
- **UI Library**: Mantine (already used) + @mantine/dates
- **State**: Zustand (lighter than Redux) or React Context
- **Forms**: @mantine/form (already exists)
- **Requests**: React Query (already exists)
- **Routing**: React Router (already exists)
- **Icons**: Lucide React (already exists)
- **Dates**: date-fns or dayjs

### New Packages to Install
```bash
# Frontend
cd frontend && npm install @mantine/dates @mantine/modals zustand dayjs

# Backend
gem 'omniauth-google-oauth2'
gem 'omniauth-zoom'
gem 'google-api-client'
gem 'httparty'
gem 'solid_queue'
gem 'whenever'  # cron jobs for reminders
```

---

## 📋 API Endpoints (New)

### Public API
```
GET    /api/public/:slug                    # public owner profile
GET    /api/public/:slug/events             # owner's events
GET    /api/public/:slug/availability       # availability for date range
```

### Owner API
```
GET    /api/owner/profile                   # current profile
PUT    /api/owner/profile                   # update profile

GET    /api/owner/availability/schedules    # list schedules
POST   /api/owner/availability/schedules    # create schedule
PUT    /api/owner/availability/schedules/:id
DELETE /api/owner/availability/schedules/:id

GET    /api/owner/availability/exceptions   # exceptions
POST   /api/owner/availability/exceptions   # add exception
DELETE /api/owner/availability/exceptions/:id

GET    /api/owner/calendar/integrations     # connected calendars
POST   /api/owner/calendar/connect          # start OAuth flow
DELETE /api/owner/calendar/disconnect       # disconnect
```

### Bookings API
```
GET    /api/bookings                        # list with filters
POST   /api/bookings                        # create
GET    /api/bookings/:id                    # details
POST   /api/bookings/:id/cancel             # cancel
POST   /api/bookings/:id/reschedule         # reschedule
PATCH  /api/bookings/:id/status             # update status
```

---

## 📅 Roadmap and Priorities

### Sprint 1 (1-2 weeks): Phase 1 - Foundation
- [ ] Extend Owner model (slug, avatar, bio, timezone)
- [ ] Public owner page (`/:slug`)
- [ ] Enhanced calendar (@mantine/dates)
- [ ] Multi-step booking wizard

### Sprint 2 (2-3 weeks): Phase 2 - Availability
- [ ] AvailabilitySchedule and AvailabilityException tables
- [ ] UI for working hours settings
- [ ] Availability application logic to slots
- [ ] Update available_slots API

### Sprint 3 (2 weeks): Phase 3 - Management
- [ ] Extend Booking (statuses, location, guests)
- [ ] New bookings dashboard (list + calendar)
- [ ] Cancel and reschedule functionality
- [ ] Filters and bulk actions

### Sprint 4 (2-3 weeks): Phase 4 - Integrations
- [ ] Email notifications (ActionMailer)
- [ ] Reminders (cron jobs)
- [ ] Google Calendar OAuth
- [ ] Zoom/Google Meet integration

---

## ⚠️ Questions for Discussion

1. **Authentication**: Currently no auth. Is login needed for owner or keep pre-seeded owner?
2. **Database**: Keep SQLite or move to PostgreSQL for production?
3. **Integrations**: Which are mandatory for MVP? (Email → Google Calendar → Zoom)
4. **Payments**: Need Stripe integration for paid meetings?
5. **Multi-language**: Only Russian or add i18n with English?
6. **Mobile App**: In the future or only web?

---

## 🔗 Useful Resources

- **Cal.com Docs**: https://cal.com/docs
- **Cal.com GitHub**: https://github.com/calcom/cal.com
- **Mantine UI Docs**: https://mantine.dev
- **Rails Guides**: https://guides.rubyonrails.org

---

## 📊 Success Metrics

- [ ] Booking time < 30 seconds (from event selection to confirmation)
- [ ] All main dashboard actions available in 2 clicks
- [ ] Mobile-friendly (works on phone without issues)
- [ ] 100% functionality available without registration (guest model)

---

*Document created: 2026-04-09*
*Last updated: 2026-04-09*
*Version: 1.0*