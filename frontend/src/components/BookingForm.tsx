import { useState } from 'react'
import { useForm } from '@mantine/form'
import { Button, TextInput, Text, Alert, Card, Group } from '@mantine/core'
import { Calendar, Check, AlertTriangle } from 'lucide-react'
import type { CreateBookingDto, Event } from '../types/api'
import { useBookingsStore } from '../store/bookings'

interface BookingFormProps {
  eventId: number
  event: Event
  selectedSlot: string | null
  onSuccess: () => void
  onCancel: () => void
}

export function BookingForm({ 
  eventId, 
  event, 
  selectedSlot, 
  onSuccess, 
  onCancel 
}: BookingFormProps) {
  const { createBooking, loading, error: storeError } = useBookingsStore()
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
    },
    validate: {
      name: (value) => value.trim().length < 2 ? 'Минимум 2 символа' : null,
      email: (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Неверный email' : null,
      phone: (value) => value.trim().length < 10 ? 'Неверный номер телефона' : null,
    },
  })

  const handleSubmit = async () => {
    if (!selectedSlot) return
    setSubmitError(null)

    try {
      const bookingData: CreateBookingDto = {
        event_id: eventId,
        slot: selectedSlot,
      }
      
      await createBooking(bookingData)
      onSuccess()
    } catch (error) {
      const err = error as { response?: { data?: { slot?: string[] } | string } }
      const message = err.response?.data?.slot?.[0] || err.response?.data || 'Не удалось создать бронь'
      setSubmitError(typeof message === 'string' ? message : JSON.stringify(message))
    }
  }

  return (
    <Card p="lg" withBorder>
      <Group mb="lg">
        <Calendar size={20} />
        <Text size="lg" fw={500}>Бронирование "{event.name}"</Text>
      </Group>

      {selectedSlot && (
        <Alert mb="lg" color="green" variant="light">
          <Group gap="xs">
            <Check size={16} />
            <span>
              Выбрано: {new Date(selectedSlot).toLocaleString('ru-RU')}
            </span>
          </Group>
        </Alert>
      )}

      {(submitError || storeError) && (
        <Alert mb="lg" color="red" variant="light" icon={<AlertTriangle size={16} />}>
          {submitError || storeError}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Имя"
          placeholder="Иван Иванов"
          {...form.getInputProps('name')}
          mb="md"
        />
        
        <TextInput
          label="Email"
          placeholder="ivan@example.com"
          type="email"
          {...form.getInputProps('email')}
          mb="md"
        />
        
        <TextInput
          label="Телефон"
          placeholder="+7 (999) 123-45-67"
          {...form.getInputProps('phone')}
          mb="md"
        />

        <Group justify="flex-end" gap="md" mt="xl">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={!selectedSlot || loading}
            loading={loading}
          >
            Забронировать
          </Button>
        </Group>
      </form>
    </Card>
  )
}
