import { create } from 'zustand'
import { eventsApi } from '../api/events'
import type { Event, CreateEventDto } from '../types/api'

interface EventsState {
  events: Event[]
  loading: boolean
  error: string | null
  fetchEvents: () => Promise<void>
  createEvent: (data: CreateEventDto) => Promise<void>
  deleteEvent: (id: number) => Promise<void>
  clearError: () => void
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null })
    try {
      const events = await eventsApi.getAll()
      set({ events, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch events', loading: false })
    }
  },

  createEvent: async (data: CreateEventDto) => {
    set({ loading: true, error: null })
    try {
      const newEvent = await eventsApi.create(data)
      set((state) => ({ events: [...state.events, newEvent], loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create event', loading: false })
    }
  },

  deleteEvent: async (id: number) => {
    set({ loading: true, error: null })
    try {
      await eventsApi.delete(id)
      set((state) => ({ 
        events: state.events.filter(event => event.id !== id), 
        loading: false 
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete event', loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))