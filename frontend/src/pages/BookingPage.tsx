import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Card, 
  Title, 
  Text, 
  Button, 
  Loader, 
  Group, 
  Badge,
  Divider
} from '@mantine/core'
import { ArrowLeft, Clock } from 'lucide-react'
import { eventsApi } from '../api/events'
import { bookingsApi } from '../api/bookings'
import { TimeSlotGrid } from '../components/TimeSlotGrid'
import { BookingForm } from '../components/BookingForm'
import { useEventsStore } from '../store/events'
import { useBookingsStore } from '../store/bookings'
import type { Event, AvailableSlotsResponse } from '../types/api'

export function BookingPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { events } = useEventsStore()
  const { fetchBookings } = useBookingsStore()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    const eventIdNum = parseInt(eventId || '0')
    if (eventIdNum) {
      const foundEvent = events.find(e => e.id === eventIdNum)
      if (foundEvent) {
        setEvent(foundEvent)
      } else {
        eventsApi.getById(eventIdNum).then(setEvent)
      }
    }
  }, [eventId, events])

  useEffect(() => {
    if (event && selectedDate) {
      setLoading(true)
      bookingsApi.getAvailableSlots(event.id, selectedDate)
        .then((data: AvailableSlotsResponse) => {
          setAvailableSlots(data.available_slots)
          setOccupiedSlots(data.occupied_slots || [])
          setSelectedSlot(null)
        })
        .catch(() => {
          setAvailableSlots([])
          setOccupiedSlots([])
        })
        .finally(() => setLoading(false))
    }
  }, [event, selectedDate])

  const handleBookingSuccess = () => {
    setShowBookingForm(false)
    setSelectedSlot(null)
    fetchBookings()
    if (event && selectedDate) {
      bookingsApi.getAvailableSlots(event.id, selectedDate)
        .then((data: AvailableSlotsResponse) => {
          setAvailableSlots(data.available_slots)
          setOccupiedSlots(data.occupied_slots || [])
        })
    }
  }

  const handleBookingCancel = () => {
    setShowBookingForm(false)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
    setShowBookingForm(true)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  if (!event) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Loader />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Button 
        component={Link}
        to="/"
        leftSection={<ArrowLeft size={16} />}
        mb="xl"
        variant="subtle"
      >
        ← Назад
      </Button>

      <Group mb="xl">
        <div>
          <Title order={2}>{event.name}</Title>
          <Text c="dimmed" size="sm">
            Выберите доступное время для бронирования
          </Text>
        </div>
        <Badge color="blue" variant="light">
          {formatDuration(event.duration)}
        </Badge>
      </Group>

      <Card p="lg" mb="xl" withBorder>
        <Text size="sm" mb="md">{event.description}</Text>
        <Divider mb="md" />
        
        <Group gap="md">
          <Text size="xs" c="dimmed">
            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Длительность: {formatDuration(event.duration)}
          </Text>
        </Group>
      </Card>

      {showBookingForm ? (
        <>
          <BookingForm
            eventId={event.id}
            event={event}
            selectedSlot={selectedSlot}
            onSuccess={handleBookingSuccess}
            onCancel={handleBookingCancel}
          />
        </>
      ) : (
        <>
          <Group mb="md">
            <Text size="sm" c="dimmed">Выберите дату:</Text>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </Group>

          <TimeSlotGrid
            availableSlots={availableSlots}
            occupiedSlots={occupiedSlots}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            loading={loading}
          />
        </>
      )}
    </div>
  )
}
