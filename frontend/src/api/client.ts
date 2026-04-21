import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Rails может возвращать ошибки в разных форматах:
      // 1. { error: "сообщение" } — общая ошибка
      // 2. { name: ["is too short"], duration: ["must be greater than 0"] } — ошибки валидации
      const data = error.response.data
      
      // Если есть поле error — используем его
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Иначе собираем ошибки валидации в строку
      const errorMessages = Object.entries(data)
        .map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages]
          return `${field}: ${messageArray.join(', ')}`
        })
        .join('; ')
      
      throw new Error(errorMessages || 'API Error')
    }
    throw error
  },
)