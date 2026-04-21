# AGENTS.md

## Quick Commands

```bash
# Setup (first time)
bundle install && npm install && cd frontend && npm install && cd ..
bundle exec rails db:create db:migrate

# Start dev servers (TWO terminals needed)
bundle exec rails server -p 3001          # Rails API (port 3001)
cd frontend && npm run dev                # React frontend (port 3000)

# Run all Rails tests
bin/rails db:test:prepare test test:system

# Run a single test file
bin/rails test test/models/event_test.rb

# Lint (Ruby)
bin/rubocop

# Lint (frontend)
cd frontend && npm run lint
```

## Architecture

- **Rails 7.2 (Ruby 3.3.6)** API-only backend, SQLite database.
- **React 18 + TypeScript + Vite + Mantine UI** frontend in `frontend/`.
- No authentication. One pre-seeded `Owner` profile; guests book without login.
- Backend runs on port **3001**, frontend dev server on port **3000**.

### Models
- `Owner` — calendar owner (name, email). Events belong to an owner.
- `Event` — bookable event type (name, description, duration in minutes).
- `Booking` — reservation linking an event to a datetime `slot`.

### Key constraint
Two bookings cannot occupy the same `slot` time, even across different event types.

### API routes (`config/routes.rb`)
- `GET /api/public/events` — list events (guest)
- `GET /api/public/events/:id` — event details (guest)
- `POST /api/public/bookings` — create booking (guest)
- `GET /api/owner/dashboard` — owner dashboard
- `POST /api/owner/events` — create event
- `DELETE /api/owner/events/:id` — delete event
- `GET /api/owner/bookings` — list bookings
- `DELETE /api/owner/bookings/:id` — delete booking
- `GET /api/available_slots` — check available slots

## CI Pipeline (`.github/workflows/ci.yml`)

On PR and push to `main`:
1. `bin/brakeman --no-pager` — Ruby security scan
2. `bin/importmap audit` — JS dependency audit
3. `bin/rubocop -f github` — Ruby lint
4. `bin/rails db:test:prepare test test:system` — tests (parallel, Chrome for system tests)

## Tooling

- **Ruby**: 3.3.6 (`.ruby-version`, managed via asdf `.tool-versions`)
- **Linter**: rubocop-rails-omakase (`.rubocop.yml`)
- **Frontend lint**: ESLint with `@typescript-eslint` in `frontend/`
- **No frontend test runner** configured (`package.json` test script exits 1)
- **Root `package.json`** is minimal; real frontend deps are in `frontend/package.json`

## Gotchas

- `npm install` at root is NOT enough — must also `cd frontend && npm install`.
- Rails server defaults to port 3000; this project overrides to **3001** to avoid conflict with the frontend dev server.
- `opencode.json` has a postgres MCP configured but the app uses **SQLite**, not Postgres. The MCP is read-only and unrelated to the app's database.
- `config/master.key` is committed (not typical for production Rails).
