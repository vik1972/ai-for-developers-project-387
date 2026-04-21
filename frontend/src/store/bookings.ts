import { create } from 'zustand'
import { bookingsApi } from '../api/bookings'
import type { Booking, CreateBookingDto } from '../types/api'

interface BookingsState {
  bookings: Booking[]
  loading: boolean
  error: string | null
  fetchBookings: () => Promise<void>
  createBooking: (data: CreateBookingDto) => Promise<void>
  deleteBooking: (id: number) => Promise<void>
}

export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBookings: async () => {
    set({ loading: true, error: null })
    try {
      const bookings = await bookingsApi.getAll()
      set({ bookings, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch bookings', loading: false })
    }
  },

  createBooking: async (data: CreateBookingDto) => {
    set({ loading: true, error: null })
    try {
      const newBooking = await bookingsApi.create(data)
      set((state) => ({ bookings: [...state.bookings, newBooking], loading: false }))
    } catch (error) {
      const err = error as { response?: { data?: { slot?: string[] } | string } }
      const message = err.response?.data?.slot?.[0] || err.response?.data || 'Failed to create booking'
      set({ error: message, loading: false })
      throw error
    }
  },

  deleteBooking: async (id: number) => {
    set({ loading: true, error: null })
    try {
      await bookingsApi.delete(id)
      set((state) => ({ 
        bookings: state.bookings.filter(booking => booking.id !== id), 
        loading: false 
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete booking', loading: false })
    }
  },
}))