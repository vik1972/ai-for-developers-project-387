import { apiClient } from './client'
import type { Booking, AvailableSlotsResponse, BookingFilters, BookingsResponse, BookingStatus } from '../types/api'

export interface CreateBookingData {
  event_id: number
  slot: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  notes?: string
  location_type?: string
  guests_count?: number
  custom_fields?: Record<string, string>
}

export const bookingsApi = {
  // Public API
  create: async (data: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post('/public/bookings', data)
    return response.data
  },

  getAvailableSlots: async (eventId: number, date: string): Promise<AvailableSlotsResponse> => {
    const response = await apiClient.get('/available_slots', {
      params: { event_id: eventId, date }
    })
    return response.data
  },

  // Owner API with filters and pagination
  getAll: async (filters?: BookingFilters): Promise<BookingsResponse> => {
    const response = await apiClient.get('/bookings', {
      params: filters
    })
    return response.data
  },

  getById: async (id: number): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${id}`)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`)
  },

  // Status management
  updateStatus: async (id: number, status: BookingStatus): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status })
    return response.data
  },

  cancel: async (id: number, reason?: string): Promise<Booking> => {
    const response = await apiClient.post(`/bookings/${id}/cancel`, { reason })
    return response.data
  },

  reschedule: async (id: number, newSlot: string): Promise<Booking> => {
    const response = await apiClient.post(`/bookings/${id}/reschedule`, { new_slot: newSlot })
    return response.data
  },

  // Bulk actions
  bulkCancel: async (ids: number[], reason?: string): Promise<{ cancelled: number; failed: number; message: string }> => {
    const response = await apiClient.post('/bookings/bulk_cancel', { ids, reason })
    return response.data
  },

  bulkUpdateStatus: async (ids: number[], status: BookingStatus): Promise<{ updated: number; failed: number; message: string }> => {
    const response = await apiClient.post('/bookings/bulk_update_status', { ids, status })
    return response.data
  }
}
