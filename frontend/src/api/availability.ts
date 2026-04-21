import { apiClient } from './client'
import type { AvailabilitySchedule, AvailabilityException, AvailabilityPreview } from '../types/api'

export interface CreateScheduleDto {
  name: string
  is_default: boolean
  schedule: Record<string, {
    enabled: boolean
    start: string
    end: string
  }>
}

export interface CreateExceptionDto {
  date: string
  is_available: boolean
  reason?: string
  available_slots?: string[]
}

export const availabilityApi = {
  // Schedules
  getSchedules: async (): Promise<AvailabilitySchedule[]> => {
    const response = await apiClient.get('/owner/availability/schedules')
    return response.data
  },

  getSchedule: async (id: number): Promise<AvailabilitySchedule> => {
    const response = await apiClient.get(`/owner/availability/schedules/${id}`)
    return response.data
  },

  createSchedule: async (data: CreateScheduleDto): Promise<AvailabilitySchedule> => {
    const response = await apiClient.post('/owner/availability/schedules', { schedule: data })
    return response.data
  },

  updateSchedule: async (id: number, data: CreateScheduleDto): Promise<AvailabilitySchedule> => {
    const response = await apiClient.put(`/owner/availability/schedules/${id}`, { schedule: data })
    return response.data
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/owner/availability/schedules/${id}`)
  },

  // Exceptions
  getExceptions: async (): Promise<AvailabilityException[]> => {
    const response = await apiClient.get('/owner/availability/exceptions')
    return response.data
  },

  createException: async (data: CreateExceptionDto): Promise<AvailabilityException> => {
    const response = await apiClient.post('/owner/availability/exceptions', { exception: data })
    return response.data
  },

  deleteException: async (id: number): Promise<void> => {
    await apiClient.delete(`/owner/availability/exceptions/${id}`)
  },

  // Preview
  getPreview: async (startDate: string, endDate: string): Promise<AvailabilityPreview[]> => {
    const response = await apiClient.get('/owner/availability/preview', {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  }
}
