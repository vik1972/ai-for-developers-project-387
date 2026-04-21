# TypeSpec Specification for Calendar API

This directory contains the TypeSpec specification for the calendar booking system API.

## Generated Files

- `calendar-api.json` - OpenAPI 3.0 specification
- `types/` - Generated TypeScript types (run `npm run types`)

## Commands

```bash
# Generate OpenAPI specification
npm run generate

# Generate TypeScript types
npm run types
```

## API Endpoints

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get specific event
- `POST /api/events` - Create new event
- `DELETE /api/events/{id}` - Delete event

### Bookings
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/{id}` - Get specific booking
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/{id}` - Delete booking

### Available Slots
- `GET /api/available_slots` - Get available time slots for event on date