export interface Event {
  id: number
  name: string
  description: string
  duration: number
  created_at: string
  updated_at: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type LocationType = 'zoom' | 'google_meet' | 'phone' | 'in_person'

export interface Booking {
  id: number
  event_id: number
  slot: string
  created_at: string
  updated_at: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  notes?: string
  status: BookingStatus
  location_type?: LocationType
  location_url?: string
  guests_count?: number
  custom_fields?: Record<string, string>
  cancelled_at?: string
  cancellation_reason?: string
  rescheduled_from?: string
  event?: Event
}

export interface BookingFilters {
  status?: BookingStatus
  event_id?: number
  from_date?: string
  to_date?: string
  time_filter?: 'upcoming' | 'past' | 'today'
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface BookingsResponse {
  bookings: Booking[]
  meta: {
    total_count: number
    page: number
    per_page: number
    total_pages: number
  }
}

export interface CreateEventDto {
  name: string
  description: string
  duration: number
}

export interface CreateBookingDto {
  event_id: number
  slot: string
}

export interface AvailableSlotsResponse {
  available_slots: string[]
  occupied_slots?: string[]
}

export interface DaySchedule {
  enabled: boolean
  start: string
  end: string
}

export interface AvailabilitySchedule {
  id: number
  name: string
  is_default: boolean
  schedule: Record<string, DaySchedule>
}

export interface AvailabilityException {
  id: number
  date: string
  is_available: boolean
  reason: string | null
  available_slots: string[]
}

export interface AvailabilityPreview {
  date: string
  type: 'exception' | 'schedule'
  enabled?: boolean
  start?: string
  end?: string
  is_available?: boolean
  reason?: string
}