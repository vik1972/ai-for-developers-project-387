import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Card,
  Title,
  Text,
  Button,
  Loader,
  Group,
  Badge,
  Stepper,
  Stack,
  Container,
  Alert,
  TextInput
} from '@mantine/core'
import { ArrowLeft, Check, Clock, User, Mail, Phone, CalendarDays } from 'lucide-react'
import { BookingCalendar } from '../components/BookingCalendar'
import { TimeSlotGrid } from '../components/TimeSlotGrid'
import { eventsApi } from '../api/events'
import { bookingsApi } from '../api/bookings'
import type { Event, AvailableSlotsResponse } from '../types/api'
import dayjs from 'dayjs'

export function BookingWizard() {
  const { ownerSlug, eventId } = useParams<{ ownerSlug: string; eventId: string }>()

  const [activeStep, setActiveStep] = useState(0)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Booking data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: ''
  })

  // Load event on mount
  useState(() => {
    const eventIdNum = parseInt(eventId || '0')
    if (eventIdNum) {
      eventsApi.getById(eventIdNum).then(setEvent)
    }
  })

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    loadSlotsForDate(date)
  }

  const loadSlotsForDate = async (date: Date) => {
    if (!event) return

    setLoading(true)
    const dateStr = dayjs(date).format('YYYY-MM-DD')

    try {
      const data: AvailableSlotsResponse = await bookingsApi.getAvailableSlots(event.id, dateStr)
      setAvailableSlots(data.available_slots)
      setOccupiedSlots(data.occupied_slots || [])
    } catch (err) {
      setError('Не удалось загрузить доступные слоты')
      setAvailableSlots([])
      setOccupiedSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
    setActiveStep(2)
  }

  const handleNextStep = () => {
    if (activeStep === 0 && selectedDate) {
      setActiveStep(1)
    }
  }

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(0, prev - 1))
  }

  const handleSubmitBooking = async () => {
    if (!event || !selectedSlot) return

    setLoading(true)
    try {
      await bookingsApi.create({
        event_id: event.id,
        slot: selectedSlot,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        notes: bookingData.notes
      })
      setSuccess(true)
      setActiveStep(3)
    } catch (err) {
      setError('Не удалось создать бронирование')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!selectedDate
      case 1:
        return !!selectedSlot
      case 2:
        return bookingData.guestName && bookingData.guestEmail
      default:
        return true
    }
  }

  if (!event) {
    return (
      <Container size="md" py="xl">
        <Loader />
      </Container>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 0' }}>
      <Container size="md">
        {/* Header */}
        <Group mb="xl">
          <Button
            component={Link}
            to={`/${ownerSlug}`}
            leftSection={<ArrowLeft size={16} />}
            variant="subtle"
          >
            Назад
          </Button>
        </Group>

        <Card p="xl" withBorder radius="lg" shadow="sm" mb="xl">
          <Group>
            <div>
              <Title order={2}>{event.name}</Title>
              <Text c="dimmed" size="sm">
                {event.description}
              </Text>
            </div>
            <Badge color="blue" variant="light" size="lg">
              <Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {formatDuration(event.duration)}
            </Badge>
          </Group>
        </Card>

        {/* Stepper */}
        <Stepper active={activeStep} mb="xl">
          <Stepper.Step
            label="Выбор даты"
            description={selectedDate ? dayjs(selectedDate).format('D MMMM') : 'Выберите день'}
            icon={<CalendarDays size={16} />}
          />
          <Stepper.Step
            label="Выбор времени"
            description={selectedSlot ? dayjs(selectedSlot).format('HH:mm') : 'Выберите слот'}
            icon={<Clock size={16} />}
          />
          <Stepper.Step
            label="Ваши данные"
            description="Заполните информацию"
            icon={<User size={16} />}
          />
          <Stepper.Step
            label="Подтверждение"
            description="Готово!"
            icon={<Check size={16} />}
          />
        </Stepper>

        {error && (
          <Alert color="red" mb="md" icon={<Mail size={16} />}>
            {error}
          </Alert>
        )}

        {/* Step 1: Date Selection */}
        {activeStep === 0 && (
          <Stack>
            <BookingCalendar
              eventId={event.id}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
            <Group justify="flex-end" mt="md">
              <Button
                onClick={handleNextStep}
                disabled={!canProceed()}
                rightSection={<ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
              >
                Далее
              </Button>
            </Group>
          </Stack>
        )}

        {/* Step 2: Time Slot Selection */}
        {activeStep === 1 && (
          <Stack>
            {selectedDate && (
              <Text mb="md" fw={500}>
                Выбранная дата: {dayjs(selectedDate).format('D MMMM YYYY')}
              </Text>
            )}
            <TimeSlotGrid
              availableSlots={availableSlots}
              occupiedSlots={occupiedSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              loading={loading}
            />
            <Group justify="space-between" mt="md">
              <Button onClick={handlePrevStep} variant="light">
                Назад
              </Button>
            </Group>
          </Stack>
        )}

        {/* Step 3: Guest Details */}
        {activeStep === 2 && (
          <Card p="lg" withBorder>
            <Stack gap="md">
              <Text fw={500} size="lg" mb="md">
                Выбрано: {dayjs(selectedSlot).format('D MMMM YYYY, HH:mm')}
              </Text>

              <TextInput
                label="Ваше имя *"
                placeholder="Иван Иванов"
                value={bookingData.guestName}
                onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                required
                leftSection={<User size={16} />}
              />

              <TextInput
                label="Email *"
                placeholder="ivan@example.com"
                type="email"
                value={bookingData.guestEmail}
                onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                required
                leftSection={<Mail size={16} />}
              />

              <TextInput
                label="Телефон"
                placeholder="+7 (999) 123-45-67"
                value={bookingData.guestPhone}
                onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                leftSection={<Phone size={16} />}
              />

              <TextInput
                label="Примечания"
                placeholder="Дополнительная информация"
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              />

              <Group justify="space-between" mt="xl">
                <Button onClick={handlePrevStep} variant="light">
                  Назад
                </Button>
                <Button
                  onClick={handleSubmitBooking}
                  loading={loading}
                  disabled={!canProceed()}
                >
                  Подтвердить бронирование
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Step 4: Success */}
        {activeStep === 3 && success && (
          <Card p="xl" withBorder style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}
            >
              <Check size={40} color="white" />
            </div>
            <Title order={2} mb="md">
              Бронирование подтверждено!
            </Title>
            <Text c="dimmed" mb="xl">
              {event.name} на {dayjs(selectedSlot).format('D MMMM YYYY, HH:mm')}
            </Text>
            <Group justify="center">
              <Button component={Link} to={`/${ownerSlug}`} variant="light">
                Вернуться к профилю
              </Button>
              <Button component={Link} to="/">
                На главную
              </Button>
            </Group>
          </Card>
        )}
      </Container>
    </div>
  )
}
