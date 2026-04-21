import { apiClient } from './client'
import type { Event, CreateEventDto } from '../types/api'

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await apiClient.get('/public/events')
    return response.data
  },

  getById: async (id: number): Promise<Event> => {
    const response = await apiClient.get(`/public/events/${id}`)
    return response.data
  },

  create: async (data: CreateEventDto): Promise<Event> => {
    const response = await apiClient.post('/owner/events', data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/owner/events/${id}`)
  },
}